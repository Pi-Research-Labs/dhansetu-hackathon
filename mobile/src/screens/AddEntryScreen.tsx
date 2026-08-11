import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, Animated, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusCircle, CheckCircle2, History, Mic, Square, Trash2, X, Calendar, Smartphone, Edit } from 'lucide-react-native';
import { useMerchantStore, Entry } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { postVoiceEntry, getTransactions, Transaction, postTransaction } from '@/utils/api-config';
import { CustomAlert } from '@/components/common/CustomAlert';
import { useSmsAutoDetect } from '@/hooks/useSmsAutoDetect';

const VoiceAgentL: Record<string, {
  title: string;
  sub: string;
  listening: string;
  transcribing: string;
  success: string;
  error: string;
  noMatch: string;
  cancel: string;
  speakBtn: string;
}> = {
  en: {
    title: 'Voice Transaction Agent',
    sub: 'Speak in English, Hindi, Marathi, or Telugu (max 30s). e.g., "Received 1,200 rupees for crop sale"',
    listening: 'Recording...',
    transcribing: 'Processing voice note with AI...',
    success: 'AI Agent Extracted',
    error: 'Speech-to-text failed. Please try again.',
    noMatch: 'Could not extract amount/direction, but transcript populated.',
    cancel: 'Cancel',
    speakBtn: 'Tap to Speak',
  },
  hi: {
    title: 'वॉइस लेनदेन एजेंट (AI)',
    sub: 'हिंदी, अंग्रेजी, मराठी या तेलुगु में बोलें (अधिकतम 30s)। जैसे, "फसल बिक्री के लिए 1,200 रुपये मिले"',
    listening: 'रिकॉर्डिंग... ',
    transcribing: 'एआई द्वारा वॉइस नोट को संसाधित किया जा रहा है...',
    success: 'एआई एजेंट द्वारा निकाला गया',
    error: 'भाषण-से-पाठ विफल रहा। कृपया पुनः प्रयास करें।',
    noMatch: 'राशि/दिशा नहीं निकाली जा सकी, लेकिन प्रतिलेख भर दिया गया।',
    cancel: 'रद्द करें',
    speakBtn: 'बोलने के लिए टैप करें',
  },
  mr: {
    title: 'व्हॉइस ट्रान्झॅक्शन एजंट (AI)',
    sub: 'मराठी, हिंदी, इंग्रजी किंवा तेलगू मध्ये बोला (कमाल ३० सेकंद). उदा., "पीक विक्रीसाठी १,२०० रुपये मिळाले"',
    listening: 'रेकॉर्डिंग...',
    transcribing: 'एआय व्हॉइस नोटवर प्रक्रिया करत आहे...',
    success: 'एआय एजंटने शोधले',
    error: 'व्हॉइस रेकॉर्डिंग अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    noMatch: 'रक्कम/दिशा शोधता आली नाही, पण मजकूर भरला गेला आहे.',
    cancel: 'रद्द करा',
    speakBtn: 'बोलण्यासाठी टॅप करा',
  },
  te: {
    title: 'వాయిస్ లావాదేవీ ఏజెంట్ (AI)',
    sub: 'తెలుగు, హిందీ, మరాఠీ లేదా ఇంగ్లీషులో మాట్లాడండి (గరిష్టంగా 30 సెకన్లు). ఉదా., "పంట అమ్మకం కోసం 1,200 రూపాయలు వచ్చాయి"',
    listening: 'రికార్డింగ్... ',
    transcribing: 'ఏఐ వాయిస్ నోట్‌ని ప్రాసెస్ చేస్తోంది...',
    success: 'ఏఐ ఏజెంట్ సంగ్రహించారు',
    error: 'వాయిస్ ప్రాసెసింగ్ విఫలమైంది. మళ్లీ ప్రయత్నించండి.',
    noMatch: 'మొత్తం/దిశను సంగ్రహించలేకపోయాము, కానీ ట్రాన్స్క్రిప్ట్ నింపబడింది.',
    cancel: 'రద్దు చేయి',
    speakBtn: 'మాట్లాడటానికి ట్యాప్ చేయండి',
  }
};

