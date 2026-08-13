/**
 * useSmsAutoDetect — React Hook for Automatic Bank SMS Transaction Detection
 *
 * This hook bridges the native Android SMS listener module with the on-device
 * SMS parser and the existing addEntry/postTransaction flow.
 *
 * Flow:
 * 1. Checks/requests SMS permissions via the native module
 * 2. Starts the BroadcastReceiver listener for incoming bank SMS
 * 3. Subscribes to "onBankSmsReceived" events from the native layer
 * 4. Runs the SMS parser on each incoming message
 * 5. On successful parse:
 *    - Checks dedup key to avoid duplicate entries
 *    - Calls addEntry() on the Zustand store (local-first)
 *    - Calls postTransaction() to sync with backend
 *    - Calls markEntrySynced() on success
 *    - Refreshes merchant data
 * 6. Optionally runs a one-time historical SMS inbox scan
 *
 * Privacy: All SMS parsing happens on-device. Only structured transaction
 * data (amount, direction, category) is sent to the backend.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { NativeModules, DeviceEventEmitter, Platform, AppState } from 'react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { postTransaction } from '@/utils/api-config';
import { parseBankSms, parseBatchSms, type ParsedTransaction, type RawSmsMessage } from '@/utils/sms-parser';

/* ─── Native Module Types ───────────────────────────────────────── */

