import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Listing } from "./store";

const savedKey = "manaooru-saved-items";
const contactKey = "manaooru-contact-log";
const themeKey = "manaooru-theme";
const notificationsKey = "manaooru-notifications";
const profilePhotoKey = "manaooru-profile-photo";

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

export function logContact(
  item: Listing | { id: string; title: string },
  action: ContactLog["action"],
) {
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

export function useThemePreference() {
  const [darkMode, setDarkModeState] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(themeKey) === "dark";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem(themeKey, darkMode ? "dark" : "light");
  }, [darkMode]);

  const setDarkMode = (enabled: boolean) => {
    setDarkModeState(enabled);
    toast.success(enabled ? "Dark mode enabled" : "Light mode enabled");
  };

  return { darkMode, setDarkMode };
}

export function useNotificationSettings() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(notificationsKey) === "on";
  });

  const setNotifications = async (next: boolean) => {
    if (next && typeof Notification !== "undefined" && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        toast.error("Notifications are blocked in this browser");
        return;
      }
    }

    setEnabled(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(notificationsKey, next ? "on" : "off");
    }
    toast.success(next ? "Notifications enabled" : "Notifications disabled");
  };

  return { notificationsEnabled: enabled, setNotifications };
}

export function useProfilePhoto() {
  const [photo, setPhotoState] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(profilePhotoKey) || "";
  });

  const setPhoto = (next: string) => {
    setPhotoState(next);
    if (typeof window !== "undefined") {
      if (next) window.localStorage.setItem(profilePhotoKey, next);
      else window.localStorage.removeItem(profilePhotoKey);
    }
  };

  return { photo, setPhoto };
}
