"use client";

import React, { useState } from "react";
import { Leaf, Volume2, VolumeX, Square } from "lucide-react";
import { useVoice } from "@/context/VoiceContext";

interface TextMessageProps {
  text: string;
}

export function TextMessage({ text }: TextMessageProps) {
  const { speak, stopSpeaking, isSpeaking } = useVoice();
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
    <div className="flex items-start gap-3 max-w-3xl">
      <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
        <Leaf className="w-4 h-4" />
      </div>
      <div className="group relative bg-surface-container-lowest border border-outline-variant/40 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs text-on-surface">
        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{text}</p>
        
        {/* Speak / Listen Action */}
        <div className="mt-2.5 pt-2 border-t border-outline-variant/20 flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggleSpeak}
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-surface-container-low"
            title="Read aloud in selected language"
          >
            {isPlayingThis ? (
              <>
                <Square className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" />
                <span className="text-red-500 font-semibold text-[11px]">Stop audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Listen (Audio)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
