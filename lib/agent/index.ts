import { handleMockChat, handleMockImage } from "./mock";
import { handleRealChat, handleRealImage } from "./real";
import { AssistantMessage, ChatMessage } from "../types";

export async function handleChat(messages: ChatMessage[]): Promise<AssistantMessage> {
  const mode = (process.env.AGENT_MODE || "mock").toLowerCase();
  if (mode === "real") {
    try {
      return await handleRealChat(messages);
    } catch (err) {
      console.warn("Real agent failed, falling back to smart SQLite semantic engine:", err);
      return handleMockChat(messages);
    }
  }
  return handleMockChat(messages);
}

export async function handleImage(file: string | Buffer | File): Promise<AssistantMessage> {
  const mode = (process.env.AGENT_MODE || "mock").toLowerCase();
  if (mode === "real") {
    try {
      return await handleRealImage(file);
    } catch (err) {
      console.warn("Real vision agent failed, falling back to visual tag matcher:", err);
      return handleMockImage(file);
    }
  }
  return handleMockImage(file);
}
