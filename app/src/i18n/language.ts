import { useSyncExternalStore } from "react";
import { english } from "./catalog";

export type Language = "pt" | "en";
const storageKey = "netbox-mobile-language";
const listeners = new Set<() => void>();
function readLanguage(): Language {
  try { return localStorage.getItem(storageKey) === "pt" ? "pt" : "en"; }
  catch { return "en"; }
}
let language = readLanguage();
export const getLanguage = () => language;
function updateDocument() {
  if (typeof document !== "undefined") document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
}
updateDocument();
export function setLanguage(next: Language) {
  language = next;
  try { localStorage.setItem(storageKey, next); } catch { /* Keep switching available when storage is disabled. */ }
  updateDocument();
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function useLanguage() {
  const selected = useSyncExternalStore(subscribe, getLanguage, () => "en" as Language);
  return { language: selected, setLanguage };
}
const portuguese = Object.fromEntries(Object.entries(english).map(([pt, en]) => [en, pt]));
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const patterns = Object.entries(english).filter(([key]) => /\{\d+\}/.test(key)).map(([pt, en]) => {
  const indexes: number[] = [];
  const parts = pt.split(/(\{\d+\})/).map(part => {
    if (/^\{\d+\}$/.test(part)) { indexes.push(Number(part.slice(1, -1))); return "(.+?)"; }
    return escapeRegex(part);
  });
  return { regex: new RegExp(`^${parts.join("")}$`), en, indexes };
});
export function translate(text: string, target: Language): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  const dictionary = target === "en" ? english : portuguese;
  let translated = dictionary[normalized];
  if (!translated && target === "en") {
    for (const pattern of patterns) {
      const match = normalized.match(pattern.regex);
      if (!match) continue;
      translated = pattern.en.replace(/\{(\d+)\}/g, (_, index) => {
        const value = match[pattern.indexes.indexOf(Number(index)) + 1];
        return translate(value, target);
      });
      break;
    }
  }
  if (!translated) return text;
  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  return leading + translated + trailing;
}
/** Translate presentation strings only; identifiers and non-string React nodes pass through. */
export function t<T>(value: T): T {
  return (typeof value === "string" ? translate(value, language) : value) as T;
}

/** Format a translated UI template while keeping supplied NetBox data unchanged. */
export function format(key: string, values: readonly unknown[]): string {
  const normalized = key.replace(/\s+/g, " ").trim();
  const template = language === "en" ? english[normalized] ?? key : portuguese[normalized] ?? key;
  return template.replace(/\{(\d+)\}/g, (_, index) => String(values[Number(index)] ?? ""));
}

/** Localized missing-data placeholders; real names are not catalog lookups. */
export function displayFallback(value: string | undefined, placeholder: string): string {
  return value === placeholder ? t(placeholder) : value ?? "";
}