const VoiceModalL: Record<string, {
  reviewText: string;
  amountLabel: string;
  typeLabel: string;
  noteLabel: string;
  saveBtn: string;
  discardBtn: string;
  successTitle: string;
  successSub: string;
  ok: string;
}> = {
  en: {
    reviewText: 'Review and edit the details extracted from your voice recording:',
    amountLabel: 'TRANSACTION AMOUNT *',
    typeLabel: 'TRANSACTION TYPE *',
    noteLabel: 'TRANSCRIPT / NOTE',
    saveBtn: 'Save to Ledger',
    discardBtn: 'Discard',
    successTitle: 'Entry Saved Successfully',
    successSub: 'Transaction successfully recorded into your digital ledger.',
    ok: 'OK',
  },
  hi: {
    reviewText: 'अपनी वॉयस रिकॉर्डिंग से निकाले गए विवरण की समीक्षा और संपादन करें:',
    amountLabel: 'लेनदेन राशि *',
    typeLabel: 'लेनदेन का प्रकार *',
    noteLabel: 'प्रतिलेख / टिप्पणी',
    saveBtn: 'लेज़र में सहेजें',
    discardBtn: 'रद्द करें',
    successTitle: 'प्रविष्टि सफलतापूर्वक सहेजी गई',
    successSub: 'लेनदेन सफलतापूर्वक आपके डिजिटल लेज़र में दर्ज कर लिया गया है।',
    ok: 'ठीक है',
  },
  mr: {
    reviewText: 'तुमच्या व्हॉइस रेकॉर्डिंगमधून काढलेल्या तपशीलांचे पुनरावलोकन आणि संपादन करा:',
    amountLabel: 'व्यवहार रक्कम *',
    typeLabel: 'व्यवहार प्रकार *',
    noteLabel: 'मजकूर / नोंद',
    saveBtn: 'लेजरमध्ये जतन करा',
    discardBtn: 'रद्द करा',
    successTitle: 'नोंद यशस्वीरित्या जतन केली',
    successSub: 'व्यवहार तुमच्या डिजिटल लेजरमध्ये यशस्वीरित्या नोंदवला गेला आहे।',
    ok: 'ठीक आहे',
  },
  te: {
    reviewText: 'మీ వాయిస్ రికార్డింగ్ నుండి సేకరించిన వివరాలను సమీక్షించండి మరియు సవరించండి:',
    amountLabel: 'లావాదేవీ మొత్తం *',
    typeLabel: 'లావాదేవీ రకం *',
    noteLabel: 'ట్రాన్స్క్రిప్ట్ / గమనిక',
    saveBtn: 'లెడ్జర్‌లో సేవ్ చేయి',
    discardBtn: 'తిరస్కరించు',
    successTitle: 'నమోదు విజయవంతంగా సేవ్ చేయబడింది',
    successSub: 'లావాదేవీ మీ డిజిటల్ లెడ్జర్‌లో విజయవంతంగా నమోదు చేయబడింది.',
    ok: 'సరే',
  }
};

const formatInputValue = (text: string) => {
  const clean = text.replace(/,/g, '');
  if (!clean) return '';
  const parts = clean.split('.');
  const intPart = parts[0];
  const decPart = parts[1];
  const num = parseInt(intPart, 10);
  if (isNaN(num)) return clean.startsWith('.') ? '0.' : '';
  const formattedInt = num.toLocaleString('en-IN');
  if (decPart !== undefined) {
    return `${formattedInt}.${decPart.slice(0, 2)}`;
  }
  return clean.endsWith('.') ? `${formattedInt}.` : formattedInt;
};

