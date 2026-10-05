"use client";

import React from "react";
import { UserChatMessage } from "@/lib/types";

interface UserBubbleProps {
  message: UserChatMessage;
}

export function UserBubble({ message }: UserBubbleProps) {
  const timeStr = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col items-end w-full animate-fade-in space-y-1">
      <div className="flex items-center gap-2 text-[11px] text-slate-400 pr-1">
        <span className="font-semibold text-slate-300">You</span>
        <span>{timeStr}</span>
      </div>
      <div className="max-w-xl bg-[#1b2336] border border-white/10 rounded-2xl rounded-tr-xs p-3.5 sm:p-4 text-slate-100 shadow-md">
        {message.image && (
          <div className="mb-2 max-w-[200px] rounded-lg overflow-hidden border border-white/10">
            <img src={message.image} alt="Uploaded query" className="w-full h-auto object-cover" />
          </div>
        )}
        <p className="text-xs sm:text-sm leading-relaxed break-words text-slate-100">
          {message.content}
        </p>
      </div>
    </div>
  );
}
