"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  PlusCircle,
  CheckCircle2,
  Mic,
  Square,
  Trash2,
  X,
  Calendar as CalendarIcon,
  Smartphone,
  Info,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMerchantStore, Entry } from '@/store/useMerchantStore';
import { L } from '@/i18n/translations';
import { Translate } from '@/components/common/Translate';
import { postVoiceEntry, getTransactions, Transaction, postTransaction } from '@/utils/api-config';
import { CustomAlert } from '@/components/common/CustomAlert';
import { parseBankSms } from '@/utils/sms-parser';

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

export default function AddEntryScreen() {
  const { lang, entries, addEntry, enterpriseId } = useMerchantStore();
  const t = L[lang] || L.en;
  const vm = VoiceModalL[lang] || VoiceModalL.en;

  const [type, setType] = useState<Entry['type']>('income');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'month' | 'custom'>('all');

  // Custom calendar states
  const [customDatePickerVisible, setCustomDatePickerVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Ledger paged states
  const [apiTransactions, setApiTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Voice modal reviews
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [modalTranscript, setModalTranscript] = useState('');
  const [modalAmount, setModalAmount] = useState('');
  const [modalType, setModalType] = useState<Entry['type']>('income');
  const [isSaved, setIsSaved] = useState(false);
  const [modalVoiceId, setModalVoiceId] = useState<string | null>(null);



  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch API transaction records
  const fetchLedger = async (pageNumber: number, replaceList: boolean) => {
    if (!enterpriseId) return;

    setIsLoadingLedger(true);
    try {
      let date_from: string | undefined;
      let date_to: string | undefined;
      const now = new Date();

      if (dateFilter === 'today') {
        date_from = now.toISOString().split('T')[0];
        date_to = date_from;
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
        date_to = customEndDate ? customEndDate.toISOString().split('T')[0] : date_from;
      }

      const data = await getTransactions(enterpriseId, {
        page: pageNumber,
        limit: 10,
        date_from,
        date_to,
      });

      if (replaceList) {
        setApiTransactions(data.transactions || []);
      } else {
        setApiTransactions((prev) => {
          const existingIds = new Set(prev.map(t => t.entry_id));
          const newOnly = (data.transactions || []).filter(t => !existingIds.has(t.entry_id));
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
  }, [dateFilter, customStartDate, customEndDate, enterpriseId]);

  const handleLoadMore = () => {
    if (isLoadingLedger || apiTransactions.length >= totalCount) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchLedger(nextPage, false);
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/,/g, ''));
    if (!numAmount || numAmount <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid positive number for the amount.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      if (!enterpriseId) {
        showAlert('Auth Error', 'No active merchant enterprise ID found.', 'error');
        setIsSaving(false);
        return;
      }

      let direction = 'inflow';
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

      // Refresh totals and lists
      useMerchantStore.getState().fetchMerchantData().catch(() => {});
      setCurrentPage(1);
      fetchLedger(1, true);
    } catch (err: any) {
      console.error('Failed to save transaction', err);
      showAlert('Save Error', err?.response?.data?.message || err?.message || 'Failed to save transaction to server.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Web Audio Recording Flow (MediaRecorder) ─── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processRecordedAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      // Start duration counter
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Recording permission failed', err);
      showAlert('Microphone Required', 'Microphone access is required to capture your voice notes.', 'error');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordDuration(0);
  };

  const processRecordedAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      // Send audio file blob to transcription wrapper
      const data = await postVoiceEntry(blob, 'app');

      if (data.error) {
        showAlert('Transcription Error', data.error, 'error');
        setIsTranscribing(false);
        return;
      }

      setModalVoiceId(data.voice_id || null);
      setModalTranscript(data.transcript || '');
      setModalAmount(data.amount && data.amount > 0 ? formatInputValue(data.amount.toString()) : '');
      setModalType(data.direction === 'outflow' ? 'expense' : 'income');

      setIsSaved(false);
      setVoiceModalVisible(true);
    } catch (err) {
      console.error('STT conversion failed', err);
      const local = VoiceAgentL[lang] || VoiceAgentL.en;
      showAlert('Voice Agent Error', local.error, 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleModalSave = async () => {
    const numAmount = parseFloat(modalAmount.replace(/,/g, ''));
    if (!numAmount || numAmount <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid amount.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      if (!enterpriseId) return;

      let direction = 'inflow';
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
        note: cleanNote || 'Recorded voice transaction',
      });
      useMerchantStore.getState().markEntrySynced(localId, 'server-synced');

      setIsSaved(true);

      // Refresh data
      useMerchantStore.getState().fetchMerchantData().catch(() => {});
      setCurrentPage(1);
      fetchLedger(1, true);

      // Auto close modal in 4s
      autoCloseTimerRef.current = setTimeout(() => {
        setVoiceModalVisible(false);
      }, 4000);

    } catch (err) {
      console.error(err);
      showAlert('Save Error', 'Failed to save voice note entry to server ledger.', 'error');
    } finally {
      setIsSaving(false);
    }
  };



  /* ─── Calendar Helpers ─── */
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
    } else {
      if (clickedDate >= customStartDate) {
        setCustomEndDate(clickedDate);
        setCustomDatePickerVisible(false);
      } else {
        setCustomStartDate(clickedDate);
      }
    }
  };

  const getCustomPillLabel = () => {
    if (!customStartDate) return t.filterCustomRange || 'Custom range';
    const startStr = customStartDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    if (!customEndDate) return `${t.filterCustomPrefix || 'Custom: '}${startStr}`;
    const endStr = customEndDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    return `${startStr} - ${endStr}`;
  };

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
  const firstDayIndex = getFirstDayOfMonth(calendarMonth, calendarYear);

  return (
    <div className="flex flex-col gap-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#E7F2E7] border border-[#2E7D32]/20 text-[#2E7D32] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-top-6 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-[#1D261F] text-xl font-bold">{t.recordEntryTitle}</h2>
        <p className="text-[#6F6B5E] text-xs leading-normal mt-1">{t.recordEntrySub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ─── LEFT COLUMN: forms ─── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Voice Agent Assistant Card */}
          <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#2E7D32]">
              <Mic className="w-5 h-5" />
              <h3 className="text-sm font-bold">{(VoiceAgentL[lang] || VoiceAgentL.en).title}</h3>
            </div>
            <p className="text-[#6F6B5E] text-[11px] leading-relaxed">{(VoiceAgentL[lang] || VoiceAgentL.en).sub}</p>

            <div className="mt-2">
              {isTranscribing ? (
                <div className="flex items-center gap-2 text-xs font-bold text-[#2E7D32]">
                  <div className="w-4 h-4 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
                  <span>{(VoiceAgentL[lang] || VoiceAgentL.en).transcribing}</span>
                </div>
              ) : isRecording ? (
                <div className="flex items-center justify-between bg-[#F8E6E2] rounded-xl p-3 border border-[#C0392B]/10">
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2.5 bg-[#C0392B] hover:bg-[#962A1F] text-white px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>Stop & Parse</span>
                  </button>
                  <div className="text-right">
                    <p className="text-[#C0392B] text-xs font-bold animate-pulse">{(VoiceAgentL[lang] || VoiceAgentL.en).listening}</p>
                    <p className="text-[#6F6B5E] text-[10px] font-bold mt-0.5">0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration} / 0:30</p>
                  </div>
                  <button onClick={cancelRecording} className="text-[#C0392B] hover:text-[#962A1F] p-1.5 rounded-full hover:bg-[#F8E6E2]">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-full bg-[#2E7D32] hover:bg-[#225F26] text-white py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <Mic className="w-4 h-4" />
                  <span>{(VoiceAgentL[lang] || VoiceAgentL.en).speakBtn}</span>
                </button>
              )}
            </div>
          </div>

          {/* Manual Entry Form Card */}
          <div className="bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <h3 className="text-[#1D261F] text-sm font-bold">{t.newLedgerEntry}</h3>

            <form onSubmit={handleManualSave} className="flex flex-col gap-4">
              
              {/* Type Grid */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase">{t.transTypeLabel}</span>
                <div className="grid grid-cols-2 gap-2">
                  {['income', 'expense', 'savdep', 'savwd', 'emi', 'newloan'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setType(k as any)}
                      className={`py-2 px-2.5 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                        type === k
                          ? 'bg-[#E7F2E7] border-[#2E7D32] text-[#2E7D32]'
                          : 'bg-white border-[#E7E5DA] text-[#6F6B5E] hover:bg-[#FAFAF5]'
                      }`}
                    >
                      {t.entryTypes[k] || k}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="manual-amount" className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase">{t.amountLabel}</label>
                <div className="flex items-center bg-[#FAFAF5] border border-[#E7E5DA] rounded-lg px-3 py-2.5 focus-within:border-[#2E7D32] transition-colors gap-2">
                  <span className="text-sm font-bold text-[#1D261F]">₹</span>
                  <input
                    id="manual-amount"
                    type="text"
                    placeholder="2,500"
                    value={amount}
                    onChange={(e) => setAmount(formatInputValue(e.target.value))}
                    className="bg-transparent flex-1 text-xs font-semibold text-[#1D261F] focus:outline-none placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Note */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="manual-note" className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase">{t.noteLabel}</label>
                <input
                  id="manual-note"
                  type="text"
                  placeholder={t.notePh}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-[#FAFAF5] border border-[#E7E5DA] rounded-lg px-3 py-2.5 text-xs font-semibold text-[#1D261F] focus:outline-none focus:border-[#2E7D32] transition-colors"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSaving || !amount}
                className={`w-full py-3 rounded-lg text-white text-xs font-bold tracking-wider uppercase transition-all mt-2 cursor-pointer ${
                  isSaving || !amount
                    ? 'bg-[#BDC5BD] cursor-not-allowed opacity-75'
                    : 'bg-[#2E7D32] hover:bg-[#225F26]'
                }`}
              >
                {isSaving ? 'Recording...' : t.saveEntryBtn}
              </button>

            </form>
          </div>



        </div>

        {/* ─── RIGHT COLUMN: ledger history ─── */}
        <div className="lg:col-span-7 bg-white border border-[#E7E5DA] rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-[#1D261F] text-sm font-bold">{t.recentLedgerEntries}</h3>

            {/* Date Filters Row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'today', '7days', 'month', 'custom'] as const).map((f) => {
                const labelMap = {
                  all: t.filterAll || 'All',
                  today: t.filterToday || 'Today',
                  '7days': t.filter7Days || '7 Days',
                  month: t.filterMonth || 'Month',
                  custom: getCustomPillLabel(),
                };
                const isSelected = dateFilter === f;
                return (
                  <button
                    key={f}
                    onClick={() => {
                      if (f === 'custom') {
                        setCustomDatePickerVisible(true);
                      } else {
                        setDateFilter(f);
                        setCustomStartDate(null);
                        setCustomEndDate(null);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2E7D32] border-[#2E7D32] text-white font-bold'
                        : 'bg-[#FAFAF5] border-[#E7E5DA] text-[#6F6B5E] hover:bg-gray-100'
                    }`}
                  >
                    {labelMap[f]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ledger paged items */}
          <div className="flex flex-col divide-y divide-[#E7E5DA] min-h-[300px]">
            {isLoadingLedger && apiTransactions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#2E7D32] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-[#6F6B5E] mt-3 font-semibold">
                  <Translate>Reading transactions...</Translate>
                </p>
              </div>
            ) : apiTransactions.length > 0 ? (
              <>
                {apiTransactions.map((item) => {
                  const isCredit = item.direction === 'inflow';
                  const dateFormatted = new Date(item.event_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                  const categoryName = item.category && t.entryTypes[item.category]
                    ? t.entryTypes[item.category]
                    : (item.category
                        ? item.category.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                        : 'Uncategorized');
                  
                  return (
                    <div key={item.entry_id} className="flex justify-between items-center py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-[#1D261F]">
                          <Translate>{categoryName}</Translate>
                        </span>
                        {item.transcript ? (
                          <span className="text-[10px] text-[#6F6B5E] italic max-w-xs truncate flex items-center gap-1">
                            <Mic className="w-3 h-3 text-[#2E7D32] shrink-0" />
                            <span>"{item.transcript}"</span>
                          </span>
                        ) : item.source === 'sms' ? (
                          <span className="text-[10px] text-[#6F6B5E] flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-[#1565C0] shrink-0" />
                            <span>Auto-detected via SMS</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#6F6B5E]">Manual entry ledger</span>
                        )}
                      </div>
                      <div className="text-right flex flex-col gap-0.5 shrink-0">
                        <span className={`text-xs font-bold ${isCredit ? 'text-[#2E7D32]' : 'text-[#C0392B]'}`}>
                          {isCredit ? '+' : '-'} ₹{parseFloat(item.amount).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] font-semibold text-[#6F6B5E] flex items-center gap-1 justify-end">
                          <Clock className="w-2.5 h-2.5 text-gray-400" />
                          <span>{dateFormatted}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Trigger */}
                {apiTransactions.length < totalCount && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingLedger}
                    className="w-full text-center text-xs font-bold text-[#2E7D32] hover:text-[#225F26] py-3 mt-2 cursor-pointer transition-colors border-t border-[#E7E5DA]"
                  >
                    {isLoadingLedger ? 'Loading more...' : 'Load More Historical Entries'}
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-[#6F6B5E]">
                <Clock className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-xs font-semibold">{t.noEntries}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ─── CALENDAR PICKER DIALOG MODAL ─── */}
      {customDatePickerVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-[#E7E5DA] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1D261F]">
                <Translate>Select Custom Date Range</Translate>
              </span>
              <button
                onClick={() => setCustomDatePickerVisible(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-[#E7E5DA] pb-2">
              <span className="text-xs font-extrabold text-[#2E7D32]">
                <Translate>{monthNames[calendarMonth]}</Translate> {calendarYear}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-1 text-[#6F6B5E] hover:text-[#1D261F]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={handleNextMonth} className="p-1 text-[#6F6B5E] hover:text-[#1D261F]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-col gap-1.5">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-[#6F6B5E]">
                {weekDays.map(d => <span key={d}>{d}</span>)}
              </div>

              {/* Day values */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty_${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dObj = new Date(calendarYear, calendarMonth, day);
                  const isStart = customStartDate && dObj.toDateString() === customStartDate.toDateString();
                  const isEnd = customEndDate && dObj.toDateString() === customEndDate.toDateString();
                  const inRange = customStartDate && customEndDate && dObj >= customStartDate && dObj <= customEndDate;

                  return (
                    <button
                      key={`day_${day}`}
                      onClick={() => handleDayPress(day)}
                      className={`h-7 rounded-md font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                        isStart || isEnd
                          ? 'bg-[#2E7D32] text-white font-bold'
                          : inRange
                            ? 'bg-[#E7F2E7] text-[#2E7D32]'
                            : 'hover:bg-gray-100 text-[#1D261F]'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setDateFilter('custom');
                setCustomDatePickerVisible(false);
              }}
              disabled={!customStartDate}
              className="bg-[#2E7D32] hover:bg-[#225F26] text-white font-bold py-2 rounded-lg text-xs cursor-pointer text-center disabled:opacity-50"
            >
              <Translate>APPLY FILTER RANGE</Translate>
            </button>
          </div>
        </div>
      )}

      {/* ─── VOICE RECOGNITION REVIEW DIALOG MODAL ─── */}
      {voiceModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-[#E7E5DA] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#E7E5DA] pb-2">
              <span className="text-xs font-bold text-[#1D261F] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                <span>{isSaved ? vm.successTitle : 'Review Voice Transaction'}</span>
              </span>
              <button
                onClick={() => setVoiceModalVisible(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSaved ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#2E7D32]" />
                <h4 className="text-sm font-bold text-[#1D261F]">{vm.successTitle}</h4>
                <p className="text-[#6F6B5E] text-xs leading-relaxed">{vm.successSub}</p>
                <button
                  onClick={() => setVoiceModalVisible(false)}
                  className="bg-[#2E7D32] hover:bg-[#225F26] text-white px-8 py-2 rounded-lg text-xs font-bold cursor-pointer mt-2"
                >
                  {vm.ok}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-[#6F6B5E] text-xs leading-relaxed">{vm.reviewText}</p>

                {/* Amount field */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="modal-amount" className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase">{vm.amountLabel}</label>
                  <div className="flex items-center bg-[#FAFAF5] border border-[#E7E5DA] rounded-lg px-2.5 py-2 focus-within:border-[#2E7D32]">
                    <span className="text-xs font-bold mr-1.5">₹</span>
                    <input
                      id="modal-amount"
                      type="text"
                      value={modalAmount}
                      onChange={(e) => setModalAmount(formatInputValue(e.target.value))}
                      className="bg-transparent flex-1 text-xs font-semibold text-[#1D261F] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Type pills */}
                <div className="flex flex-col gap-1">
                  <span className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase">{vm.typeLabel}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['income', 'expense'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setModalType(k as any)}
                        className={`py-1.5 px-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                          modalType === k
                            ? 'bg-[#E7F2E7] border-[#2E7D32] text-[#2E7D32]'
                            : 'bg-white border-[#E7E5DA] text-[#6F6B5E] hover:bg-[#FAFAF5]'
                        }`}
                      >
                        {t.entryTypes[k] || k}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transcript text */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="modal-transcript" className="text-[#6F6B5E] text-[10px] font-bold tracking-wider uppercase">{vm.noteLabel}</label>
                  <textarea
                    id="modal-transcript"
                    rows={2}
                    value={modalTranscript}
                    onChange={(e) => setModalTranscript(e.target.value)}
                    className="bg-[#FAFAF5] border border-[#E7E5DA] rounded-lg p-2 text-xs font-semibold text-[#1D261F] focus:outline-none focus:border-[#2E7D32] resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 border-t border-[#E7E5DA] pt-3 mt-1">
                  <button
                    onClick={() => setVoiceModalVisible(false)}
                    className="flex-1 py-2 border border-[#E7E5DA] text-[#6F6B5E] font-semibold text-xs rounded-lg hover:bg-gray-50 cursor-pointer text-center"
                  >
                    {vm.discardBtn}
                  </button>
                  <button
                    onClick={handleModalSave}
                    disabled={isSaving || !modalAmount}
                    className="flex-1 py-2 bg-[#2E7D32] hover:bg-[#225F26] text-white font-bold text-xs rounded-lg cursor-pointer text-center"
                  >
                    {isSaving ? 'Saving...' : vm.saveBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />

    </div>
  );
}