const getEntryTimestamp = (en: Entry) => {
  const parts = en.id.split('_');
  if (parts.length > 1) {
    const ts = parseInt(parts[1], 10);
    if (!isNaN(ts)) return ts;
  }
  return Date.now();
};

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function AddEntryScreen() {
  const insets = useSafeAreaInsets();
  const { lang, entries, addEntry } = useMerchantStore();
  const t = L[lang];
  const vm = VoiceModalL[lang] || VoiceModalL.en;

  // SMS Auto-Detect Hook
  const smsAutoDetect = useSmsAutoDetect();

  const [type, setType] = useState<Entry['type']>('income');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'month' | 'custom'>('all');

  // Custom date picker states
  const [customDatePickerVisible, setCustomDatePickerVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const [apiTransactions, setApiTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  const fetchLedger = async (pageNumber: number, replaceList: boolean) => {
    const enterpriseId = useMerchantStore.getState().enterpriseId;
    if (!enterpriseId) return;

    setIsLoadingLedger(true);
    console.log('[fetchLedger] Fetching ledger for page:', pageNumber, 'replaceList:', replaceList);
    try {
      let date_from: string | undefined;
      let date_to: string | undefined;
      const now = new Date();

      if (dateFilter === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        date_from = todayStr;
        date_to = todayStr;
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        date_from = sevenDaysAgo.toISOString().split('T')[0];
        date_to = now.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        date_from = startOfMonth.toISOString().split('T')[0];
        date_to = now.toISOString().split('T')[0];
      } else if (dateFilter === 'custom' && customStartDate) {
        date_from = customStartDate.toISOString().split('T')[0];
        if (customEndDate) {
          date_to = customEndDate.toISOString().split('T')[0];
        } else {
          date_to = date_from;
        }
      }

      console.log('[fetchLedger] Calling getTransactions with filters:', { page: pageNumber, limit: 10, date_from, date_to });
      const data = await getTransactions(enterpriseId, {
        page: pageNumber,
        limit: 10,
        date_from,
        date_to,
      });

      console.log('[fetchLedger] Received transactions count:', data.transactions?.length, 'total count on server:', data.total);
      if (replaceList) {
        setApiTransactions(data.transactions);
      } else {
        setApiTransactions((prev) => {
          const existingIds = new Set(prev.map(t => t.entry_id));
          const newOnly = data.transactions.filter(t => !existingIds.has(t.entry_id));
          console.log('[fetchLedger] Appending new items:', newOnly.length);
          return [...prev, ...newOnly];
        });
      }
      setTotalCount(Number(data.total) || 0);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoadingLedger(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchLedger(1, true);
  }, [dateFilter, customStartDate, customEndDate]);

  const handleLoadMore = () => {
    console.log('[handleLoadMore] Clicked. isLoadingLedger:', isLoadingLedger, 'apiTransactions.length:', apiTransactions.length, 'totalCount:', totalCount);
    if (isLoadingLedger || apiTransactions.length >= totalCount) {
      console.log('[handleLoadMore] Aborted. Length >= totalCount or loading.');
      return;
    }
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    console.log('[handleLoadMore] Triggering fetchLedger for page:', nextPage);
    fetchLedger(nextPage, false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const formatCategoryName = (cat?: string) => {
    if (!cat) return '';
    return cat
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const handleDayPress = (day: number) => {
    const clickedDate = new Date(calendarYear, calendarMonth, day);
    if (!customStartDate || (customStartDate && customEndDate)) {
      setCustomStartDate(clickedDate);
      setCustomEndDate(null);
    } else if (customStartDate && !customEndDate) {
      if (clickedDate >= customStartDate) {
        setCustomEndDate(clickedDate);
      } else {
        setCustomStartDate(clickedDate);
      }
    }
  };

  const getCustomPillLabel = () => {
    if (!customStartDate) return 'Custom range';
    const startStr = customStartDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!customEndDate) return `Custom: ${startStr}`;
    const endStr = customEndDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    return `${startStr} - ${endStr}`;
  };

  const filteredEntries = entries.filter((en) => {
    if (dateFilter === 'all') return true;
    const ts = getEntryTimestamp(en);
    const entryDate = new Date(ts);
    const now = new Date();

    if (dateFilter === 'today') {
      return (
        entryDate.getDate() === now.getDate() &&
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return entryDate >= sevenDaysAgo;
    }
    if (dateFilter === 'month') {
      return (
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getFullYear() === now.getFullYear()
      );
    }
    if (dateFilter === 'custom' && customStartDate) {
      const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
      const startDay = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate());
      if (customEndDate) {
        const endDay = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate());
        return entryDay >= startDay && entryDay <= endDay;
      }
      return entryDay.getTime() === startDay.getTime();
    }
    return true;
  });

  // Voice recording using new expo-audio SDK 57 hooks
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 100);

  const [isTranscribing, setIsTranscribing] = useState(false);

  // Voice Modal States
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [modalTranscript, setModalTranscript] = useState('');
  const [modalAmount, setModalAmount] = useState('');
  const [modalType, setModalType] = useState<Entry['type']>('income');
  const [isSaved, setIsSaved] = useState(false);
  const [modalVoiceId, setModalVoiceId] = useState<string | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);

  // Timers and Refs
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animated value for toast horizontal translation
  const toastTranslateX = useRef(new Animated.Value(0)).current;

  // PanResponder to handle swiping the toast left/right
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        toastTranslateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Swipe threshold is 80 pixels in either direction
        if (Math.abs(gestureState.dx) > 80) {
          Animated.timing(toastTranslateX, {
            toValue: gestureState.dx > 0 ? 450 : -450,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setToastMessage(null);
            toastTranslateX.setValue(0);
          });
        } else {
          // Snap back
          Animated.spring(toastTranslateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const typeKeys: Entry['type'][] = ['income', 'expense', 'savdep', 'savwd', 'emi', 'newloan'];

  const recordDuration = Math.floor((recorderState?.durationMillis || 0) / 1000);
  const isRecording = recorderState?.isRecording || false;

  // Auto-stop recording at 30 seconds (Sarvam sync API limit)
  useEffect(() => {
    if (isRecording && recorderState?.durationMillis >= 30000) {
      stopRecording();
    }
  }, [isRecording, recorderState?.durationMillis]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // SMS Auto-Detection Toast — show notification when a bank SMS is parsed
  useEffect(() => {
    if (smsAutoDetect.lastDetected && smsAutoDetect.lastDetected.success) {
      const txn = smsAutoDetect.lastDetected;
      const dirSymbol = txn.direction === 'inflow' ? '+' : '-';
      const toastMsg = `Auto-Detected: ${dirSymbol}₹${txn.amount.toLocaleString('en-IN')} ${txn.direction === 'inflow' ? 'credited' : 'debited'} — ${txn.bankName}`;
      showToast(toastMsg);

      // Refresh transaction list
      setCurrentPage(1);
      fetchLedger(1, true);
    }
  }, [smsAutoDetect.lastDetected]);

  const startRecording = async () => {
    try {
      const { status } = await requestRecordingPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'Microphone permission is required to use the Voice Agent.', 'error');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error('Failed to start recording', err);
      showAlert('Recording Error', 'Could not initialize audio recorder.', 'error');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        await handleUpload(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      showAlert('Recording Error', 'Failed to save audio recording.', 'error');
    }
  };

  const cancelRecording = async () => {
    try {
      await audioRecorder.stop();
    } catch (err) {
      console.error('Failed to cancel recording', err);
    }
  };

  const handleUpload = async (uri: string) => {
    setIsTranscribing(true);
    try {
      const data = await postVoiceEntry(uri, 'app');

      if (data.error) {
        showAlert('Transcription Error', data.error, 'error');
        setIsTranscribing(false);
        return;
      }

      // Populate modal state
      setModalVoiceId(data.voice_id || null);
      setModalTranscript(data.transcript || '');
      setModalAmount(data.amount && data.amount > 0 ? formatInputValue(data.amount.toString()) : '');

      if (data.direction === 'inflow') {
        setModalType('income');
      } else if (data.direction === 'outflow') {
        setModalType('expense');
      } else {
        setModalType('income');
      }

      // Also set the main form fields so that they match if they edit it or as a fallback
      if (data.transcript) {
        setNote(data.transcript);
      }
      if (data.amount && data.amount > 0) {
        setAmount(formatInputValue(data.amount.toString()));
      }
      if (data.direction === 'inflow') {
        setType('income');
      } else if (data.direction === 'outflow') {
        setType('expense');
      }

      setVoiceModalVisible(true);
    } catch (err: any) {
      console.error('Failed to transcribe audio', err);
      const local = VoiceAgentL[lang] || VoiceAgentL.en;
      showAlert('Voice Agent Error', local.error, 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const closeVoiceModal = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setVoiceModalVisible(false);
    setIsSaved(false);
    setModalAmount('');
    setModalTranscript('');
    setModalVoiceId(null);
  };

  const handleModalSave = async () => {
    const numAmount = parseFloat(modalAmount.replace(/,/g, ''));
    if (!numAmount || numAmount <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid positive number for the amount.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const enterpriseId = useMerchantStore.getState().enterpriseId;
      if (!enterpriseId) {
        showAlert('Auth Error', 'No active merchant enterprise ID found.', 'error');
        setIsSaving(false);
        return;
      }

      let direction: 'inflow' | 'outflow' = 'inflow';
      if (modalType === 'expense' || modalType === 'savdep' || modalType === 'emi') {
        direction = 'outflow';
      }

      const cleanNote = modalTranscript.trim();
      const category = cleanNote
        ? cleanNote.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '')
        : (modalType === 'income' ? 'sale' : modalType);

      await postTransaction(enterpriseId, {
        direction,
        amount: numAmount,
        category: category || 'sale',
        tender: 'cash',
        voice_id: modalVoiceId,
      });

      const localId = addEntry({
        type: modalType,
        amount: numAmount,
        note: cleanNote || 'Recorded transaction',
      });
      useMerchantStore.getState().markEntrySynced(localId, 'server-synced');

      // Clear main form inputs
      setAmount('');
      setNote('');

      // Trigger success screen inside the voice modal
      setIsSaved(true);

      // Refresh merchant data (totals, forecasting, flags, etc.)
      useMerchantStore.getState().fetchMerchantData().catch(err => {
        console.error('Failed to fetch merchant data after save', err);
      });

      // Refresh transactions list
      setCurrentPage(1);
      fetchLedger(1, true);

      // Auto-close in 5 seconds
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      autoCloseTimerRef.current = setTimeout(() => {
        closeVoiceModal();
      }, 5000);
    } catch (err: any) {
      console.error('Failed to save voice transaction', err);
      showAlert('Save Error', err?.response?.data?.message || err?.message || 'Failed to save transaction to server.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTranslateX.setValue(0); // Reset animation state
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      // Auto dismiss with slide-out animation
      Animated.timing(toastTranslateX, {
        toValue: 450,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setToastMessage(null);
        toastTranslateX.setValue(0);
      });
    }, 5000); // Auto close in 5 seconds
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (!numAmount || numAmount <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid positive number for the amount.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const enterpriseId = useMerchantStore.getState().enterpriseId;
      if (!enterpriseId) {
        showAlert('Auth Error', 'No active merchant enterprise ID found.', 'error');
        setIsSaving(false);
        return;
      }

      let direction: 'inflow' | 'outflow' = 'inflow';
      if (type === 'expense' || type === 'savdep' || type === 'emi') {
        direction = 'outflow';
      }

      const cleanNote = note.trim();
      const category = cleanNote
        ? cleanNote.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '')
        : (type === 'income' ? 'sale' : type);

      await postTransaction(enterpriseId, {
        direction,
        amount: numAmount,
        category: category || 'sale',
        tender: 'cash',
      });

      const localId = addEntry({
        type,
        amount: numAmount,
        note: cleanNote || 'Recorded transaction',
      });
      useMerchantStore.getState().markEntrySynced(localId, 'server-synced');

      setAmount('');
      setNote('');
      showToast(lang === 'hi' ? 'लेनदेन प्रविष्टि सफलतापूर्वक सहेजी गई।' : 'Transaction entry successfully recorded into your digital ledger.');

      // Refresh merchant data (totals, forecasting, flags, etc.)
      useMerchantStore.getState().fetchMerchantData().catch(err => {
        console.error('Failed to fetch merchant data after save', err);
      });

      // Refresh transactions list
      setCurrentPage(1);
      fetchLedger(1, true);
    } catch (err: any) {
      console.error('Failed to save transaction', err);
      showAlert('Save Error', err?.response?.data?.message || err?.message || 'Failed to save transaction to server.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <PlusCircle size={20} color="#2E7D32" />
          <Text style={styles.headerTitle}>{t.recordEntryTitle}</Text>
        </View>
        <Text style={styles.headerSubtitle}>{t.recordEntrySub}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Voice Agent Assistant Card */}
        <View style={styles.voiceCard}>
          <View style={styles.voiceHeaderRow}>
            <Mic size={18} color="#2E7D32" />
            <Text style={styles.voiceCardTitle}>{(VoiceAgentL[lang] || VoiceAgentL.en).title}</Text>
          </View>
          <Text style={styles.voiceCardSub}>{(VoiceAgentL[lang] || VoiceAgentL.en).sub}</Text>

          <View style={styles.voiceActionContainer}>
            {isTranscribing ? (
              <View style={styles.voiceLoadingRow}>
                <ActivityIndicator size="small" color="#2E7D32" />
                <Text style={styles.voiceLoadingText}>{(VoiceAgentL[lang] || VoiceAgentL.en).transcribing}</Text>
              </View>
            ) : isRecording ? (
              <View style={styles.recordingRow}>
                <TouchableOpacity
                  style={styles.stopTapArea}
                  onPress={stopRecording}
                  activeOpacity={0.8}
                >
                  <View style={styles.pulsingMicContainer}>
                    <View style={styles.stopMicBtn}>
                      <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                    </View>
                  </View>
                  <View style={styles.recordingInfo}>
                    <Text style={styles.listeningText}>{(VoiceAgentL[lang] || VoiceAgentL.en).listening}</Text>
                    <Text style={styles.timerText}>0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration} / 0:30</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={cancelRecording} activeOpacity={0.7}>
                  <Trash2 size={16} color="#C0392B" />
                  <Text style={styles.cancelBtnText}>{(VoiceAgentL[lang] || VoiceAgentL.en).cancel}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.startMicBtn} onPress={startRecording} activeOpacity={0.85}>
                <Mic size={18} color="#FFFFFF" />
                <Text style={styles.startMicBtnText}>{(VoiceAgentL[lang] || VoiceAgentL.en).speakBtn}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Entry Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>{t.newLedgerEntry}</Text>

          {/* Select Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.transTypeLabel}</Text>
            <View style={styles.pillsContainer}>
              {typeKeys.map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.pill, type === k && styles.pillActive]}
                  onPress={() => setType(k)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, type === k && styles.pillTextActive]}>
                    {t.entryTypes[k] || k}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.amountLabel}</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2500"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={amount}
                onChangeText={(val) => setAmount(formatInputValue(val))}
              />
            </View>
          </View>

          {/* Note */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.noteLabel}</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder={t.notePh}
                placeholderTextColor="#94A3B8"
                value={note}
                onChangeText={setNote}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, isSaving && { backgroundColor: '#A5D6A7' }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
            ) : (
              <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            )}
            <Text style={styles.submitBtnText}>
              {isSaving ? 'SAVING...' : t.saveEntryBtn}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Ledger Entries */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <History size={16} color="#1D261F" />
            <Text style={styles.historyTitle}>{t.recentLedgerEntries} ({totalCount})</Text>
          </View>

          {/* Date Range Selector */}
          <View style={styles.filterContainer}>
            {(['all', 'today', '7days', 'month', 'custom'] as const).map((f) => {
              const label = f === 'custom' ? getCustomPillLabel() : {
                all: 'All',
                today: 'Today',
                '7days': '7 Days',
                month: 'Month',
              }[f];
              const isActive = dateFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => {
                    if (f === 'custom') {
                      setDateFilter('custom');
                      setCustomDatePickerVisible(true);
                    } else {
                      setDateFilter(f);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {f === 'custom' && <Calendar size={12} color={isActive ? '#2E7D32' : '#6F6B5E'} />}
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                      {label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {isLoadingLedger && apiTransactions.length === 0 ? (
            <ActivityIndicator size="small" color="#2E7D32" style={{ paddingVertical: 20 }} />
          ) : apiTransactions.length === 0 ? (
            <Text style={styles.emptyLedgerText}>
              No transaction entries found for the selected range.
            </Text>
          ) : (
            <>
              {apiTransactions.map((en, idx) => {
                const parsedAmount = parseFloat(en.amount) || 0;
                const isOutflow = en.direction === 'outflow';
                const title =
                  t.ledgerCategories[en.category ?? ''] ||
                  formatCategoryName(en.category) ||
                  (isOutflow ? t.entryTypes.expense : t.entryTypes.income);
                const confidencePct = en.confidence ? Math.round(parseFloat(en.confidence) * 100) : null;
                const sourceLabel = en.source === 'voice' ? `Voice${confidencePct !== null ? ` (${confidencePct}%)` : ''}` : en.source === 'sms' ? 'SMS' : 'Manual';
                return (
                  <View key={`${en.entry_id}_${idx}`} style={styles.entryRowItem}>
                    <View style={styles.entryMainInfo}>
                      <View style={styles.entryTitleRow}>
                        <Text style={styles.entryTypeTitle}>{title}</Text>
                        {en.is_household && (
                          <View style={styles.householdBadge}>
                            <Text style={styles.householdBadgeText}>Household</Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.entryMetaRow}>
                        {en.tender ? (
                          <Text style={styles.entryMetaText}>{en.tender.toUpperCase()}</Text>
                        ) : null}
                        {en.source ? (
                          <>
                            <Text style={styles.entryMetaText}> • </Text>
                            {en.source === 'voice' ? (
                              <Mic size={10} color="#6F6B5E" style={{ marginRight: 3, marginTop: 2 }} />
                            ) : en.source === 'sms' ? (
                              <Smartphone size={10} color="#6F6B5E" style={{ marginRight: 3, marginTop: 2 }} />
                            ) : (
                              <Edit size={10} color="#6F6B5E" style={{ marginRight: 3, marginTop: 2 }} />
                            )}
                            <Text style={styles.entryMetaText}>{sourceLabel}</Text>
                          </>
                        ) : null}
                      </View>

                      {en.transcript ? (
                        <View style={styles.transcriptContainer}>
                          <Mic size={10} color="#475569" style={{ marginRight: 4 }} />
                          <Text style={styles.transcriptText} numberOfLines={2}>
                            "{en.transcript}"
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.entryAmountInfo}>
                      <Text style={[styles.entryAmtText, isOutflow ? styles.textRed : styles.textGreen]}>
                        {isOutflow ? `-₹ ${parsedAmount.toLocaleString('en-IN')}` : `+₹ ${parsedAmount.toLocaleString('en-IN')}`}
                      </Text>
                      <Text style={styles.entryDateText}>{formatDate(en.event_date || en.recorded_at)}</Text>
                    </View>
                  </View>
                );
              })}

              {apiTransactions.length < totalCount && (
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={handleLoadMore}
                  disabled={isLoadingLedger}
                  activeOpacity={0.8}
                >
                  {isLoadingLedger ? (
                    <ActivityIndicator size="small" color="#2E7D32" />
                  ) : (
                    <Text style={styles.loadMoreBtnText}>Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Custom Date Picker Modal */}
      <Modal
        visible={customDatePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Custom Range</Text>
              <TouchableOpacity onPress={() => setCustomDatePickerVisible(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#6F6B5E" />
              </TouchableOpacity>
            </View>

            {/* Selected Range Preview */}
            <View style={styles.rangePreviewContainer}>
              <Text style={styles.rangePreviewText}>
                {customStartDate ? (
                  customEndDate ? (
                    `${customStartDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to ${customEndDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                  ) : (
                    `Start Date: ${customStartDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} (Tap end date)`
                  )
                ) : (
                  'Select start and end dates'
                )}
              </Text>
            </View>

            {/* Month Header Navigation */}
            <View style={styles.calendarMonthHeader}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
                <Text style={styles.monthNavBtnText}>&lt;</Text>
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>
                {monthNames[calendarMonth]} {calendarYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
                <Text style={styles.monthNavBtnText}>&gt;</Text>
              </TouchableOpacity>
            </View>

            {/* Weekdays Row */}
            <View style={styles.weekdaysRow}>
              {weekDays.map((wd) => (
                <Text key={wd} style={styles.weekdayText}>
                  {wd}
                </Text>
              ))}
            </View>

            {/* Calendar Days Grid */}
            <View style={styles.daysGrid}>
              {(() => {
                const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();

                const calendarDays: (number | null)[] = [];
                for (let i = 0; i < firstDayIndex; i++) {
                  calendarDays.push(null);
                }
                for (let i = 1; i <= daysInMonth; i++) {
                  calendarDays.push(i);
                }

                return calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty_${idx}`} style={styles.dayCellEmpty} />;
                  }

                  const dayDate = new Date(calendarYear, calendarMonth, day);
                  const isSelectedStart = customStartDate && dayDate.getTime() === customStartDate.getTime();
                  const isSelectedEnd = customEndDate && dayDate.getTime() === customEndDate.getTime();
                  const isInRange = customStartDate && customEndDate && dayDate > customStartDate && dayDate < customEndDate;

                  return (
                    <TouchableOpacity
                      key={`day_${day}`}
                      style={[
                        styles.dayCell,
                        isSelectedStart && styles.dayCellStart,
                        isSelectedEnd && styles.dayCellEnd,
                        isInRange && styles.dayCellInRange,
                      ]}
                      onPress={() => handleDayPress(day)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          (isSelectedStart || isSelectedEnd) && styles.dayTextActive,
                          isInRange && styles.dayTextInRange,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                });
              })()}
            </View>

            {/* Action Buttons */}
            <View style={styles.calendarActions}>
              <TouchableOpacity
                style={styles.calendarResetBtn}
                onPress={() => {
                  setCustomStartDate(null);
                  setCustomEndDate(null);
                }}
              >
                <Text style={styles.calendarResetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.calendarApplyBtn}
                onPress={() => {
                  setCustomDatePickerVisible(false);
                }}
              >
                <Text style={styles.calendarApplyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Voice Result Modal */}
      <Modal
        visible={voiceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeVoiceModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {isSaved ? (
              <View style={styles.modalSuccessContainer}>
                <CheckCircle2 size={56} color="#2E7D32" style={{ marginBottom: 16 }} />
                <Text style={styles.modalSuccessTitle}>{vm.successTitle}</Text>
                <Text style={styles.modalSuccessSub}>{vm.successSub}</Text>
                <TouchableOpacity
                  style={styles.modalSuccessBtn}
                  onPress={closeVoiceModal}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalSuccessBtnText}>{vm.ok}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Mic size={20} color="#2E7D32" />
                    <Text style={styles.modalTitle}>{(VoiceAgentL[lang] || VoiceAgentL.en).title}</Text>
                  </View>
                  <TouchableOpacity onPress={closeVoiceModal} style={styles.modalCloseBtn}>
                    <X size={18} color="#6F6B5E" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalInstruction}>
                    {vm.reviewText}
                  </Text>

                  {/* Amount Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{vm.amountLabel}</Text>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="0"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        value={modalAmount}
                        onChangeText={(val) => setModalAmount(formatInputValue(val))}
                      />
                    </View>
                  </View>

                  {/* Select Type */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{vm.typeLabel}</Text>
                    <View style={styles.pillsContainer}>
                      {typeKeys.map((k) => (
                        <TouchableOpacity
                          key={k}
                          style={[styles.pill, modalType === k && styles.pillActive]}
                          onPress={() => setModalType(k)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.pillText, modalType === k && styles.pillTextActive]}>
                            {t.entryTypes[k] || k}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Note / Transcript Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{vm.noteLabel}</Text>
                    <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingVertical: 10 }]}>
                      <TextInput
                        style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
                        placeholder={t.notePh}
                        placeholderTextColor="#94A3B8"
                        multiline
                        value={modalTranscript}
                        onChangeText={setModalTranscript}
                      />
                    </View>
                  </View>
                </ScrollView>

                {/* Modal Actions */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={closeVoiceModal}
                    disabled={isSaving}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalCancelBtnText}>{vm.discardBtn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalConfirmBtn, isSaving && { backgroundColor: '#A5D6A7' }]}
                    onPress={handleModalSave}
                    disabled={isSaving}
                    activeOpacity={0.85}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 6 }} />
                    ) : (
                      <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    )}
                    <Text style={styles.modalConfirmBtnText}>
                      {isSaving ? 'Saving...' : vm.saveBtn}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {toastMessage && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.toastContainer,
            {
              top: insets.top + 16,
              transform: [{ translateX: toastTranslateX }],
            },
          ]}
        >
          <CheckCircle2 size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
          <TouchableOpacity
            style={styles.toastCloseBtn}
            onPress={() => {
              Animated.timing(toastTranslateX, {
                toValue: 450,
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                setToastMessage(null);
                toastTranslateX.setValue(0);
              });
            }}
            activeOpacity={0.7}
          >
            <X size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#1D261F',
    fontSize: 17,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardSectionTitle: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#FAFAF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  pillActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  pillText: {
    color: '#6F6B5E',
    fontSize: 12,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    paddingHorizontal: 12,
    height: 46,
  },
  currencySymbol: {
    color: '#1D261F',
    fontWeight: '700',
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    color: '#1D261F',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
  },
  historyTitle: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '700',
  },
  entryRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
  },
  entryMainInfo: {
    flex: 1,
  },
  entryTypeTitle: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '600',
  },
  entryNoteText: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 2,
  },
  entryAmountInfo: {
    alignItems: 'flex-end',
  },
  entryAmtText: {
    fontSize: 13,
    fontWeight: '700',
  },
  entryDateText: {
    color: '#6F6B5E',
    fontSize: 10,
    marginTop: 2,
  },
  textRed: {
    color: '#C0392B',
  },
  textGreen: {
    color: '#2E7D32',
  },
  voiceCard: {
    backgroundColor: '#E7F2E7',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  voiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  voiceCardTitle: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  voiceCardSub: {
    color: '#4E7D4E',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 12,
  },
  voiceActionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  startMicBtn: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  startMicBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    justifyContent: 'space-between',
  },
  stopTapArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingMicContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C0392B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopMicBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listeningText: {
    color: '#C0392B',
    fontSize: 12,
    fontWeight: '700',
  },
  timerText: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FDEDEC',
  },
  cancelBtnText: {
    color: '#C0392B',
    fontSize: 11,
    fontWeight: '600',
  },
  voiceLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  voiceLoadingText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 38, 31, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: '#1D261F',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 16,
  },
  modalInstruction: {
    color: '#6F6B5E',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E7E5DA',
    paddingTop: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FAFAF5',
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  modalCancelBtnText: {
    color: '#6F6B5E',
    fontSize: 12,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalSuccessContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  modalSuccessTitle: {
    color: '#1D261F',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSuccessSub: {
    color: '#6F6B5E',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  modalSuccessBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalSuccessBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 999,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  toastCloseBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
    backgroundColor: '#FAFAF5',
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  filterPillActive: {
    backgroundColor: '#E7F2E7',
    borderColor: '#2E7D32',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6F6B5E',
  },
  filterPillTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  emptyLedgerText: {
    color: '#6F6B5E',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
  calendarModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  rangePreviewContainer: {
    backgroundColor: '#FAFAF5',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    alignItems: 'center',
    marginVertical: 10,
  },
  rangePreviewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  calendarMonthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D261F',
  },
  monthNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FAFAF5',
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  monthNavBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6F6B5E',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
    marginBottom: 4,
  },
  weekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: '#6F6B5E',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: 308, // 7 days * 44px
    alignSelf: 'center',
  },
  dayCell: {
    width: 44,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCellEmpty: {
    width: 44,
    height: 38,
  },
  dayCellStart: {
    backgroundColor: '#2E7D32',
    borderTopLeftRadius: 19,
    borderBottomLeftRadius: 19,
  },
  dayCellEnd: {
    backgroundColor: '#2E7D32',
    borderTopRightRadius: 19,
    borderBottomRightRadius: 19,
  },
  dayCellInRange: {
    backgroundColor: '#E7F2E7',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D261F',
  },
  dayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextInRange: {
    color: '#2E7D32',
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E7E5DA',
    paddingTop: 12,
  },
  calendarResetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FAFAF5',
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  calendarResetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6F6B5E',
  },
  calendarApplyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
  },
  calendarApplyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  transcriptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  transcriptText: {
    color: '#475569',
    fontSize: 10,
    fontStyle: 'italic',
  },
  loadMoreBtn: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreBtnText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  householdBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  householdBadgeText: {
    color: '#475569',
    fontSize: 9,
    fontWeight: '600',
  },
  entryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  entryMetaText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
});
