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
  { name: "honey.png", label: "Organic Raw Honey", path: "/images/honey.png", desc: "Clear match (Honey)" },
  { name: "oats.png", label: "Whole Grain Oats", path: "/images/oats.png", desc: "Grains & Cereals" },
  { name: "elephant.png", label: "Savannah Elephant", path: "/images/elephant.png", desc: "Non-Product Test" },
  { name: "avocado_oil.png", label: "Avocado Oil", path: "/images/avocado_oil.png", desc: "Culinary Oil" },
];

const QUICK_CHIPS = [
  { label: "⚖️ Compare Honey vs Sugar", query: "Compare honey and cane sugar" },
  { label: "🏷️ Apply voucher", query: "Apply promo voucher SAVE10" },
  { label: "📦 Track package", query: "Track order #1040" },
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
      <div className="w-full pt-2 pb-3 px-3 bg-[#0d121f] border-t border-white/5 space-y-2">
        {/* Quick Suggestion Chips (Screenshot match) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => (onSelectSuggestion ? onSelectSuggestion(chip.query) : onSendMessage(chip.query))}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-300 bg-[#161d2d] hover:bg-[#1f283d] hover:text-white border border-white/5 whitespace-nowrap transition-colors cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Live Listening Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
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
          className="relative flex items-center bg-[#151c2d] border border-white/10 rounded-full py-1.5 pl-3 pr-1.5 hover:border-white/20 focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all shadow-inner"
        >
          {/* Snap Search Camera */}
          <button
            type="button"
            onClick={() => setShowPhotoModal(true)}
            aria-label="Snap Search"
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-full transition-colors flex-shrink-0 cursor-pointer"
            title="Snap Search (Image Upload)"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Voice Input */}
          <button
            type="button"
            onClick={toggleMic}
            aria-label={isListening ? "Stop Voice" : "Start Voice"}
            className={`p-1.5 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
              isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:text-cyan-300 hover:bg-white/5"
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
            placeholder="Ask Aura to find, track or buy any..."
            className="w-full bg-transparent border-none text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none px-2"
          />

          {/* Send Button (Purple Gradient Arrow) */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            aria-label="Send message"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-md ${
              text.trim() && !disabled
                ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white hover:opacity-90 active:scale-95"
                : "bg-[#1f283d] text-slate-500 opacity-50 cursor-not-allowed"
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Snap Search Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1422] border border-white/10 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Camera className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">Snap Search (Vision AI)</h3>
                  <p className="text-xs text-slate-400">Upload any grocery photo or use mentor test images</p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
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
                className="w-full py-4 border-2 border-dashed border-white/15 rounded-2xl hover:border-cyan-400/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-400 cursor-pointer"
              >
                <ImageIcon className="w-6 h-6 text-indigo-400" />
                <span className="font-semibold text-xs sm:text-sm text-white">Upload image from device</span>
                <span className="text-[10px] text-slate-500">PNG, JPG, WEBP up to 10MB</span>
              </button>
            </div>

            {/* Quick Test Images */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Quick-Test Mentor Test Images
              </span>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_TEST_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample)}
                    className="p-2.5 rounded-xl bg-[#141b2a] border border-white/5 hover:border-cyan-400/40 hover:bg-[#192236] transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#090d16] flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
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
                      <span className="font-bold text-xs text-white block truncate group-hover:text-cyan-300">
                        {sample.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">{sample.desc}</span>
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
