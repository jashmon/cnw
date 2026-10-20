// Transcripts for the voice-alarm demo recordings on /downloads (WCAG 1.2.1). Both recordings are continuous
// speech, with no tones or other sound cues.
// Source: local speech-to-text (whisper.cpp, small and large-v3-turbo models) checked line by line against the
// recordings and against each other (the two recordings read the same script). The English is as spoken; the
// Hindi has spelling corrected. One word in the Hindi opening (सुरक्षा केंद्र, "safety centre") was unclear in both
// runs and follows the English recording. To be confirmed by the client: CLIENT-TODO §7.
export type Transcript = { label: string; lang: string; duration: string; text: string[] };

export const TRANSCRIPTS: Record<"english" | "hindi", Transcript> = {
  english: {
    label: "English", lang: "en", duration: "3:08",
    text: [
      "Namaskar! Here, you will be given information about various process related in the plant.",
      "First, it is mandatory for a new employee to give trade test. Secondly, after successful completion of the trade test, a new employee is sent to the health department for physical examination. Thirdly, after the completion of above two tests, the new employee is sent to the safety centre for information induction.",
      "You will be given detailed information on various safety regulations, equipment, prevalent related in the plant, so that we can all work safely there and go back home safely.",
      "In this sequence, we will first tell you about the most important health and safety rules in the workplace, which are as follows.",
      "One, I assess and control risks before starting any task. Two, I only perform activities for which I am authorized. Three, I never override or misuse health and safety devices. I always use the required PPEs. Four, I do not work under the influence of alcohol or drugs. Five, I report all incidents.",
      "Along with this, there are some other important safety rules related to the work, which are mandatory to follow, which are as follows.",
      "A, always keep your work area clean and tidy. B, you must obtain a permission letter, work permit, before starting work. C, do use essential PPEs as per requirement of your work. D, follow all the rules of lockout while disconnecting energy sources. E, electrical works should be carried out by its authorized persons only. F, follow all safety rules while working at height. G, always keep a guard on the rotating parts of a machine. H, do not use damaged wires. I, always use the passage or the pathway. J, use seat belt while driving. K, before doing hot work, transfer all the flammable substances and articles to some other place. L, be sure to check the instructions given before using any equipment or tool. M, remember company's emergency numbers. N, do not tamper with emergency equipment.",
      "Thank you.",
    ],
  },
  hindi: {
    label: "Hindi", lang: "hi", duration: "2:49",
    text: [
      "नमस्कार। यहाँ पर आपको संयंत्र में प्रचलित विभिन्न प्रक्रियाओं की जानकारी दी जाएगी।",
      "पहला: नए कर्मचारी को ट्रेड टेस्ट देना अनिवार्य है। दूसरा: ट्रेड टेस्ट में सफल होने के बाद नए कर्मचारी को स्वास्थ्य विभाग में शारीरिक जाँच करवाने हेतु भेजा जाता है। तीसरा: उपरोक्त दोनों परीक्षणों के बाद नए कर्मचारी को सुरक्षा संबंधी जानकारी के लिए सुरक्षा केंद्र में भेजा जाता है, जहाँ पर आपको संयंत्र में प्रचलित विभिन्न सुरक्षा नियमों, कार्यों, उपकरणों के बारे में विस्तृत जानकारी दी जाती है, जिससे हम सभी सुरक्षापूर्वक कार्य कर सकें और सुरक्षित घर वापसी कर सकें।",
      "इस क्रम में सबसे पहले हम आपको बताएँगे प्लांट परिसर में अति आवश्यक स्वास्थ्य एवं सुरक्षा नियमों के बारे में, जो कि निम्न हैं।",
      "कोई भी कार्य शुरू करने से पहले मैं जोखिमों का आकलन एवं नियंत्रण करता हूँ या करती हूँ। मैं केवल उन गतिविधियों को करता हूँ या करती हूँ, जिनके लिए मैं अधिकृत हूँ। मैं कभी भी स्वास्थ्य एवं सुरक्षा संबंधी उपकरणों का उल्लंघन नहीं करता हूँ या करती हूँ, तथा हमेशा आवश्यक सुरक्षा उपकरणों (PPE) का इस्तेमाल करता हूँ या करती हूँ। मैं शराब या मादक पदार्थों के नशे में कार्य नहीं करता हूँ या करती हूँ। मैं सभी हादसों को सूचित करता हूँ या करती हूँ।",
      "इसके साथ ही अन्य कुछ कार्य से जुड़े महत्वपूर्ण सुरक्षा नियम भी हैं, जिनका पालन करना अनिवार्य है, जो निम्न हैं।",
      "अपने कार्यक्षेत्र को सदैव साफ़ रखें। कार्य को प्रारंभ करने से पहले अनुमति पत्र अवश्य लें। कार्य के अनुरूप PPE का प्रयोग करें। ऊर्जा स्रोतों का पृथक्करण करते समय तालाबंदी के सभी नियमों का पालन करें। बिजली के कार्य उसके अधिकृत व्यक्तियों के द्वारा ही किए जाने चाहिए। ऊँचाई पर कार्य करते समय दिए गए सभी सुरक्षा नियमों का पालन करें। किसी भी मशीन के घूमने वाले हिस्सों को हमेशा गार्ड लगाकर रखें। कटे-फटे तारों का प्रयोग न करें। हमेशा पैदल पथ का प्रयोग करें। वाहन चलाते समय सीट बेल्ट का प्रयोग करें। ज्वलनशील कार्य करने से पहले वहाँ स्थित सभी ज्वलनशील पदार्थों को स्थानांतरित कर दें। सभी उपकरणों को प्रयोग से पहले दिए गए निर्देशानुसार जाँच लें। कंपनी के आपातकालीन नंबरों को याद रखें। आपातकालीन उपकरणों से छेड़छाड़ न करें।",
      "धन्यवाद।",
    ],
  },
};