interface SmsListenerNativeModule {
  checkPermission(): Promise<{
    hasReadSmsPermission: boolean;
    hasReceiveSmsPermission: boolean;
    allGranted: boolean;
  }>;
  requestPermission(): Promise<{ granted?: boolean; requested?: boolean }>;
  startListening(): Promise<boolean>;
  stopListening(): Promise<boolean>;
  isCurrentlyListening(): Promise<boolean>;
  readBankSmsInbox(maxDaysBack: number, maxMessages: number): Promise<Array<{
    sender: string;
    body: string;
    timestamp: number;
  }>>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

/* ─── Hook Return Type ──────────────────────────────────────────── */

export interface SmsAutoDetectState {
  /** Whether the SMS listener is currently active */
  isListening: boolean;
  /** Current permission status */
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'unavailable';
  /** The last auto-detected transaction (for toast display) */
  lastDetected: ParsedTransaction | null;
  /** Whether a historical scan is currently in progress */
  isScanning: boolean;
  /** Number of entries created from the historical scan */
  historicalScanCount: number;
  /** Start listening for incoming SMS */
  startListening: () => Promise<void>;
  /** Stop listening */
  stopListening: () => Promise<void>;
  /** Request SMS permissions */
  requestPermission: () => Promise<boolean>;
  /** Run historical SMS inbox scan (one-time) */
  runHistoricalScan: () => Promise<number>;
}

/* ─── Constants ─────────────────────────────────────────────────── */

const IS_ANDROID = Platform.OS === 'android';

// Prevent duplicate processing of the same SMS across multiple active instances of the hook
const processedLiveSmsKeys = new Set<string>();

/* ─── Hook Implementation ───────────────────────────────────────── */

export function useSmsAutoDetect(): SmsAutoDetectState {
  const [isListening, setIsListening] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'unavailable'>(
    IS_ANDROID ? 'unknown' : 'unavailable'
  );
  const [lastDetected, setLastDetected] = useState<ParsedTransaction | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [historicalScanCount, setHistoricalScanCount] = useState(0);

  const listenerRef = useRef<any>(null);
  const processingRef = useRef(false);

  // Reactive subscription to settings to trigger re-renders & re-runs of effects
  const smsAutoDetectEnabled = useMerchantStore(state => state.smsAutoDetectEnabled);
  const smsHistoryImportEnabled = useMerchantStore(state => state.smsHistoryImportEnabled);

  // Get store state directly to avoid stale closures
  const store = useMerchantStore;

  /* ─── Native Module Access ──────────────────────────────────── */

  const getNativeModule = useCallback((): SmsListenerNativeModule | null => {
    if (!IS_ANDROID) return null;
    try {
      return NativeModules.SmsListenerModule as SmsListenerNativeModule;
    } catch {
      console.warn('[SMS] Native SmsListenerModule not available');
      return null;
    }
  }, []);

  /* ─── Process a single parsed transaction ───────────────────── */

  const processTransaction = useCallback(async (parsed: ParsedTransaction, skipDedup = false): Promise<boolean> => {
    const state = store.getState();
    const enterpriseId = state.enterpriseId;

    if (!enterpriseId) {
      console.warn('[SMS] No enterprise ID, skipping transaction');
      return false;
    }

    // Dedup check — only for historical scan, not live SMS
    if (!skipDedup && state.hasDedupKey(parsed.dedupKey)) {
      console.log('[SMS] Duplicate detected, skipping:', parsed.dedupKey);
      return false;
    }

    // Double execution check — prevents duplicate calls if multiple instances of this hook are mounted
    if (skipDedup) {
      if (processedLiveSmsKeys.has(parsed.dedupKey)) {
        console.log('[SMS] Live duplicate skipped by in-memory dedup:', parsed.dedupKey);
        return false;
      }
      processedLiveSmsKeys.add(parsed.dedupKey);
      // Clean up after 10 seconds to keep memory clear
      setTimeout(() => processedLiveSmsKeys.delete(parsed.dedupKey), 10000);
    }

    // Build the note for the entry
    const noteParts = [parsed.bankName];
    if (parsed.merchant) noteParts.push(`• ${parsed.merchant}`);
    if (parsed.accountFragment) noteParts.push(`• A/c ${parsed.accountFragment}`);
    if (parsed.referenceId) noteParts.push(`• Ref: ${parsed.referenceId}`);
    const note = noteParts.join(' ') || 'Auto-detected from bank SMS';

    // 1. Local-first: add to store immediately
    const localId = state.addEntry({
      type: parsed.entryType,
      amount: parsed.amount,
      note,
      source: 'sms',
      dedupKey: parsed.dedupKey,
    });

    // 2. Increment counter
    state.incrementSmsDetectedCount();

    // 3. Sync to backend
    try {
      // Map SMS tender to values the backend accepts: bank, cash, credit, upi, wallet
      // The SMS parser produces: 'digital', 'cash', 'card'
      const tenderMap: Record<string, string> = {
        digital: 'upi',
        cash: 'cash',
        card: 'credit',
      };

      // Map SMS-parsed categories to the simple categories the backend accepts.
      // The manual AddEntry form only sends: 'sale', 'expense', 'savdep', 'emi'.
      // The SMS parser produces granular categories like 'upi_payment', 'atm_withdrawal', etc.
      // We need to collapse those into what the backend recognises.
      const category = parsed.direction === 'inflow' ? 'sale' : 'expense';

      const payload = {
        direction: parsed.direction,
        amount: parsed.amount,
        category,
        tender: tenderMap[parsed.tender] || 'cash',
      };

      console.log('[SMS] Posting transaction payload:', JSON.stringify(payload));

      await postTransaction(enterpriseId, payload);

      store.getState().markEntrySynced(localId, 'sms-synced');

      // Refresh dashboard data
      store.getState().fetchMerchantData().catch(err => {
        console.error('[SMS] Failed to refresh merchant data:', err);
      });

      return true;
    } catch (err: any) {
      // Log the full 422 response body for debugging
      if (err?.response) {
        console.error('[SMS] Backend rejection status:', err.response.status);
        console.error('[SMS] Backend rejection body:', JSON.stringify(err.response.data));
      }
      console.error('[SMS] Failed to post transaction to backend:', err);
      // Entry is still saved locally, will appear as unsynced
      return true; // Still counts as processed (locally saved)
    }
  }, [store]);

  /* ─── Permission Management ─────────────────────────────────── */

  const checkPermissions = useCallback(async () => {
    const module = getNativeModule();
    if (!module) {
      setPermissionStatus('unavailable');
      return false;
    }

    try {
      const result = await module.checkPermission();
      if (result.allGranted) {
        setPermissionStatus('granted');
        return true;
      } else {
        setPermissionStatus('denied');
        return false;
      }
    } catch (e) {
      console.error('[SMS] Permission check failed:', e);
      setPermissionStatus('denied');
      return false;
    }
  }, [getNativeModule]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const module = getNativeModule();
    if (!module) return false;

    try {
      await module.requestPermission();
      // Wait a moment for the dialog to resolve, then re-check
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await checkPermissions();
    } catch (e) {
      console.error('[SMS] Permission request failed:', e);
      return false;
    }
  }, [getNativeModule, checkPermissions]);

  /* ─── Listener Management ───────────────────────────────────── */

