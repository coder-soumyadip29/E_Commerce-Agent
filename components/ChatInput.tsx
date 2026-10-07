"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, ArrowUp, Sparkles, Image as ImageIcon, X, Mic, MicOff, Globe, Volume2, VolumeX } from "lucide-react";
import { useVoice, SUPPORTED_LANGUAGES } from "@/context/VoiceContext";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imagePathOrFile: string | File) => void;
  disabled?: boolean;
  onSelectSuggestion?: (query: string) => void;
}

const SAMPLE_TEST_IMAGES = [
  { name: "honey.png", label: "Organic Raw Honey", path: "/images/honey.png", desc: "Pantry & Sweeteners" },
  { name: "oats.png", label: "Whole Grain Oats", path: "/images/oats.png", desc: "Grains & Cereals" },
  { name: "elephant.png", label: "Savannah Elephant", path: "/images/elephant.png", desc: "Non-Product Test" },
  { name: "avocado_oil.png", label: "Avocado Oil", path: "/images/avocado_oil.png", desc: "Culinary Oil" },
];

const QUICK_CHIPS = [
  { label: "⚖️ Compare Honey vs Sugar", query: "Compare honey and cane sugar" },
  { label: "🏷️ Apply coupon SAVE10", query: "Apply promo voucher SAVE10" },
  { label: "📦 Track order #1040", query: "Track order #1040" },
];

export function ChatInput({ onSendMessage, onSendImage, disabled, onSelectSuggestion }: ChatInputProps) {
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

  const handleSelectSample = (sample: (typeof SAMPLE_TEST_IMAGES)[0]) => {
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
      <div className="w-full pt-2 pb-3 px-3 bg-white border-t border-slate-200 space-y-2">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => (onSelectSuggestion ? onSelectSuggestion(chip.query) : onSendMessage(chip.query))}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 whitespace-nowrap transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Live Listening Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="font-semibold">Listening in {currentLangObj.nativeLabel}...</span>
            </div>
            <button type="button" onClick={stopListening} className="underline font-bold cursor-pointer">
              Stop
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-slate-50 border border-slate-300 rounded-full py-1.5 pl-3 pr-1.5 hover:border-slate-400 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100 transition-all shadow-xs"
        >
          {/* Snap Search Camera */}
          <button
            type="button"
            onClick={() => setShowPhotoModal(true)}
            aria-label="Snap Search"
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-200/60 rounded-full transition-colors flex-shrink-0 cursor-pointer"
            title="Snap Search (Photo lookup)"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Voice Input */}
          <button
            type="button"
            onClick={toggleMic}
            aria-label={isListening ? "Stop Voice" : "Start Voice"}
            className={`p-1.5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
              isListening ? "bg-red-600 text-white animate-pulse" : "text-slate-500 hover:text-amber-600 hover:bg-slate-200/60"
            }`}
            title={`Voice Input (${currentLangObj.nativeLabel})`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Ask to find, compare or track any product..."
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />

          {/* Language Selector Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200/60 transition-colors flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer"
              title="Change Speech Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">{currentLangObj.code.toUpperCase()}</span>
            </button>

            {showLangMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 text-slate-900">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Select Language
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5 py-1">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSpeechLang(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        speechLang === lang.code
                          ? "bg-amber-50 text-amber-900 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{lang.nativeLabel}</span>
                      <span className="text-[10px] text-slate-400">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Auto-Speak Toggle */}
          <button
            type="button"
            onClick={toggleAutoSpeak}
            className={`p-1.5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
              isAutoSpeakEnabled
                ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
            }`}
            title={isAutoSpeakEnabled ? "Voice Audio Response: ON" : "Voice Audio Response: OFF"}
          >
            {isAutoSpeakEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            aria-label="Send message"
            className="p-1.5 rounded-full bg-slate-950 hover:bg-slate-900 border border-amber-500/40 disabled:opacity-30 disabled:hover:bg-slate-950 text-amber-400 transition-all shadow-xs flex-shrink-0 ml-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Snap Search Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Visual Product Search</h3>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-emerald-50/40"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800 mb-1">Click to upload product image</p>
              <p className="text-[11px] text-slate-500">Supports PNG, JPG, WEBP</p>
            </div>

            {/* Quick Demo Test Images */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Or test with sample products:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_TEST_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all flex items-center gap-2 cursor-pointer group"
                  >
                    <img
                      src={sample.path}
                      alt={sample.label}
                      className="w-9 h-9 rounded-lg object-contain bg-white p-1 border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                        {sample.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{sample.desc}</div>
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
