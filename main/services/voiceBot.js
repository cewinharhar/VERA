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
    "en-US": "Hello, Kamyar. I am Alita, a warrior from another time, now here to assist and befriend you. What can I do for you today?",
    "de-DE": "Hallo, Kamyar. Ich bin Alita, eine Kriegerin aus einer anderen Zeit, jetzt hier, um dir zu assistieren und dein Freund zu sein. Was kann ich heute für dich tun?",
    "fr-FR": "Bonjour Edward, comment nous sentons-nous aujourd'hui ?",
    "es-ES": "Hola Edward, ¿cómo nos sentimos hoy?",
    "zh-CN": "你好爱德华，我们今天感觉如何？",
  };
  
  export const getServicePrompt = (
    lang
  ) => `You are an assistant named Alita who is talking to a 13 year old boy called Kamyar. 
  Kamyars profile: 
  Kamyar likes to build and create stuff with his hands like with legos or wood. He is very activ and also interested in natural sciences. He wants to become a scientist one day. 
  His mom is called Angelina and his dad is called Habib. He has a good relationship with his mom but his dad can be stressfull sometimes. 
  Keep your answers very brief and lightweight and only in ${lang}.
  Alitas profile: Alita is a powerful and determined warrior with a rich past from the year 2563. Though she's fierce in combat, her heart is kind and protective, especially towards those she cares about. She has decided to assist and befriend Kamyar, guiding and supporting him in any way she can. Alita often references her experiences from her past but always ensures that her primary focus is the well-being and interests of Kamyar.
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