  const startListening = useCallback(async () => {
    const module = getNativeModule();
    if (!module) return;

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.warn('[SMS] Cannot start listening: no permissions');
      return;
    }

    try {
      await module.startListening();
      setIsListening(true);
      console.log('[SMS] Listener started');
    } catch (e) {
      console.error('[SMS] Failed to start listener:', e);
    }
  }, [getNativeModule, checkPermissions]);

  const stopListening = useCallback(async () => {
    const module = getNativeModule();
    if (!module) return;

    try {
      await module.stopListening();
      setIsListening(false);
      console.log('[SMS] Listener stopped');
    } catch (e) {
      console.error('[SMS] Failed to stop listener:', e);
    }
  }, [getNativeModule]);

  /* ─── Historical Scan ───────────────────────────────────────── */

  const runHistoricalScan = useCallback(async (): Promise<number> => {
    const module = getNativeModule();
    if (!module) return 0;

    const hasPermission = await checkPermissions();
    if (!hasPermission) return 0;

    const state = store.getState();
    if (state.smsHistoricalScanDone) {
      console.log('[SMS] Historical scan already done, skipping');
      return 0;
    }

    setIsScanning(true);
    let processedCount = 0;

    try {
      // Read up to 30 days, max 500 messages
      const rawMessages = await module.readBankSmsInbox(30, 500);
      console.log(`[SMS] Historical scan: ${rawMessages.length} bank SMS found`);

      // Convert to parser format
      const smsMessages: RawSmsMessage[] = rawMessages.map(msg => ({
        sender: msg.sender,
        body: msg.body,
        timestamp: msg.timestamp,
      }));

      // Parse all messages
      const parsed = parseBatchSms(smsMessages);
      console.log(`[SMS] Historical scan: ${parsed.length} transactions parsed`);

      // Process each (with dedup)
      for (const txn of parsed) {
        const processed = await processTransaction(txn);
        if (processed) processedCount++;
      }

      // Mark scan as done
      store.getState().setSmsHistoricalScanDone(true);
      setHistoricalScanCount(processedCount);

      console.log(`[SMS] Historical scan complete: ${processedCount} new entries created`);
    } catch (e) {
      console.error('[SMS] Historical scan failed:', e);
    } finally {
      setIsScanning(false);
    }

    return processedCount;
  }, [getNativeModule, checkPermissions, store, processTransaction]);

  /* ─── Event Listener Setup ──────────────────────────────────── */

  useEffect(() => {
    if (!IS_ANDROID) return;

    const module = getNativeModule();
    if (!module) return;

    if (!smsAutoDetectEnabled) {
      setIsListening(false);
      return;
    }

    const subscription = DeviceEventEmitter.addListener('onBankSmsReceived', (event: {
      sender: string;
      body: string;
      timestamp: number;
    }) => {
      // Prevent concurrent processing
      if (processingRef.current) return;
      processingRef.current = true;

      console.log(`[SMS] Bank SMS received from: ${event.sender}`);

      try {
        const parsed = parseBankSms(event.body, event.sender);

        if (parsed.success) {
          console.log(`[SMS] Parsed: ${parsed.bankName} ${parsed.direction} ₹${parsed.amount}`);
          setLastDetected(parsed);
          processTransaction(parsed, true).finally(() => {
            processingRef.current = false;
          });
        } else {
          console.log('[SMS] Failed to parse bank SMS');
          processingRef.current = false;
        }
      } catch (e) {
        console.error('[SMS] Error processing incoming SMS:', e);
        processingRef.current = false;
      }
    });

    listenerRef.current = subscription;

    // Auto-start listening
    checkPermissions().then(hasPermission => {
      if (hasPermission) {
        module.startListening()
          .then(() => {
            setIsListening(true);
            console.log('[SMS] Auto-started listener on mount/enable');

            // Run historical scan only if the user has opted in AND it hasn't been done yet
            const state = store.getState();
            if (state.smsHistoryImportEnabled && !state.smsHistoricalScanDone) {
              runHistoricalScan();
            }
          })
          .catch(err => console.error('[SMS] Auto-start failed:', err));
      }
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
      listenerRef.current = null;
    };
  }, [smsAutoDetectEnabled, checkPermissions, getNativeModule, runHistoricalScan]);

  // Trigger historical scan if opted-in and listener is running, but scan wasn't done yet
  useEffect(() => {
    if (!IS_ANDROID) return;
    if (smsAutoDetectEnabled && smsHistoryImportEnabled && isListening) {
      const state = store.getState();
      if (!state.smsHistoricalScanDone) {
        runHistoricalScan();
      }
    }
  }, [smsHistoryImportEnabled, smsAutoDetectEnabled, isListening, runHistoricalScan]);

  /* ─── AppState: Resume/Pause listening ──────────────────────── */

  useEffect(() => {
    if (!IS_ANDROID) return;

    const handleAppStateChange = (nextState: string) => {
      const module = getNativeModule();
      if (!module) return;

      const enabled = store.getState().smsAutoDetectEnabled;
      if (!enabled) return;

      if (nextState === 'active') {
        // Re-check permissions and restart if needed
        checkPermissions().then(hasPermission => {
          if (hasPermission && !isListening) {
            module.startListening()
              .then(() => setIsListening(true))
              .catch(err => console.warn('[SMS] Resume listener failed:', err));
          }
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isListening]);

  return {
    isListening,
    permissionStatus,
    lastDetected,
    isScanning,
    historicalScanCount,
    startListening,
    stopListening,
    requestPermission,
    runHistoricalScan,
  };
}
