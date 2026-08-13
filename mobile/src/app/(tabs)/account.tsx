import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, ActivityIndicator, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  ShieldCheck,
  Globe,
  Lock,
  LogOut,
  HelpCircle,
  Building2,
  Phone,
  Award,
  ChevronRight,
  X,
  PhoneCall,
  KeyRound,
  CheckCircle2,
  MapPin,
  Plus,
  Minus,
  MessageSquare,
  Smartphone,
  History,
} from 'lucide-react-native';
import { useMerchantStore } from '@/store/useMerchantStore';
import { L, SupportedLang } from '@/i18n/translations';
import { GovHeader } from '@/components/common/GovHeader';
import { SecurityBadge } from '@/components/common/SecurityBadge';
import { API_BASE_URL, apiClient } from '@/utils/api-config';
import { CustomAlert } from '@/components/common/CustomAlert';
import { useSmsAutoDetect } from '@/hooks/useSmsAutoDetect';

const LANG_LIST: { id: SupportedLang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी (Hindi)' },
  { id: 'mr', label: 'मराठी (Marathi)' },
  { id: 'te', label: 'తెలుగు (Telugu)' },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    lang,
    setLang,
    name,
    segment,
    district,
    phone,
    gstin,
    score,
    logout,
    token,
    enterpriseId,
    smsAutoDetectEnabled,
    setSmsAutoDetectEnabled,
    smsDetectedCount,
    smsHistoryImportEnabled,
    setSmsHistoryImportEnabled,
  } = useMerchantStore();

  // SMS Auto-Detect Hook
  const smsAutoDetect = useSmsAutoDetect();

  const t = L[lang];

  // Custom Modal States
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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

  // Map Tile States
  const [mapImageUri, setMapImageUri] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState<boolean>(false);
  const [mapError, setMapError] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(15);

  // Helper to convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    if (typeof btoa === 'function') {
      return btoa(binary);
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let base64 = '';
    let i = 0;
    while (i < len) {
      const byte1 = bytes[i++];
      const byte2 = i < len ? bytes[i++] : NaN;
      const byte3 = i < len ? bytes[i++] : NaN;

      const enc1 = byte1 >> 2;
      const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
      let enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
      let enc4 = byte3 & 63;

      if (isNaN(byte2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(byte3)) {
        enc4 = 64;
      }

      base64 += chars.charAt(enc1) + chars.charAt(enc2) +
        (enc3 === 64 ? '=' : chars.charAt(enc3)) +
        (enc4 === 64 ? '=' : chars.charAt(enc4));
    }
    return base64;
  };

  useEffect(() => {
    if (enterpriseId && token) {
      setMapLoading(true);
      setMapError(false);
      apiClient.get(`/enterprise/${enterpriseId}/map-tile?zoom=${zoom}&size=500x250`, {
        responseType: 'arraybuffer'
      })
        .then(response => {
          const base64 = arrayBufferToBase64(response.data);
          setMapImageUri(`data:image/png;base64,${base64}`);
          setMapLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch map tile:', err);
          setMapError(true);
          setMapLoading(false);
        });
    }
  }, [enterpriseId, token, zoom]);

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Nav (Clean Header without top-bar language select) */}
      <View style={styles.topNav}>
        <GovHeader subtitle={t.verifiedMerchantGateway} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>{t.accountTitle}</Text>
          <Text style={styles.subtitle}>{t.accountSub}</Text>
        </View>

        {/* Merchant Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarBox}>
              <User size={24} color="#2E7D32" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.merchantName}>{name}</Text>
              <Text style={styles.merchantMeta}>{segment} · {district}</Text>
            </View>

          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Building2 size={15} color="#6F6B5E" />
            <Text style={styles.infoLabel}>{t.gstinMerchantId}</Text>
            <Text style={styles.infoVal}>{gstin}</Text>
          </View>



          <View style={styles.infoRow}>
            <Award size={15} color="#2E7D32" />
            <Text style={styles.infoLabel}>{t.verificationStatus}</Text>
            <View style={styles.verifiedChip}>
              <ShieldCheck size={12} color="#2E7D32" />
              <Text style={styles.verifiedText}>{t.gstAadhaarVerified}</Text>
            </View>
          </View>
        </View>

        {/* Settings & Preferences Section */}
        <Text style={styles.sectionHeader}>{t.accountSettings}</Text>

        {/* Language Selection Setting Card */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Globe size={18} color="#2E7D32" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>{t.changeLanguage}</Text>
              <Text style={styles.settingSub}>{t.selectPreferredLangSub}</Text>
            </View>
          </View>

          <View style={styles.langGrid}>
            {LANG_LIST.map((item) => {
              const isSelected = item.id === lang;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.langChip, isSelected && styles.langChipSelected]}
                  onPress={() => setLang(item.id)}
                  activeOpacity={0.8}
                >
                  <Globe size={14} color={isSelected ? "#2E7D32" : "#6F6B5E"} />
                  <Text style={[styles.langChipText, isSelected && styles.langChipTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && <CheckCircle2 size={14} color="#2E7D32" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Security & Password Reset Setting */}
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => setSecurityModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Lock size={18} color="#C77700" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>{t.securitySettings}</Text>
              <Text style={styles.settingSub}>Security, Encryption & Password Reset</Text>
            </View>
            <ChevronRight size={18} color="#6F6B5E" />
          </View>
        </TouchableOpacity>

        {/* Support Helpdesk Setting */}
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => setSupportModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <HelpCircle size={18} color="#2E7D32" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>{t.supportHelpdesk}</Text>
              <Text style={styles.settingSub}>Toll Free: 1800-11-2244 · support@dhansetu.example</Text>
            </View>
            <ChevronRight size={18} color="#6F6B5E" />
          </View>
        </TouchableOpacity>

        {/* SMS Auto-Detect Setting Card */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIconBox, { backgroundColor: '#E8F0FE' }]}>
              <MessageSquare size={18} color="#1565C0" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>{t.autoDetectBankSms}</Text>
              <Text style={styles.settingSub}>
                {smsAutoDetect.isListening
                  ? t.smsActiveLabel(smsDetectedCount)
                  : smsAutoDetect.permissionStatus === 'unavailable'
                    ? t.availableOnAndroidOnly
                    : smsAutoDetect.permissionStatus === 'denied'
                      ? t.smsPermissionRequired
                      : t.detectTransactionsSub}
              </Text>
            </View>
            <Switch
              value={smsAutoDetectEnabled}
              onValueChange={async (value) => {
                if (value) {
                  // Request permission first if not granted
                  if (smsAutoDetect.permissionStatus !== 'granted') {
                    const granted = await smsAutoDetect.requestPermission();
                    if (!granted) {
                      showAlert(
                        t.smsPermissionTitle,
                        t.smsPermissionMsg,
                        'warning'
                      );
                      return;
                    }
                  }
                  setSmsAutoDetectEnabled(true);
                  await smsAutoDetect.startListening();
                } else {
                  setSmsAutoDetectEnabled(false);
                  await smsAutoDetect.stopListening();
                }
              }}
              trackColor={{ false: '#E7E5DA', true: '#A5D6A7' }}
              thumbColor={smsAutoDetectEnabled ? '#2E7D32' : '#BDBDBD'}
            />
          </View>

          {/* Status Indicators */}
          {smsAutoDetectEnabled && (
            <View style={styles.smsStatusContainer}>
              <View style={styles.smsStatusRow}>
                <Smartphone size={12} color={smsAutoDetect.isListening ? '#2E7D32' : '#C77700'} />
                <Text style={[
                  styles.smsStatusText,
                  { color: smsAutoDetect.isListening ? '#2E7D32' : '#C77700' }
                ]}>
                  {smsAutoDetect.isListening ? t.listeningForBankSms : t.startingListener}
                </Text>
                <View style={[
                  styles.smsStatusDot,
                  { backgroundColor: smsAutoDetect.isListening ? '#4CAF50' : '#FFA726' }
                ]} />
              </View>

              <View style={styles.smsPrivacyNoteContainer}>
                <Lock size={10} color="#9E9E9E" />
                <Text style={styles.smsPrivacyNote}>
                  {t.smsPrivacyNotice}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* SMS History Import Setting Card (Opt-In, disabled by default) */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIconBox, { backgroundColor: '#FFF3E0' }]}>
              <History size={18} color="#E65100" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>{t.importSmsHistory}</Text>
              <Text style={styles.settingSub}>
                {smsHistoryImportEnabled
                  ? smsAutoDetect.isScanning
                    ? t.scanningPastSmsInbox
                    : smsAutoDetect.historicalScanCount > 0
                      ? t.pastTxnsImportedLabel(smsAutoDetect.historicalScanCount)
                      : t.smsEnabledWillScan
                  : t.scanPastSmsSub}
              </Text>
            </View>
            <Switch
              value={smsHistoryImportEnabled}
              onValueChange={async (value) => {
                if (value) {
                  // Need SMS permission for history scan too
                  if (smsAutoDetect.permissionStatus !== 'granted') {
                    const granted = await smsAutoDetect.requestPermission();
                    if (!granted) {
                      showAlert(
                        t.smsPermissionTitle,
                        t.smsHistoryPermissionMsg,
                        'warning'
                      );
                      return;
                    }
                  }
                  setSmsHistoryImportEnabled(true);
                  // Trigger the scan immediately if the listener is already running
                  if (smsAutoDetect.isListening) {
                    smsAutoDetect.runHistoricalScan();
                  }
                } else {
                  setSmsHistoryImportEnabled(false);
                }
              }}
              trackColor={{ false: '#E7E5DA', true: '#FFCC80' }}
              thumbColor={smsHistoryImportEnabled ? '#E65100' : '#BDBDBD'}
            />
          </View>

          {/* History scan status */}
          {smsHistoryImportEnabled && (
            <View style={styles.smsStatusContainer}>
              {smsAutoDetect.isScanning && (
                <View style={styles.smsStatusRow}>
                  <ActivityIndicator size={10} color="#E65100" />
                  <Text style={[styles.smsStatusText, { color: '#E65100' }]}>
                    {t.scanningPastSmsProgress}
                  </Text>
                </View>
              )}

              {smsAutoDetect.historicalScanCount > 0 && !smsAutoDetect.isScanning && (
                <View style={styles.smsStatusRow}>
                  <CheckCircle2 size={12} color="#2E7D32" />
                  <Text style={[styles.smsStatusText, { color: '#2E7D32' }]}>
                    {t.pastTxnsImportedLabel(smsAutoDetect.historicalScanCount)}
                  </Text>
                </View>
              )}

              <View style={styles.smsPrivacyNoteContainer}>
                <Lock size={10} color="#9E9E9E" />
                <Text style={styles.smsPrivacyNote}>
                  {t.smsHistoryPrivacyNotice}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Verified Business Location Card */}
        {enterpriseId && token && (
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarBox}>
                <MapPin size={24} color="#2E7D32" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.merchantName}>{t.verifiedShopLocation}</Text>
                <Text style={styles.merchantMeta}>{t.googleMapsCentroid}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.mapContainer}>
              {mapLoading && !mapImageUri ? (
                <View style={styles.mapOverlaySpinner}>
                  <ActivityIndicator size="small" color="#2E7D32" />
                  <Text style={styles.mapLoadingText}>Loading location map...</Text>
                </View>
              ) : mapError ? (
                <View style={styles.mapOverlayError}>
                  <MapPin size={24} color="#C0392B" style={{ marginBottom: 6 }} />
                  <Text style={styles.mapErrorText}>Unable to load map tile.</Text>
                </View>
              ) : mapImageUri ? (
                <>
                  <Image
                    source={{ uri: mapImageUri }}
                    style={styles.mapImage}
                    resizeMode="cover"
                  />
                  {/* Subtle Loading overlay while fetching new zoom levels */}
                  {mapLoading && (
                    <View style={styles.mapSubtleLoading}>
                      <ActivityIndicator size="small" color="#2E7D32" />
                    </View>
                  )}
                  {/* Zoom Controls Overlay */}
                  <View style={styles.zoomControls}>
                    <TouchableOpacity
                      style={styles.zoomBtn}
                      onPress={() => setZoom(prev => Math.min(18, prev + 1))}
                      disabled={zoom >= 18 || mapLoading}
                      activeOpacity={0.7}
                    >
                      <Plus size={16} color={zoom >= 18 || mapLoading ? "#CBD5E1" : "#1D261F"} />
                    </TouchableOpacity>
                    <View style={styles.zoomDivider} />
                    <TouchableOpacity
                      style={styles.zoomBtn}
                      onPress={() => setZoom(prev => Math.max(12, prev - 1))}
                      disabled={zoom <= 12 || mapLoading}
                      activeOpacity={0.7}
                    >
                      <Minus size={16} color={zoom <= 12 || mapLoading ? "#CBD5E1" : "#1D261F"} />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.mapOverlaySpinner}>
                  <ActivityIndicator size="small" color="#2E7D32" />
                </View>
              )}
            </View>
            <Text style={styles.mapFooterText}>
              {t.gpsLockedFooter}
            </Text>
          </View>
        )}

        {/* Security Badge */}
        <SecurityBadge />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.85}
        >
          <LogOut size={18} color="#C0392B" />
          <Text style={styles.logoutButtonText}>{t.logoutBtn}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ----------------- CUSTOM SECURITY & ACCESS MODAL ----------------- */}
      <Modal visible={securityModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.customModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconBox, { backgroundColor: '#FBF0D9' }]}>
                <Lock size={20} color="#C77700" />
              </View>
              <Text style={styles.modalTitle}>{t.securityAccessInfoTitle}</Text>
              <TouchableOpacity onPress={() => setSecurityModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color="#6F6B5E" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalInfoBox}>
                <ShieldCheck size={16} color="#2E7D32" />
                <Text style={styles.modalInfoBoxText}>
                  {t.sslEncryptedGateway}
                </Text>
              </View>

              <Text style={styles.modalDetailLabel}>{t.registeredGstinCreds}</Text>
              <Text style={styles.modalDetailVal}>{gstin}</Text>

              <Text style={styles.modalDetailLabel}>{t.aadhaarLinkedMobile}</Text>
              <Text style={styles.modalDetailVal}>{phone}</Text>

              <Text style={styles.modalDetailLabel}>{t.activeSessionId}</Text>
              <Text style={styles.modalDetailVal}>DS-SEC-SESSION-889231</Text>
            </View>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                setSecurityModalVisible(false);
                showAlert(t.otpDispatchedTitle, t.otpDispatchedMsg, 'success');
              }}
            >
              <KeyRound size={16} color="#FFFFFF" />
              <Text style={styles.modalPrimaryBtnText}>{t.requestAadhaarOtpReset}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setSecurityModalVisible(false)}>
              <Text style={styles.modalSecondaryBtnText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ----------------- CUSTOM GOVERNMENT NODAL SUPPORT MODAL ----------------- */}
      <Modal visible={supportModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.customModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconBox, { backgroundColor: '#E7F2E7' }]}>
                <HelpCircle size={20} color="#2E7D32" />
              </View>
              <Text style={styles.modalTitle}>{t.dhansetuSupportHelpdeskTitle}</Text>
              <TouchableOpacity onPress={() => setSupportModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color="#6F6B5E" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDetailLabel}>{t.supportDeptLabel}</Text>
              <Text style={styles.modalDetailVal}>{t.financialInclusionDiv}</Text>

              <Text style={styles.modalDetailLabel}>{t.tollFreeHelpline}</Text>
              <Text style={[styles.modalDetailVal, { color: '#1565C0' }]}>1800-11-2244</Text>

              <Text style={styles.modalDetailLabel}>{t.officialEmailSupport}</Text>
              <Text style={styles.modalDetailVal}>support@dhansetu.example</Text>

              <Text style={styles.modalDetailLabel}>{t.operatingHours}</Text>
              <Text style={styles.modalDetailVal}>{t.operatingHoursVal}</Text>

              <Text style={styles.modalDetailLabel}>{t.supportCoordinator}</Text>
              <Text style={styles.modalDetailVal}>{t.regionalNodalCoordinator}</Text>
            </View>

            <TouchableOpacity
              style={[styles.modalPrimaryBtn, { backgroundColor: '#2E7D32' }]}
              onPress={() => {
                setSupportModalVisible(false);
                showAlert(t.dhansetuSupportHelpdeskTitle, t.callingSupportMsg, 'info');
              }}
            >
              <PhoneCall size={16} color="#FFFFFF" />
              <Text style={styles.modalPrimaryBtnText}>{t.callHelplineBtn}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setSupportModalVisible(false)}>
              <Text style={styles.modalSecondaryBtnText}>{t.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ----------------- CUSTOM LOGOUT CONFIRMATION MODAL ----------------- */}
      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.customModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconBox, { backgroundColor: '#F8E6E2' }]}>
                <LogOut size={20} color="#C0392B" />
              </View>
              <Text style={styles.modalTitle}>Confirm Merchant Logout</Text>
              <TouchableOpacity onPress={() => setLogoutModalVisible(false)} style={styles.closeBtn}>
                <X size={18} color="#6F6B5E" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.logoutModalPrompt}>
                Are you sure you want to log out of your merchant portal session?
              </Text>
              <Text style={styles.logoutModalSub}>
                Your transaction ledger entries and financial records are securely saved on device.
              </Text>
            </View>

            <TouchableOpacity style={styles.logoutConfirmBtn} onPress={confirmLogout}>
              <LogOut size={16} color="#FFFFFF" />
              <Text style={styles.logoutConfirmBtnText}>YES, LOGOUT NOW</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setLogoutModalVisible(false)}>
              <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5DA',
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  headerSection: {
    marginBottom: 16,
  },
  mainTitle: {
    color: '#1D261F',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6F6B5E',
    fontSize: 12,
    marginTop: 2,
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
    shadowRadius: 4,
    elevation: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E7F2E7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  merchantName: {
    color: '#1D261F',
    fontSize: 16,
    fontWeight: '700',
  },
  merchantMeta: {
    color: '#6F6B5E',
    fontSize: 12,
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tierGreen: { backgroundColor: '#E7F2E7' },
  tierAmber: { backgroundColor: '#FBF0D9' },
  tierRed: { backgroundColor: '#F8E6E2' },
  tierText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D261F',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7E5DA',
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    color: '#6F6B5E',
    fontSize: 12,
    fontWeight: '500',
  },
  infoVal: {
    color: '#1D261F',
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E7F2E7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  verifiedText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: '600',
  },
  sectionHeader: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FAFAF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E5DA',
  },
  settingTitle: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '600',
  },
  settingSub: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 2,
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAFAF5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    width: '48%',
  },
  langChipSelected: {
    backgroundColor: '#E7F2E7',
    borderColor: '#2E7D32',
  },
  langFlag: {
    fontSize: 16,
  },
  langChipText: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  langChipTextSelected: {
    color: '#1D261F',
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#F8E6E2',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F8E6E2',
    marginTop: 16,
  },
  logoutButtonText: {
    color: '#C0392B',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  /* SMS Auto-Detect Styles */
  smsStatusContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E7E5DA',
    gap: 8,
  },
  smsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smsStatusText: {
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  smsStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  smsPrivacyNote: {
    fontSize: 10,
    color: '#9E9E9E',
    flex: 1,
    lineHeight: 14,
  },
  smsPrivacyNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  /* Custom Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 38, 31, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  customModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  modalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    color: '#1D261F',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 18,
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E7F2E7',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E7E5DA',
    marginBottom: 12,
  },
  modalInfoBoxText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  modalDetailLabel: {
    color: '#6F6B5E',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
  },
  modalDetailVal: {
    color: '#1D261F',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  modalPrimaryBtn: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalSecondaryBtn: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    color: '#6F6B5E',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutModalPrompt: {
    color: '#1D261F',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  logoutModalSub: {
    color: '#6F6B5E',
    fontSize: 12,
    lineHeight: 16,
  },
  logoutConfirmBtn: {
    backgroundColor: '#C0392B',
    borderRadius: 10,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logoutConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mapContainer: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapSubtleLoading: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    width: '100%',
  },
  mapOverlaySpinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  mapLoadingText: {
    color: '#6F6B5E',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
  mapOverlayError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDEDEC',
    padding: 12,
  },
  mapErrorText: {
    color: '#C0392B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapFooterText: {
    color: '#6F6B5E',
    fontSize: 10,
    marginTop: 8,
    lineHeight: 14,
    fontStyle: 'italic',
  },
});
