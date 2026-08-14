export type SupportedLang = 'en' | 'hi' | 'mr' | 'te';

export interface FlagParams {
  marginGapPct?: number | null;
  missedEmi?: number | null;
  bufferMonths?: number | null;
}

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
  creditHeadroom: string;
  bridgeHeadroom: string;
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
  walletLabel: string;
  cashLabel: string;
  recordedEntriesTitle: string;
  todaysEntryTitle: string;
  todayTotalLabel: (total: string, live: string) => string;
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
  quickDemoHeader: string;
  autoFillBtn: string;
  scanQrToDownload: string;
  howToInstall: string;
  installStep1Title: string;
  installStep1Desc: string;
  installStep2Title: string;
  installStep2Desc: string;
  installWarningTitle: string;
  installWarningDesc: string;
  mechanisms: Record<string, string>;
  flagDetails: Record<string, (p: FlagParams) => string>;

  // New unified fields for dashboard home, filters, market & account
  verifiedPortfolio: string;
  gstAadhaarActive: string;
  manualSyncDisclaimer: string;
  invoicesLabel: string;
  avgLabel: string;
  daysToCashLabel: string;
  writtenOffLabel: string;
  noReceivables: string;
  digitalReceiptsTip: string;
  receivablesTitle: string;
  counterpartyTypes: Record<string, string>;
  alertsTab: string;
  gstinMerchantId: string;
  verificationStatus: string;
  gstAadhaarVerified: string;
  verifiedShopLocation: string;
  googleMapsCentroid: string;
  gpsLockedFooter: string;
  autoDetectBankSms: string;
  detectTransactionsSub: string;
  onlyOnPhoneApp: string;
  importSmsHistory: string;
  importSmsHistorySub: string;
  filterAll: string;
  filterToday: string;
  filter7Days: string;
  filterMonth: string;
  filterCustom: string;
  filterCustomRange: string;
  filterCustomPrefix: string;
  noTxnsFound: string;
  noCashflowRecords: string;
  addDailyEntriesHint: string;
  chartInflowLegend: string;
  chartOutflowLegend: string;
  chartNetLegend: string;
  inflowColon: string;
  outflowColon: string;
  netCashflowColon: string;

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
    creditHeadroom: 'Credit Headroom',
    bridgeHeadroom: 'Bridge Headroom',
    missedEmiSuffix: 'missed 90d',
    noLoan: 'No active loan',
    runwaySuffix: 'mo runway',
    emiBanner: (n) => `⚠️ ${n} missed EMI(s) in the last 90 days - see Alerts tab for recommended actions.`,
    weeklyRecordTitle: 'Weekly Cashflow Record',
    weeklyRecordSub: 'Last 4 weeks history',
    inflowLabel: 'Credit',
    outflowLabel: 'Debit',
    netLabel: 'Net',
    channelsTitle: 'Collection Channels',
    channelsSub: 'How your customers pay you',
    upiLabel: 'UPI',
    walletLabel: 'Wallet',
    cashLabel: 'Cash',
    recordedEntriesTitle: 'Recorded Entries',
    todaysEntryTitle: "Today's Entry",
    todayTotalLabel: (total, live) => `${total} today, of which you recorded ${live}.`,
    addNew: '+ Add New',
    noEntries: 'No transaction entries recorded yet.',

    recordEntryTitle: 'Record Transaction Entry',
    recordEntrySub: 'Entries you add here enrich your record - cash sales recorded digitally strengthen your credit profile.',
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
    quickDemoHeader: 'Quick Demo Credentials',
    autoFillBtn: 'Auto Fill Credentials',
    scanQrToDownload: 'Scan the QR to download the Android application',
    howToInstall: 'How to install?',
    installStep1Title: '1. Enable Unknown Sources',
    installStep1Desc: 'Go to Settings > Apps > Special App Access > Install Unknown Apps. Toggle permission ON for your browser.',
    installStep2Title: '2. Disable Play Protect',
    installStep2Desc: 'Open Google Play Store > Profile Icon > Play Protect > Settings (gear icon). Turn OFF \'Scan apps with Play Protect\'.',
    installWarningTitle: '⚠️ Why Play Protect blocks installation?',
    installWarningDesc: 'DhanSetu uses automated SMS scraping to analyze transaction history and forecast cashflow. Because it processes local financial SMS messages, Google Play Protect flags it as high-permission and blocks it unless disabled.',
    mechanisms: { margin_squeeze: 'Margin squeeze', working_capital_erosion: 'Working capital erosion', debt_overhang: 'Debt overhang', climate_shock: 'Climate shock', demand_trough: 'Demand trough', receivable_stretch: 'Receivable stretch' },
    flagDetails: {
      margin_squeeze: (p) => p.marginGapPct != null ? `Input costs are squeezing margins (gap of ${p.marginGapPct}%).` : 'Input costs are squeezing operating margins.',
      working_capital_erosion: () => 'Everyday working money is draining away against ongoing expenses.',
      debt_overhang: (p) => p.missedEmi ? `Repayments are heavy against expected cash, with ${p.missedEmi} instalment(s) missed in 90 days.` : 'Loan repayments are heavy relative to expected cash coming in.',
      receivable_stretch: () => 'Buyers are taking a long time to pay, so earned money has not arrived.',
      demand_trough: () => 'Demand has dropped off, so sales are below the usual level.',
      climate_shock: () => 'Weather has hit output or costs in this area.',
      repayment_stress: (p) => p.missedEmi ? `${p.missedEmi} missed instalment(s) in the last 90 days.` : 'Repayment schedules are being missed.',
      thin_buffer: (p) => p.bufferMonths != null ? `Cash runway covers only ${p.bufferMonths} month(s) of usual outflows.` : 'Savings cover less than a month of usual outflows.',
      spend_exceeds: () => 'Money going out has exceeded money coming in recently.',
    },

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

    verifiedPortfolio: 'Verified Portfolio',
    gstAadhaarActive: 'GSTIN & Aadhaar Active',
    manualSyncDisclaimer: 'All manual entries recorded locally are instantly synchronized on server reconnection.',
    invoicesLabel: 'Invoices',
    avgLabel: 'Avg',
    daysToCashLabel: 'Days to Cash',
    writtenOffLabel: 'Written-Off',
    noReceivables: 'No credit (udhaar) book entries recorded.',
    digitalReceiptsTip: '💡 Digital receipts (UPI/Wallet) provide verifiable credit tracking for bankers, boosting loan eligibility.',
    receivablesTitle: 'Udhaar Book (Receivables Ageing)',
    counterpartyTypes: { cooperative: 'Cooperative', trader: 'Trader', exporter: 'Exporter', retailer: 'Retailer', village_credit: 'Village credit' },
    alertsTab: 'Alerts',
    gstinMerchantId: 'GSTIN / Merchant ID:',
    verificationStatus: 'Verification Status:',
    gstAadhaarVerified: 'GST & Aadhaar Verified',
    verifiedShopLocation: 'Verified Shop Location',
    googleMapsCentroid: 'Google Maps Centered GPS Centroid',
    gpsLockedFooter: 'Your GPS coordinates are securely locked and verified by your regional nodal coordinator.',
    autoDetectBankSms: 'Auto-Detect Bank SMS',
    detectTransactionsSub: 'Detect transactions from bank SMS',
    onlyOnPhoneApp: 'only available on phone app',
    importSmsHistory: 'Import SMS History',
    importSmsHistorySub: 'Import past bank transactions on start',
    filterAll: 'All',
    filterToday: 'Today',
    filter7Days: '7 Days',
    filterMonth: 'Month',
    filterCustom: 'Custom',
    filterCustomRange: 'Custom range',
    filterCustomPrefix: 'Custom: ',
    noTxnsFound: 'No transaction entries recorded yet.',
    noCashflowRecords: 'No cashflow records available yet',
    addDailyEntriesHint: 'Add daily entries to generate weekly cashflow analytics.',
    chartInflowLegend: 'Inflow (₹)',
    chartOutflowLegend: 'Outflow (₹)',
    chartNetLegend: 'Net Line',
    inflowColon: 'Inflow:',
    outflowColon: 'Outflow:',
    netCashflowColon: 'Net Cashflow:',
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
    creditHeadroom: 'क्रेडिट सीमा (Credit Headroom)',
    bridgeHeadroom: 'ब्रिज सीमा (Bridge Headroom)',
    missedEmiSuffix: 'चूकी 90d',
    noLoan: 'कोई ऋण नहीं',
    runwaySuffix: 'माह बचत',
    emiBanner: (n) => `⚠️ पिछले 90 दिनों में ${n} EMI चूकी - क्या करें, इसके लिए अलर्ट टैब देखें।`,
    weeklyRecordTitle: 'साप्ताहिक नकदी प्रवाह रिकॉर्ड',
    weeklyRecordSub: 'पिछले 4 हफ्तों का इतिहास',
    inflowLabel: 'जमा',
    outflowLabel: 'नामे',
    netLabel: 'शुद्ध',
    channelsTitle: 'भुगतान संग्रह चैनल',
    channelsSub: 'ग्राहक आपको कैसे भुगतान करते हैं',
    upiLabel: 'UPI',
    walletLabel: 'वॉलेट',
    cashLabel: 'नकद',
    recordedEntriesTitle: 'दर्ज प्रविष्टियाँ',
    todaysEntryTitle: 'आज की प्रविष्टि',
    todayTotalLabel: (total, live) => `आज ${total}, जिसमें से आपने ${live} दर्ज किया।`,
    addNew: '+ नई प्रविष्टि',
    noEntries: 'अभी कोई प्रविष्टि दर्ज नहीं की गई है।',

    recordEntryTitle: 'लेनदेन प्रविष्टि दर्ज करें',
    recordEntrySub: 'यहाँ जोड़ी गई प्रविष्टियाँ आपका रिकॉर्ड समृद्ध करती हैं - नकद बिक्री को डिजिटल दर्ज करने से आपकी क्रेडिट प्रोफ़ाइल मज़बूत होती है।',
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
    quickDemoHeader: 'त्वरित डेमो क्रेडेंशियल',
    autoFillBtn: 'क्रेडेंशियल स्वतः भरें',
    scanQrToDownload: 'एंड्रॉइड एप्लिकेशन डाउनलोड करने के लिए क्यूआर कोड स्कैन करें',
    howToInstall: 'कैसे इंस्टॉल करें?',
    installStep1Title: '1. अज्ञात स्रोत (Unknown Sources) सक्षम करें',
    installStep1Desc: 'सेटिंग्स > ऐप्स > विशेष ऐप एक्सेस > अज्ञात ऐप्स इंस्टॉल करें पर जाएं। अपने ब्राउज़र के लिए अनुमति चालू करें।',
    installStep2Title: '2. प्ले प्रोटेक्ट (Play Protect) अक्षम करें',
    installStep2Desc: 'गूगल प्ले स्टोर > प्रोफाइल आइकन > प्ले प्रोटेक्ट > सेटिंग्स (गियर आइकन) खोलें। \'प्ले प्रोटेक्ट के साथ ऐप्स स्कैन करें\' को बंद करें।',
    installWarningTitle: '⚠️ प्ले प्रोटेक्ट इंस्टॉलेशन क्यों रोकता है?',
    installWarningDesc: 'नकदी प्रवाह का पूर्वानुमान लगाने के लिए धनसेतु स्वचालित एसएमएस स्क्रैपिंग (SMS Scraping) का उपयोग करता है। चूंकि यह स्थानीय वित्तीय एसएमएस संदेशों को पढ़ता है, इसलिए प्ले प्रोटेक्ट इसे ब्लॉक करता है जब तक कि इसे बंद न किया जाए।',
    mechanisms: { margin_squeeze: 'मार्जिन संकुचन', working_capital_erosion: 'कार्यशील पूंजी क्षरण', debt_overhang: 'ऋण भार', climate_shock: 'मौसम झटका', demand_trough: 'मांग में गिरावट', receivable_stretch: 'प्राप्य राशियों में देरी' },
    flagDetails: {
      margin_squeeze: (p) => p.marginGapPct != null ? `लागत बढ़ने से मार्जिन दब रहा है (अंतर ${p.marginGapPct}%)।` : 'लागत बढ़ने से मार्जिन दब रहा है।',
      working_capital_erosion: () => 'रोज़मर्रा के खर्च के मुकाबले कामकाजी पैसा घट रहा है।',
      debt_overhang: (p) => p.missedEmi ? `आमदनी के मुकाबले किस्तें भारी हैं; 90 दिनों में ${p.missedEmi} किस्त चूकी।` : 'अपेक्षित आमदनी के मुकाबले किस्तें भारी हैं।',
      receivable_stretch: () => 'खरीदार भुगतान में देर कर रहे हैं, कमाया पैसा अभी आया नहीं।',
      demand_trough: () => 'मांग घट गई है, बिक्री सामान्य से कम है।',
      climate_shock: () => 'मौसम ने इस इलाके में उत्पादन या लागत पर असर डाला है।',
      repayment_stress: (p) => p.missedEmi ? `पिछले 90 दिनों में ${p.missedEmi} किस्त चूकी।` : 'किस्तें समय पर नहीं भर पा रहे।',
      thin_buffer: (p) => p.bufferMonths != null ? `नकदी सिर्फ ${p.bufferMonths} महीने के खर्च के लिए बची है।` : 'बचत एक महीने के खर्च से भी कम है।',
      spend_exceeds: () => 'हाल में खर्च आमदनी से ज़्यादा रहा है।',
    },

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

    verifiedPortfolio: 'सत्यापित पोर्टफोलियो',
    gstAadhaarActive: 'GSTIN और आधार सक्रिय',
    manualSyncDisclaimer: 'स्थानीय रूप से दर्ज की गई सभी मैन्युअल प्रविष्टियां सर्वर पुन: कनेक्शन पर तुरंत सिंक हो जाती हैं।',
    invoicesLabel: 'इनवॉइस',
    avgLabel: 'औसत',
    daysToCashLabel: 'नकद प्राप्त करने के दिन',
    writtenOffLabel: 'बट्टे खाते में डाला गया (खराब ऋण)',
    noReceivables: 'कोई क्रेडिट (उधार) बही प्रविष्टियां दर्ज नहीं हैं।',
    digitalReceiptsTip: '💡 डिजिटल रसीदें (UPI/वॉलेट) बैंकरों के लिए सत्यापन योग्य क्रेडिट ट्रैकिंग प्रदान करती हैं, जिससे ऋण पात्रता बढ़ती है।',
    receivablesTitle: 'उधार खाता (प्राप्य राशियां)',
    counterpartyTypes: { cooperative: 'सहकारी समिति', trader: 'व्यापारी', exporter: 'निर्यातक', retailer: 'खुदरा विक्रेता', village_credit: 'गांव उधार' },
    alertsTab: 'अलर्ट',
    gstinMerchantId: 'GSTIN / मर्चेंट आईडी:',
    verificationStatus: 'सत्यापन स्थिति:',
    gstAadhaarVerified: 'GST और आधार सत्यापित',
    verifiedShopLocation: 'सत्यापित दुकान का स्थान',
    googleMapsCentroid: 'गूगल मैप्स केंद्रित जीपीएस सेंट्रॉइड',
    gpsLockedFooter: 'आपके जीपीएस निर्देशांक सुरक्षित रूप से लॉक हैं और आपके क्षेत्रीय नोडल समन्वयक द्वारा सत्यापित हैं।',
    autoDetectBankSms: 'बैंक एसएमएस स्वतः पहचानें',
    detectTransactionsSub: 'बैंक एसएमएस से लेनदेन का पता लगाएं',
    onlyOnPhoneApp: 'केवल फोन ऐप पर उपलब्ध है',
    importSmsHistory: 'एसएमएस इतिहास आयात करें',
    importSmsHistorySub: 'शुरुआत में पिछले बैंक लेनदेन आयात करें',
    filterAll: 'सभी',
    filterToday: 'आज',
    filter7Days: '7 दिन',
    filterMonth: 'महीना',
    filterCustom: 'कस्टम',
    filterCustomRange: 'कस्टम दायरा',
    filterCustomPrefix: 'कस्टम: ',
    noTxnsFound: 'अभी तक कोई लेनदेन प्रविष्टि दर्ज नहीं की गई है।',
    noCashflowRecords: 'अभी कोई नकदी प्रवाह रिकॉर्ड उपलब्ध नहीं है',
    addDailyEntriesHint: 'साप्ताहिक नकदी प्रवाह विश्लेषण उत्पन्न करने के लिए दैनिक प्रविष्टियां जोड़ें।',
    chartInflowLegend: 'जमा (₹)',
    chartOutflowLegend: 'नामे (₹)',
    chartNetLegend: 'शुद्ध रेखा',
    inflowColon: 'जमा:',
    outflowColon: 'नामे:',
    netCashflowColon: 'शुद्ध नकदी प्रवाह:',
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
    creditHeadroom: 'क्रेडिट मर्यादा (Credit Headroom)',
    bridgeHeadroom: 'ब्रिज मर्यादा (Bridge Headroom)',
    missedEmiSuffix: 'चुकल्या ९०d',
    noLoan: 'कर्ज नाही',
    runwaySuffix: 'महिने बचत',
    emiBanner: (n) => `⚠️ मागील ९० दिवसांत ${n} EMI चुकल्या - काय करावे यासाठी सूचना टॅब पहा.`,
    weeklyRecordTitle: 'साप्ताहिक रोख प्रवाह नोंद',
    weeklyRecordSub: 'मागील ४ आठवड्यांचा इतिहास',
    inflowLabel: 'जमा',
    outflowLabel: 'नामे',
    netLabel: 'निव्वळ',
    channelsTitle: 'पेमेंट वसुली चॅनेल',
    channelsSub: 'ग्राहक तुम्हाला कसे पैसे देतात',
    upiLabel: 'UPI',
    walletLabel: 'वॉलेट',
    cashLabel: 'रोख',
    recordedEntriesTitle: 'नोंदवलेल्या नोंदी',
    todaysEntryTitle: 'आजची नोंद',
    todayTotalLabel: (total, live) => `आज ${total}, ज्यापैकी तुम्ही ${live} नोंदवले।`,
    addNew: '+ नवीन नोंद',
    noEntries: 'अद्याप कोणतीही नोंद जतन केलेली नाही.',

    recordEntryTitle: 'व्यवहार नोंद करा',
    recordEntrySub: 'येथे केलेल्या नोंदी तुमची माहिती समृद्ध करतात - रोख विक्री डिजिटल नोंदवल्याने तुमची क्रेडिट प्रोफाइल बळकट होते.',
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
    quickDemoHeader: 'जलद डेमो माहिती',
    autoFillBtn: 'माहिती स्वयंचलितपणे भरा',
    scanQrToDownload: 'अँड्रॉइड ॲप्लिकेशन डाउनलोड करण्यासाठी क्यूआर स्कॅन करा',
    howToInstall: 'इन्स्टॉल कसे करावे?',
    installStep1Title: '1. अनोळखी स्त्रोत (Unknown Sources) सक्षम करा',
    installStep1Desc: 'सेटिंग्ज > ॲप्स > स्पेशल ॲप ॲक्सेस > इन्स्टॉल अननोन ॲप्स वर जा आणि तुमच्या ब्राउझरसाठी परवानगी चालू करा.',
    installStep2Title: '2. प्ले प्रोटेक्ट (Play Protect) बंद करा',
    installStep2Desc: 'गुगल प्ले स्टोअर > प्रोफाइल आयकॉन > प्ले प्रोटेक्ट > सेटिंग्ज (गियर आयकॉन) उघडा. \'स्कॅन ॲप्स विथ प्ले प्रोटेक्ट\' बंद करा.',
    installWarningTitle: '⚠️ प्ले प्रोटेक्ट इन्स्टॉलेशन का थांबवते?',
    installWarningDesc: 'धनसेतू रोख प्रवाहाचा अंदाज घेण्यासाठी स्वयंचलित एसएमएस स्क्रॅपिंग (SMS Scraping) वापरते. हे स्थानिक आर्थिक एसएमएस संदेश वाचत असल्याने, प्ले प्रोटेक्ट याला ब्लॉक करते.',
    mechanisms: { margin_squeeze: 'मार्जिन दबाव', working_capital_erosion: 'खेळते भांडवल क्षरण', debt_overhang: 'कर्जाचा भार', climate_shock: 'हवामान धोका', demand_trough: 'मागणीतील घट', receivable_stretch: 'येणे रकमेत विलंब' },
    flagDetails: {
      margin_squeeze: (p) => p.marginGapPct != null ? `खर्च वाढल्याने मार्जिनवर दबाव आहे (फरक ${p.marginGapPct}%).` : 'खर्च वाढल्याने मार्जिनवर दबाव आहे.',
      working_capital_erosion: () => 'दैनंदिन खर्चाच्या तुलनेत खेळते भांडवल घटत आहे.',
      debt_overhang: (p) => p.missedEmi ? `उत्पन्नाच्या तुलनेत हप्ते जड आहेत; 90 दिवसांत ${p.missedEmi} हप्ता चुकला.` : 'अपेक्षित उत्पन्नाच्या तुलनेत हप्ते जड आहेत.',
      receivable_stretch: () => 'खरेदीदार पैसे द्यायला उशीर करत आहेत, कमावलेले पैसे आलेले नाहीत.',
      demand_trough: () => 'मागणी घटली आहे, विक्री नेहमीपेक्षा कमी आहे.',
      climate_shock: () => 'हवामानाचा या भागातील उत्पादन किंवा खर्चावर परिणाम झाला आहे.',
      repayment_stress: (p) => p.missedEmi ? `गेल्या 90 दिवसांत ${p.missedEmi} हप्ता चुकला.` : 'हप्ते वेळेवर भरले जात नाहीत.',
      thin_buffer: (p) => p.bufferMonths != null ? `रोख रक्कम फक्त ${p.bufferMonths} महिन्यांच्या खर्चापुरती आहे.` : 'बचत एक महिन्याच्या खर्चापेक्षा कमी आहे.',
      spend_exceeds: () => 'अलीकडे खर्च उत्पन्नापेक्षा जास्त झाला आहे.',
    },

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
    firstLoadLangSub: 'धनसेतु मर्चेंट पोर्टलसाठी भाषा निवडा',
    firstLoadLangTip: '💡 तुम्ही नंतर खाते सेटिंग्ज पृष्ठावरून तुमची भाषा कधीही बदलू शकता.',
    applyLangBtn: 'होय, भाषा लागू करा',

    verifiedPortfolio: 'सत्यापित पोर्टफोलिओ',
    gstAadhaarActive: 'GSTIN आणि आधार सक्रिय',
    manualSyncDisclaimer: 'स्थानिक पातळीवर नोंदवलेल्या सर्व मॅन्युअल नोंदी सर्व्हर पुन्हा कनेक्ट झाल्यावर लगेच समक्रमित केल्या जातात.',
    invoicesLabel: 'इनव्हॉइस',
    avgLabel: 'सरासरी',
    daysToCashLabel: 'रोख मिळण्याचे दिवस',
    writtenOffLabel: 'बट्ट्यात जमा (बुडीत कर्ज)',
    noReceivables: 'कोणत्याही उधारी खाते नोंदी नाहीत.',
    digitalReceiptsTip: '💡 डिजिटल पावत्या (UPI/वॉलेट) बँकांसाठी पडताळणीयोग्य क्रेडिट ट्रॅकिंग प्रदान करतात, ज्यामुळे कर्ज पात्रता वाढते.',
    receivablesTitle: 'उधारी खाते (येणे रकमा)',
    counterpartyTypes: { cooperative: 'सहकारी संस्था', trader: 'व्यापारी', exporter: 'निर्यातदार', retailer: 'किरकोळ विक्रेता', village_credit: 'गाव उधारी' },
    alertsTab: 'अलर्ट',
    gstinMerchantId: 'GSTIN / मर्चेंट आयडी:',
    verificationStatus: 'पडताळणी स्थिती:',
    gstAadhaarVerified: 'GST आणि आधार सत्यापित',
    verifiedShopLocation: 'सत्यापित दुकान ठिकाण',
    googleMapsCentroid: 'गुगल नकाशे केंद्रित जीपीएस सेंट्रॉइड',
    gpsLockedFooter: 'तुमचे जीपीएस निर्देशांक सुरक्षितपणे लॉक केलेले आहेत आणि तुमच्या प्रादेशिक नोडल समन्वयकाद्वारे सत्यापित आहेत.',
    autoDetectBankSms: 'बँक एसएमएस स्वयंचलितपणे शोधा',
    detectTransactionsSub: 'बँक एसएमएस द्वारे व्यवहार शोधा',
    onlyOnPhoneApp: 'फक्त फोन ॲपवर उपलब्ध',
    importSmsHistory: 'एसएमएस इतिहास आयात करा',
    importSmsHistorySub: 'प्रारंभी मागील बँक व्यवहार आयात करा',
    filterAll: 'सर्व',
    filterToday: 'आज',
    filter7Days: '7 दिवस',
    filterMonth: 'महिना',
    filterCustom: 'कस्टम',
    filterCustomRange: 'कस्टम श्रेणी',
    filterCustomPrefix: 'कस्टम: ',
    noTxnsFound: 'अद्याप कोणतेही व्यवहार नोंदवले गेले नाहीत.',
    noCashflowRecords: 'अद्याप कोणतेही व्यवहार उपलब्ध नाहीत',
    addDailyEntriesHint: 'साप्ताहिक रोख प्रवाह विश्लेषण व्युत्पन्न करण्यासाठी दैनिक नोंदी जोडा.',
    chartInflowLegend: 'जमा (₹)',
    chartOutflowLegend: 'नामे (₹)',
    chartNetLegend: 'निव्वळ रेषा',
    inflowColon: 'जमा:',
    outflowColon: 'नामे:',
    netCashflowColon: 'निव्वळ रोख प्रवाह:',
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
    creditHeadroom: 'క్రెడిట్ హెడ్‌రూమ్',
    bridgeHeadroom: 'బ్రిడ్జ్ హెడ్‌రూమ్',
    missedEmiSuffix: 'మిస్సయినవి 90d',
    noLoan: 'రుణం లేదు',
    runwaySuffix: 'నెల్ల పొదుపు',
    emiBanner: (n) => `⚠️ గత 90 రోజుల్లో ${n} EMIలు మిస్సయ్యాయి - సూచనల కోసం అలర్ట్స్ ట్యాబ్ చూడండి.`,
    weeklyRecordTitle: 'వారాంతపు నగదు ప్రవాహ రికార్డు',
    weeklyRecordSub: 'గత 4 వారాల చరిత్ర',
    inflowLabel: 'జమ',
    outflowLabel: 'డెబిట్',
    netLabel: 'నికర',
    channelsTitle: 'చెల్లింపుల సేకరణ మార్గాలు',
    channelsSub: 'వినియోగదారులు మీకు ఎలా చెల్లిస్తారు',
    upiLabel: 'UPI',
    walletLabel: 'వాలెట్',
    cashLabel: 'నగదు',
    recordedEntriesTitle: 'నమోదైన ఎంట్రీలు',
    todaysEntryTitle: 'ఈరోజు నమోదు',
    todayTotalLabel: (total, live) => `ఈరోజు ${total}, ఇందులో మీరు నమోదు చేసినది ${live}.`,
    addNew: '+ కొత్తది జత చేయి',
    noEntries: 'ఇంకా ఎంట్రీలు ఏవీ నమోదు కాలేదు.',

    recordEntryTitle: 'లావాదేవీ ఎంట్రీని నమోదు చేయండి',
    recordEntrySub: 'ఇక్కడ నమోదు చేసే ఎంట్రీలు మీ రికార్డును బలోపేతం చేస్తాయి - డిజిటల్‌గా నమోదు చేసే నగదు అమ్మకాలు మీ క్రెడిట్ ప్రొఫైల్‌ను పెంచుతాయి.',
    newLedgerEntry: 'కొత్త खाता ఎంట్రీ',
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
    quickDemoHeader: 'త్వరిత డెమో వివరాలు',
    autoFillBtn: 'వివరాలు ఆటో ఫిల్ చేయి',
    scanQrToDownload: 'ఆండ్రాయిడ్ అప్లికేషన్‌ను డౌన్‌లోడ్ చేయడానికి క్యూఆర్ కోడ్‌ని స్కాన్ చేయండి',
    howToInstall: 'ఇన్‌స్టాల్ చేయడం ఎలా?',
    installStep1Title: '1. అన్‌నోన్ సోర్సెస్ అనుమతించండి',
    installStep1Desc: 'సెట్టింగులు > యాప్స్ > స్పెషల్ యాప్ యాక్సెస్ > ఇన్‌స్టాల్ అన్‌నోన్ యాప్స్ కి వెళ్లి, మీ బ్రౌజర్‌కు అనుమతిని ఆన్ చేయండి.',
    installStep2Title: '2. ప్లే ప్రొటెక్ట్ ఆఫ్ చేయండి',
    installStep2Desc: 'గూగుల్ ప్లే స్టోర్ > ప్రొఫైల్ ఐకాన్ > ప్లే ప్రొటెక్ట్ > సెట్టింగ్స్ (గేర్ ఐకాన్) లో \'స్కాన్ యాప్స్ విత్ ప్లే ప్రొటెక్ట్\' ఆఫ్ చేయండి.',
    installWarningTitle: '⚠️ ప్లే ప్రొటెక్ట్ ఎందుకు బ్లాక్ చేస్తుంది?',
    installWarningDesc: 'నగదు ప్రవాహాన్ని అంచనా వేయడానికి ధనసేతు ఆటోమేటెడ్ SMS స్క్రాపింగ్ ఉపయోగిస్తుంది. ఇది మీ మొబైల్ లోని ఆర్థిక SMS సమాచారాన్ని విశ్లేషిస్తుంది కాబట్టి, ప్లే ప్రొటెక్ట్ దీనిని బ్లాక్ చేస్తుంది.',
    mechanisms: { margin_squeeze: 'మార్జిన్ ఒత్తిడి', working_capital_erosion: 'వర్కింగ్ కేపిటల్ క్షీణత', debt_overhang: 'అప్పుల భారం', climate_shock: 'వాతావరణ షాక్', demand_trough: 'డిమాండ్ పతనం', receivable_stretch: 'వసూళ్ల ఆలస్యం' },
    flagDetails: {
      margin_squeeze: (p) => p.marginGapPct != null ? `ఖర్చులు పెరిగి మార్జిన్‌పై ఒత్తిడి ఉంది (తేడా ${p.marginGapPct}%).` : 'ఖర్చులు పెరిగి మార్జిన్‌పై ఒత్తిడి ఉంది.',
      working_capital_erosion: () => 'రోజువారీ ఖర్చులతో పోలిస్తే వర్కింగ్ కేపిటల్ తగ్గిపోతోంది.',
      debt_overhang: (p) => p.missedEmi ? `ఆదాయంతో పోలిస్తే వాయిదాలు భారంగా ఉన్నాయి; 90 రోజుల్లో ${p.missedEmi} వాయిదా చెల్లించలేదు.` : 'ఆశించిన ఆదాయంతో పోలిస్తే వాయిదాలు భారంగా ఉన్నాయి.',
      receivable_stretch: () => 'కొనుగోలుదారులు చెల్లించడంలో ఆలస్యం చేస్తున్నారు, సంపాదించిన సొమ్ము రాలేదు.',
      demand_trough: () => 'డిమాండ్ తగ్గింది, అమ్మకాలు సాధారణం కంటే తక్కువగా ఉన్నాయి.',
      climate_shock: () => 'వాతావరణం ఈ ప్రాంతంలో ఉత్పత్తి లేదా ఖర్చులపై ప్రభావం చూపింది.',
      repayment_stress: (p) => p.missedEmi ? `గత 90 రోజుల్లో ${p.missedEmi} వాయిదా చెల్లించలేదు.` : 'వాయిదాలు సమయానికి చెల్లించలేకపోతున్నారు.',
      thin_buffer: (p) => p.bufferMonths != null ? `నగదు ${p.bufferMonths} నెలల ఖర్చులకే సరిపోతుంది.` : 'పొదుపు ఒక నెల ఖర్చులకూ సరిపోదు.',
      spend_exceeds: () => 'ఇటీవల ఖర్చు ఆదాయాన్ని మించింది.',
    },

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

    verifiedPortfolio: 'ధృవీకరించబడిన పోర్ట్‌ఫోలియో',
    gstAadhaarActive: 'GSTIN & ఆధార్ యాక్టివ్',
    manualSyncDisclaimer: 'ప్రాంతీయంగా రికార్డ్ చేయబడిన అన్ని మాన్యువల్ ఎంట్రీలు సర్వర్ తిరిగి కనెక్ట్ అయినప్పుడు తక్షణమే సింక్ చేయబడతాయి.',
    invoicesLabel: 'ఇన్‌వాయిస్‌లు',
    avgLabel: 'సగటు',
    daysToCashLabel: 'నగదు రావడానికి రోజులు',
    writtenOffLabel: 'రద్దు చేయబడింది',
    noReceivables: 'క్రెడిట్ (ఉధార్) బుక్ ఎంట్రీలు ఏవీ లేవు.',
    digitalReceiptsTip: '💡 డిజిటల్ రశీదులు (UPI/వాలెట్) బ్యాంకర్లకు ధృవీకరించదగిన క్రెడిట్ ట్రాకింగ్‌ను అందిస్తాయి, ఇది రుణ అర్హతను పెంచుతుంది.',
    receivablesTitle: 'ఉధార్ బుక్ (రావాల్సిన సొమ్ము)',
    counterpartyTypes: { cooperative: 'సహకార సంఘం', trader: 'వ్యాపారి', exporter: 'ఎగుమతిదారు', retailer: 'రిటైలర్', village_credit: 'గ్రామ అప్పు' },
    alertsTab: 'అలర్ట్‌లు',
    gstinMerchantId: 'GSTIN / మర్చంట్ ID:',
    verificationStatus: 'ధృవీకరణ స్థితి:',
    gstAadhaarVerified: 'GST & ఆధార్ ధృవీకరించబడింది',
    verifiedShopLocation: 'ధృవీకరించబడిన షాప్ స్థానం',
    googleMapsCentroid: 'గూగుల్ మ్యాప్స్ కేంద్రీకృత GPS సెంట్రాయిడ్',
    gpsLockedFooter: 'మీ GPS కోఆర్డినేట్లు సురక్షితంగా లాక్ చేయబడ్డాయి మరియు మీ ప్రాంతీయ నోడల్ కోఆర్డినేటర్ ద్వారా ధృవీకరించబడ్డాయి.',
    autoDetectBankSms: 'బ్యాంక్ SMS ఆటోమేటిక్ గుర్తింపు',
    detectTransactionsSub: 'బ్యాంక్ SMS నుండి లావాదేవీలను గుర్తించండి',
    onlyOnPhoneApp: 'ఫోన్ యాప్‌లో మాత్రమే అందుబాటులో ఉంటుంది',
    importSmsHistory: 'SMS చరిత్రను ఇంపోర్ట్ చేయి',
    importSmsHistorySub: 'ప్రారంభంలో గత బ్యాంక్ లావాదేవీలను ఇంపోర్ట్ చేయండి',
    filterAll: 'అన్నీ',
    filterToday: 'నేడు',
    filter7Days: '7 రోజులు',
    filterMonth: 'నెల',
    filterCustom: 'కస్టమ్',
    filterCustomRange: 'కస్టమ్ పరిధి',
    filterCustomPrefix: 'కస్టమ్: ',
    noTxnsFound: 'ఇంకా ఎలాంటి లావాదేవీల నమోదులు లేవు.',
    noCashflowRecords: 'నగదు ప్రవాహ రికార్డులు ఇంకా అందుబాటులో లేవు',
    addDailyEntriesHint: 'వారాంతపు నగదు ప్రవాహ విశ్లేషణను రూపొందించడానికి రోజువారీ నమోదులను జోడించండి.',
    chartInflowLegend: 'జమ (₹)',
    chartOutflowLegend: 'డెబిట్ (₹)',
    chartNetLegend: 'నికర రేఖ',
    inflowColon: 'జమ:',
    outflowColon: 'డెబిట్:',
    netCashflowColon: 'నికర నగదు ప్రవాహం:',
  },
};
