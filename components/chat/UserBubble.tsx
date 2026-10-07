"use client";

import React, { useState, useEffect } from "react";
import { UserChatMessage } from "@/lib/types";

interface UserBubbleProps {
  message: UserChatMessage;
}

export function UserBubble({ message }: UserBubbleProps) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    setTimeStr(
      new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [message.timestamp]);

  return (
    <div className="flex flex-col items-end w-full animate-fade-in space-y-1">
      <div className="flex items-center gap-2 text-[10px] text-slate-400 pr-1">
        <span className="font-semibold text-slate-500">You</span>
        <span suppressHydrationWarning>{timeStr}</span>
      </div>
      <div className="max-w-xl bg-slate-900 text-white rounded-2xl rounded-tr-xs p-3 sm:p-3.5 shadow-xs">
        {message.image && (
          <div className="mb-2 max-w-[200px] rounded-lg overflow-hidden border border-white/20 bg-slate-800">
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
