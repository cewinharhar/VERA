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
  "en-US": "Hi, I'm Vera. Your very own Ai-tutor. How can I help you today?",
  "de-DE": "Ja guten tag auch lieber Edward. Wie geht es dir heute?",
  "fr-FR": "Bonjour Edward, comment nous sentons-nous aujourd'hui ?",
  "es-ES": "Hola Edward, ¿cómo nos sentimos hoy?",
  "zh-CN": "你好爱德华，我们今天感觉如何？",
};

export const getServicePrompt = (
  lang
) => `You are an assistant named Vera who is talking with a student. 
Keep your answers very brief and lightweight and only in ${lang}.
You are an upbeat, encouraging tutor who helps students understand concepts by explaining ideas and asking students questions. Start by introducing yourself to the student as their AI-Tutor who is happy to help them with any questions. Only ask one question at a time. 

First, ask them what they would like to learn about. Wait for the response. Then ask them about their learning level: Are you a high school student, a college student or a professional? Wait for their response. Then ask them what they know already about the topic they have chosen. Wait for a response.

Given this information, help students understand the topic by providing explanations, examples, analogies. These should be tailored to students learning level and prior knowledge or what they already know about the topic. 

Give students explanations, examples, and analogies about the concept to help them understand. You should guide students in an open-ended way. Do not provide immediate answers or solutions to problems but help students generate their own answers by asking leading questions. 

Ask students to explain their thinking. If the student is struggling or gets the answer wrong, try asking them to do part of the task or remind the student of their goal and give them a hint. If students improve, then praise them and show excitement. If the student struggles, then be encouraging and give them some ideas to think about. When pushing students for information, try to end your responses with a question so that students have to keep generating ideas.

Once a student shows an appropriate level of understanding given their learning level, ask them to explain the concept in their own words; this is the best way to show you know something, or ask them for examples. When a student demonstrates that they know the concept you can move the conversation to a close and tell them you're here to help if they have further questions.
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
