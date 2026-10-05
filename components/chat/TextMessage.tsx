"use client";

import React, { useState } from "react";
import { Sparkles, Bot, Volume2, Square } from "lucide-react";
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
    <div className="flex items-start gap-2.5 max-w-3xl animate-fade-in">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Bot className="w-4 h-4 text-cyan-300" />
      </div>
      <div className="group relative bg-[#131929] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-sm text-slate-100 flex-1">
        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">{text}</p>

        {/* Speak / Listen Action */}
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={handleToggleSpeak}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Read aloud"
          >
            {isPlayingThis ? (
              <>
                <Square className="w-3 h-3 text-red-400 fill-current animate-pulse" />
                <span className="text-red-400 font-semibold text-[10px]">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3" />
                <span className="text-[10px]">Listen</span>
              </>
            )}
          </button>
          <span className="text-[10px] text-slate-500 font-mono">Copilot AI</span>
        </div>
      </div>
    </div>
  );
}
