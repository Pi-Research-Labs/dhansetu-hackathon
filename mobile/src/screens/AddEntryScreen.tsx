import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlusCircle, CheckCircle2, History, Mic, Square, Trash2, X } from 'lucide-react-native';
import { useMerchantStore, Entry } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { postVoiceEntry } from '@/utils/api-config';
import { CustomAlert } from '@/components/common/CustomAlert';

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
    listening: 'Listening... Tap to stop',
    transcribing: 'Processing voice note with AI...',
    success: 'AI Agent Extracted',
    error: 'Speech-to-text failed. Please try again.',
    noMatch: 'Could not extract amount/direction, but transcript populated.',
    cancel: 'Cancel',
    speakBtn: 'Tap to Speak Entry',
  },
  hi: {
    title: 'वॉइस लेनदेन एजेंट (AI)',
    sub: 'हिंदी, अंग्रेजी, मराठी या तेलुगु में बोलें (अधिकतम 30s)। जैसे, "फसल बिक्री के लिए 1,200 रुपये मिले"',
    listening: 'सुन रहा है... रोकने के लिए टैप करें',
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
    listening: 'ऐकत आहे... थांबवण्यासाठी टॅप करा',
    transcribing: 'एआय व्हॉइस नोटवर प्रक्रिया करत आहे...',
    success: 'एआय एजंटने शोधले',
    error: 'व्हॉइस रेकॉर्डिंग अयशस्वी. कृपया पुन्हा प्रयत्न करा.',
    noMatch: 'रक्कम/दिशा शोधता आली नाही, पण मजकूर भरला गेला आहे.',
    cancel: 'रद्द करा',
    speakBtn: 'नोंद बोलण्यासाठी टॅप करा',
  },
  te: {
    title: 'వాయిస్ లావాదేవీ ఏజెంట్ (AI)',
    sub: 'తెలుగు, హిందీ, మరాఠీ లేదా ఇంగ్లీషులో మాట్లాడండి (గరిష్టంగా 30 సెకన్లు). ఉదా., "పంట అమ్మకం కోసం 1,200 రూపాయలు వచ్చాయి"',
    listening: 'వింటున్నది... ఆపడానికి ట్యాప్ చేయండి',
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

export function AddEntryScreen() {
  const insets = useSafeAreaInsets();
  const { lang, entries, addEntry } = useMerchantStore();
  const t = L[lang];
  const vm = VoiceModalL[lang] || VoiceModalL.en;

  const [type, setType] = useState<Entry['type']>('income');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

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

  // Timers and Refs
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      setModalTranscript(data.transcript || '');
      setModalAmount(data.amount && data.amount > 0 ? data.amount.toString() : '');
      
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
        setAmount(data.amount.toString());
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
  };

  const handleModalSave = () => {
    const numAmount = parseFloat(modalAmount);
    if (!numAmount || numAmount <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid positive number for the amount.', 'warning');
      return;
    }

    addEntry({
      type: modalType,
      amount: numAmount,
      note: modalTranscript.trim() || 'Recorded transaction',
    });

    // Clear main form inputs
    setAmount('');
    setNote('');

    // Trigger success screen inside the voice modal
    setIsSaved(true);

    // Auto-close in 5 seconds
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      closeVoiceModal();
    }, 5000);
  };

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid positive number for the amount.', 'warning');
      return;
    }

    addEntry({
      type,
      amount: numAmount,
      note: note.trim() || 'Recorded transaction',
    });

    setAmount('');
    setNote('');
    showToast(lang === 'hi' ? 'लेनदेन प्रविष्टि सफलतापूर्वक सहेजी गई।' : 'Transaction entry successfully recorded into your digital ledger.');
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
                <View style={styles.pulsingMicContainer}>
                  <TouchableOpacity style={styles.stopMicBtn} onPress={stopRecording} activeOpacity={0.8}>
                    <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.recordingInfo}>
                  <Text style={styles.listeningText}>{(VoiceAgentL[lang] || VoiceAgentL.en).listening}</Text>
                  <Text style={styles.timerText}>0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration} / 0:30</Text>
                </View>
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
                onChangeText={setAmount}
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

          <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.85}>
            <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.submitBtnText}>{t.saveEntryBtn}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Ledger Entries */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <History size={16} color="#1D261F" />
            <Text style={styles.historyTitle}>{t.recentLedgerEntries} ({entries.length})</Text>
          </View>

          {entries.map((en) => (
            <View key={en.id} style={styles.entryRowItem}>
              <View style={styles.entryMainInfo}>
                <Text style={styles.entryTypeTitle}>{t.entryTypes[en.type] || en.type}</Text>
                <Text style={styles.entryNoteText}>{en.note}</Text>
              </View>
              <View style={styles.entryAmountInfo}>
                <Text style={[styles.entryAmtText, en.type === 'expense' || en.type === 'emi' ? styles.textRed : styles.textGreen]}>
                  {en.type === 'expense' || en.type === 'emi' ? `-₹ ${en.amount.toLocaleString('en-IN')}` : `+₹ ${en.amount.toLocaleString('en-IN')}`}
                </Text>
                <Text style={styles.entryDateText}>{en.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
                        onChangeText={setModalAmount}
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
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalCancelBtnText}>{vm.discardBtn}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalConfirmBtn}
                    onPress={handleModalSave}
                    activeOpacity={0.85}
                  >
                    <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.modalConfirmBtnText}>{vm.saveBtn}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {toastMessage && (
        <View style={styles.toastContainer}>
          <CheckCircle2 size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
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
    paddingBottom: 100,
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
    bottom: 90,
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
  },
});
