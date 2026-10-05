"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export type SpeechLanguage = "en-IN" | "hi-IN" | "bn-IN";

export interface LanguageOption {
  code: SpeechLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en-IN", label: "English", nativeLabel: "English", flag: "🇬🇧" },
  { code: "hi-IN", label: "Hindi", nativeLabel: "हिन्दी", flag: "🇮🇳" },
  { code: "bn-IN", label: "Bengali", nativeLabel: "বাংলা", flag: "🇮🇳" },
];

interface VoiceContextType {
  speechLang: SpeechLanguage;
  setSpeechLang: (lang: SpeechLanguage) => void;
  isAutoSpeakEnabled: boolean;
  setIsAutoSpeakEnabled: (enabled: boolean) => void;
  toggleAutoSpeak: () => void;
  isListening: boolean;
  startListening: (onResult: (text: string, isFinal: boolean) => void) => void;
  stopListening: () => void;
  interimTranscript: string;
  isSpeaking: boolean;
  speak: (text: string, overrideLang?: string) => void;
  stopSpeaking: () => void;
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italic
    .replace(/#{1,6}\s?/g, "") // headers
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // markdown links
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, "") // code blocks
    .replace(/★|⭐|\$|•|-/g, " ") // special rating symbols and bullets
    .replace(/\s+/g, " ")
    .trim();

}

function detectTextLanguage(text: string, defaultLang: SpeechLanguage): string {
  // Check for Bengali Unicode range (0980–09FF)
  if (/[\u0980-\u09FF]/.test(text)) {
    return "bn-IN";
  }
  // Check for Devanagari/Hindi Unicode range (0900–097F)
  if (/[\u0900-\u097F]/.test(text)) {
    return "hi-IN";
  }
  return defaultLang;
}

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [speechLang, setSpeechLang] = useState<SpeechLanguage>("en-IN");
  const [isAutoSpeakEnabled, setIsAutoSpeakEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeCallbackRef = useRef<((text: string, isFinal: boolean) => void) | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  const hasSpeechRecognition =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const hasSpeechSynthesis = typeof window !== "undefined" && "speechSynthesis" in window;

  const toggleAutoSpeak = useCallback(() => {
    setIsAutoSpeakEnabled((prev) => !prev);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, overrideLang?: string) => {
      if (!synthRef.current || !text) return;

      stopSpeaking();

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) return;

      const targetLang = overrideLang || detectTextLanguage(cleaned, speechLang);
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = targetLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Find the best matching voice for the target language
      const langPrefix = targetLang.split("-")[0].toLowerCase();
      const matchedVoice =
        availableVoices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
        availableVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ||
        availableVoices.find((v) => v.default);

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    [availableVoices, speechLang, stopSpeaking]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore stop errors if already stopped
      }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(
    (onResult: (text: string, isFinal: boolean) => void) => {
      if (!hasSpeechRecognition) {
        alert("Speech Recognition is not supported on this browser. Please try Chrome, Edge, or Safari.");
        return;
      }

      stopSpeaking();
      stopListening();

      activeCallbackRef.current = onResult;

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript("");
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
          if (activeCallbackRef.current) {
            activeCallbackRef.current(currentInterim, false);
          }
        }

        if (finalTranscript) {
          setInterimTranscript("");
          if (activeCallbackRef.current) {
            activeCallbackRef.current(finalTranscript, true);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        setInterimTranscript("");
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start speech recognition", e);
        setIsListening(false);
      }
    },
    [hasSpeechRecognition, speechLang, stopListening, stopSpeaking]
  );

  return (
    <VoiceContext.Provider
      value={{
        speechLang,
        setSpeechLang,
        isAutoSpeakEnabled,
        setIsAutoSpeakEnabled,
        toggleAutoSpeak,
        isListening,
        startListening,
        stopListening,
        interimTranscript,
        isSpeaking,
        speak,
        stopSpeaking,
        hasSpeechRecognition,
        hasSpeechSynthesis,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
}
