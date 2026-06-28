import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Listing } from "./store";

const savedKey = "manaooru-saved-items";
const contactKey = "manaooru-contact-log";

type ContactLog = {
  id: string;
  title: string;
  action: "call" | "whatsapp" | "chat" | "map";
  at: number;
};

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(`${key}:change`));
}

export function useSavedItems() {
  const [saved, setSaved] = useState<string[]>(() => readArray<string>(savedKey));

  useEffect(() => {
    const sync = () => setSaved(readArray<string>(savedKey));
    window.addEventListener(`${savedKey}:change`, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(`${savedKey}:change`, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleSaved = (item: Listing | { id: string; title: string }) => {
    const exists = saved.includes(item.id);
    const next = exists ? saved.filter((id) => id !== item.id) : [item.id, ...saved];
    setSaved(next);
    writeArray(savedKey, next);
    toast.success(exists ? "Removed from saved items" : `${item.title} saved`);
  };

  return { saved, isSaved: (id: string) => saved.includes(id), toggleSaved };
}

export function logContact(item: Listing | { id: string; title: string }, action: ContactLog["action"]) {
  const next = [
    { id: item.id, title: item.title, action, at: Date.now() },
    ...readArray<ContactLog>(contactKey),
  ].slice(0, 50);
  writeArray(contactKey, next);
}

export function useContactLog() {
  const [items, setItems] = useState<ContactLog[]>(() => readArray<ContactLog>(contactKey));

  useEffect(() => {
    const sync = () => setItems(readArray<ContactLog>(contactKey));
    window.addEventListener(`${contactKey}:change`, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(`${contactKey}:change`, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return items;
}
