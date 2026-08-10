import { LanguageCode } from "@/redux/slices/languageSlice";

/** params the rule engine attaches to each recommended action (amount in Rs,
 *  days until the shortfall bites, months the action should cover). */
export interface ActionParams {
  amount?: number;
  days?: number;
  months?: number;
}

export interface TranslationDictionary {
  langName: string;
  govtBadge: string;
  nav: {
    home: string;
    dashboard: string;
    officerLogin: string;
    logout: string;
    welcomeOfficer: string;
  };
  land: {
    welcome: string;
    subtitle: string;
    chip: string;
    cta: string;
    whoFor: string;
    poweredBy: string;
    signin: string;
    secEyebrow: string;
    secTitle: string;
    secIntro: string;
    features: {
      f1Title: string;
      f1Desc: string;
      f2Title: string;
      f2Desc: string;
      f3Title: string;
      f3Desc: string;
      f4Title: string;
      f4Desc: string;
    };
    nodes: {
      farmer: string;
      shg: string;
      ent: string;
      bank: string;
    };
    backtestTitle: string;
    backtestSub: string;
  };
  login: {
    title: string;
    titlePortal: string;
    subtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitButton: string;
    submitting: string;
    quickDemoHeader: string;
    quickDemoNote: string;
    errorGeneric: string;
    govtPortalNote: string;
  };
  dash: {
    title: string;
    tagline: string;
    searchPlaceholder: string;
    allDistricts: string;
    allSegments: string;
    allTiers: string;
    bankablePipeline: string;
    atRiskExposure: string;
    scoreStressLabel: string;
    scoreStressTooltip: string;
    scoreOverallLabel: string;
    scoreOverallTooltip: string;
    scoreDirectionHint: string;
    summaryTitle: string;
    summaryLoading: string;
    scoreBandLow: string;
    scoreBandModerate: string;
    scoreBandHigh: string;
    actionAudience: Record<string, string>;
    actionGuidance: Record<string, (p: ActionParams) => string>;
    backtestStat: (a: number, b: number) => string;
    noMatch: string;
    historyTab: string;
    forecastTab: string;
    confidence: string;
    confidenceNote: (d: number) => string;
    channels: string;
    riskAlerts: string;
    noAlerts: string;
    suggestedActions: string;
    marketIntelTab: string;
    portfolioTab: string;
    creditHeadroom: string;
    headroomNote: (emi: number) => string;
    metrics: {
      avgInflow: string;
      outInRatio: string;
      zeroDays: string;
      runway: string;
      dscr: string;
      missedEmi: string;
      m3: string;
      m6: string;
      digital: string;
    };
    noLoan: string;
    proprietor: string;
    id: string;
    district: string;
    riskTier: string;
    bridgeHeadroom: string;
    marginGap90d: string;
    heatmapTitle: string;
    heatmapTimeHorizon: string;
    heatmapLoading: string;
    heatmapWeeks: (weeks: number) => string;
    heatmapNoData: string;
    receivablesTitle: string;
    totalBookValue: string;
    outstandingBookValue: string;
    writtenOff: string;
    writeOffRatio: string;
    highWriteOffBleed: (pct: number) => string;
    colCounterparty: string;
    colInvoices: string;
    colTotal: string;
    colOutstanding: string;
    colWrittenOff: string;
    colAvgDays: string;
    colWorstDelay: string;
    noReceivables: string;
    loadingReceivables: string;
    paymentMixTitle: string;
    preferredChannel: string;
    overallDistribution: string;
    upiLabel: string;
    walletLabel: string;
    cashLabel: string;
    trailing90DShift: string;
    overallDigital: string;
    recent90D: string;
    recentCashShare: string;
    shiftText: (pct: string) => string;
    transactionsTab: string;
    transactionsTitle: string;
    txnAll: string;
    txnLoading: string;
    txnSelectEnterprise: string;
    txnEmptyTitle: string;
    txnEmptyHint: string;
    txnUncategorised: string;
    txnHousehold: string;
    txnShowing: (shown: number, total: number) => string;
    loadingPaymentMix: string;
    heatmapStatus: string;
    heatmapPositive: string;
    heatmapNegative: string;
    heatmapZero: string;
    heatmapNetCashflow: string;
    allMechanisms: string;
  };
  tiers: {
    GREEN: string;
    AMBER: string;
    RED: string;
  };
  advice: Record<string, string>;
  flagTags: Record<string, string>;
  mechanisms: Record<string, string>;
  actionKeys: Record<string, string>;
  sectors: Record<string, string>;
  counterpartyTypes: Record<string, string>;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    langName: "English",
    govtBadge: "Government of India · Ministry of Rural Development",
    nav: {
      home: "Home",
      dashboard: "Officer Portal",
      officerLogin: "Officer Login",
      logout: "Logout",
      welcomeOfficer: "Officer Portal",
    },
    land: {
      welcome: "Welcome to DhanSetu",
      subtitle: "AI-powered Cashflow Forecasting & Early Warning Platform for Rural Enterprises",
      chip: "Bridging Financial Inclusion with AI Intelligence",
      cta: "Access Officer Portal",
      whoFor: "For Banks, SHGs, FPOs, MFIs and Rural Enterprises",
      poweredBy: "Initiative under NABARD & MoRD Framework",
      signin: "Sign In as Officer",
      secEyebrow: "Why DhanSetu",
      secTitle: "One Platform, Unified Stakeholders",
      secIntro: "The same AI signals serve the merchant, field officer, and lending bank — predictions, early risk alerts, and underwriting decisions based on single consent-driven data.",
      features: {
        f1Title: "3–6 Month Cashflow Foresight",
        f1Desc: "Cashflow forecasting for every enterprise with confidence intervals based on digital transaction history.",
        f2Title: "Pre-Default Risk Warning",
        f2Desc: "Peer-relative risk signals capture repayment stress months ahead — complete with root-cause diagnostics.",
        f3Title: "Lender Credit Capacity",
        f3Desc: "Transforms stable enterprises into a pre-qualified loan pipeline using projected DSCR.",
        f4Title: "Built for Bharat",
        f4Desc: "Multi-language support, UPI-first signals, and strict privacy under DPDP Act 2023.",
      },
      nodes: {
        farmer: "Farmers",
        shg: "Women SHGs",
        ent: "Rural Enterprises",
        bank: "Banks & MFIs",
      },
      backtestTitle: "High Accuracy Backtested Models",
      backtestSub: "Validated across historical rural transaction datasets with up to 57.5% error reduction over baseline.",
    },
    login: {
      title: "Officer Sign In",
      titlePortal: "Government Officer Portal",
      subtitle: "Secure authentication for Field Officers & Bank Credit Managers",
      phoneLabel: "Registered Phone Number",
      phonePlaceholder: "Enter 10-digit mobile number",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter officer password",
      submitButton: "Sign In to Dashboard",
      submitting: "Authenticating...",
      quickDemoHeader: "Quick Demo Credentials",
      quickDemoNote: "Use demo phone: 9000000031 & password: Lakshmi@0031",
      errorGeneric: "Invalid credentials. Please check phone number and password.",
      govtPortalNote: "Authorized Personnel Only. Logins are monitored under IT Act & DPDP Act 2023.",
    },
    dash: {
      title: "Field Officer Portfolio Dashboard",
      tagline: "Cashflow forecasting & pre-default risk monitoring for assigned enterprises",
      searchPlaceholder: "Search enterprise name, phone, or ID...",
      allDistricts: "All Districts",
      allSegments: "All Segments",
      allTiers: "All Risk Tiers",
      bankablePipeline: "Bankable Loan Pipeline",
      atRiskExposure: "At-Risk Exposure",
      scoreStressLabel: "Chance of cash trouble",
      scoreStressTooltip:
        "How likely this business is to run short of cash or miss a repayment in the next 90 days. Higher means more likely.",
      scoreOverallLabel: "Overall risk rating",
      scoreOverallTooltip:
        "The combined rating behind this enterprise's tier: the model's prediction blended with the rule checks. 38 and above is Watch, 58 and above is Act now.",
      scoreDirectionHint: "Higher = more risk",
      summaryTitle: "Business Analysis",
      summaryLoading: "Reading the numbers...",
      scoreBandLow: "Low",
      scoreBandModerate: "Moderate",
      scoreBandHigh: "High",
      actionAudience: { merchant: "Merchant does this", officer: "You do this", both: "You and the merchant" },
      actionGuidance: {
        prebook_input: (p) =>
          `Pre-book about ${p.months ?? 3} months of feed and inputs now, while prices are low. Locks today's rate before costs climb.`,
        collect_udhaar: (p) =>
          `Go after the unpaid udhaar${p.amount ? ` — roughly ₹${Math.round(p.amount).toLocaleString("en-IN")} is sitting with buyers` : ""}. Cash already earned is the cheapest cash to find.`,
        request_bridge_loan: (p) =>
          `Start a short bridge loan now${p.amount ? ` to cover the ₹${Math.round(p.amount).toLocaleString("en-IN")} gap` : ""}${p.days ? `, about ${p.days} days before it bites` : ""}. Approval takes longer than the gap allows.`,
        restructure_emi: () =>
          "Ask the lender to re-space the EMI. Repayments are landing faster than money is coming in, so a longer schedule protects the loan.",
        stagger_batch: (p) =>
          `Split the next batch across ${p.months ?? 3} months instead of buying it in one go, so the cost does not land in a single week.`,
      },
      backtestStat: (a: number, b: number) => `Backtest: ${a}% lower error on 3-month · ${b}% on 6-month vs naive baseline`,
      noMatch: "No assigned enterprises match the selected filters.",
      historyTab: "History (Weekly)",
      forecastTab: "Forecast (6-Month)",
      confidence: "Confidence",
      confidenceNote: (d: number) => `Shaded band = confidence interval. Visibility is ${d}% based on digital collections & zero-day history.`,
      channels: "Payment Channels",
      riskAlerts: "Risk & Early Warnings",
      noAlerts: "No active risk warnings",
      suggestedActions: "Recommended Guidance Actions",
      marketIntelTab: "Market Intelligence",
      portfolioTab: "My Portfolio",
      creditHeadroom: "Eligible Credit Headroom",
      headroomNote: (emi: number) => `Affordable at ≤₹${emi}/mo EMI · 24-month tenure pre-qualified`,
      metrics: {
        avgInflow: "30D Avg Inflow",
        outInRatio: "Out/In Ratio",
        zeroDays: "Zero-Txn Days",
        runway: "Savings Runway",
        dscr: "Projected DSCR",
        missedEmi: "Missed EMIs (90D)",
        m3: "Next 3M net (proj.)",
        m6: "Next 6M net (proj.)",
        digital: "Digital visibility",
      },
      noLoan: "no loan",
      proprietor: "Proprietor",
      id: "ID",
      district: "District",
      riskTier: "RISK TIER",
      bridgeHeadroom: "Bridge Headroom",
      marginGap90d: "90D Margin Gap",
      heatmapTitle: "Net Cashflow Heatmap",
      heatmapTimeHorizon: "Heatmap Time Horizon",
      heatmapLoading: "Loading Heatmap...",
      heatmapWeeks: (weeks: number) => `${weeks} Weeks`,
      heatmapNoData: "No weekly cashflow data recorded for this enterprise.",
      receivablesTitle: "Udhaar Book & Receivables Ageing",
      totalBookValue: "Total Book Value",
      outstandingBookValue: "Outstanding Book Value",
      writtenOff: "Written Off",
      writeOffRatio: "Write-Off Ratio",
      highWriteOffBleed: (pct: number) => `High Write-Off Bleed Detected (${pct}%)`,
      colCounterparty: "Counterparty Type",
      colInvoices: "Invoices",
      colTotal: "Total Amount",
      colOutstanding: "Outstanding",
      colWrittenOff: "Written Off",
      colAvgDays: "Avg Days to Cash",
      colWorstDelay: "Worst Delay",
      noReceivables: "No recorded receivables or bad debts for this enterprise.",
      loadingReceivables: "Loading Udhaar Book (Receivables)...",
      paymentMixTitle: "Ledger Payment Channels & Digital Shift",
      preferredChannel: "Channel",
      overallDistribution: "Overall Payment Distribution",
      upiLabel: "UPI",
      walletLabel: "Wallet",
      cashLabel: "Cash",
      trailing90DShift: "Trailing 90D Digital Shift",
      overallDigital: "Overall Digital",
      recent90D: "Recent 90D",
      recentCashShare: "Recent Cash Share",
      shiftText: (pct: string) => `${pct}% shift`,
      transactionsTab: "Transactions",
      transactionsTitle: "Recorded Transactions",
      txnAll: "All",
      txnLoading: "Loading transactions...",
      txnSelectEnterprise: "Select an enterprise to see its transactions.",
      txnEmptyTitle: "No transactions recorded yet",
      txnEmptyHint:
        "Entries appear here once this merchant records them by voice or in the app. Simulated history shows as daily totals only, not individual transactions.",
      txnUncategorised: "Uncategorised",
      txnHousehold: "Household",
      txnShowing: (shown: number, total: number) => `Showing ${shown} of ${total}`,
      loadingPaymentMix: "Loading Payment Mix breakdown...",
      heatmapStatus: "Status",
      heatmapPositive: "Positive",
      heatmapNegative: "Negative",
      heatmapZero: "No activity",
      heatmapNetCashflow: "Net Cashflow",
      allMechanisms: "All Mechanisms",
    },
    tiers: {
      GREEN: "Stable",
      AMBER: "Watch",
      RED: "Act Now",
    },
    mechanisms: {
      margin_squeeze: "Margin squeeze",
      working_capital_erosion: "Working capital erosion",
      debt_overhang: "Debt overhang",
      climate_shock: "Climate shock",
      demand_trough: "Demand trough",
      receivable_stretch: "Receivable stretch",
    },
    actionKeys: {
      request_bridge_loan: "Request bridge loan",
      defer_capex: "Defer capital expense",
      prebook_input: "Pre-book input",
      renegotiate_buyer_terms: "Renegotiate buyer terms",
      diversify_buyer: "Diversify buyer",
      collect_udhaar: "Collect udhaar",
      stagger_batch: "Stagger batch",
      restructure_emi: "Restructure EMI",
      claim_scheme: "Claim scheme",
      reduce_drawings: "Reduce drawings",
      sell_slow_stock: "Sell slow stock",
      on_track: "On track",
    },
    sectors: {
      DAIRY: "Dairy",
      POULTRY: "Poultry",
      HANDICRAFT: "Handicrafts & handloom",
      FOODPROC: "Food processing & agri-aggregation",
      RETAIL: "Rural retail",
    },
    counterpartyTypes: {
      cooperative: "Cooperative",
      trader: "Trader",
      exporter: "Exporter",
      retailer: "Retailer",
      village_credit: "Village credit",
    },
    advice: {
      repayment_stress: "Protect credit record: pay upcoming EMI first and contact bank for restructuring before missing another installment.",
      spend_exceeds: "Outflows exceed earnings this month — defer non-essential purchases and negotiate vendor credit terms.",
      thin_buffer: "Set aside a buffer from good weeks until savings cover at least 1 month of operations.",
      activity_drop: "Digital activity dropped — capture even small sales via UPI to maintain credit history.",
      sustained_erosion: "Inflows declining continuously — re-align business plan with Field Officer before next loan cycle.",
      on_track: "Operations smooth. Maintain digital collection & timely EMI — clean record enables larger loan eligibility.",
    },
    flagTags: {
      repayment_stress: "Repayment stress",
      spend_exceeds: "Spend exceeds earnings",
      thin_buffer: "Thin savings buffer",
      activity_drop: "Activity drop",
      sustained_erosion: "Sustained erosion",
      cost_escalation: "Cost escalation",
      erratic: "Erratic revenue",
      anomaly: "Behavioural anomaly",
    },
  },

  hi: {
    langName: "हिंदी",
    govtBadge: "भारत सरकार · ग्रामीण विकास मंत्रालय",
    nav: {
      home: "मुख्य पृष्ठ",
      dashboard: "अधिकारी पोर्टल",
      officerLogin: "अधिकारी लॉगिन",
      logout: "लॉग आउट",
      welcomeOfficer: "अधिकारी पोर्टल",
    },
    land: {
      welcome: "धनसेतु में आपका स्वागत है",
      subtitle: "ग्रामीण उद्यमों के लिए AI-संचालित नकदी प्रवाह पूर्वानुमान एवं पूर्व चेतावनी प्लेटफ़ॉर्म",
      chip: "वित्तीय समावेशन को AI बुद्धिमत्ता से जोड़ता सेतु",
      cta: "अधिकारी पोर्टल में प्रवेश करें",
      whoFor: "बैंकों, SHG, FPO, MFI और ग्रामीण उद्यमियों के लिए",
      poweredBy: "नाबार्ड एवं ग्रामीण विकास मंत्रालय की पहल",
      signin: "अधिकारी के रूप में लॉगिन करें",
      secEyebrow: "धनसेतु क्यों",
      secTitle: "एक मंच, सभी हितधारक",
      secIntro: "एक ही AI सिग्नल व्यापारी, फ़ील्ड अधिकारी और ऋणदाता बैंक तीनों को सहायता प्रदान करते हैं — एक ही सहमति-आधारित डेटा पर पूर्वानुमान व निर्णय।",
      features: {
        f1Title: "3–6 माह का नकदी प्रवाह पूर्वानुमान",
        f1Desc: "डिजिटल लेनदेन इतिहास के आधार पर प्रत्येक उद्यम के लिए सटीक नकदी प्रवाह पूर्वानुमान।",
        f2Title: "चूक से पहले चेतावनी",
        f2Desc: "समकक्ष-तुलनात्मक जोखिम संकेत महीनों पहले पुनर्भुगतान तनाव को पहचानते हैं।",
        f3Title: "ऋणदाता क्रेडिट क्षमता",
        f3Desc: "अनुमानित DSCR के साथ स्थिर उद्यमों को पूर्व-अर्हता प्राप्त ऋण पाइपलाइन में बदलता है।",
        f4Title: "भारत के लिए निर्मित",
        f4Desc: "बहु-भाषा सहायता, UPI-प्रथम संकेत और DPDP अधिनियम 2023 के तहत गोपनीयता।",
      },
      nodes: {
        farmer: "किसान",
        shg: "महिला SHG",
        ent: "ग्रामीण उद्यम",
        bank: "बैंक एवं MFI",
      },
      backtestTitle: "उच्च सटीकता बैकटेस्टेड मॉडल",
      backtestSub: "ग्रामीण लेनदेन डेटासेट पर 57.5% तक त्रुटि कमी के साथ सत्यापित।",
    },
    login: {
      title: "अधिकारी लॉगिन",
      titlePortal: "सरकारी अधिकारी पोर्टल",
      subtitle: "फ़ील्ड अधिकारियों एवं बैंक क्रेडिट प्रबंधकों के लिए सुरक्षित लॉगिन",
      phoneLabel: "पंजीकृत मोबाइल नंबर",
      phonePlaceholder: "10 अंकों का मोबाइल नंबर दर्ज करें",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "अधिकारी पासवर्ड दर्ज करें",
      submitButton: "डैशबोर्ड में साइन इन करें",
      submitting: "प्रमाणीकरण हो रहा है...",
      quickDemoHeader: "त्वरित डेमो क्रेडेंशियल",
      quickDemoNote: "डेमो फोन: 9000000031 और पासवर्ड: Lakshmi@0031 का उपयोग करें",
      errorGeneric: "अमान्य क्रेडेंशियल। कृपया मोबाइल नंबर और पासवर्ड जाँचें।",
      govtPortalNote: "केवल अधिकृत कर्मियों के लिए। आईटी अधिनियम एवं DPDP अधिनियम 2023 के तहत निगरानी।",
    },
    dash: {
      title: "फ़ील्ड अधिकारी पोर्टफोलियो डैशबोर्ड",
      tagline: "आवंटित उद्यमों के लिए नकदी प्रवाह पूर्वानुमान एवं जोखिम निगरानी",
      searchPlaceholder: "उद्यम का नाम, फोन या आईडी खोजें...",
      allDistricts: "सभी ज़िले",
      allSegments: "सभी क्षेत्र",
      allTiers: "सभी जोखिम स्तर",
      bankablePipeline: "ऋण-योग्य पाइपलाइन",
      atRiskExposure: "जोखिम में कुल ऋण",
      scoreStressLabel: "नकदी संकट की संभावना",
      scoreStressTooltip:
        "अगले 90 दिनों में इस व्यवसाय के पास नकदी कम पड़ने या किस्त चूकने की कितनी संभावना है। जितना ज़्यादा, उतना जोखिम।",
      scoreOverallLabel: "कुल जोखिम रेटिंग",
      scoreOverallTooltip:
        "इस उद्यम के स्तर के पीछे की संयुक्त रेटिंग: मॉडल का अनुमान और नियम-जाँच मिलाकर। 38 से ऊपर 'निगरानी', 58 से ऊपर 'तुरंत कार्रवाई'।",
      scoreDirectionHint: "ज़्यादा = ज़्यादा जोखिम",
      summaryTitle: "व्यापार विश्लेषण",
      summaryLoading: "आँकड़े पढ़े जा रहे हैं...",
      scoreBandLow: "कम",
      scoreBandModerate: "मध्यम",
      scoreBandHigh: "ऊँचा",
      actionAudience: { merchant: "व्यापारी यह करेंगे", officer: "आप यह करें", both: "आप और व्यापारी" },
      actionGuidance: {
        prebook_input: (p) =>
          `अभी लगभग ${p.months ?? 3} महीने का चारा और सामान पहले से बुक करें, जब दाम कम हैं। आज की दर तय हो जाएगी।`,
        collect_udhaar: (p) =>
          `बकाया उधार वसूलें${p.amount ? ` — करीब ₹${Math.round(p.amount).toLocaleString("en-IN")} खरीदारों के पास अटका है` : ""}। कमाया हुआ पैसा सबसे सस्ता पैसा है।`,
        request_bridge_loan: (p) =>
          `अभी छोटा ब्रिज लोन शुरू करें${p.amount ? ` ताकि ₹${Math.round(p.amount).toLocaleString("en-IN")} की कमी पूरी हो` : ""}${p.days ? `, संकट से लगभग ${p.days} दिन पहले` : ""}। मंज़ूरी में समय लगता है।`,
        restructure_emi: () =>
          "ऋणदाता से किस्त की अवधि बढ़ाने को कहें। आमदनी से तेज़ किस्तें जा रही हैं; लंबी अवधि ऋण को बचाएगी।",
        stagger_batch: (p) =>
          `अगला बैच एक साथ लेने के बजाय ${p.months ?? 3} महीनों में बाँटें, ताकि खर्च एक ही हफ़्ते में न पड़े।`,
      },
      backtestStat: (a: number, b: number) => `बैकटेस्ट: 3 माह पर ${a}% कम त्रुटि · 6 माह पर ${b}% सटीकता सुधार`,
      noMatch: "चयनित फ़िल्टर से कोई आवंटित उद्यम मेल नहीं खाता।",
      historyTab: "इतिहास (साप्ताहिक)",
      forecastTab: "पूर्वानुमान (6 माह)",
      confidence: "विश्वसनीयता",
      confidenceNote: (d: number) => `छायांकित बैंड = विश्वसनीयता सीमा। डिजिटल संग्रह (${d}%) के आधार पर।`,
      channels: "भुगतान चैनल",
      riskAlerts: "जोखिम व पूर्व चेतावनियाँ",
      noAlerts: "कोई सक्रिय जोखिम चेतावनी नहीं",
      suggestedActions: "अनुशंसित मार्गदर्शन कार्यवाहियाँ",
      marketIntelTab: "बाज़ार जानकारी",
      portfolioTab: "मेरा पोर्टफोलियो",
      creditHeadroom: "अतिरिक्त ऋण क्षमता",
      headroomNote: (emi: number) => `≤₹${emi}/माह EMI पर वहनीय · 24-माह अवधि पूर्व-पात्र`,
      metrics: {
        avgInflow: "30-दिवसीय औसत आवक",
        outInRatio: "जावक/आवक अनुपात",
        zeroDays: "शून्य-लेनदेन दिन",
        runway: "बचत अवधि",
        dscr: "अनुमानित DSCR",
        missedEmi: "चूकी हुई EMI (90 दिन)",
        m3: "अगले 3 माह का शुद्ध (अनुमानित)",
        m6: "अगले 6 माह का शुद्ध (अनुमानित)",
        digital: "डिजिटल दृश्यता",
      },
      noLoan: "कोई ऋण नहीं",
      proprietor: "प्रोप्राइटर",
      id: "आईडी",
      district: "ज़िला",
      riskTier: "जोखिम स्तर",
      bridgeHeadroom: "ब्रिज हेडरूम",
      marginGap90d: "90D मार्जिन अंतर",
      heatmapTitle: "नकदी प्रवाह हीटमैप",
      heatmapTimeHorizon: "हीटमैप समय सीमा",
      heatmapLoading: "हीटमैप लोड हो रहा है...",
      heatmapWeeks: (weeks: number) => `${weeks} सप्ताह`,
      heatmapNoData: "इस उद्यम के लिए कोई साप्ताहिक नकदी प्रवाह डेटा दर्ज नहीं है।",
      receivablesTitle: "उधार बही और प्राप्य आयु (उधार बुक)",
      totalBookValue: "कुल पुस्तक मूल्य (उधार)",
      outstandingBookValue: "बकाया मूल्य",
      writtenOff: "बट्टा खाता (लिखित बंद)",
      writeOffRatio: "बट्टा अनुपात",
      highWriteOffBleed: (pct: number) => `उच्च बट्टा हानि पाई गई (${pct}%)`,
      colCounterparty: "लेनदार का प्रकार",
      colInvoices: "इनवॉइस संख्या",
      colTotal: "कुल राशि",
      colOutstanding: "बकाया",
      colWrittenOff: "लिखित बंद (बट्टा)",
      colAvgDays: "औसत भुगतान दिन",
      colWorstDelay: "अधिकतम देरी",
      noReceivables: "इस उद्यम के लिए कोई प्राप्य या खराब ऋण दर्ज नहीं है।",
      loadingReceivables: "उधार बुक (प्राप्य) लोड हो रहा है...",
      paymentMixTitle: "लेजर भुगतान चैनल और डिजिटल बदलाव",
      preferredChannel: "चैनल",
      overallDistribution: "समग्र भुगतान वितरण",
      upiLabel: "UPI",
      walletLabel: "वॉलेट",
      cashLabel: "नकद",
      trailing90DShift: "पिछले 90 दिनों में डिजिटल बदलाव",
      overallDigital: "कुल डिजिटल",
      recent90D: "हालिया 90 दिन",
      recentCashShare: "हालिया नकद हिस्सा",
      shiftText: (pct: string) => `${pct}% बदलाव`,
      transactionsTab: "लेनदेन",
      transactionsTitle: "दर्ज लेनदेन",
      txnAll: "सभी",
      txnLoading: "लेनदेन लोड हो रहे हैं...",
      txnSelectEnterprise: "लेनदेन देखने के लिए एक उद्यम चुनें।",
      txnEmptyTitle: "अभी तक कोई लेनदेन दर्ज नहीं",
      txnEmptyHint:
        "जब यह व्यापारी आवाज़ से या ऐप में दर्ज करेगा, तब प्रविष्टियाँ यहाँ दिखेंगी। नकली इतिहास केवल दैनिक कुल के रूप में है, अलग-अलग लेनदेन के रूप में नहीं।",
      txnUncategorised: "अवर्गीकृत",
      txnHousehold: "घरेलू",
      txnShowing: (shown: number, total: number) => `${total} में से ${shown} दिखाए जा रहे हैं`,
      loadingPaymentMix: "पेमेंट मिक्स विवरण लोड हो रहा है...",
      heatmapStatus: "स्थिति",
      heatmapPositive: "सकारात्मक",
      heatmapNegative: "नकारात्मक",
      heatmapZero: "कोई गतिविधि नहीं",
      heatmapNetCashflow: "शुद्ध नकदी प्रवाह",
      allMechanisms: "सभी कारण",
    },
    tiers: {
      GREEN: "स्थिर",
      AMBER: "निगरानी",
      RED: "उच्च जोखिम",
    },
    mechanisms: {
      margin_squeeze: "मार्जिन संकुचन",
      working_capital_erosion: "कार्यशील पूंजी क्षरण",
      debt_overhang: "ऋण भार",
      climate_shock: "मौसम झटका",
      demand_trough: "मांग में गिरावट",
      receivable_stretch: "प्राप्य राशियों में देरी",
    },
    actionKeys: {
      request_bridge_loan: "ब्रिज लोन का आवेदन करें",
      defer_capex: "पूंजीगत खर्च टालें",
      prebook_input: "इनपुट पहले से बुक करें",
      renegotiate_buyer_terms: "खरीदार की शर्तों पर पुनः बातचीत करें",
      diversify_buyer: "खरीदार आधार बढ़ाएँ",
      collect_udhaar: "उधार वसूल करें",
      stagger_batch: "बैच को टालें",
      restructure_emi: "EMI पुनर्गठित करें",
      claim_scheme: "योजना का लाभ लें",
      reduce_drawings: "घरेलू निकासी घटाएँ",
      sell_slow_stock: "धीमे स्टॉक को बेचें",
      on_track: "स्थिति सामान्य",
    },
    sectors: {
      DAIRY: "डेयरी",
      POULTRY: "पोल्ट्री",
      HANDICRAFT: "हस्तशिल्प एवं हथकरघा",
      FOODPROC: "खाद्य प्रसंस्करण एवं कृषि-एकत्रीकरण",
      RETAIL: "ग्रामीण खुदरा",
    },
    counterpartyTypes: {
      cooperative: "सहकारी समिति",
      trader: "व्यापारी",
      exporter: "निर्यातक",
      retailer: "खुदरा विक्रेता",
      village_credit: "गांव उधार",
    },
    advice: {
      repayment_stress: "क्रेडिट रिकॉर्ड बचाएँ: पहले अगली EMI चुकाएँ और किस्त चूकने से पहले बैंक से पुनर्गठन पर बात करें।",
      spend_exceeds: "इस माह खर्च कमाई से अधिक है — गैर-ज़रूरी खरीद टालें और आपूर्तिकर्ताओं से उधार शर्तों पर बात करें।",
      thin_buffer: "हर अच्छे सप्ताह की बचत अलग रखें जब तक कि बचत कम से कम 1 माह के खर्च के बराबर न हो जाए।",
      activity_drop: "डिजिटल रिकॉर्ड शांत है — छोटी राशि भी UPI से लें ताकि क्रेडिट इतिहास मज़बूत रहे।",
      sustained_erosion: "आय लगातार घट रही है — अगले ऋण चक्र से पहले अधिकारी के साथ व्यवसाय योजना पुनः बनाएँ।",
      on_track: "सब ठीक चल रहा है। कलेक्शन डिजिटल व समय पर रखें — साफ़ इतिहास सस्ते ऋण की राह खोलता है।",
    },
    flagTags: {
      repayment_stress: "पुनर्भुगतान तनाव",
      spend_exceeds: "खर्च आय से अधिक",
      thin_buffer: "कम बचत बफर",
      activity_drop: "लेनदेन में कमी",
      sustained_erosion: "सतत घसरण",
      cost_escalation: "लागत वृद्धि",
      erratic: "अस्थिर आय",
      anomaly: "असामान्य पैटर्न",
    },
  },

  te: {
    langName: "తెలుగు",
    govtBadge: "భారత ప్రభుత్వం · గ్రామీణాభివృద్ధి మంత్రిత్వ శాఖ",
    nav: {
      home: "హోమ్",
      dashboard: "అధికారి పోర్టల్",
      officerLogin: "అధికారి లాగిన్",
      logout: "లాగ్ అవుట్",
      welcomeOfficer: "అధికారి పోర్టల్",
    },
    land: {
      welcome: "ధనసేతుకు స్వాగతం",
      subtitle: "గ్రామీణ సంస్థల కోసం AI-ఆధారిత నగదు ప్రవాహ అంచనా & ముందస్తు హెచ్చరిక వేదిక",
      chip: "ఆర్థిక చేరికను AI మేధస్సుతో కలిపే వంతెన",
      cta: "అధికారి పోర్టల్ యాక్సెస్ చేయండి",
      whoFor: "బ్యాంకులు, SHGలు, FPOలు, MFIలు మరియు గ్రామీణ వ్యవస్థాపకుల కోసం",
      poweredBy: "నాబార్డ్ & గ్రామీణాభివృద్ధి మంత్రిత్వ శాఖ చొరవ",
      signin: "అధికారిగా సైన్ ఇన్ చేయండి",
      secEyebrow: "ధనసేతు ఎందుకు",
      secTitle: "ఒకే ప్లాట్‌ఫారమ్, ముగ్గురు లబ్ధిదారులు",
      secIntro: "అవే AI సంకేతాలు వ్యాపారి, ఫీల్డ్ అధికారి, రుణ బ్యాంకు — ముగ్గురికీ సేవ చేస్తాయి: ఒకే సమ్మతి-ఆధారిత డేటా ఆధారంగా అంచనాలు.",
      features: {
        f1Title: "3–6 నెలల నగదు దూరదృష్టి",
        f1Desc: "డిజిటల్ లావాదేవీల ఆధారంగా ప్రతి సంస్థ నగదు ప్రవాహ అంచనా.",
        f2Title: "డిఫాల్ట్‌కు ముందే హెచ్చరిక",
        f2Desc: "పీర్-సాపేక్ష రిస్క్ సంకేతాలు నెలల ముందే ఒత్తిడిని పట్టుకుంటాయి.",
        f3Title: "రుణదాతలకు రుణ సామర్థ్యం",
        f3Desc: "స్థిర సంస్థలను ముందస్తు-అర్హ రుణ పైప్‌లైన్‌గా మారుస్తుంది.",
        f4Title: "భారత్ కోసం నిర్మించింది",
        f4Desc: "బహుభాషా మద్దతు, UPI-ప్రథమ సంకేతాలు మరియు DPDP చట్టం 2023 గోప్యత.",
      },
      nodes: {
        farmer: "రైతులు",
        shg: "మహిళా SHGలు",
        ent: "గ్రామీణ సంస్థలు",
        bank: "బ్యాంకులు & MFIలు",
      },
      backtestTitle: "అధిక ఖచ్చితత్వ బ్యాక్‌టెస్ట్ మోడల్స్",
      backtestSub: "గ్రామీణ లావాదేవీ డేటాపై 57.5% వరకు తక్కువ లోపంతో ధృవీకరించబడింది.",
    },
    login: {
      title: "అధికారి లాగిన్",
      titlePortal: "ప్రభుత్వ అధికారి పోర్టల్",
      subtitle: "ఫీల్డ్ అధికారులు & బ్యాంక్ క్రెడిట్ మేనేజర్ల కోసం సురక్షిత లాగిన్",
      phoneLabel: "నమోదిత మొబైల్ సంఖ్య",
      phonePlaceholder: "10 అంకెల మొబైల్ సంఖ్యను నమోదు చేయండి",
      passwordLabel: "పాస్‌వర్డ్",
      passwordPlaceholder: "అధికారి పాస్‌వర్డ్ నమోదు చేయండి",
      submitButton: "డ్యాష్‌బోర్డ్‌లోకి సైన్ ఇన్ చేయండి",
      submitting: "ప్రమాణీకరిస్తోంది...",
      quickDemoHeader: "త్వరిత డెమో వివరాలు",
      quickDemoNote: "డెమో ఫోన్: 9000000031 & పాస్‌వర్డ్: Lakshmi@0031 ఉపయోగించండి",
      errorGeneric: "చెల్లని వివరాలు. ఫోన్ సంఖ్య మరియు పాస్‌వర్డ్ తనిఖీ చేయండి.",
      govtPortalNote: "అధికారిక సిబ్బందికి మాత్రమే. IT చట్టం & DPDP చట్టం 2023 కింద పర్యవేక్షించబడుతుంది.",
    },
    dash: {
      title: "ఫీల్డ్ అధికారి పోర్ట్‌ఫోలియో డ్యాష్‌బోర్డ్",
      tagline: "కేటాయించిన సంస్థల నగదు ప్రవాహ అంచనా & రిస్క్ పర్యవేక్షణ",
      searchPlaceholder: "సంస్థ పేరు, ఫోన్ లేదా ఐడీతో వెతకండి...",
      allDistricts: "అన్ని జిల్లాలు",
      allSegments: "అన్ని రంగాలు",
      allTiers: "అన్ని రిస్క్ స్థాయిలు",
      bankablePipeline: "రుణ-అర్హ పైప్‌లైన్",
      atRiskExposure: "రిస్క్‌లో ఉన్న రుణాలు",
      scoreStressLabel: "నగదు ఇబ్బంది అవకాశం",
      scoreStressTooltip:
        "రాబోయే 90 రోజుల్లో ఈ వ్యాపారానికి నగదు కొరత రావడానికి లేదా వాయిదా చెల్లించలేకపోవడానికి ఎంత అవకాశం ఉంది. ఎక్కువైతే ఎక్కువ ప్రమాదం.",
      scoreOverallLabel: "మొత్తం రిస్క్ రేటింగ్",
      scoreOverallTooltip:
        "ఈ సంస్థ స్థాయి వెనుక ఉన్న సంయుక్త రేటింగ్: మోడల్ అంచనా మరియు రూల్ తనిఖీలు కలిపి. 38 పైన 'గమనించండి', 58 పైన 'వెంటనే చర్య'.",
      scoreDirectionHint: "ఎక్కువ = ఎక్కువ ప్రమాదం",
      summaryTitle: "వ్యాపార విశ్లేషణ",
      summaryLoading: "సంఖ్యలు చదువుతోంది...",
      scoreBandLow: "తక్కువ",
      scoreBandModerate: "మధ్యస్థం",
      scoreBandHigh: "ఎక్కువ",
      actionAudience: { merchant: "వ్యాపారి చేయాలి", officer: "మీరు చేయాలి", both: "మీరు మరియు వ్యాపారి" },
      actionGuidance: {
        prebook_input: (p) =>
          `ధరలు తక్కువగా ఉన్నప్పుడే సుమారు ${p.months ?? 3} నెలల దాణా, సామాగ్రి ముందుగా బుక్ చేయండి. ఈనాటి ధర ఖాయమవుతుంది.`,
        collect_udhaar: (p) =>
          `బకాయి ఉధార్ వసూలు చేయండి${p.amount ? ` — సుమారు ₹${Math.round(p.amount).toLocaleString("en-IN")} కొనుగోలుదారుల వద్ద ఉంది` : ""}. సంపాదించిన డబ్బే చౌకైన డబ్బు.`,
        request_bridge_loan: (p) =>
          `ఇప్పుడే చిన్న బ్రిడ్జ్ లోన్ మొదలుపెట్టండి${p.amount ? ` — ₹${Math.round(p.amount).toLocaleString("en-IN")} లోటు కోసం` : ""}${p.days ? `, సుమారు ${p.days} రోజుల ముందు` : ""}. ఆమోదానికి సమయం పడుతుంది.`,
        restructure_emi: () =>
          "వాయిదా గడువు పొడిగించమని రుణదాతను అడగండి. ఆదాయం కంటే వేగంగా వాయిదాలు పోతున్నాయి.",
        stagger_batch: (p) =>
          `తదుపరి బ్యాచ్‌ను ఒకేసారి కాకుండా ${p.months ?? 3} నెలల్లో విభజించండి, ఖర్చు ఒకే వారంలో పడకుండా.`,
      },
      backtestStat: (a: number, b: number) => `బ్యాక్‌టెస్ట్: 3 నెలలపై ${a}% తక్కువ లోపం · 6 నెలలపై ${b}% ఖచ్చితత్వం`,
      noMatch: "ఎంచుకున్న ఫిల్టర్లకు సరిపోలే కేటాయించిన సంస్థ లేదు.",
      historyTab: "చరిత్ర (వారంవారీ)",
      forecastTab: "అంచనా (6 నెలలు)",
      confidence: "విశ్వసనీయత",
      confidenceNote: (d: number) => `షేడెడ్ బ్యాండ్ = విశ్వసనీయత శ్రేణి (${d}% డిజిటల్ దృశ్యత).`,
      channels: "చెల్లింపు మార్గాలు",
      riskAlerts: "రిస్క్ హెచ్చరికలు",
      noAlerts: "సక్రియ హెచ్చరికలు లేవు",
      suggestedActions: "సూచించిన చర్యలు",
      marketIntelTab: "మార్కెట్ సమాచారం",
      portfolioTab: "నా పోర్ట్‌ఫోలియో",
      creditHeadroom: "అదనపు రుణ సామర్థ్యం",
      headroomNote: (emi: number) => `≤₹${emi}/నెల EMI వద్ద భరించగలిగేది · 24 నెలల కాలపరిమితి`,
      metrics: {
        avgInflow: "30 రోజుల సగటు రాబడి",
        outInRatio: "చెల్లింపు/రాబడి నిష్పత్తి",
        zeroDays: "శూన్య లావాదేవీ రోజులు",
        runway: "పొదుపు వ్యవధి",
        dscr: "అంచనా DSCR",
        missedEmi: "తప్పిన EMIలు (90 రోజులు)",
        m3: "తరువాతి 3 నెలల నికర (అంచనా)",
        m6: "తరువాతి 6 నెలల నికర (అంచనా)",
        digital: "డిజిటల్ దృశ్యత",
      },
      noLoan: "రుణం లేదు",
      proprietor: "యజమాని (ప్రోప్రైటర్)",
      id: "ఐడీ",
      district: "జిల్లా",
      riskTier: "రిస్క్ వర్గం",
      bridgeHeadroom: "బ్రిడ్జ్ హెడ్‌రూమ్",
      marginGap90d: "90D మార్జిన్ నిష్పత్తి",
      heatmapTitle: "నికర నగదు ప్రవాహ హీట్‌మ్యాప్",
      heatmapTimeHorizon: "హీట్‌మ్యాప్ సమయ పరిమితి",
      heatmapLoading: "హీట్‌మ్యాప్ లోడ్ అవుతోంది...",
      heatmapWeeks: (weeks: number) => `${weeks} వారాలు`,
      heatmapNoData: "ఈ సంస్థ కోసం వారపు నగదు ప్రవాహ డేటా నమోదు కాలేదు.",
      receivablesTitle: "ఉధార్ బుక్ & వసూళ్లు వయస్సు విశ్లేషణ",
      totalBookValue: "మొత్తం పుస్తక విలువ",
      outstandingBookValue: "బాకీ ఉన్న విలువ",
      writtenOff: "రద్దు చేయబడినవి",
      writeOffRatio: "రద్దు నిష్పत्ति",
      highWriteOffBleed: (pct: number) => `అధిక నష్టాలు గుర్తించబడ్డాయి (${pct}%)`,
      colCounterparty: "కౌంటర్ పార్టీ రకం",
      colInvoices: "ఇన్వాయిస్లు",
      colTotal: "మొత్తం నగదు",
      colOutstanding: "బాకీ ఉన్నది",
      colWrittenOff: "రద్దు చేయబడినది",
      colAvgDays: "వసూలు సगటు రోజులు",
      colWorstDelay: "గరిష్ట ఆలస్యం",
      noReceivables: "ఈ సంస్థకు ఎటువంటి బాకీలు లేదా నష్టాలు నమోదు కాలేదు.",
      loadingReceivables: "ఉధార్ బుక్ (వసూళ్లు) లోడ్ అవుతోంది...",
      paymentMixTitle: "లెడ్జర్ చెల్లింపు మార్గాలు & డిజిటల్ మార్పు",
      preferredChannel: "ఛానల్",
      overallDistribution: "మొత్తం చెల్లింపు పంపిణీ",
      upiLabel: "UPI",
      walletLabel: "వాలెట్",
      cashLabel: "నగదు",
      trailing90DShift: "గడిచిన 90 రోజుల డిజిటల్ మార్పు",
      overallDigital: "మొత్తం డిజిటల్",
      recent90D: "ఇటీవలి 90 రోజులు",
      recentCashShare: "ఇటీవలి నగదు వాటా",
      shiftText: (pct: string) => `${pct}% మార్పు`,
      transactionsTab: "లావాదేవీలు",
      transactionsTitle: "నమోదైన లావాదేవీలు",
      txnAll: "అన్నీ",
      txnLoading: "లావాదేవీలు లోడ్ అవుతున్నాయి...",
      txnSelectEnterprise: "లావాదేవీలు చూడటానికి ఒక సంస్థను ఎంచుకోండి.",
      txnEmptyTitle: "ఇంకా లావాదేవీలు నమోదు కాలేదు",
      txnEmptyHint:
        "ఈ వ్యాపారి వాయిస్ ద్వారా లేదా యాప్‌లో నమోదు చేసినప్పుడు ఎంట్రీలు ఇక్కడ కనిపిస్తాయి. అనుకరణ చరిత్ర రోజువారీ మొత్తాలుగా మాత్రమే ఉంటుంది, విడి లావాదేవీలుగా కాదు.",
      txnUncategorised: "వర్గీకరించనివి",
      txnHousehold: "గృహ",
      txnShowing: (shown: number, total: number) => `${total}లో ${shown} చూపుతోంది`,
      loadingPaymentMix: "చెల్లింపుల విభజన లోడ్ అవుతోంది...",
      heatmapStatus: "స్థితి",
      heatmapPositive: "సానుకూలం",
      heatmapNegative: "ప్రతికూలం",
      heatmapZero: "కార్యకలాపం లేదు",
      heatmapNetCashflow: "నికర నగదు ప్రవాహం",
      allMechanisms: "అన్ని కారణాలు",
    },
    tiers: {
      GREEN: "స్థిరం",
      AMBER: "గమనించండి",
      RED: "అధిక రిస్క్",
    },
    mechanisms: {
      margin_squeeze: "మార్జిన్ ఒత్తిడి",
      working_capital_erosion: "వర్కింగ్ కేపిటల్ క్షీణత",
      debt_overhang: "అప్పుల భారం",
      climate_shock: "వాతావరణ షాక్",
      demand_trough: "డిమాండ్ పతనం",
      receivable_stretch: "వసూళ్ల ఆలస్యం",
    },
    actionKeys: {
      request_bridge_loan: "బ్రిడ్జ్ లోన్ కోసం అభ్యర్థించండి",
      defer_capex: "మూలధన వ్యయాన్ని వాయిదా వేయండి",
      prebook_input: "ఇన్‌పుట్‌ను ముందుగా బుక్ చేయండి",
      renegotiate_buyer_terms: "కొనుగోలుదారు నిబంధనలను తిరిగి చర్చించండి",
      diversify_buyer: "కొనుగోలుదారులను విస్తరించండి",
      collect_udhaar: "ఉధార్ వసూలు చేయండి",
      stagger_batch: "బ్యాచ్‌ను వాయిదా వేయండి",
      restructure_emi: "EMI పునర్‌వ్యవస్థీకరించండి",
      claim_scheme: "పథకం ప్రయోజనం పొందండి",
      reduce_drawings: "ఇంటి ఖర్చులు తగ్గించండి",
      sell_slow_stock: "నెమ్మదిగా అమ్ముడైన స్టాక్‌ను విక్రయించండి",
      on_track: "సక్రమంగా ఉంది",
    },
    sectors: {
      DAIRY: "పాడి పరిశ్రమ",
      POULTRY: "పౌల్ట్రీ",
      HANDICRAFT: "హస్తకళలు & చేనేత",
      FOODPROC: "ఆహార ప్రాసెసింగ్ & వ్యవసాయ సమీకరణ",
      RETAIL: "గ్రామీణ రిటైల్",
    },
    counterpartyTypes: {
      cooperative: "సహకార సంఘం",
      trader: "వ్యాపారి",
      exporter: "ఎగుమతిదారు",
      retailer: "రిటైలర్",
      village_credit: "గ్రామ అప్పు",
    },
    advice: {
      repayment_stress: "క్రెడిట్ రికార్డును కాపాడుకోండి: ముందుగా EMI చెల్లించండి, లేకపోతే బ్యాంకుతో మాట్లాడండి.",
      spend_exceeds: "ఈ నెల సంపాదన కంటే ఎక్కువ ఖర్చు చేస్తున్నారు — అనవసర కొనుగోళ్లను వాయిదా వేయండి.",
      thin_buffer: "పొదుపు కనీసం ఒక నెల ఖర్చులకు సరిపడే వరకు ప్రతి వారంలో కొంత పక్కన పెట్టండి.",
      activity_drop: "డిజిటల్ రికార్డు నిశ్శబ్దమైంది — చిన్న మొత్తాలైనా UPIలో తీసుకోండి.",
      sustained_erosion: "ఆదాయం నెలలుగా తగ్గుతోంది — అధికారులతో కలిసి ప్రణాళికను మార్చండి.",
      on_track: "అంతా సక్రమంగా ఉంది. సకాలంలో చెల్లింపులు పెద్ద రుణాలకు దోహదపడతాయి.",
    },
    flagTags: {
      repayment_stress: "చెల్లింపు ఒత్తిడి",
      spend_exceeds: "ఖర్చు రాబడిని మించింది",
      thin_buffer: "తక్కువ పొదుపు",
      activity_drop: "లావాదేవీల తగ్గుదల",
      sustained_erosion: "నిరంతర క్షీణత",
      cost_escalation: "వ్యయ పెరుగుదల",
      erratic: "అస్థిర రాబడి",
      anomaly: "అసాధారణ సరళి",
    },
  },

  mr: {
    langName: "मराठी",
    govtBadge: "भारत सरकार · ग्रामीण विकास मंत्रालय",
    nav: {
      home: "मुख्यपृष्ठ",
      dashboard: "अधिकारी पोर्टल",
      officerLogin: "अधिकारी लॉगिन",
      logout: "लॉग आउट",
      welcomeOfficer: "अधिकारी पोर्टल",
    },
    land: {
      welcome: "धनसेतूमध्ये आपले स्वागत आहे",
      subtitle: "ग्रामीण उद्योगांसाठी AI-आधारित रोख प्रवाह अंदाज व पूर्वसूचना प्लॅटफॉर्म",
      chip: "बुद्धिमत्ता आणि आर्थिक समावेशन जोडणारा सेतू",
      cta: "अधिकारी पोर्टल पहा",
      whoFor: "बँका, SHG, FPO, MFI आणि ग्रामीण उद्योजकांसाठी",
      poweredBy: "नाबार्ड व ग्रामीण विकास मंत्रालयाचा उपक्रम",
      signin: "अधिकारी म्हणून साइन इन करा",
      secEyebrow: "धनसेतू का",
      secTitle: "एक प्लॅटफॉर्म, सर्व भागधारक",
      secIntro: "तेच AI संकेत व्यापारी, क्षेत्र अधिकारी आणि कर्ज देणारी बँक तिघांनाही सेवा देतात.",
      features: {
        f1Title: "३–६ महिन्यांची रोख दूरदृष्टी",
        f1Desc: "डिजिटल व्यवहारांवर आधारित रोख प्रवाह अंदाज.",
        f2Title: "डिफॉल्टपूर्वी पूर्वसूचना",
        f2Desc: "जोखीम संकेत महिने आधीच पुनर्भुगतान ताण पकडतात.",
        f3Title: "कर्जदात्यांसाठी कर्ज क्षमता",
        f3Desc: "स्थिर उद्योगांना पूर्व-पात्र कर्ज पाइपलाइन बनवते.",
        f4Title: "भारतासाठी बनवलेले",
        f4Desc: "बहुभाषिक भाषा, UPI-प्रथम संकेत आणि DPDP कायदा २०२३.",
      },
      nodes: {
        farmer: "शेतकरी",
        shg: "महिला बचत गट",
        ent: "ग्रामीण उद्योजक",
        bank: "बँका व MFI",
      },
      backtestTitle: "उच्च अचूकता बॅकटेस्टेड मॉडेल",
      backtestSub: "ग्रामीण डेटावर ५७.५% पर्यंत कमी त्रुटीसह प्रमाणित.",
    },
    login: {
      title: "अधिकारी लॉगिन",
      titlePortal: "सरकारी अधिकारी पोर्टल",
      subtitle: "क्षेत्र अधिकारी व बँक क्रेडिट व्यवस्थापकांसाठी सुरक्षित लॉगिन",
      phoneLabel: "नोंदणीकृत मोबाईल नंबर",
      phonePlaceholder: "१० अंकी मोबाईल नंबर टाका",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "अधिकारी पासवर्ड टाका",
      submitButton: "डॅशबोर्डवर साइन इन करा",
      submitting: "प्रमाणिकरण होत आहे...",
      quickDemoHeader: "जलद डेमो माहिती",
      quickDemoNote: "डेमो फोन: 9000000031 व पासवर्ड: Lakshmi@0031 वापरा",
      errorGeneric: "अवैध माहिती. फोन नंबर व पासवर्ड तपासा.",
      govtPortalNote: "फक्त अधिकृत कर्मचाऱ्यांसाठी. IT कायदा व DPDP कायदा २०२३ अंतर्गत देखरेख.",
    },
    dash: {
      title: "क्षेत्र अधिकारी पोर्टफोलिओ डॅशबोर्ड",
      tagline: "नेमून दिलेल्या उद्योगांसाठी रोख प्रवाह अंदाज व जोखीम देखरेख",
      searchPlaceholder: "उद्योगाचे नाव, फोन किंवा आयडी शोधा...",
      allDistricts: "सर्व जिल्हे",
      allSegments: "सर्व क्षेत्रे",
      allTiers: "सर्व जोखीम स्तर",
      bankablePipeline: "कर्ज-पात्र पाइपलाइन",
      atRiskExposure: "जोखमीतील कर्ज",
      scoreStressLabel: "रोख अडचणीची शक्यता",
      scoreStressTooltip:
        "पुढील 90 दिवसांत या व्यवसायाकडे रोख कमी पडण्याची किंवा हप्ता चुकण्याची किती शक्यता आहे. जास्त म्हणजे जास्त धोका.",
      scoreOverallLabel: "एकूण जोखीम रेटिंग",
      scoreOverallTooltip:
        "या उद्योगाच्या श्रेणीमागील एकत्रित रेटिंग: मॉडेलचा अंदाज आणि नियम-तपासणी एकत्र करून. 38 वर 'लक्ष ठेवा', 58 वर 'त्वरित कारवाई'.",
      scoreDirectionHint: "जास्त = जास्त धोका",
      summaryTitle: "व्यवसाय विश्लेषण",
      summaryLoading: "आकडे वाचत आहे...",
      scoreBandLow: "कमी",
      scoreBandModerate: "मध्यम",
      scoreBandHigh: "जास्त",
      actionAudience: { merchant: "व्यापारी हे करतील", officer: "तुम्ही हे करा", both: "तुम्ही आणि व्यापारी" },
      actionGuidance: {
        prebook_input: (p) =>
          `दर कमी असतानाच सुमारे ${p.months ?? 3} महिन्यांचा चारा व साहित्य आधीच बुक करा. आजचा दर निश्चित होईल.`,
        collect_udhaar: (p) =>
          `थकीत उधारी वसूल करा${p.amount ? ` — जवळपास ₹${Math.round(p.amount).toLocaleString("en-IN")} खरेदीदारांकडे अडकले आहे` : ""}. कमावलेला पैसा सर्वात स्वस्त पैसा.`,
        request_bridge_loan: (p) =>
          `आताच छोटे ब्रिज कर्ज सुरू करा${p.amount ? ` — ₹${Math.round(p.amount).toLocaleString("en-IN")} ची तूट भरण्यासाठी` : ""}${p.days ? `, सुमारे ${p.days} दिवस आधी` : ""}. मंजुरीला वेळ लागतो.`,
        restructure_emi: () =>
          "सावकाराला हप्त्याची मुदत वाढवायला सांगा. उत्पन्नापेक्षा वेगाने हप्ते जात आहेत.",
        stagger_batch: (p) =>
          `पुढील बॅच एकाच वेळी न घेता ${p.months ?? 3} महिन्यांत विभागा, म्हणजे खर्च एकाच आठवड्यात पडणार नाही.`,
      },
      backtestStat: (a: number, b: number) => `बॅकटेस्ट: ३ महिन्यांवर ${a}% कमी त्रुटी · ६ महिन्यांवर ${b}% अचूकता`,
      noMatch: "निवडलेल्या फिल्टरशी जुळणारा कोणताही उद्योग नाही.",
      historyTab: "इतिहास (साप्ताहिक)",
      forecastTab: "अंदाज (६ महिने)",
      confidence: "विश्वासार्हता",
      confidenceNote: (d: number) => `छायांकित पट्टा = विश्वासार्हता श्रेणी (${d}% डिजिटल दृश्यमानता).`,
      channels: "पेमेंट चॅनेल",
      riskAlerts: "जोखीम सूचना",
      noAlerts: "सक्रिय सूचना नाहीत",
      suggestedActions: "सुचवलेल्या कृती",
      marketIntelTab: "बाजार माहिती",
      portfolioTab: "माझा पोर्टफोलिओ",
      creditHeadroom: "अतिरिक्त कर्ज क्षमता",
      headroomNote: (emi: number) => `≤₹${emi}/महिना EMI वर परवडणारे · २४ महिने मुदत`,
      metrics: {
        avgInflow: "३० दिवसांची सरासरी आवक",
        outInRatio: "जावक/आवक प्रमाण",
        zeroDays: "शून्य-व्यवहार दिवस",
        runway: "बचत कालावधी",
        dscr: "अंदाजित DSCR",
        missedEmi: "चुकलेल्या EMI (९० दिवस)",
        m3: "पुढील ३ महिने निव्वळ (अंदाजित)",
        m6: "पुढील ६ महिने निव्वळ (अंदाजित)",
        digital: "डिजिटल दृश्यमानता",
      },
      noLoan: "कर्ज नाही",
      proprietor: "प्रोप्रायटर",
      id: "आयडी",
      district: "जिल्हा",
      riskTier: "जोखीम स्तर",
      bridgeHeadroom: "ब्रिज हेडरूम",
      marginGap90d: "90D मार्जिन फरक",
      heatmapTitle: "निव्वळ रोख प्रवाह हीटमॅप",
      heatmapTimeHorizon: "हीटमॅप कालावधी",
      heatmapLoading: "हीटमॅप लोड होत आहे...",
      heatmapWeeks: (weeks: number) => `${weeks} आठवडे`,
      heatmapNoData: "या उद्योगासाठी साप्ताहिक रोख प्रवाह डेटा नोंदवलेला नाही.",
      receivablesTitle: "उधारी खाते आणि येणे रक्कम विश्लेषण",
      totalBookValue: "एकूण उधारी मूल्य",
      outstandingBookValue: "थकीत मूल्य",
      writtenOff: "रद्द केलेले (बुडीत)",
      writeOffRatio: "बुडीत प्रमाण",
      highWriteOffBleed: (pct: number) => `उच्च बुडीत प्रमाण आढळले (${pct}%)`,
      colCounterparty: "व्यापारी/ग्राहक प्रकार",
      colInvoices: "इनव्हॉइस संख्या",
      colTotal: "एकूण रक्कम",
      colOutstanding: "थकीत रक्कम",
      colWrittenOff: "बुडीत रक्कम",
      colAvgDays: "सरासरी वसुली दिवस",
      colWorstDelay: "कमाल विलंब",
      noReceivables: "या उद्योगासाठी कोणतीही येणे रक्कम किंवा बुडीत कर्ज नोंदवलेले नाही।",
      loadingReceivables: "उधारी खाते (येणे रक्कम) लोड होत आहे...",
      paymentMixTitle: "खातेवही पेमेंट चॅनेल्स आणि डिजिटल शिफ्ट",
      preferredChannel: "चॅनेल",
      overallDistribution: "एकूण पेमेंट वितरण",
      upiLabel: "UPI",
      walletLabel: "वॉलेट",
      cashLabel: "रोख",
      trailing90DShift: "मागील ९० दिवसांतील डिजिटल शिफ्ट",
      overallDigital: "एकूण डिजिटल",
      recent90D: "अलीकडील ९० दिवस",
      recentCashShare: "अलीकडील रोख वाटा",
      shiftText: (pct: string) => `${pct}% बदल`,
      transactionsTab: "व्यवहार",
      transactionsTitle: "नोंदवलेले व्यवहार",
      txnAll: "सर्व",
      txnLoading: "व्यवहार लोड होत आहेत...",
      txnSelectEnterprise: "व्यवहार पाहण्यासाठी एक उद्योग निवडा.",
      txnEmptyTitle: "अद्याप कोणतेही व्यवहार नोंदवलेले नाहीत",
      txnEmptyHint:
        "हा व्यापारी आवाजाने किंवा अ‍ॅपमध्ये नोंदवेल तेव्हा नोंदी येथे दिसतील. सिम्युलेटेड इतिहास फक्त दैनिक एकूण म्हणून आहे, वेगळे व्यवहार म्हणून नाही.",
      txnUncategorised: "अवर्गीकृत",
      txnHousehold: "घरगुती",
      txnShowing: (shown: number, total: number) => `${total} पैकी ${shown} दाखवत आहे`,
      loadingPaymentMix: "पेमेंट मिक्स तपशील लोड होत आहे...",
      heatmapStatus: "स्थिती",
      heatmapPositive: "सकारात्मक",
      heatmapNegative: "नकारात्मक",
      heatmapZero: "कोणतीही हालचाल नाही",
      heatmapNetCashflow: "निव्वळ रोख प्रवाह",
      allMechanisms: "सर्व कारणे",
    },
    tiers: {
      GREEN: "स्थिर",
      AMBER: "लक्ष ठेवा",
      RED: "उच्च जोखीम",
    },
    mechanisms: {
      margin_squeeze: "मार्जिन दबाव",
      working_capital_erosion: "खेळते भांडवल क्षरण",
      debt_overhang: "कर्जाचा भार",
      climate_shock: "हवामान धोका",
      demand_trough: "मागणीतील घट",
      receivable_stretch: "येणे रकमेत विलंब",
    },
    actionKeys: {
      request_bridge_loan: "ब्रिज लोनसाठी अर्ज करा",
      defer_capex: "भांडवली खर्च पुढे ढकला",
      prebook_input: "इनपुट आधीच बुक करा",
      renegotiate_buyer_terms: "खरेदीदाराच्या अटींवर पुन्हा बोलणी करा",
      diversify_buyer: "खरेदीदार वाढवा",
      collect_udhaar: "उधारी वसूल करा",
      stagger_batch: "बॅच पुढे ढकला",
      restructure_emi: "EMI पुनर्रचना करा",
      claim_scheme: "योजनेचा लाभ घ्या",
      reduce_drawings: "घरगुती खर्च कमी करा",
      sell_slow_stock: "साचलेला माल विका",
      on_track: "स्थिती सामान्य आहे",
    },
    sectors: {
      DAIRY: "दुग्धव्यवसाय",
      POULTRY: "कुक्कुटपालन",
      HANDICRAFT: "हस्तकला व हातमाग",
      FOODPROC: "अन्न प्रक्रिया व कृषी-एकत्रीकरण",
      RETAIL: "ग्रामीण किरकोळ विक्री",
    },
    counterpartyTypes: {
      cooperative: "सहकारी संस्था",
      trader: "व्यापारी",
      exporter: "निर्यातदार",
      retailer: "किरकोळ विक्रेता",
      village_credit: "गाव उधारी",
    },
    advice: {
      repayment_stress: "क्रेडिट रेकॉर्ड सांभाळा: आधी EMI भरा व बँकेशी पुनर्रचनेबाबत बोला.",
      spend_exceeds: "या महिन्यात खर्च उत्पन्नापेक्षा जास्त आहे — अनावश्यक खरेदी पुढे ढकला.",
      thin_buffer: "बचत किमान १ महिन्याच्या खर्चाएवढी होईपर्यंत बचत बाजूला ठेवा.",
      activity_drop: "डिजिटल नोंद शांत आहे — लहान रकमासुद्धा UPI ने घ्या.",
      sustained_erosion: "उत्पन्न घसरत आहे — अधिकाऱ्यासोबत व्यवसाय योजना नव्याने आखा.",
      on_track: "सर्व सुरळीत आहे. सवेळ EMI भरल्याने मोठ्या कर्जाचा मार्ग सुकर होतो.",
    },
    flagTags: {
      repayment_stress: "परतफेड ताण",
      spend_exceeds: "खर्च उत्पन्नाहून जास्त",
      thin_buffer: "अपुरी बचत",
      activity_drop: "व्यवहार घट",
      sustained_erosion: "सततची घसरण",
      cost_escalation: "खर्चवाढ",
      erratic: "अस्थिर उत्पन्न",
      anomaly: "असामान्‍य नमुना",
    },
  },
};
