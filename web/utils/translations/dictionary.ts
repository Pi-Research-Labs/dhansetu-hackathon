import { LanguageCode } from "@/redux/slices/languageSlice";

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
    creditHeadroom: string;
    headroomNote: (emi: number) => string;
    metrics: {
      avgInflow: string;
      outInRatio: string;
      zeroDays: string;
      runway: string;
      dscr: string;
      missedEmi: string;
    };
  };
  tiers: {
    GREEN: string;
    AMBER: string;
    RED: string;
  };
  advice: Record<string, string>;
  flagTags: Record<string, string>;
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
      creditHeadroom: "Eligible Credit Headroom",
      headroomNote: (emi: number) => `Affordable at ≤₹${emi}/mo EMI · 24-month tenure pre-qualified`,
      metrics: {
        avgInflow: "30D Avg Inflow",
        outInRatio: "Out/In Ratio",
        zeroDays: "Zero-Txn Days",
        runway: "Savings Runway",
        dscr: "Projected DSCR",
        missedEmi: "Missed EMIs (90D)",
      },
    },
    tiers: {
      GREEN: "Stable",
      AMBER: "Watchlist",
      RED: "High Risk",
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
      creditHeadroom: "अतिरिक्त ऋण क्षमता",
      headroomNote: (emi: number) => `≤₹${emi}/माह EMI पर वहनीय · 24-माह अवधि पूर्व-पात्र`,
      metrics: {
        avgInflow: "30-दिवसीय औसत आवक",
        outInRatio: "जावक/आवक अनुपात",
        zeroDays: "शून्य-लेनदेन दिन",
        runway: "बचत अवधि",
        dscr: "अनुमानित DSCR",
        missedEmi: "चूकी हुई EMI (90 दिन)",
      },
    },
    tiers: {
      GREEN: "स्थिर",
      AMBER: "निगरानी",
      RED: "उच्च जोखिम",
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
      creditHeadroom: "అదనపు రుణ సామర్థ్యం",
      headroomNote: (emi: number) => `≤₹${emi}/నెల EMI వద్ద భరించగలిగేది · 24 నెలల కాలపరిమితి`,
      metrics: {
        avgInflow: "30 రోజుల సగటు రాబడి",
        outInRatio: "చెల్లింపు/రాబడి నిష్పత్తి",
        zeroDays: "శూన్య లావాదేవీ రోజులు",
        runway: "పొదుపు వ్యవధి",
        dscr: "అంచనా DSCR",
        missedEmi: "తప్పిన EMIలు (90 రోజులు)",
      },
    },
    tiers: {
      GREEN: "స్థిరం",
      AMBER: "గమనించండి",
      RED: "అధిక రిస్క్",
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
      creditHeadroom: "अतिरिक्त कर्ज क्षमता",
      headroomNote: (emi: number) => `≤₹${emi}/महिना EMI वर परवडणारे · २४ महिने मुदत`,
      metrics: {
        avgInflow: "३० दिवसांची सरासरी आवक",
        outInRatio: "जावक/आवक प्रमाण",
        zeroDays: "शून्य-व्यवहार दिवस",
        runway: "बचत कालावधी",
        dscr: "अंदाजित DSCR",
        missedEmi: "चुकलेल्या EMI (९० दिवस)",
      },
    },
    tiers: {
      GREEN: "स्थिर",
      AMBER: "लक्ष ठेवा",
      RED: "उच्च जोखीम",
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
