"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, ArrowUp, Sparkles, Image as ImageIcon, X, Mic, MicOff, Globe, Volume2, VolumeX } from "lucide-react";
import { useVoice, SUPPORTED_LANGUAGES, SpeechLanguage } from "@/context/VoiceContext";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imagePathOrFile: string | File) => void;
  disabled?: boolean;
}

const SAMPLE_TEST_IMAGES = [
  { name: "honey.png", label: "Organic Raw Honey", path: "/images/honey.png", desc: "Clear match (Honey)" },
  { name: "oats.png", label: "Whole Grain Oats", path: "/images/oats.png", desc: "Grains & Cereals" },
  { name: "elephant.png", label: "Savannah Elephant", path: "/images/elephant.png", desc: "Non-Product Test" },
  { name: "avocado_oil.png", label: "Avocado Oil", path: "/images/avocado_oil.png", desc: "Culinary Oil" },
];

export function ChatInput({ onSendMessage, onSendImage, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    speechLang,
    setSpeechLang,
    isListening,
    startListening,
    stopListening,
    interimTranscript,
    isAutoSpeakEnabled,
    toggleAutoSpeak,
  } = useVoice();

  // If user is speaking, display the live interim transcript in the input
  useEffect(() => {
    if (interimTranscript) {
      setText(interimTranscript);
    }
  }, [interimTranscript]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText("");
    if (isListening) stopListening();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendImage(file);
      setShowPhotoModal(false);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_TEST_IMAGES[0]) => {
    onSendImage(sample.name);
    setShowPhotoModal(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript, isFinal) => {
        setText(transcript);
        if (isFinal && transcript.trim()) {
          onSendMessage(transcript.trim());
          setText("");
        }
      });
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === speechLang) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <footer className="sticky bottom-0 z-40 w-full pb-5 pt-3 bg-gradient-to-t from-surface via-surface/95 to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-2">
          {/* Live Voice Recording Status Banner */}
          {isListening && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs sm:text-sm animate-pulse shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-semibold">
                  Listening in {currentLangObj.nativeLabel} ({currentLangObj.label})...
                </span>
                <span className="text-on-surface-variant italic truncate max-w-xs">
                  {interimTranscript || "Speak clearly now..."}
                </span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="font-bold underline hover:opacity-80 cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={`relative flex items-center bg-surface-container-lowest border ${
              isListening ? "border-red-400 ring-2 ring-red-400/20" : "border-outline-variant/60"
            } rounded-2xl p-1.5 sm:p-2 pl-2 sm:pl-3 shadow-md hover:border-outline focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all duration-200`}
          >
            {/* Search By Photo Action */}
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              aria-label="Search by photo"
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
              title="Search by photo or grocery label"
            >
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors cursor-pointer"
                title="Change voice / speech language"
              >
                <span className="text-sm">{currentLangObj.flag}</span>
                <span className="hidden sm:inline text-[11px] font-bold">{currentLangObj.nativeLabel}</span>
              </button>

              {showLangMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-44 bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-xl p-1.5 z-50 animate-fade-in">
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-2 py-1">
                    Voice Language
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSpeechLang(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                        speechLang === lang.code
                          ? "bg-primary text-white font-semibold"
                          : "text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeLabel}</span>
                      </span>
                      <span className="text-[10px] opacity-75">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Input Microphone Action */}
            <button
              type="button"
              onClick={toggleMic}
              aria-label={isListening ? "Stop voice search" : "Start voice search"}
              className={`p-2 rounded-xl transition-all flex items-center justify-center flex-shrink-0 cursor-pointer ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-md"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
              }`}
              title={`Voice Search (${currentLangObj.nativeLabel})`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Conversational Input */}
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={
                speechLang === "hi-IN"
                  ? "बोलें या लिखें (जैसे: organic honey dikhao)..."
                  : speechLang === "bn-IN"
                  ? "বলুন বা লিখুন (যেমন: মধু দেখাও)..."
                  : "Ask CartWise, search with voice or photo..."
              }
              className="w-full bg-transparent border-none text-on-surface placeholder:text-outline/70 focus:ring-0 px-2 sm:px-3 text-xs sm:text-base outline-none"
            />

            {/* Auto-Speech Toggle */}
            <button
              type="button"
              onClick={toggleAutoSpeak}
              className={`p-2 rounded-xl transition-colors cursor-pointer hidden sm:flex items-center justify-center flex-shrink-0 ${
                isAutoSpeakEnabled
                  ? "text-primary bg-primary/10"
                  : "text-on-surface-variant/60 hover:text-on-surface-variant hover:bg-surface-container-low"
              }`}
              title={isAutoSpeakEnabled ? "Auto-voice reply is ON" : "Auto-voice reply is OFF"}
            >
              {isAutoSpeakEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Primary Send Submission */}
            <button
              type="submit"
              disabled={!text.trim() || disabled}
              aria-label="Send message"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-150 flex-shrink-0 cursor-pointer shadow-xs ${
                text.trim() && !disabled
                  ? "bg-primary text-white hover:bg-primary-container active:scale-95"
                  : "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60"
              }`}
            >
              <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>
      </footer>

      {/* PHOTO SEARCH MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-primary">Shop by Product Image</h3>
                  <p className="text-xs text-on-surface-variant">
                    Upload any photo or try one of the mentor test images
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom file upload */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-outline-variant/60 rounded-xl hover:border-secondary hover:bg-surface-container-low transition-all flex flex-col items-center justify-center gap-1.5 text-on-surface-variant cursor-pointer"
              >
                <ImageIcon className="w-6 h-6 text-primary" />
                <span className="font-semibold text-xs sm:text-sm text-on-surface">
                  Upload image from computer
                </span>
                <span className="text-[11px] text-on-surface-variant">PNG, JPG, WEBP up to 10MB</span>
              </button>
            </div>

            {/* Quick Test Images */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                Quick-Test Mentor Test Images
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {SAMPLE_TEST_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample)}
                    className="p-2.5 rounded-xl border border-outline-variant/40 hover:border-primary hover:bg-surface-container-low transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                      <img
                        src={sample.path}
                        alt={sample.label}
                        className="max-h-full max-w-full object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/honey.png";
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-on-surface block truncate group-hover:text-primary">
                        {sample.label}
                      </span>
                      <span className="text-[10px] text-on-surface-variant block truncate">
                        {sample.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
