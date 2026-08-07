export type SupportedLang = 'en' | 'hi' | 'mr' | 'te';

export interface Translations {
  langName: string;
  portalTitle: string;
  myPortfolio: string;
  marketIntelligence: string;
  logout: string;
  last90: string;
  savBal: string;
  loanOut: string;
  mEmi: string;
  missedEmiSuffix: string;
  noLoan: string;
  runwaySuffix: string;
  emiBanner: (n: number) => string;
  weeklyRecordTitle: string;
  weeklyRecordSub: string;
  inflowLabel: string;
  outflowLabel: string;
  netLabel: string;
  channelsTitle: string;
  channelsSub: string;
  upiLabel: string;
  appsLabel: string;
  cashLabel: string;
  recordedEntriesTitle: string;
  addNew: string;
  noEntries: string;
  
  // Add Entry Screen
  recordEntryTitle: string;
  recordEntrySub: string;
  newLedgerEntry: string;
  transTypeLabel: string;
  amountLabel: string;
  noteLabel: string;
  notePh: string;
  saveEntryBtn: string;
  recentLedgerEntries: string;
  entryTypes: Record<string, string>;
  
  // Market Screen
  marketTitle: string;
  marketSub: string;
  trackedCommodity: string;
  liveFeed: string;
  realtimeRates: string;
  productivityTitle: string;
  seasonalTitle: string;
  climateRisksTitle: string;
  severityLabel: (sev: string) => string;
  
  // Alerts Screen
  alertsTitle: string;
  alertsSub: string;
  healthStatusLabel: string;
  healthDesc: string;
  activeFlagsTitle: (count: number) => string;
  suggestedActionsTitle: string;
  recNumber: (n: number) => string;
  tiers: Record<string, string>;
  
  // Login Screen
  merchantAccessPortal: string;
  officialPortalSub: string;
  gstinTab: string;
  mobileTab: string;
  gstinLabel: string;
  passwordLabel: string;
  forgotPassword: string;
  mobileLabel: string;
  otpLabel: string;
  sendOtp: string;
  captchaLabel: string;
  enterCodePh: string;
  rememberMe: string;
  loginBtn: string;
  needHelp: string;
  disclaimer: string;

  // Account Screen
  accountTitle: string;
  accountSub: string;
  accountSettings: string;
  profileDetails: string;
  changeLanguage: string;
  securitySettings: string;
  resetPassword: string;
  supportHelpdesk: string;
  logoutBtn: string;
  logoutConfirmTitle: string;
  logoutConfirmMsg: string;
  cancel: string;
  
  // First load modal
  firstLoadLangTitle: string;
  firstLoadLangSub: string;
  firstLoadLangTip: string;
  applyLangBtn: string;
}

