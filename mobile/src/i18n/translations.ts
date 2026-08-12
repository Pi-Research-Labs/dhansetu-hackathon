export type SupportedLang = 'en' | 'hi' | 'mr' | 'te';

/** Figures the early-warning sentences quote, passed from the risk card. */
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
  // Backend enum values arrive as keys (margin_squeeze, cooperative, ...).
  // They are a closed set, so they are translated from a table here rather
  // than sent through a translation API: instant, free, and impossible to
  // get wrong on a bad network.
  mechanisms: Record<string, string>;
  counterpartyTypes: Record<string, string>;
  riskTypes: Record<string, string>;
  ledgerCategories: Record<string, string>;
  // Early-warning detail per reason code. Functions, not strings, because the
  // sentences carry real figures (margin gap, missed EMIs, months of runway).
  // The store used to build these in English at fetch time, so switching
  // language left them untranslated until the next refetch.
  flagDetails: Record<string, (p: FlagParams) => string>;

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

  firstLoadLangTitle: string;
  firstLoadLangSub: string;
  firstLoadLangTip: string;
  applyLangBtn: string;

  // Udhaar Book / Receivables & Accounts Screen additions
  receivablesTitle: string;
  receivablesSub: string;
  gstinMerchantId: string;
  verificationStatus: string;
  gstAadhaarVerified: string;
  autoDetectBankSms: string;
  availableOnAndroidOnly: string;
  startingListener: string;
  listeningForBankSms: string;
  smsPrivacyNotice: string;
  importSmsHistory: string;
  scanPastSmsSub: string;
  verifiedShopLocation: string;
  googleMapsCentroid: string;
  gpsLockedFooter: string;
  smsActiveLabel: (n: number) => string;
  smsPermissionRequired: string;
  detectTransactionsSub: string;
  scanningPastSmsInbox: string;
  pastTxnsImportedLabel: (n: number) => string;
  smsEnabledWillScan: string;
  scanningPastSmsProgress: string;
  smsHistoryPrivacyNotice: string;
  smsPermissionTitle: string;
  smsPermissionMsg: string;
  smsHistoryPermissionMsg: string;
  selectPreferredLangSub: string;

  // Additional fields for Modals, top bar and GST verified
  verifiedMerchantGateway: string;
  gstVerified: string;
  securityAccessInfoTitle: string;
  sslEncryptedGateway: string;
  registeredGstinCreds: string;
  aadhaarLinkedMobile: string;
  activeSessionId: string;
  requestAadhaarOtpReset: string;
  close: string;
  otpDispatchedTitle: string;
  otpDispatchedMsg: string;
  dhansetuSupportHelpdeskTitle: string;
  supportDeptLabel: string;
  financialInclusionDiv: string;
  tollFreeHelpline: string;
  officialEmailSupport: string;
  operatingHours: string;
  operatingHoursVal: string;
  supportCoordinator: string;
  regionalNodalCoordinator: string;
  callHelplineBtn: string;
  callingSupportMsg: string;

  // Chart Legend & details
  chartInflowLegend: string;
  chartOutflowLegend: string;
  chartNetLegend: string;
  noCashflowRecords: string;
  addDailyEntriesHint: string;
  inflowColon: string;
  outflowColon: string;
  netCashflowColon: string;

  // New fields for filter selection, alert UI, mark all as read, and status tags
  filterAll: string;
  filterToday: string;
  filter7Days: string;
  filterMonth: string;
  filterCustom: string;
  filterCustomRange: string;
  filterCustomPrefix: string;
  noTxnsFound: string;
  aiPredictiveAnalysis: string;
  stressProb: string;
  defaultProb: string;
  modelScore: string;
  markAllAsRead: string;
  allRead: string;
  tagNew: string;
  tagMonitored: string;
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
    marketSub: 'Real-time agricultural commodity prices, MSP & climate risk',
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
    mechanisms: { margin_squeeze: 'Margin squeeze', working_capital_erosion: 'Working capital erosion', debt_overhang: 'Debt overhang', climate_shock: 'Climate shock', demand_trough: 'Demand trough', receivable_stretch: 'Receivable stretch' },
    counterpartyTypes: { cooperative: 'Cooperative', trader: 'Trader', exporter: 'Exporter', retailer: 'Retailer', village_credit: 'Village credit' },
    riskTypes: { climate: 'Climate', counterparty: 'Buyer risk', cycle: 'Business cycle', demand: 'Demand', disease: 'Disease', input: 'Input costs', logistics: 'Logistics', margin: 'Margins', receivable: 'Payments due', seasonality: 'Seasonality', visibility: 'Record keeping' },
    ledgerCategories: { milk_sale: 'Milk sale', pottery_sale: 'Pottery sale', cloth_sale: 'Cloth sale', bird_sale: 'Bird sale', shop_sale: 'Shop sale', vegetable_sale: 'Vegetable sale', sale: 'Sale', feed: 'Feed', yarn: 'Yarn', clay_glaze: 'Clay & glaze', stock_purchase: 'Stock purchase', fees: 'Fees', expense: 'Expense', emi: 'Loan instalment', loan_received: 'Loan received', savings_deposit: 'Savings deposit', savings_withdrawal: 'Savings withdrawal', unclassified: 'Uncategorised' },
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

    // Udhaar Book / Receivables & Accounts Screen additions
    receivablesTitle: 'Udhaar Book (Receivables Ageing)',
    receivablesSub: 'Outstanding credit from business counterparties',
    gstinMerchantId: 'GSTIN / Merchant ID:',
    verificationStatus: 'Verification Status:',
    gstAadhaarVerified: 'GST & Aadhaar Verified',
    autoDetectBankSms: 'Auto-Detect Bank SMS',
    availableOnAndroidOnly: 'Available on Android only',
    startingListener: 'Starting listener...',
    listeningForBankSms: 'Listening for bank SMS',
    smsPrivacyNotice: 'All SMS parsing happens on your device. No message data is uploaded.',
    importSmsHistory: 'Import SMS History',
    scanPastSmsSub: 'Scan past bank SMS to import older transactions',
    verifiedShopLocation: 'Verified Shop Location',
    googleMapsCentroid: 'Google Maps Centered GPS Centroid',
    gpsLockedFooter: 'Your GPS coordinates are securely locked and verified by your regional nodal coordinator.',
    smsActiveLabel: (n) => `Active · ${n} entries auto-detected`,
    smsPermissionRequired: 'SMS permission required',
    detectTransactionsSub: 'Detect transactions from bank SMS',
    scanningPastSmsInbox: 'Scanning past SMS inbox...',
    pastTxnsImportedLabel: (n) => `${n} past transactions imported`,
    smsEnabledWillScan: 'Enabled · Will scan on next listener start',
    scanningPastSmsProgress: 'Scanning past SMS for transactions...',
    smsHistoryPrivacyNotice: 'Scans your SMS inbox on-device only. No message data is uploaded.',
    smsPermissionTitle: 'Permission Required',
    smsPermissionMsg: 'SMS permission is needed to auto-detect bank transactions. Please grant the permission in your device settings.',
    smsHistoryPermissionMsg: 'SMS permission is needed to scan your inbox for past bank transactions. Please grant the permission in your device settings.',
    selectPreferredLangSub: 'Select your preferred app language',

    // Additional fields for Modals, top bar and GST verified
    verifiedMerchantGateway: 'Verified Merchant Gateway',
    gstVerified: 'GST Verified',
    securityAccessInfoTitle: 'Security & Access Info',
    sslEncryptedGateway: '256-Bit SSL AES Encrypted Secure Gateway',
    registeredGstinCreds: 'Registered GSTIN Credentials:',
    aadhaarLinkedMobile: 'Aadhaar Linked Mobile:',
    activeSessionId: 'Active Session ID:',
    requestAadhaarOtpReset: 'REQUEST AADHAAR OTP RESET',
    close: 'Close',
    otpDispatchedTitle: 'OTP Dispatched',
    otpDispatchedMsg: 'Password reset code has been dispatched to your registered Aadhaar mobile number via SMS.',
    dhansetuSupportHelpdeskTitle: 'DhanSetu Support Helpdesk',
    supportDeptLabel: 'Support Department:',
    financialInclusionDiv: 'Financial Inclusion Support Division',
    tollFreeHelpline: 'Toll-Free Helpline:',
    officialEmailSupport: 'Official Email Support:',
    operatingHours: 'Operating Hours:',
    operatingHoursVal: 'Mon - Sat: 9:00 AM to 6:00 PM IST',
    supportCoordinator: 'Support Coordinator:',
    regionalNodalCoordinator: 'Regional Nodal Coordinator',
    callHelplineBtn: 'CALL HELPLINE (1800-11-2244)',
    callingSupportMsg: 'Dialing Toll Free: 1800-11-2244...',

    // Chart Legend & details
    chartInflowLegend: 'Inflow (₹)',
    chartOutflowLegend: 'Outflow (₹)',
    chartNetLegend: 'Net Line',
    noCashflowRecords: 'No cashflow records available yet',
    addDailyEntriesHint: 'Add daily entries to generate weekly cashflow analytics.',
    inflowColon: 'Inflow:',
    outflowColon: 'Outflow:',
    netCashflowColon: 'Net Cashflow:',

    // Filter, Alert UI, status tags, and mark read
    filterAll: 'All',
    filterToday: 'Today',
    filter7Days: '7 Days',
    filterMonth: 'Month',
    filterCustom: 'Custom',
    filterCustomRange: 'Custom range',
    filterCustomPrefix: 'Custom: ',
    noTxnsFound: 'No transaction entries found for the selected range.',
    aiPredictiveAnalysis: 'AI Predictive Analysis',
    stressProb: 'Stress Prob',
    defaultProb: 'Default Prob',
    modelScore: 'Model Score',
    markAllAsRead: 'Mark all as read',
    allRead: 'All Read',
    tagNew: 'NEW',
    tagMonitored: 'Monitored',
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
    marketSub: 'कृषि वस्तु मूल्य, न्यूनतम समर्थन मूल्य (MSP) और जलवायु जोखिम',
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
    mechanisms: { margin_squeeze: 'मार्जिन संकुचन', working_capital_erosion: 'कार्यशील पूंजी क्षरण', debt_overhang: 'ऋण भार', climate_shock: 'मौसम झटका', demand_trough: 'मांग में गिरावट', receivable_stretch: 'प्राप्य राशियों में देरी' },
    counterpartyTypes: { cooperative: 'सहकारी समिति', trader: 'व्यापारी', exporter: 'निर्यातक', retailer: 'खुदरा विक्रेता', village_credit: 'गांव उधार' },
    riskTypes: { climate: 'मौसम', counterparty: 'खरीदार जोखिम', cycle: 'व्यापार चक्र', demand: 'मांग', disease: 'बीमारी', input: 'लागत', logistics: 'ढुलाई', margin: 'मार्जिन', receivable: 'बकाया भुगतान', seasonality: 'मौसमी बदलाव', visibility: 'हिसाब-किताब' },
    ledgerCategories: { milk_sale: 'दूध बिक्री', pottery_sale: 'मिट्टी के बर्तन बिक्री', cloth_sale: 'कपड़ा बिक्री', bird_sale: 'मुर्गी बिक्री', shop_sale: 'दुकान बिक्री', vegetable_sale: 'सब्ज़ी बिक्री', sale: 'बिक्री', feed: 'चारा', yarn: 'धागा', clay_glaze: 'मिट्टी और लेप', stock_purchase: 'माल खरीद', fees: 'शुल्क', expense: 'खर्च', emi: 'किस्त', loan_received: 'ऋण प्राप्त', savings_deposit: 'बचत जमा', savings_withdrawal: 'बचत निकासी', unclassified: 'अवर्गीकृत' },
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

    // Udhaar Book / Receivables & Accounts Screen additions
    receivablesTitle: 'उधार खाता (प्राप्य राशियां)',
    receivablesSub: 'व्यावसायिक समकक्षों से बकाया ऋण',
    gstinMerchantId: 'GSTIN / व्यापारी ID:',
    verificationStatus: 'सत्यापन स्थिति:',
    gstAadhaarVerified: 'GST और आधार सत्यापित',
    autoDetectBankSms: 'बैंक SMS ऑटो-डिटेक्ट',
    availableOnAndroidOnly: 'केवल Android पर उपलब्ध',
    startingListener: 'सुनना शुरू किया जा रहा है...',
    listeningForBankSms: 'बैंक SMS की निगरानी सक्रिय है',
    smsPrivacyNotice: 'सभी SMS प्रोसेसिंग आपके डिवाइस पर ही होती है। कोई भी मैसेज डेटा अपलोड नहीं किया जाता है।',
    importSmsHistory: 'SMS इतिहास आयात करें',
    scanPastSmsSub: 'पुराने लेन-देन आयात करने के लिए पिछले बैंक SMS स्कैन करें',
    verifiedShopLocation: 'सत्यापित दुकान का स्थान',
    googleMapsCentroid: 'Google Maps सत्यापित GPS सेंट्रॉइड',
    gpsLockedFooter: 'आपके GPS निर्देशांक सुरक्षित रूप से लॉक हैं और आपके क्षेत्रीय नोडल समन्वयक द्वारा सत्यापित हैं।',
    smsActiveLabel: (n) => `सक्रिय · ${n} लेनदेन ऑटो-डिटेक्ट किए गए`,
    smsPermissionRequired: 'SMS अनुमति आवश्यक है',
    detectTransactionsSub: 'बैंक SMS से लेनदेन का पता लगाएं',
    scanningPastSmsInbox: 'पिछले SMS इनबॉक्स को स्कैन किया जा रहा है...',
    pastTxnsImportedLabel: (n) => `${n} पिछले लेनदेन आयात किए गए`,
    smsEnabledWillScan: 'सक्रिय · अगली बार लिसनर शुरू होने पर स्कैन किया जाएगा',
    scanningPastSmsProgress: 'लेनदेन के लिए पिछले SMS को स्कैन किया जा रहा है...',
    smsHistoryPrivacyNotice: 'आपके SMS इनबॉक्स को केवल डिवाइस पर स्कैन करता है। कोई मैसेज डेटा अपलोड नहीं किया जाता है।',
    smsPermissionTitle: 'अनुमति की आवश्यकता है',
    smsPermissionMsg: 'बैंक लेनदेन को ऑटो-डिटेक्ट करने के लिए SMS अनुमति की आवश्यकता है। कृपया अपनी डिवाइस सेटिंग्स में अनुमति प्रदान करें।',
    smsHistoryPermissionMsg: 'पिछले बैंक लेनदेन के लिए आपके इनबॉक्स को स्कैन करने के लिए SMS अनुमति की आवश्यकता है। कृपया अपनी डिवाइस सेटिंग्स में अनुमति प्रदान करें।',
    selectPreferredLangSub: 'अपनी पसंदीदा ऐप भाषा चुनें',

    // Additional fields for Modals, top bar and GST verified
    verifiedMerchantGateway: 'सत्यापित मर्चेंट गेटवे',
    gstVerified: 'GST सत्यापित',
    securityAccessInfoTitle: 'सुरक्षा और पहुँच जानकारी',
    sslEncryptedGateway: '256-बिट SSL AES एन्क्रिप्टेड सुरक्षित गेटवे',
    registeredGstinCreds: 'पंजीकृत GSTIN क्रेडेंशियल:',
    aadhaarLinkedMobile: 'आधार लिंक मोबाइल:',
    activeSessionId: 'सक्रिय सत्र ID:',
    requestAadhaarOtpReset: 'आधार OTP रीसेट का अनुरोध करें',
    close: 'बंद करें',
    otpDispatchedTitle: 'OTP भेजा गया',
    otpDispatchedMsg: 'पासवर्ड रीसेट कोड SMS के माध्यम से आपके पंजीकृत आधार मोबाइल नंबर पर भेज दिया गया है।',
    dhansetuSupportHelpdeskTitle: 'धनसेतु सहायता डेस्क',
    supportDeptLabel: 'सहायता विभाग:',
    financialInclusionDiv: 'वित्तीय समावेशन सहायता प्रभाग',
    tollFreeHelpline: 'टोल-फ्री हेल्पलाइन:',
    officialEmailSupport: 'आधिकारिक ईमेल सहायता:',
    operatingHours: 'कार्य समय:',
    operatingHoursVal: 'सोम - शनि: सुबह 9:00 बजे से शाम 6:00 बजे IST',
    supportCoordinator: 'सहायता समन्वयक:',
    regionalNodalCoordinator: 'क्षेत्रीय नोडल समन्वयक',
    callHelplineBtn: 'हेल्पलाइन पर कॉल करें (1800-11-2244)',
    callingSupportMsg: 'टोल फ्री डायल किया जा रहा है: 1800-11-2244...',

    // Chart Legend & details
    chartInflowLegend: 'जमा (₹)',
    chartOutflowLegend: 'नामे (₹)',
    chartNetLegend: 'शुद्ध रेखा',
    noCashflowRecords: 'अभी कोई नकदी प्रवाह रिकॉर्ड उपलब्ध नहीं है',
    addDailyEntriesHint: 'साप्ताहिक नकदी प्रवाह विश्लेषण उत्पन्न करने के लिए दैनिक प्रविष्टियां जोड़ें।',
    inflowColon: 'जमा:',
    outflowColon: 'नामे:',
    netCashflowColon: 'शुद्ध नकदी प्रवाह:',

    // Filter, Alert UI, status tags, and mark read
    filterAll: 'सभी',
    filterToday: 'आज',
    filter7Days: '7 दिन',
    filterMonth: 'महीना',
    filterCustom: 'कस्टम',
    filterCustomRange: 'कस्टम दायरा',
    filterCustomPrefix: 'कस्टम: ',
    noTxnsFound: 'चयनित सीमा के लिए कोई लेनदेन प्रविष्टियां नहीं मिलीं।',
    aiPredictiveAnalysis: 'एआई भविष्य कहनेवाला विश्लेषण',
    stressProb: 'तनाव की संभावना',
    defaultProb: 'चूक की संभावना',
    modelScore: 'मॉडल स्कोर',
    markAllAsRead: 'सभी को पढ़ा हुआ चिह्नित करें',
    allRead: 'सभी पढ़े गए',
    tagNew: 'नया',
    tagMonitored: 'निगरानी की गई',
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
    marketSub: 'कृषी वस्तू दर, किमान आधारभूत किंमत (MSP) व हवामान जोखीम',
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
    mechanisms: { margin_squeeze: 'मार्जिन दबाव', working_capital_erosion: 'खेळते भांडवल क्षरण', debt_overhang: 'कर्जाचा भार', climate_shock: 'हवामान धोका', demand_trough: 'मागणीतील घट', receivable_stretch: 'येणे रकमेत विलंब' },
    counterpartyTypes: { cooperative: 'सहकारी संस्था', trader: 'व्यापारी', exporter: 'निर्यातदार', retailer: 'किरकोळ विक्रेता', village_credit: 'गाव उधारी' },
    riskTypes: { climate: 'हवामान', counterparty: 'खरेदीदार धोका', cycle: 'व्यवसाय चक्र', demand: 'मागणी', disease: 'रोग', input: 'निविष्ठा खर्च', logistics: 'वाहतूक', margin: 'मार्जिन', receivable: 'येणी', seasonality: 'हंगामी बदल', visibility: 'नोंदी' },
    ledgerCategories: { milk_sale: 'दूध विक्री', pottery_sale: 'मातीची भांडी विक्री', cloth_sale: 'कापड विक्री', bird_sale: 'पक्षी विक्री', shop_sale: 'दुकान विक्री', vegetable_sale: 'भाजी विक्री', sale: 'विक्री', feed: 'चारा', yarn: 'सूत', clay_glaze: 'माती व लेप', stock_purchase: 'माल खरेदी', fees: 'शुल्क', expense: 'खर्च', emi: 'हप्ता', loan_received: 'कर्ज मिळाले', savings_deposit: 'बचत ठेव', savings_withdrawal: 'बचत काढली', unclassified: 'अवर्गीकृत' },
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

    // Udhaar Book / Receivables & Accounts Screen additions
    receivablesTitle: 'उधारी खाते (येणे रकमा)',
    receivablesSub: 'व्यावसायिक भागीदारांकडून थकीत येणी',
    gstinMerchantId: 'GSTIN / व्यापारी ID:',
    verificationStatus: 'सत्यापन स्थिती:',
    gstAadhaarVerified: 'GST आणि आधार सत्यापित',
    autoDetectBankSms: 'बँक SMS ऑटो-डिटेक्ट',
    availableOnAndroidOnly: 'फक्त Android वर उपलब्ध',
    startingListener: 'प्रक्रिया सुरू होत आहे...',
    listeningForBankSms: 'बँक SMS ऐकत आहे',
    smsPrivacyNotice: 'सर्व SMS प्रोसेसिंग तुमच्या डिव्हाइसवरच होते. कोणताही संदेश डेटा अपलोड केला जात नाही.',
    importSmsHistory: 'SMS इतिहास आयात करा',
    scanPastSmsSub: 'जुने व्यवहार आयात करण्यासाठी मागील बँक SMS स्कॅन करा',
    verifiedShopLocation: 'सत्यापित दुकान स्थान',
    googleMapsCentroid: 'Google Maps सत्यापित GPS सेंट्रॉइड',
    gpsLockedFooter: 'तुमचे GPS निर्देशांक सुरक्षितपणे लॉक केले आहेत आणि तुमच्या प्रादेशिक नोडल समन्वयकाद्वारे सत्यापित केले आहेत.',
    smsActiveLabel: (n) => `सक्रिय · ${n} व्यवहार ऑटो-डिटेक्ट केले`,
    smsPermissionRequired: 'SMS परवानगी आवश्यक आहे',
    detectTransactionsSub: 'बँक SMS वरून व्यवहार शोधा',
    scanningPastSmsInbox: 'मागील SMS इनबॉक्स स्कॅन करत आहे...',
    pastTxnsImportedLabel: (n) => `${n} मागील व्यवहार आयात केले`,
    smsEnabledWillScan: 'सक्रिय · पुढील वेळी लिसनर सुरू झाल्यावर स्कॅन केले जाईल',
    scanningPastSmsProgress: 'व्यवहारांसाठी मागील SMS स्कॅन करत आहे...',
    smsHistoryPrivacyNotice: 'तुमचा SMS इनबॉक्स फक्त डिव्हाइसवर स्कॅन करतो. कोणताही संदेश डेटा अपलोड केला जात नाही.',
    smsPermissionTitle: 'परवानगी आवश्यक आहे',
    smsPermissionMsg: 'बँक व्यवहार ऑटो-डिटेक्ट करण्यासाठी SMS परवानगी आवश्यक आहे. कृपया तुमच्या डिव्हाइस सेटिंग्जमध्ये परवानगी द्या.',
    smsHistoryPermissionMsg: 'मागील बँक व्यवहारांसाठी तुमचा इनबॉक्स स्कॅन करण्यासाठी SMS परवानगी आवश्यक आहे. कृपया तुमच्या डिव्हाइस सेटिंग्जमध्ये परवानगी द्या.',
    selectPreferredLangSub: 'तुमची आवडती अ‍ॅप भाषा निवडा',

    // Additional fields for Modals, top bar and GST verified
    verifiedMerchantGateway: 'सत्यापित मर्चंट गेटवे',
    gstVerified: 'GST सत्यापित',
    securityAccessInfoTitle: 'सुरक्षा आणि प्रवेश माहिती',
    sslEncryptedGateway: '२५६-बिट SSL AES एन्क्रिप्टेड सुरक्षित गेटवे',
    registeredGstinCreds: 'नोंदणीकृत GSTIN क्रेडेंशियल्स:',
    aadhaarLinkedMobile: 'आधार लिंक केलेला मोबाईल:',
    activeSessionId: 'सक्रिय सत्र ID:',
    requestAadhaarOtpReset: 'आधार OTP रीसेटची विनंती करा',
    close: 'बंद करा',
    otpDispatchedTitle: 'OTP पाठवला',
    otpDispatchedMsg: 'पासवर्ड रीसेट कोड SMS द्वारे तुमच्या नोंदणीकृत आधार मोबाईल नंबरवर पाठवला गेला आहे।',
    dhansetuSupportHelpdeskTitle: 'धनसेतु मदत केंद्र',
    supportDeptLabel: 'मदत विभाग:',
    financialInclusionDiv: 'वित्तीय समावेशन मदत विभाग',
    tollFreeHelpline: 'टोल-फ्री हेल्पलाइन:',
    officialEmailSupport: 'अधिकृत ईमेल मदत:',
    operatingHours: 'कामाचे तास:',
    operatingHoursVal: 'सोम - शनि: सकाळी ९:०० ते संध्याकाळी ६:०० IST',
    supportCoordinator: 'मदत समन्वयक:',
    regionalNodalCoordinator: 'प्रादेशिक नोडल समन्वयक',
    callHelplineBtn: 'हेल्पलाइनवर कॉल करा (1800-11-2244)',
    callingSupportMsg: 'टोल फ्री डायल केला जात आहे: 1800-11-2244...',

    // Chart Legend & details
    chartInflowLegend: 'जमा (₹)',
    chartOutflowLegend: 'नामे (₹)',
    chartNetLegend: 'निव्वळ रेषा',
    noCashflowRecords: 'अद्याप कोणताही रोख प्रवाह उपलब्ध नाही',
    addDailyEntriesHint: 'साप्ताहिक रोख प्रवाह विश्लेषण व्युत्पन्न करण्यासाठी दैनिक नोंदी जोडा.',
    inflowColon: 'जमा:',
    outflowColon: 'नामे:',
    netCashflowColon: 'निव्वळ रोख प्रवाह:',

    // Filter, Alert UI, status tags, and mark read
    filterAll: 'सर्व',
    filterToday: 'आज',
    filter7Days: '७ दिवस',
    filterMonth: 'महिना',
    filterCustom: 'कस्टम',
    filterCustomRange: 'कस्टम श्रेणी',
    filterCustomPrefix: 'कस्टम: ',
    noTxnsFound: 'निवडलेल्या कालावधीसाठी कोणतेही व्यवहार सापडले नाहीत.',
    aiPredictiveAnalysis: 'एआई भविष्यसूचक विश्लेषण',
    stressProb: 'ताण शक्यता',
    defaultProb: 'चुकवण्याची शक्यता',
    modelScore: 'मॉडेल धावसंख्या',
    markAllAsRead: 'सर्व वाचलेले म्हणून चिन्हांकित करा',
    allRead: 'सर्व वाचले',
    tagNew: 'नवीन',
    tagMonitored: 'निरीक्षण केलेले',
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
    marketSub: 'వ్యవసాయ సరుకుల ధరలు, మద్దతు ధర (MSP) మరియు వాతావరణ ముప్పు',
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
    mechanisms: { margin_squeeze: 'మార్జిన్ ఒత్తిడి', working_capital_erosion: 'వర్కింగ్ కేపిటల్ క్షీణత', debt_overhang: 'అప్పుల భారం', climate_shock: 'వాతావరణ షాక్', demand_trough: 'డిమాండ్ పతనం', receivable_stretch: 'వసూళ్ల ఆలస్యం' },
    counterpartyTypes: { cooperative: 'సహకార సంఘం', trader: 'వ్యాపారి', exporter: 'ఎగుమతిదారు', retailer: 'రిటైలర్', village_credit: 'గ్రామ అప్పు' },
    riskTypes: { climate: 'వాతావరణం', counterparty: 'కొనుగోలుదారు రిస్క్', cycle: 'వ్యాపార చక్రం', demand: 'డిమాండ్', disease: 'వ్యాధి', input: 'ఇన్‌పుట్ ఖర్చులు', logistics: 'రవాణా', margin: 'మార్జిన్లు', receivable: 'రావాల్సిన సొమ్ము', seasonality: 'కాలానుగుణత', visibility: 'లెక్కల నిర్వహణ' },
    ledgerCategories: { milk_sale: 'పాల విక్రయం', pottery_sale: 'కుండల విక్రయం', cloth_sale: 'వస్త్ర విక్రయం', bird_sale: 'కోళ్ల విక్రయం', shop_sale: 'దుకాణ విక్రయం', vegetable_sale: 'కూరగాయల విక్రయం', sale: 'అమ్మకం', feed: 'దాణా', yarn: 'నూలు', clay_glaze: 'మట్టి & పూత', stock_purchase: 'సరుకు కొనుగోలు', fees: 'ఫీజులు', expense: 'ఖర్చు', emi: 'వాయిదా', loan_received: 'రుణం అందింది', savings_deposit: 'పొదుపు జమ', savings_withdrawal: 'పొదుపు ఉపసంహరణ', unclassified: 'వర్గీకరించనివి' },
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

    // Udhaar Book / Receivables & Accounts Screen additions
    receivablesTitle: 'ఉధార్ బుక్ (రావాల్సిన సొమ్ము)',
    receivablesSub: 'వ్యాపార భాగస్వాముల నుండి రావలసిన బాకీలు',
    gstinMerchantId: 'GSTIN / మర్చంట్ ID:',
    verificationStatus: 'ధృవీకరణ స్థితి:',
    gstAadhaarVerified: 'GST & ఆధార్ ధృవీకరించబడింది',
    autoDetectBankSms: 'బ్యాంక్ SMS ఆటో-డిటెక్ట్',
    availableOnAndroidOnly: 'ఆండ్రాయిడ్‌లో మాత్రమే అందుబాటులో ఉంది',
    startingListener: 'ప్రారంభమౌతోంది...',
    listeningForBankSms: 'బ్యాంక్ SMS మానిటర్ చేస్తోంది',
    smsPrivacyNotice: 'అన్ని SMS విశ్లేషణ మీ పరికరంలోనే జరుగుతుంది. ఏ సమాచారము అప్‌లోడ్ చేయబడదు.',
    importSmsHistory: 'SMS చరిత్రను దిగుమతి చేయి',
    scanPastSmsSub: 'పాత లావాదేవీలను దిగుమతి చేయడానికి పాత బ్యాంక్ SMSలను స్కాన్ చేయండి',
    verifiedShopLocation: 'ధృవీకరించబడిన దుకాణం ప్రాంతం',
    googleMapsCentroid: 'Google Maps ధృవీకరించిన GPS కేంద్రీయం',
    gpsLockedFooter: 'మీ GPS కోఆర్డినేట్లు సురక్షితంగా లాక్ చేయబడ్డాయి మరియు మీ ప్రాంతీయ నోడల్ కోఆర్డినేటర్ ద్వారా ధృవీకరించబడ్డాయి.',
    smsActiveLabel: (n) => `సక్రియం · ${n} లావాదేవీలు ఆటో-డిటెక్ట్ చేయబడ్డాయి`,
    smsPermissionRequired: 'SMS अनुमति అవసరం',
    detectTransactionsSub: 'బ్యాంక్ SMS నుండి లావాదేవీలను గుర్తించండి',
    scanningPastSmsInbox: 'పాత SMS ఇన్‌బాక్స్ స్కాన్ చేస్తోంది...',
    pastTxnsImportedLabel: (n) => `${n} పాత లావాదేవీలు దిగుమతి చేయబడ్డాయి`,
    smsEnabledWillScan: 'సక్రియం · తదుపరిసారి లీజనర్ ప్రారంభమైనప్పుడు స్కాన్ చేయబడుతుంది',
    scanningPastSmsProgress: 'లావాదేవీల కోసం పాత SMSలను స్కాన్ చేస్తోంది...',
    smsHistoryPrivacyNotice: 'మీ పరికరంలో మాత్రమే SMS ఇన్‌బాక్స్‌ను స్కాన్ చేస్తుంది. ఏ మెసేజ్ డేటా అప్‌లోడ్ చేయబడదు.',
    smsPermissionTitle: 'అనుమతి అవసరం',
    smsPermissionMsg: 'బ్యాంక్ లావాదేవీలను ఆటో-డిటెక్ట్ చేయడానికి SMS అనుమతి అవసరం. దయచేసి మీ పరికర సెట్టింగ్‌లలో అనుమతిని మంజూరు చేయండి.',
    smsHistoryPermissionMsg: 'పాత బ్యాంక్ లావాదేవీల కోసం మీ ఇన్‌బాక్స్‌ను స్కాన్ చేయడానికి SMS అనుమతి అవసరం. దయచేసి మీ పరికర సెట్టింగ్‌లలో అనుమతిని మంజూరు చేయండి.',
    selectPreferredLangSub: 'మీకు నచ్చిన యాప్ భాషను ఎంచుకోండి',

    // Additional fields for Modals, top bar and GST verified
    verifiedMerchantGateway: 'ధృవీకరించబడిన మర్చంట్ గేట్‌వే',
    gstVerified: 'GST ధృవీకరించబడింది',
    securityAccessInfoTitle: 'భద్రత & యాక్సెస్ సమాచారం',
    sslEncryptedGateway: '256-బిట్ SSL AES ఎన్‌క్రిప్ట్ చేయబడిన సురక్షిత గేట్‌వే',
    registeredGstinCreds: 'నమోదిత GSTIN ఆధారాలు:',
    aadhaarLinkedMobile: 'ఆధార్ లింక్ చేయబడిన మొబైల్:',
    activeSessionId: 'సక్రియ సెషన్ ID:',
    requestAadhaarOtpReset: 'ఆధార్ OTP రీసెట్ కోసం అభ్యర్థించండి',
    close: 'మూసివేయి',
    otpDispatchedTitle: 'OTP పంపబడింది',
    otpDispatchedMsg: 'పాసవర్డ్ రీసెట్ కోడ్ SMS ద్వారా మీ నమోదిత ఆధార్ మొబైల్ నంబర్‌కు పంపబడింది.',
    dhansetuSupportHelpdeskTitle: 'ధనసేతు సహాయ డెస్క్',
    supportDeptLabel: 'సపోర్ట్ విభాగం:',
    financialInclusionDiv: 'ఆర్థిక చేరిక సపోర్ట్ విభాగం',
    tollFreeHelpline: 'టోల్-ఫ్రీ హెల్ప్‌లైన్:',
    officialEmailSupport: 'అధికారిక ఇమెయిల్ సపోర్ట్:',
    operatingHours: 'పని వేళలు:',
    operatingHoursVal: 'సోమ - శని: ఉదయం 9:00 నుండి సాయంత్రం 6:00 IST',
    supportCoordinator: 'సపోర్ట్ కోఆర్డినేటర్:',
    regionalNodalCoordinator: 'ప్రాంతీయ నోడల్ కోఆర్డినేటర్',
    callHelplineBtn: 'హెల్ప్‌లైన్‌కు కాల్ చేయి (1800-11-2244)',
    callingSupportMsg: 'టోల్ ఫ్రీ కాల్ చేయబడుతోంది: 1800-11-2244...',

    // Chart Legend & details
    chartInflowLegend: 'జమ (₹)',
    chartOutflowLegend: 'డెబిట్ (₹)',
    chartNetLegend: 'నికర రేఖ',
    noCashflowRecords: 'నగదు ప్రవాహ రికార్డులు ఇంకా అందుబాటులో లేవు',
    addDailyEntriesHint: 'వారాంతపు నగదు ప్రవాహ విశ్లేషణను రూపొందించడానికి రోజువారీ నమోదులను జోడించండి.',
    inflowColon: 'జమ:',
    outflowColon: 'డెబిట్:',
    netCashflowColon: 'నికర నగదు ప్రవాహం:',

    // Filter, Alert UI, status tags, and mark read
    filterAll: 'అన్నీ',
    filterToday: 'నేడు',
    filter7Days: '7 రోజులు',
    filterMonth: 'నెల',
    filterCustom: 'కస్టమ్',
    filterCustomRange: 'కస్టమ్ పరిధి',
    filterCustomPrefix: 'కస్టమ్: ',
    noTxnsFound: 'ఎంచుకున్న పరిధి కోసం లావాదేవీల నమోదులు ఏవీ కనుగొనబడలేదు.',
    aiPredictiveAnalysis: 'AI ప్రిడిక్టివ్ అనాలిసిస్',
    stressProb: 'ఒత్తిడి సంభావ్యత',
    defaultProb: 'డిఫాల్ట్ సంభావ్యత',
    modelScore: 'మోడల్ స్కోర్',
    markAllAsRead: 'అన్నీ చదివినట్లుగా గుర్తు పెట్టు',
    allRead: 'అన్నీ చదివినవి',
    tagNew: 'కొత్త',
    tagMonitored: 'పర్యవేక్షించబడింది',
  },
};
