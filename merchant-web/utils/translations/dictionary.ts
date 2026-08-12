export type LanguageCode = "en" | "hi" | "mr" | "te";

export interface TranslationDictionary {
  langName: string;
  govtBadge: string;
  nav: {
    home: string;
    dashboard: string;
    logout: string;
    welcomeMerchant: string;
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
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    langName: "English",
    govtBadge: "Ministry of Rural Development",
    nav: {
      home: "Home",
      dashboard: "Merchant Portal",
      logout: "Logout",
      welcomeMerchant: "Merchant Portal",
    },
    land: {
      welcome: "Welcome to DhanSetu",
      subtitle: "AI-powered Cashflow Forecasting & Early Warning Platform for Rural Enterprises",
      chip: "Bridging Financial Inclusion with AI Intelligence",
      cta: "Access Merchant Portal",
      whoFor: "For Banks, SHGs, FPOs, MFIs and Rural Enterprises",
      poweredBy: "Initiative under NABARD & MoRD Framework",
      signin: "Sign In as Merchant",
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
  },
  hi: {
    langName: "हिन्दी",
    govtBadge: "भारत सरकार · ग्रामीण विकास मंत्रालय",
    nav: {
      home: "मुख्य पृष्ठ",
      dashboard: "मर्चेंट पोर्टल",
      logout: "लॉग आउट",
      welcomeMerchant: "मर्चेंट पोर्टल",
    },
    land: {
      welcome: "धनसेतु में आपका स्वागत है",
      subtitle: "ग्रामीण उद्यमों के लिए AI-संचालित नकदी प्रवाह पूर्वानुमान एवं पूर्व चेतावनी प्लेटफ़ॉर्म",
      chip: "वित्तीय समावेशन को AI बुद्धिमत्ता से जोड़ता सेतु",
      cta: "मर्चेंट पोर्टल में प्रवेश करें",
      whoFor: "बैंकों, SHG, FPO, MFI और ग्रामीण उद्यमियों के लिए",
      poweredBy: "नाबार्ड एवं ग्रामीण विकास मंत्रालय की पहल",
      signin: "मर्चेंट के रूप में लॉगिन करें",
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
  },
  te: {
    langName: "తెలుగు",
    govtBadge: "భారత ప్రభుత్వం · గ్రామీణాభివృద్ధి మంత్రిత్వ శాఖ",
    nav: {
      home: "హోమ్",
      dashboard: "మర్చంట్ పోర్టల్",
      logout: "లాగ్ అవుట్",
      welcomeMerchant: "మర్చంట్ పోర్టల్",
    },
    land: {
      welcome: "ధనసేతుకు స్వాగతం",
      subtitle: "గ్రాमीణ సంస్థల కోసం AI-ఆధారిత నగదు ప్రవాహ అంచనా & ముందస్తు హెచ్చరిక వేదిక",
      chip: "ఆర్థిక చేరికను AI మేధస్సుతో కలిపే వంతెన",
      cta: "మర్చంట్ పోర్టల్ యాక్సెస్ చేయండి",
      whoFor: "బ్యాంకులు, SHGలు, FPOలు, MFIలు మరియు గ్రామీణ వ్యవస్థాపకుల కోసం",
      poweredBy: "నాబార్డ్ & గ్రామీణాభివృద్ధి మంత్రిత్వ శాఖ చొరవ",
      signin: "మర్చంట్‌గా సైన్ ఇన్ చేయండి",
      secEyebrow: "ధనసేతు ఎందుకు",
      secTitle: "ఒకే ప్లాట్‌ఫారమ్, ముగ్గురు లब्ధిదారులు",
      secIntro: "అవే AI సంకేతాలు వ్యాపారి, ఫీల్డ్ అధికారి, రుణ బ్యాంకు — ముग्गुరికీ సేవ చేస్తాయి: ఒకే సమ్మతి-ఆధారిత డేటా ఆధారంగా అంచనాలు.",
      features: {
        f1Title: "3–6 నెలల నగదు దూరదృష్టి",
        f1Desc: "డిజిటల్ లావాదేవీల ఆధారంగా ప్రతి సంస్థ నగదు ప్రवाహ అంచనా.",
        f2Title: "డిఫాల్ట్‌కు ముందే హెచ్చరిక",
        f2Desc: "పీర్-సాపేక్ష రిస్క్ సంకేతాలు నెలల ముందే ఒత్తిడిని పట్టుకుంటాయి.",
        f3Title: "రుణదాతలకు రుణ సామర్థ్యం",
        f3Desc: "స్థిర సంస్థలను ముందస్తు-అర్హ రుణ పైప్‌లైన్‌గా మారుస్తుంది.",
        f4Title: "భారత్ కోసం నిర్మించింది",
        f4Desc: "బహుభాషా మద్దతు, UPI-ప్రథమ సంకేతాలు మరియు DPDP చట్టం 2023 గోప्यత.",
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
  },
  mr: {
    langName: "मराठी",
    govtBadge: "भारत सरकार · ग्रामीण विकास मंत्रालय",
    nav: {
      home: "मुख्य पृष्ठ",
      dashboard: "मर्चेंट पोर्टल",
      logout: "लॉग आउट",
      welcomeMerchant: "मर्चेंट पोर्टल",
    },
    land: {
      welcome: "धनसेतूमध्ये आपले स्वागत आहे",
      subtitle: "ग्रामीण उद्योगांसाठी AI-आधारित रोख प्रवाह अंदाज व पूर्वसूचना प्लॅटफॉर्म",
      chip: "बुद्धिमत्ता आणि आर्थिक समावेशन जोडणारा सेतू",
      cta: "मर्चेंट पोर्टल पहा",
      whoFor: "बँका, SHG, FPO, MFI आणि ग्रामीण उद्योजकांसाठी",
      poweredBy: "नाबार्ड व ग्रामीण विकास मंत्रालयाचा उपक्रम",
      signin: "मर्चेंट म्हणून साइन इन करा",
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
  },
};