export const L: Record<SupportedLang, Translations> = {
  en: {
    langName: 'English',
    portalTitle: 'DhanSetu Merchant',
    myPortfolio: 'My Portfolio',
    marketIntelligence: 'Market Intelligence',
    logout: 'Logout',
    last90: 'Last 90 Days Net',
    savBal: 'Savings Balance',
    loanOut: 'Loan Outstanding',
    mEmi: 'Monthly EMI',
    missedEmiSuffix: 'missed 90d',
    noLoan: 'No active loan',
    runwaySuffix: 'mo runway',
    emiBanner: (n) => `⚠️ ${n} missed EMI(s) in the last 90 days — see Alerts tab for recommended actions.`,
    weeklyRecordTitle: 'Weekly Cashflow Record',
    weeklyRecordSub: 'Last 4 weeks history',
    inflowLabel: 'In',
    outflowLabel: 'Out',
    netLabel: 'Net',
    channelsTitle: 'Collection Channels',
    channelsSub: 'How your customers pay you',
    upiLabel: 'UPI',
    appsLabel: 'Apps',
    cashLabel: 'Cash',
    recordedEntriesTitle: 'Recorded Entries',
    addNew: '+ Add New',
    noEntries: 'No transaction entries recorded yet.',

    recordEntryTitle: 'Record Transaction Entry',
    recordEntrySub: 'Entries you add here enrich your record — cash sales recorded digitally strengthen your credit profile.',
    newLedgerEntry: 'New Ledger Entry',
    transTypeLabel: 'TRANSACTION TYPE *',
    amountLabel: 'AMOUNT (INR) *',
    noteLabel: 'NOTE / DESCRIPTION (OPTIONAL)',
    notePh: 'e.g. Sunday market sales',
    saveEntryBtn: 'SAVE ENTRY TO LEDGER',
    recentLedgerEntries: 'Recent Ledger Entries',
    entryTypes: {
      income: 'Income',
      expense: 'Expense',
      savdep: 'Savings Deposit',
      savwd: 'Savings Withdrawal',
      emi: 'Loan Repayment (EMI)',
      newloan: 'New Loan Taken',
    },

    marketTitle: 'Market Intelligence',
    marketSub: 'Real-time agricultural commodity prices, MSP & climate risk index',
    trackedCommodity: 'TRACKED COMMODITY BASKET',
    liveFeed: 'LIVE MANDI & MSP FEED',
    realtimeRates: 'Real-Time Commodity Rates',
    productivityTitle: 'Productivity Outlook',
    seasonalTitle: 'Seasonal Pattern',
    climateRisksTitle: 'Climate & Market Risks in Model',
    severityLabel: (sev) => `${sev.toUpperCase()} SEVERITY`,

    alertsTitle: 'Risk Alerts & Advice',
    alertsSub: 'Early warning indicators & actionable financial recommendations',
    healthStatusLabel: 'BUSINESS HEALTH STATUS',
    healthDesc: 'Risk indicators are calculated by benchmarking your cashflow records against segment peers.',
    activeFlagsTitle: (count) => `Active Risk Flags (${count})`,
    suggestedActionsTitle: 'Suggested Actions for You',
    recNumber: (n) => `Recommendation #${n}`,
    tiers: { GREEN: 'Stable', AMBER: 'Watch', RED: 'Act Now' },

    merchantAccessPortal: 'Merchant Access Portal',
    officialPortalSub: 'Official portal for GST registered traders, vendors & enterprises',
    gstinTab: 'GSTIN / Merchant ID',
    mobileTab: 'Mobile & OTP',
    gstinLabel: 'GSTIN / MERCHANT ID *',
    passwordLabel: 'PASSWORD *',
    forgotPassword: 'Forgot Password?',
    mobileLabel: 'REGISTERED MOBILE NUMBER *',
    otpLabel: 'ENTER OTP',
    sendOtp: 'Send OTP',
    captchaLabel: 'SECURITY CODE (CAPTCHA) *',
    enterCodePh: 'Enter code',
    rememberMe: 'Remember GSTIN / Device Credentials',
    loginBtn: 'SECURE MERCHANT LOGIN',
    needHelp: 'Need Help logging in? Contact Nodal Support',
    disclaimer: 'Unauthorized access to this system is strictly prohibited under the IT Act 2000.',

    accountTitle: 'Account & Settings',
    accountSub: 'Manage your merchant profile, language preferences, and portal security',
    accountSettings: 'Account Settings',
    profileDetails: 'Merchant Profile Details',
    changeLanguage: 'App Language / भाषा',
    securitySettings: 'Security & Access',
    resetPassword: 'Reset Password via Aadhaar OTP',
    supportHelpdesk: 'DhanSetu Nodal Support',
    logoutBtn: 'LOGOUT FROM PORTAL',
    logoutConfirmTitle: 'Merchant Logout',
    logoutConfirmMsg: 'Are you sure you want to log out of your session?',
    cancel: 'Cancel',

    firstLoadLangTitle: 'Choose Your Preferred Language',
    firstLoadLangSub: 'Select the language for the DhanSetu Merchant Portal',
    firstLoadLangTip: '💡 Language is changeable anytime later from the Account Settings page.',
    applyLangBtn: 'OK, APPLY LANGUAGE',
  },

  hi: {
    langName: 'हिन्दी',
    portalTitle: 'धनसेतु मर्चेंट',
    myPortfolio: 'मेरा पोर्टफोलियो',
    marketIntelligence: 'बाज़ार जानकारी',
    logout: 'लॉग आउट',
    last90: 'पिछले 90 दिन शुद्ध',
    savBal: 'बचत शेष',
    loanOut: 'बकाया ऋण',
    mEmi: 'मासिक EMI',
    missedEmiSuffix: 'चूकी 90d',
    noLoan: 'कोई ऋण नहीं',
    runwaySuffix: 'माह बचत',
    emiBanner: (n) => `⚠️ पिछले 90 दिनों में ${n} EMI चूकी — क्या करें, इसके लिए अलर्ट टैब देखें।`,
    weeklyRecordTitle: 'साप्ताहिक नकदी प्रवाह रिकॉर्ड',
    weeklyRecordSub: 'पिछले 4 हफ्तों का इतिहास',
    inflowLabel: 'आवक',
    outflowLabel: 'जावक',
    netLabel: 'शुद्ध',
    channelsTitle: 'भुगतान संग्रह चैनल',
    channelsSub: 'ग्राहक आपको कैसे भुगतान करते हैं',
    upiLabel: 'UPI',
    appsLabel: 'ऐप्स',
    cashLabel: 'नकद',
    recordedEntriesTitle: 'दर्ज प्रविष्टियाँ',
    addNew: '+ नई प्रविष्टि',
    noEntries: 'अभी कोई प्रविष्टि दर्ज नहीं की गई है।',

    recordEntryTitle: 'लेनदेन प्रविष्टि दर्ज करें',
    recordEntrySub: 'यहाँ जोड़ी गई प्रविष्टियाँ आपका रिकॉर्ड समृद्ध करती हैं — नकद बिक्री को डिजिटल दर्ज करने से आपकी क्रेडिट प्रोफ़ाइल मज़बूत होती है।',
    newLedgerEntry: 'नई बही-खाता प्रविष्टि',
    transTypeLabel: 'लेनदेन का प्रकार *',
    amountLabel: 'राशि (₹) *',
    noteLabel: 'टिप्पणी / विवरण (वैकल्पिक)',
    notePh: 'जैसे रविवार बाज़ार की बिक्री',
    saveEntryBtn: 'बही-खाते में सहेजें',
    recentLedgerEntries: 'हाल की प्रविष्टियाँ',
    entryTypes: {
      income: 'आय (Income)',
      expense: 'खर्च (Expense)',
      savdep: 'बचत जमा (Savings)',
      savwd: 'बचत निकासी',
      emi: 'ऋण भुगतान (EMI)',
      newloan: 'नया ऋण (New Loan)',
    },

    marketTitle: 'बाज़ार बुद्धिमत्ता (Market Intel)',
    marketSub: 'कृषि वस्तु मूल्य, न्यूनतम समर्थन मूल्य (MSP) और जलवायु जोखिम सूचकांक',
    trackedCommodity: 'ट्रैक की गई वस्तु बास्केट',
    liveFeed: 'लाइव मंडी एवं MSP फ़ीड',
    realtimeRates: 'वास्तविक समय मंडी भाव',
    productivityTitle: 'उत्पादकता परिदृश्य',
    seasonalTitle: 'मौसमी पैटर्न',
    climateRisksTitle: 'मॉडल में जलवायु व बाज़ार जोखिम',
    severityLabel: (sev) => `${sev.toUpperCase()} जोखिम`,

    alertsTitle: 'जोखिम अलर्ट एवं सुझाव',
    alertsSub: 'पूर्व चेतावनी संकेत एवं सुझाई गई वित्तीय कार्रवाइयाँ',
    healthStatusLabel: 'व्यवसाय स्वास्थ्य स्थिति',
    healthDesc: 'जोखिम संकेतों की गणना आपके नकदी प्रवाह का साथियों से तुलना करके की जाती है।',
    activeFlagsTitle: (count) => `सक्रिय जोखिम फ्लैग (${count})`,
    suggestedActionsTitle: 'आपके लिए सुझाई गई कार्रवाइयाँ',
    recNumber: (n) => `सुझाव #${n}`,
    tiers: { GREEN: 'स्थिर', AMBER: 'निगरानी', RED: 'तुरंत कार्रवाई' },

    merchantAccessPortal: 'व्यापारी पहुँच पोर्टल',
    officialPortalSub: 'GST पंजीकृत व्यापारियों, विक्रेताओं एवं उद्यमों के लिए आधिकारिक पोर्टल',
    gstinTab: 'GSTIN / व्यापारी ID',
    mobileTab: 'मोबाइल एवं OTP',
    gstinLabel: 'GSTIN / व्यापारी ID *',
    passwordLabel: 'पासवर्ड *',
    forgotPassword: 'पासवर्ड भूल गए?',
    mobileLabel: 'पंजीकृत मोबाइल नंबर *',
    otpLabel: 'OTP दर्ज करें',
    sendOtp: 'OTP भेजें',
    captchaLabel: 'सुरक्षा कोड (CAPTCHA) *',
    enterCodePh: 'कोड दर्ज करें',
    rememberMe: 'GSTIN / डिवाइस विवरण याद रखें',
    loginBtn: 'सुरक्षित व्यापारी लॉगिन',
    needHelp: 'लॉगिन में सहायता चाहिए? सहायता केंद्र से संपर्क करें',
    disclaimer: 'आईटी अधिनियम 2000 के तहत इस प्रणाली तक अनधिकृत पहुँच सख्त वर्जित है।',

    accountTitle: 'खाता एवं सेटिंग्स',
    accountSub: 'अपनी प्रोफ़ाइल, भाषा प्राथमिकताओं और पोर्टल सुरक्षा को प्रबंधित करें',
    accountSettings: 'खाता सेटिंग्स',
    profileDetails: 'व्यापारी प्रोफ़ाइल विवरण',
    changeLanguage: 'ऐप भाषा / App Language',
    securitySettings: 'सुरक्षा एवं पहुँच',
    resetPassword: 'आधार OTP के माध्यम से पासवर्ड रीसेट करें',
    supportHelpdesk: 'धनसेतु नोडल सहायता केंद्र',
    logoutBtn: 'पोर्टल से लॉग आउट करें',
    logoutConfirmTitle: 'व्यापारी लॉग आउट',
    logoutConfirmMsg: 'क्या आप निश्चित रूप से अपने सत्र से लॉग आउट करना चाहते हैं?',
    cancel: 'रद्द करें',

    firstLoadLangTitle: 'अपनी पसंदीदा भाषा चुनें',
    firstLoadLangSub: 'धनसेतु मर्चेंट पोर्टल के लिए भाषा का चयन करें',
    firstLoadLangTip: '💡 आप बाद में अकाउंट सेटिंग्स पेज से कभी भी अपनी भाषा बदल सकते हैं।',
    applyLangBtn: 'ठीक है, भाषा लागू करें',
  },

  mr: {
    langName: 'मराठी',
    portalTitle: 'धनसेतु मर्चंट',
    myPortfolio: 'माझा पोर्टफोलिओ',
    marketIntelligence: 'बाजार माहिती',
    logout: 'लॉग आउट',
    last90: 'मागील ९० दिवस निव्वळ',
    savBal: 'बचत शिल्लक',
    loanOut: 'थकीत कर्ज',
    mEmi: 'मासिक EMI',
    missedEmiSuffix: 'चुकल्या ९०d',
    noLoan: 'कर्ज नाही',
    runwaySuffix: 'महिने बचत',
    emiBanner: (n) => `⚠️ मागील ९० दिवसांत ${n} EMI चुकल्या — काय करावे यासाठी सूचना टॅब पहा.`,
    weeklyRecordTitle: 'साप्ताहिक रोख प्रवाह नोंद',
    weeklyRecordSub: 'मागील ४ आठवड्यांचा इतिहास',
    inflowLabel: 'आवक',
    outflowLabel: 'जावक',
    netLabel: 'निव्वळ',
    channelsTitle: 'पेमेंट वसुली चॅनेल',
    channelsSub: 'ग्राहक तुम्हाला कसे पैसे देतात',
    upiLabel: 'UPI',
    appsLabel: 'अ‍ॅप्स',
    cashLabel: 'रोख',
    recordedEntriesTitle: 'नोंदवलेल्या नोंदी',
    addNew: '+ नवीन नोंद',
    noEntries: 'अद्याप कोणतीही नोंद जतन केलेली नाही.',

    recordEntryTitle: 'व्यवहार नोंद करा',
    recordEntrySub: 'येथे केलेल्या नोंदी तुमची माहिती समृद्ध करतात — रोख विक्री डिजिटल नोंदवल्याने तुमची क्रेडिट प्रोफाइल बळकट होते.',
    newLedgerEntry: 'नवीन वही नोंद',
    transTypeLabel: 'व्यवहाराचा प्रकार *',
    amountLabel: 'रक्कम (₹) *',
    noteLabel: 'टीप / तपशील (ऐच्छिक)',
    notePh: 'उदा. रविवार बाजारातील विक्री',
    saveEntryBtn: 'वहीत जतन करा',
    recentLedgerEntries: 'अलीकडील नोंदी',
    entryTypes: {
      income: 'उत्पन्न (Income)',
      expense: 'खर्च (Expense)',
      savdep: 'बचत जमा (Savings)',
      savwd: 'बचत काढली',
      emi: 'कर्ज परतफेड (EMI)',
      newloan: 'नवीन कर्ज (New Loan)',
    },

    marketTitle: 'बाजार माहिती (Market Intel)',
    marketSub: 'कृषी वस्तू दर, किमान आधारभूत किंमत (MSP) व हवामान जोखीम निर्देशांक',
    trackedCommodity: 'ट्रॅक केलेली वस्तू बास्केट',
    liveFeed: 'थेट मंडी व MSP फीड',
    realtimeRates: 'प्रत्यक्ष बाजार भाव',
    productivityTitle: 'उत्पादकता दृष्टीकोन',
    seasonalTitle: 'हंगामी नमुना',
    climateRisksTitle: 'मॉडेलमधील हवामान व बाजार जोखीम',
    severityLabel: (sev) => `${sev.toUpperCase()} जोखीम`,

    alertsTitle: 'जोखीम सूचना व मार्गदर्शन',
    alertsSub: 'पूर्वसूचना संकेत व कृतीयोग्य आर्थिक मार्गदर्शन',
    healthStatusLabel: 'व्यवसाय आरोग्य स्थिती',
    healthDesc: 'जोखीम संकेतांची गणना तुमच्या रोख प्रवाहाची समवयस्कांशी तुलना करून केली जाते.',
    activeFlagsTitle: (count) => `सक्रिय जोखीम फ्लॅग (${count})`,
    suggestedActionsTitle: 'तुमच्यासाठी सुचवलेल्या कृती',
    recNumber: (n) => `मार्गदर्शन #${n}`,
    tiers: { GREEN: 'स्थिर', AMBER: 'लक्ष ठेवा', RED: 'त्वरित कृती' },

    merchantAccessPortal: 'व्यापारी प्रवेश पोर्टल',
    officialPortalSub: 'GST नोंदणीकृत व्यापारी, विक्रेते व उद्योगांसाठी अधिकृत पोर्टल',
    gstinTab: 'GSTIN / व्यापारी ID',
    mobileTab: 'मोबाइल व OTP',
    gstinLabel: 'GSTIN / व्यापारी ID *',
    passwordLabel: 'पासवर्ड *',
    forgotPassword: 'पासवर्ड विसरलात?',
    mobileLabel: 'नोंदणीकृत मोबाइल क्रमांक *',
    otpLabel: 'OTP प्रविष्ट करा',
    sendOtp: 'OTP पाठवा',
    captchaLabel: 'सुरक्षा कोड (CAPTCHA) *',
    enterCodePh: 'कोड प्रविष्ट करा',
    rememberMe: 'GSTIN / डिव्हाइस तपशील लक्षात ठेवा',
    loginBtn: 'सुरक्षित व्यापारी लॉगिन',
    needHelp: 'लॉगिन करण्यात मदत हवी आहे? मदत केंद्राशी संपर्क साधा',
    disclaimer: 'धनसेतु पोर्टलवर अनधिकृत प्रवेशास सक्त मनाई आहे।',

    accountTitle: 'खाते व सेटिंग्ज',
    accountSub: 'तुमचे प्रोफाइल, भाषा प्राधान्ये आणि सुरक्षा व्यवस्थापित करा',
    accountSettings: 'खाते सेटिंग्ज',
    profileDetails: 'व्यापारी प्रोफाइल तपशील',
    changeLanguage: 'अ‍ॅप भाषा / App Language',
    securitySettings: 'सुरक्षा व प्रवेश',
    resetPassword: 'आधार OTP द्वारे पासवर्ड रीसेट करा',
    supportHelpdesk: 'धनसेतु नोडल मदत केंद्र',
    logoutBtn: 'पोर्टलवरून लॉग आउट करा',
    logoutConfirmTitle: 'व्यापारी लॉग आउट',
    logoutConfirmMsg: 'तुमच्या सत्रातून लॉग आउट करायचे आहे का?',
    cancel: 'रद्द करा',

    firstLoadLangTitle: 'तुमची आवडती भाषा निवडा',
    firstLoadLangSub: 'धनसेतु मर्चंट पोर्टलसाठी भाषा निवडा',
    firstLoadLangTip: '💡 तुम्ही नंतर खाते सेटिंग्ज पृष्ठावरून तुमची भाषा कधीही बदलू शकता.',
    applyLangBtn: 'होय, भाषा लागू करा',
  },

  te: {
    langName: 'తెలుగు',
    portalTitle: 'ధనసేతు మర్చంట్',
    myPortfolio: 'నా పోర్ట్‌ఫోలియో',
    marketIntelligence: 'మార్కెట్ మేధస్సు',
    logout: 'లాగ్ అవుట్',
    last90: 'గత 90 రోజుల నికర',
    savBal: 'పొదుపు నిల్వ',
    loanOut: 'బాకీ ఉన్న రుణం',
    mEmi: 'నెలవారీ EMI',
    missedEmiSuffix: 'మిస్సయినవి 90d',
    noLoan: 'రుణం లేదు',
    runwaySuffix: 'నెల్ల పొదుపు',
    emiBanner: (n) => `⚠️ గత 90 రోజుల్లో ${n} EMIలు మిస్సయ్యాయి — సూచనల కోసం అలర్ట్స్ ట్యాబ్ చూడండి.`,
    weeklyRecordTitle: 'వారాంతపు నగదు ప్రవాహ రికార్డు',
    weeklyRecordSub: 'గత 4 వారాల చరిత్ర',
    inflowLabel: 'వచ్చినవి',
    outflowLabel: 'వెళ్లినవి',
    netLabel: 'నికర',
    channelsTitle: 'చెల్లింపుల సేకరణ మార్గాలు',
    channelsSub: 'వినియోగదారులు మీకు ఎలా చెల్లిస్తారు',
    upiLabel: 'UPI',
    appsLabel: 'యాప్‌లు',
    cashLabel: 'నగదు',
    recordedEntriesTitle: 'నమోదైన ఎంట్రీలు',
    addNew: '+ కొత్తది జత చేయి',
    noEntries: 'ఇంకా ఎంట్రీలు ఏవీ నమోదు కాలేదు.',

    recordEntryTitle: 'లావాదేవీ ఎంట్రీని నమోదు చేయండి',
    recordEntrySub: 'ఇక్కడ నమోదు చేసే ఎంట్రీలు మీ రికార్డును బలోపేతం చేస్తాయి — డిజిటల్‌గా నమోదు చేసే నగదు అమ్మకాలు మీ క్రెడిట్ ప్రొఫైల్‌ను పెంచుతాయి.',
    newLedgerEntry: 'కొత్త ఖాతా ఎంట్రీ',
    transTypeLabel: 'లావాదేవీ రకం *',
    amountLabel: 'మొత్తం (₹) *',
    noteLabel: 'గమనిక / వివరాలు (ఐచ్ఛికం)',
    notePh: 'ఉదా. ఆ ఆదివారం సంత అమ్మకాలు',
    saveEntryBtn: 'ఖాతాలో భద్రపరచు',
    recentLedgerEntries: 'ఇటీవలి ఎంట్రీలు',
    entryTypes: {
      income: 'ఆదాయం (Income)',
      expense: 'ఖర్చు (Expense)',
      savdep: 'పొదుపు జమ (Savings)',
      savwd: 'పొదుపు ఉపసంహరణ',
      emi: 'రుణ వాయిదా (EMI)',
      newloan: 'కొత్త రుణం (New Loan)',
    },

    marketTitle: 'మార్కెట్ సమాచారం (Market Intel)',
    marketSub: 'వ్యవసాయ సరుకుల ధరలు, మద్దతు ధర (MSP) మరియు వాతావరణ ముప్పు సూచిక',
    trackedCommodity: 'సరుకుల జాబితా',
    liveFeed: 'లైవ్ మార్కెట్ & MSP ఫీడ్',
    realtimeRates: 'నేటి మార్కెట్ ధరలు',
    productivityTitle: 'ఉత్పాదకత దృక్పథం',
    seasonalTitle: 'ఋతువుల నమూనా',
    climateRisksTitle: 'మోడల్‌లోని వాతావరణ & మార్కెట్ నష్టాలు',
    severityLabel: (sev) => `${sev.toUpperCase()} నష్టం`,

    alertsTitle: 'నష్టభయ హెచ్చరికలు & సలహాలు',
    alertsSub: 'ముందస్తు హెచ్చరికలు & ఆర్థిక సూచనలు',
    healthStatusLabel: 'వ్యాపార ఆరోగ్య స్థితి',
    healthDesc: 'మీ నగదు ప్రవాహాన్ని సమాన వ్యాపారాలతో పోల్చి నష్టభయాన్ని లెక్కిస్తారు.',
    activeFlagsTitle: (count) => `సక్రియ నష్టభయ ఫ్లాగ్‌లు (${count})`,
    suggestedActionsTitle: 'మీ కోసం సూచించిన చర్యలు',
    recNumber: (n) => `సూచన #${n}`,
    tiers: { GREEN: 'స్థిరం', AMBER: 'పరిశీలన', RED: 'వెంటనే చర్య' },

    merchantAccessPortal: 'మర్చంట్ యాక్సెస్ పోర్టల్',
    officialPortalSub: 'GST నమోదు చేసుకున్న వ్యాపారులు మరియు సంస్థల కోసం అధికారిక పోర్టల్',
    gstinTab: 'GSTIN / మర్చంట్ ID',
    mobileTab: 'మొబైల్ & OTP',
    gstinLabel: 'GSTIN / మర్చంట్ ID *',
    passwordLabel: 'పాస్‌వర్డ్ *',
    forgotPassword: 'పాస్‌వర్డ్ మరిచిపోయారా?',
    mobileLabel: 'నమోదిత మొబైల్ సంఖ్య *',
    otpLabel: 'OTP నమోదు చేయండి',
    sendOtp: 'OTP పంపు',
    captchaLabel: 'సెక్యూరిటీ కోడ్ (CAPTCHA) *',
    enterCodePh: 'కోడ్ నమోదు చేయండి',
    rememberMe: 'GSTIN / పరికరం వివరాలు గుర్తుంచుకో',
    loginBtn: 'సురక్షిత మర్చంట్ లాగిన్',
    needHelp: 'లాగిన్ సహాయం కావాలా? సపోర్ట్‌ని సంప్రదించండి',
    disclaimer: 'IT చట్టం 2000 ప్రకారం ఈ వ్యవస్థలోకి అనధికారిక ప్రవేశం తీవ్ర నేరం.',

    accountTitle: 'అకౌంట్ & సెట్టింగ్స్',
    accountSub: 'మీ మర్చంట్ ప్రొఫైల్, భాష మరియు భద్రతను నిర్వహించండి',
    accountSettings: 'అకౌంట్ సెట్టింగ్స్',
    profileDetails: 'మర్చంట్ ప్రొఫైల్ వివరాలు',
    changeLanguage: 'యాప్ భాష / App Language',
    securitySettings: 'భద్రత & యాక్సెస్',
    resetPassword: 'ఆధార్ OTP ద్వారా పాస్‌వర్డ్ రీసెట్',
    supportHelpdesk: 'ధనసేతు నోడల్ సపోర్ట్',
    logoutBtn: 'పోర్టల్ నుండి లాగ్ అవుట్ చేయండి',
    logoutConfirmTitle: 'మర్చంట్ లాగ్ అవుట్',
    logoutConfirmMsg: 'మీరు లాగ్ అవుట్ చేయాలనుకుంటున్నారా?',
    cancel: 'రద్దు చేయి',

    firstLoadLangTitle: 'మీకు ఇష్టమైన భాషను ఎంచుకోండి',
    firstLoadLangSub: 'ధనసేతు మర్చంట్ పోర్టల్ కోసం భాషను ఎంచుకోండి',
    firstLoadLangTip: '💡 మీరు అకౌంట్ సెట్టింగ్స్ పేజీ నుండి తర్వాత ఎప్పుడైనా మీ భాషను మార్చుకోవచ్చు.',
    applyLangBtn: 'సరే, భాషను వర్తింపజేయి',
  },
};
