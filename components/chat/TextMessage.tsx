"use client";

import React, { useState } from "react";
import { Bot, Volume2, Square, Sparkles } from "lucide-react";
import { useVoice } from "@/context/VoiceContext";

interface TextMessageProps {
  text: string;
}

export function TextMessage({ text }: TextMessageProps) {
  const { speak, stopSpeaking } = useVoice();
  const [isPlayingThis, setIsPlayingThis] = useState(false);

  const handleToggleSpeak = () => {
    if (isPlayingThis) {
      stopSpeaking();
      setIsPlayingThis(false);
    } else {
      speak(text);
      setIsPlayingThis(true);
      setTimeout(() => setIsPlayingThis(false), 5000);
    }
  };

  return (
    <div className="flex items-start gap-2.5 max-w-2xl animate-fade-in">
      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="group relative bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-xs text-slate-800 flex-1">
        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-800">{text}</p>

        {/* Speak / Listen Action */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={handleToggleSpeak}
            className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors cursor-pointer"
            title="Read aloud"
          >
            {isPlayingThis ? (
              <>
                <Square className="w-3 h-3 text-red-500 fill-current animate-pulse" />
                <span className="text-red-600 font-semibold text-[11px]">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-medium">Listen</span>
              </>
            )}
          </button>
          <span className="text-[10px] text-slate-400 font-medium">CartWise Assistant</span>
        </div>
      </div>
    </div>
  );
}
