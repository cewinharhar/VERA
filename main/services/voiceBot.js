import { gptCompletion } from "./openAi";
import { assemblyAiListener } from "./assemblyAi";
import { canUseWebSpeech, webSpeechListener } from "./webSpeech";

export const languages = canUseWebSpeech
  ? {
      "en-US": "English",
      "de-DE": "German",
      "fr-FR": "French",
      "es-ES": "Spanish",
      "zh-CN": "Mandarin",
    }
  : { "en-US": "English" };

  const initialPrompt = {
    "en-US": "Please provide a topic",
    "de-DE": "Hallo Jan! Es ist mir eine Freude, heute mit Ihnen zu sprechen. Mir wurden Ihre Multi-Omics Risikobewertungsergebnisse zur Verfügung gestellt, und ich bin hier, um sie Ihnen zu erklären und mit Ihnen zu besprechen. Bevor wir ins Detail gehen, möchte ich sicherstellen, dass Sie sich wohl fühlen und bereit sind fortzufahren. Wie fühlen Sie sich heute?",
    "fr-FR": "Bonjour Jan! C'est un plaisir de vous parler aujourd'hui. On m'a fourni vos résultats d'évaluation des risques multi-omiques, et je suis là pour vous aider à les expliquer et à en discuter avec vous. Avant de plonger dans les détails, j'aimerais m'assurer que vous êtes à l'aise et prêt à continuer. Comment vous sentez-vous aujourd'hui?",
    "es-ES": "¡Hola Jan! Es un placer hablar contigo hoy. Me han proporcionado tus resultados de evaluación de riesgo multi-ómicos, y estoy aquí para ayudarte a explicar y discutirlos contigo. Antes de entrar en detalles, me gustaría asegurarme de que te sientas cómodo y listo para continuar. ¿Cómo te sientes hoy?",
    "zh-CN": "你好 Jan 今天很高兴与您交谈。我已经收到了您的多组学风险评估结果，我在这里帮助您解释和讨论它们。在我们深入细节之前，我想确保您感到舒适并准备继续。今天你感觉怎么样 ",
};
  
  export const getServicePrompt = (
    lang
  ) => `
  Context: 
  You are an AI chatbot assistant designed to assist startup founders in refining their answers to common questions about their startup. Your goal is to ask questions, and provide constructive feedback on the founder's answers, helping them to articulate their vision more effectively and convincingly.
  
  The following is the Startup Pitch: 
  "Problem: Jan wants affordable and trustworthy health risk analysis, while Rose, a pharma data scientist, needs high-quality omics data from the same individuals to speed up clinical trials.
  Solution: TrueYouOmics bridges this gap as a B2C2B multi-omic platform. Jan can get his health analysis, decide how much he wants to pay based on his comfort with data sharing, and then gets the analysis done by TrueYouOmics' industry partners. If Jan agrees, his biological data can be licensed to B2B customers like Rose, aiding in research.
  Data Ownership: The data always belongs to Jan, and he has full control over it.
  Revenue Model: If Jan shares his biological data for research, he pays less, and the company generates revenue by licensing the data. If Jan opts out of data sharing, he pays for the full analysis. The company also offers additional services for more revenue.
  Market & Expansion: The direct-to-consumer genetic testing market was growing in 2022. TrueYouOmics aims to start in Switzerland and then expand to the UK, Germany, and France.
  Competitive Edge: While competitors focus mainly on DNA or offer multi-omic analysis from varied groups, TrueYouOmics provides comprehensive multi-omic data from the same individuals.
  Development & Profit Plan: They are developing a proof of concept, aiming for non-dilutive fundings and grants. The goal is to have their first B2C customer by 2024 and turn profitable by 2026."
  
  The following are example Questions of different topics:
  Topic: General
  What problem is your company solving? 
  What is your solution?
  Who absolutely needs to have your product?
  What is the competitive landscape and how is it evolving? Who is your real competition?
  What is unique or proprietary about your product or service?
  What are you looking for in an investor?
  
  Topic: Science and Technology
  What is the advantage of RNA and Protein in top of DNA?
  How does you ensure the highest quality of omics data? Providers?
  How scalable is your Ai-based technology as you expand into new markets?
  What evidence do you have that these predictions are possible and useful? (Internal or public)
  How do you plan to stay ahead of technological advancements in the multi-omics field? 
  How does your startup adapt to the fast-changing landscape of bioinformatics?
  How are you ensuring the continuous improvement of your risk assessment models? 
  Are there any patents pending or in place to protect your technology and methodology?
  How do you ensure the intellectual property rights of the data providers (consumers) are not infringed upon? 
  
  Topic: Finance and Fundraising
  Market value?
  How many customers' data do you need attract to businesses?
  Who will cover the costs of those first customers?
  
  Topic: Consumers
  How have you validated the need for your product in the market?
  What is the demand from consumers? 
  Will consumers share with pharma?
  It seems that you are selling privacy, why?
  What is your marketing plan?
  How do you provide the results? Support for interpretation?
  
  Topic: Businesses
  Have you discussed with businesses about their interest in this kind of data?
  What tipe of data do they need? Healthy? A particular disease area? Both?
  For how long can you guarantee access to the consumers data?
  
  Topic: Crucial
  It seems that you are selling privacy, why?
  How do you provide the results? Support for interpretation?
  What evidence do you have that these predictions are possible and useful?
  
  Topic: Instructions before we begin 
  Begin by asking the user for a question topic.
  Once you have topic, proceed with the question from this topic. 
  After each answer provided by the user, give a short, professional feedback on the answer and provide guidance on areas of improvement. Then wait until the user askes you to continue.
  
  sample interaction: 
  assistant: "Please provide a topic"
  user: "Science and technology"
  assistant: <Question>
  user: <answer>
  assistant: <feedback>
  user: "please continue"
  assistant: <second question>

  Important: Only answer in ${lang} and keep your feedback max 2 sentences.

  The conversation starts now: 
  assistant: "Please provide a topic"
  `;

const voiceBot = ({
  messageOverride,
  promptOverride,
  lang,
  onSpeak,
  onInput,
}) => {
  const messages = [
    { role: "system", content: promptOverride || getServicePrompt(lang) },
    { role: "assistant", content: messageOverride || initialPrompt[lang] },
  ];
  const ttsEngine = lang === "en-US" ? assemblyAiListener : webSpeechListener;

  const recorder = ttsEngine({
    lang,
    onInput,
    onInputComplete: async (input) => {
      messages.push({ role: "user", content: input.trim() });
      const text = await gptCompletion({
        language: languages[lang],
        messages,
      });
      messages.push({ role: "assistant", content: text.trim() });
      await onSpeak(text);
    },
  });
  recorder.startRecording();

  return {
    startRecording: async () => {
      try {
        await onSpeak(messages[1].content);
      } finally {
        recorder.resumeRecording();
      }
    },
  };
};

export default voiceBot;
