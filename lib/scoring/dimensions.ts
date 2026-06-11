import type { Dimension } from "./types";

export interface QuestionDef {
  id: string;
  dimension: Dimension;
  dimensionLabel: string;
  dimensionLabelHi: string;
  text: string;
  textHi: string;
  orderIndex: number;
}

export const QUESTIONS: QuestionDef[] = [
  // A. Strategic Thinking
  {
    id: "A1", dimension: "A", dimensionLabel: "Strategic Thinking", dimensionLabelHi: "रणनीतिक सोच",
    text: "I regularly step back from day-to-day tasks to think about long-term direction and implications.",
    textHi: "मैं नियमित रूप से दैनिक कार्यों से हटकर दीर्घकालिक दिशा और प्रभावों के बारे में सोचता/सोचती हूँ।",
    orderIndex: 1,
  },
  {
    id: "A2", dimension: "A", dimensionLabel: "Strategic Thinking", dimensionLabelHi: "रणनीतिक सोच",
    text: "When making decisions, I actively consider how they align with broader organisational goals.",
    textHi: "निर्णय लेते समय, मैं सक्रिय रूप से विचार करता/करती हूँ कि वे व्यापक संगठनात्मक लक्ष्यों के साथ कैसे संरेखित हैं।",
    orderIndex: 2,
  },
  {
    id: "A3", dimension: "A", dimensionLabel: "Strategic Thinking", dimensionLabelHi: "रणनीतिक सोच",
    text: "I anticipate future challenges and prepare contingency plans before problems arise.",
    textHi: "मैं भविष्य की चुनौतियों का अनुमान लगाता/लगाती हूँ और समस्याएँ आने से पहले आकस्मिक योजनाएँ तैयार करता/करती हूँ।",
    orderIndex: 3,
  },
  {
    id: "A4", dimension: "A", dimensionLabel: "Strategic Thinking", dimensionLabelHi: "रणनीतिक सोच",
    text: "I connect information from different areas to identify emerging patterns and opportunities.",
    textHi: "मैं उभरते पैटर्न और अवसरों की पहचान के लिए विभिन्न क्षेत्रों की जानकारी को जोड़ता/जोड़ती हूँ।",
    orderIndex: 4,
  },

  // B. Attention to Detail
  {
    id: "B1", dimension: "B", dimensionLabel: "Attention to Detail", dimensionLabelHi: "विवरण पर ध्यान",
    text: "I review my work carefully to catch errors before submitting or presenting it.",
    textHi: "मैं अपने काम को सबमिट या प्रस्तुत करने से पहले त्रुटियों को पकड़ने के लिए ध्यान से समीक्षा करता/करती हूँ।",
    orderIndex: 5,
  },
  {
    id: "B2", dimension: "B", dimensionLabel: "Attention to Detail", dimensionLabelHi: "विवरण पर ध्यान",
    text: "I track small but important details even when working under tight deadlines.",
    textHi: "मैं कड़ी समयसीमा में काम करते समय भी छोटे लेकिन महत्वपूर्ण विवरणों पर नज़र रखता/रखती हूँ।",
    orderIndex: 6,
  },
  {
    id: "B3", dimension: "B", dimensionLabel: "Attention to Detail", dimensionLabelHi: "विवरण पर ध्यान",
    text: "When processes break down, I trace the root cause methodically rather than patching symptoms.",
    textHi: "जब प्रक्रियाएँ विफल होती हैं, तो मैं लक्षणों को ठीक करने के बजाय व्यवस्थित तरीके से मूल कारण का पता लगाता/लगाती हूँ।",
    orderIndex: 7,
  },
  {
    id: "B4", dimension: "B", dimensionLabel: "Attention to Detail", dimensionLabelHi: "विवरण पर ध्यान",
    text: "I maintain accuracy and quality standards even when speed is prioritised.",
    textHi: "मैं गति को प्राथमिकता दिए जाने पर भी सटीकता और गुणवत्ता मानकों को बनाए रखता/रखती हूँ।",
    orderIndex: 8,
  },

  // C. Delegation Capability
  {
    id: "C1", dimension: "C", dimensionLabel: "Delegation Capability", dimensionLabelHi: "प्रत्यायोजन क्षमता",
    text: "I assign tasks to team members based on their strengths rather than doing the work myself.",
    textHi: "मैं खुद काम करने के बजाय टीम के सदस्यों को उनकी ताकत के आधार पर कार्य सौंपता/सौंपती हूँ।",
    orderIndex: 9,
  },
  {
    id: "C2", dimension: "C", dimensionLabel: "Delegation Capability", dimensionLabelHi: "प्रत्यायोजन क्षमता",
    text: "I provide clear outcomes and context when delegating rather than micromanaging the method.",
    textHi: "प्रत्यायोजन करते समय मैं तरीके पर सूक्ष्म-प्रबंधन करने के बजाय स्पष्ट परिणाम और संदर्भ प्रदान करता/करती हूँ।",
    orderIndex: 10,
  },
  {
    id: "C3", dimension: "C", dimensionLabel: "Delegation Capability", dimensionLabelHi: "प्रत्यायोजन क्षमता",
    text: "I feel comfortable handing over important responsibilities to capable colleagues.",
    textHi: "मुझे सक्षम सहयोगियों को महत्वपूर्ण जिम्मेदारियाँ सौंपने में सहजता महसूस होती है।",
    orderIndex: 11,
  },
  {
    id: "C4", dimension: "C", dimensionLabel: "Delegation Capability", dimensionLabelHi: "प्रत्यायोजन क्षमता",
    text: "I follow up on delegated work at appropriate intervals without taking it back unnecessarily.",
    textHi: "मैं प्रत्यायोजित कार्य पर उचित अंतराल पर अनुवर्ती कार्रवाई करता/करती हूँ बिना इसे अनावश्यक रूप से वापस लिए।",
    orderIndex: 12,
  },

  // D. Stress Handling
  {
    id: "D1", dimension: "D", dimensionLabel: "Stress Handling", dimensionLabelHi: "तनाव प्रबंधन",
    text: "I remain calm and focused when multiple urgent demands arrive simultaneously.",
    textHi: "जब एक साथ कई तत्काल माँगें आती हैं तो मैं शांत और केंद्रित रहता/रहती हूँ।",
    orderIndex: 13,
  },
  {
    id: "D2", dimension: "D", dimensionLabel: "Stress Handling", dimensionLabelHi: "तनाव प्रबंधन",
    text: "After a stressful period, I recover my energy and motivation relatively quickly.",
    textHi: "तनावपूर्ण अवधि के बाद, मैं अपनी ऊर्जा और प्रेरणा को अपेक्षाकृत जल्दी वापस पा लेता/लेती हूँ।",
    orderIndex: 14,
  },
  {
    id: "D3", dimension: "D", dimensionLabel: "Stress Handling", dimensionLabelHi: "तनाव प्रबंधन",
    text: "I make clear-headed decisions even when pressure is high and stakes are significant.",
    textHi: "मैं उच्च दबाव और महत्वपूर्ण दाँव होने पर भी स्पष्ट दिमाग से निर्णय लेता/लेती हूँ।",
    orderIndex: 15,
  },
  {
    id: "D4", dimension: "D", dimensionLabel: "Stress Handling", dimensionLabelHi: "तनाव प्रबंधन",
    text: "I manage my emotional reactions effectively so they do not disrupt my team.",
    textHi: "मैं अपनी भावनात्मक प्रतिक्रियाओं को प्रभावी ढंग से प्रबंधित करता/करती हूँ ताकि वे मेरी टीम को बाधित न करें।",
    orderIndex: 16,
  },

  // E. Initiative
  {
    id: "E1", dimension: "E", dimensionLabel: "Initiative", dimensionLabelHi: "पहल",
    text: "I proactively identify and address problems before I am asked to.",
    textHi: "मैं समस्याओं को पूछे जाने से पहले सक्रिय रूप से पहचानता/पहचानती और संबोधित करता/करती हूँ।",
    orderIndex: 17,
  },
  {
    id: "E2", dimension: "E", dimensionLabel: "Initiative", dimensionLabelHi: "पहल",
    text: "I introduce new ideas or process improvements without waiting for permission.",
    textHi: "मैं अनुमति की प्रतीक्षा किए बिना नए विचार या प्रक्रिया सुधार पेश करता/करती हूँ।",
    orderIndex: 18,
  },
  {
    id: "E3", dimension: "E", dimensionLabel: "Initiative", dimensionLabelHi: "पहल",
    text: "When I see an unmet need, I take ownership of solving it even if it is outside my role.",
    textHi: "जब मैं एक अपूर्ण आवश्यकता देखता/देखती हूँ, तो मैं इसे हल करने की जिम्मेदारी लेता/लेती हूँ, भले ही यह मेरी भूमिका से बाहर हो।",
    orderIndex: 19,
  },
  {
    id: "E4", dimension: "E", dimensionLabel: "Initiative", dimensionLabelHi: "पहल",
    text: "I push forward on goals even when I encounter resistance or lack of support.",
    textHi: "मैं प्रतिरोध या समर्थन की कमी का सामना करने पर भी लक्ष्यों की दिशा में आगे बढ़ता/बढ़ती हूँ।",
    orderIndex: 20,
  },

  // F. Change Acceptance
  {
    id: "F1", dimension: "F", dimensionLabel: "Change Acceptance", dimensionLabelHi: "परिवर्तन स्वीकृति",
    text: "I adapt my approach quickly when priorities or circumstances shift.",
    textHi: "जब प्राथमिकताएँ या परिस्थितियाँ बदलती हैं तो मैं जल्दी से अपना दृष्टिकोण अनुकूलित करता/करती हूँ।",
    orderIndex: 21,
  },
  {
    id: "F2", dimension: "F", dimensionLabel: "Change Acceptance", dimensionLabelHi: "परिवर्तन स्वीकृति",
    text: "I view organisational change as an opportunity rather than a disruption.",
    textHi: "मैं संगठनात्मक परिवर्तन को व्यवधान के बजाय एक अवसर के रूप में देखता/देखती हूँ।",
    orderIndex: 22,
  },
  {
    id: "F3", dimension: "F", dimensionLabel: "Change Acceptance", dimensionLabelHi: "परिवर्तन स्वीकृति",
    text: "I actively help others navigate transitions rather than resisting or avoiding them.",
    textHi: "मैं सक्रिय रूप से दूसरों को बदलाव से गुज़रने में मदद करता/करती हूँ बजाय प्रतिरोध या परिहार के।",
    orderIndex: 23,
  },
  {
    id: "F4", dimension: "F", dimensionLabel: "Change Acceptance", dimensionLabelHi: "परिवर्तन स्वीकृति",
    text: "I experiment with new methods even when familiar approaches feel more comfortable.",
    textHi: "मैं नई विधियों के साथ प्रयोग करता/करती हूँ, भले ही परिचित तरीके अधिक आरामदायक लगें।",
    orderIndex: 24,
  },

  // G. Accountability
  {
    id: "G1", dimension: "G", dimensionLabel: "Accountability", dimensionLabelHi: "जवाबदेही",
    text: "I take full responsibility for outcomes in my area, including failures.",
    textHi: "मैं अपने क्षेत्र में परिणामों की पूरी जिम्मेदारी लेता/लेती हूँ, जिसमें विफलताएँ भी शामिल हैं।",
    orderIndex: 25,
  },
  {
    id: "G2", dimension: "G", dimensionLabel: "Accountability", dimensionLabelHi: "जवाबदेही",
    text: "I follow through on commitments reliably, even when circumstances become difficult.",
    textHi: "मैं प्रतिबद्धताओं पर भरोसेमंद तरीके से अमल करता/करती हूँ, भले ही परिस्थितियाँ कठिन हो जाएँ।",
    orderIndex: 26,
  },
  {
    id: "G3", dimension: "G", dimensionLabel: "Accountability", dimensionLabelHi: "जवाबदेही",
    text: "I communicate proactively when a deadline or commitment is at risk, rather than waiting.",
    textHi: "जब कोई समयसीमा या प्रतिबद्धता जोखिम में हो, तो मैं प्रतीक्षा करने के बजाय सक्रिय रूप से संवाद करता/करती हूँ।",
    orderIndex: 27,
  },
  {
    id: "G4", dimension: "G", dimensionLabel: "Accountability", dimensionLabelHi: "जवाबदेही",
    text: "I hold my team members accountable for agreed standards without being passive or avoidant.",
    textHi: "मैं निष्क्रिय या परिहारवादी हुए बिना अपनी टीम के सदस्यों को सहमत मानकों के लिए जवाबदेह ठहराता/ठहराती हूँ।",
    orderIndex: 28,
  },

  // H. Crisis Dependence
  {
    id: "H1", dimension: "H", dimensionLabel: "Crisis Dependence", dimensionLabelHi: "संकट निर्भरता",
    text: "I perform at my best when there is a sense of urgency or an active problem to solve.",
    textHi: "मैं तब सबसे अच्छा प्रदर्शन करता/करती हूँ जब तात्कालिकता की भावना हो या कोई सक्रिय समस्या हल करनी हो।",
    orderIndex: 29,
  },
  {
    id: "H2", dimension: "H", dimensionLabel: "Crisis Dependence", dimensionLabelHi: "संकट निर्भरता",
    text: "I feel most energised and engaged during high-stakes situations or emergencies.",
    textHi: "मैं उच्च-दाँव वाली स्थितियों या आपात स्थितियों के दौरान सबसे अधिक ऊर्जावान और संलग्न महसूस करता/करती हूँ।",
    orderIndex: 30,
  },
  {
    id: "H3", dimension: "H", dimensionLabel: "Crisis Dependence", dimensionLabelHi: "संकट निर्भरता",
    text: "I find it difficult to sustain focus and motivation during calm, routine periods.",
    textHi: "मुझे शांत, नियमित अवधियों के दौरान ध्यान और प्रेरणा बनाए रखना मुश्किल लगता है।",
    orderIndex: 31,
  },
  {
    id: "H4", dimension: "H", dimensionLabel: "Crisis Dependence", dimensionLabelHi: "संकट निर्भरता",
    text: "I tend to create a sense of urgency in my team even when the situation does not require it.",
    textHi: "मैं अपनी टीम में तात्कालिकता की भावना पैदा करता/करती हूँ, भले ही स्थिति को इसकी आवश्यकता न हो।",
    orderIndex: 32,
  },

  // I. Collaboration
  {
    id: "I1", dimension: "I", dimensionLabel: "Collaboration", dimensionLabelHi: "सहयोग",
    text: "I actively seek out different perspectives and include others in decision-making.",
    textHi: "मैं सक्रिय रूप से विभिन्न दृष्टिकोणों की तलाश करता/करती हूँ और निर्णय लेने में दूसरों को शामिल करता/करती हूँ।",
    orderIndex: 33,
  },
  {
    id: "I2", dimension: "I", dimensionLabel: "Collaboration", dimensionLabelHi: "सहयोग",
    text: "I share information, resources, and credit openly with colleagues and peers.",
    textHi: "मैं जानकारी, संसाधन और श्रेय सहकर्मियों के साथ खुलकर साझा करता/करती हूँ।",
    orderIndex: 34,
  },
  {
    id: "I3", dimension: "I", dimensionLabel: "Collaboration", dimensionLabelHi: "सहयोग",
    text: "I invest time in building relationships across teams, not just within my own.",
    textHi: "मैं केवल अपनी टीम के भीतर नहीं बल्कि अन्य टीमों में भी संबंध बनाने में समय लगाता/लगाती हूँ।",
    orderIndex: 35,
  },
  {
    id: "I4", dimension: "I", dimensionLabel: "Collaboration", dimensionLabelHi: "सहयोग",
    text: "I adapt my communication style to work effectively with people of different preferences.",
    textHi: "मैं विभिन्न प्राथमिकताओं वाले लोगों के साथ प्रभावी ढंग से काम करने के लिए अपनी संचार शैली को अनुकूलित करता/करती हूँ।",
    orderIndex: 36,
  },

  // J. Workload Management
  {
    id: "J1", dimension: "J", dimensionLabel: "Workload Management", dimensionLabelHi: "कार्यभार प्रबंधन",
    text: "I accurately estimate effort and allocate my time to match priorities.",
    textHi: "मैं प्रयास का सटीक अनुमान लगाता/लगाती हूँ और प्राथमिकताओं के अनुसार अपना समय आवंटित करता/करती हूँ।",
    orderIndex: 37,
  },
  {
    id: "J2", dimension: "J", dimensionLabel: "Workload Management", dimensionLabelHi: "कार्यभार प्रबंधन",
    text: "I recognise when my workload is unsustainable and take steps to address it.",
    textHi: "मैं पहचानता/पहचानती हूँ कि मेरा कार्यभार कब अस्थिर है और इसे संबोधित करने के लिए कदम उठाता/उठाती हूँ।",
    orderIndex: 38,
  },
  {
    id: "J3", dimension: "J", dimensionLabel: "Workload Management", dimensionLabelHi: "कार्यभार प्रबंधन",
    text: "I complete high-priority tasks without allowing lower-priority ones to crowd them out.",
    textHi: "मैं उच्च-प्राथमिकता वाले कार्यों को बिना निम्न-प्राथमिकता वाले कार्यों को उन पर हावी होने दिए पूरा करता/करती हूँ।",
    orderIndex: 39,
  },
  {
    id: "J4", dimension: "J", dimensionLabel: "Workload Management", dimensionLabelHi: "कार्यभार प्रबंधन",
    text: "I maintain consistent output quality even when I have a heavy volume of work.",
    textHi: "मैं भारी काम की मात्रा होने पर भी लगातार आउटपुट गुणवत्ता बनाए रखता/रखती हूँ।",
    orderIndex: 40,
  },
];
