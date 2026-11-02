import { storage } from './storage';

const KEY = 'sent_messages_log';
const MAX = 5;

export interface SentMessage {
  id: string;
  text: string;
  ts: number;
}

export async function appendSentMessage(text: string): Promise<void> {
  const existing = await getSentMessages();
  const updated: SentMessage[] = [
    { id: String(Date.now()), text, ts: Date.now() },
    ...existing,
  ].slice(0, MAX);
  await storage.setItem(KEY, JSON.stringify(updated));
}

export async function getSentMessages(): Promise<SentMessage[]> {
  try {
    const raw = await storage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SentMessage[];
  } catch {
    return [];
  }
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
