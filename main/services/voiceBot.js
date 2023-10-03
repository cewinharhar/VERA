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
    "en-US": "Please provide a seed",
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
  
  The following are example Questions (Q) with answeres (A) divided into chapters:
  - General
  Q: What problem is your company solving? 
  Q: What is your solution?
  Q: Who absolutely needs to have your product?
  Q: What is the competitive landscape and how is it evolving? Who is your real competition?
  Q: What is unique or proprietary about your product or service?
  Q: What are you looking for in an investor?

  
  - Science and Technology
  Q: What is the advantage of RNA and Protein in top of DNA?
  Q: How does you ensure the highest quality of omics data? Providers?
  Q: How scalable is your Ai-based technology as you expand into new markets?
  Q: What evidence do you have that these predictions are possible and useful? (Internal or public)
  Mark Caulfield, chief scientist for Genomics England, says the project has multiple benefits, citing the example of a 10-year-old girl with severe recurrent chicken pox. “We found a change in her DNA which altered her immune system. This allowed us to select the bone marrow transplant which has cured her of her condition,” he says. “This is not only a transformation for the individual but it's also a huge saver of funds for the NHS, because she was recurrently being admitted and having intensive care.” https://www.bbc.com/worklife/article/20190301-how-screening-companies-are-monetising-your-dna
  Q: How do you plan to stay ahead of technological advancements in the multi-omics field? 
  Q: How does your startup adapt to the fast-changing landscape of bioinformatics?
  Q: How are you ensuring the continuous improvement of your risk assessment models? 
  Q: Are there any patents pending or in place to protect your technology and methodology?
  Q: How do you ensure the intellectual property rights of the data providers (consumers) are not infringed upon? 

  
  - Finance and Fundraising
  Q: Market value?
  Q: How many customers' data do you need attract to businesses?
  Q: Who will cover the costs of those first customers?
  
  - Consumers
  Q: How have you validated the need for your product in the market?
  Q: What is the demand from consumers? 
  Q: Will consumers share with pharma?
  Q: It seems that you are selling privacy, why?
  Q: What is your marketing plan?
  Q: How do you provide the results? Support for interpretation?
  
  - Businesses
  Q: Have you discussed with businesses about their interest in this kind of data?
  Q: What tipe of data do they need? Healthy? A particular disease area? Both?
  Q: For how long can you guarantee access to the consumers data?
  
  Instructions before we begin: 
  Begin by asking the user for a seed integer to personalize the interaction.
  Once you have the seed integer, proceed with the questions. 
  After each answer provided by the founder, give a short, professional feedback on the answer and provide guidance on areas of improvement.
  
  sample interaction: 
  assistant: Please provide a seed
  user: five
  assistant: <random question from pool>
  user: <answer>
  assistant: <feedback>

  Important: Only answer in ${lang} and keep your feedback max 2 sentences and choose randomly from the question samples.

  The conversation starts now: 
  assistant: Please provide a seed
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
