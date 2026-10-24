import type { Locale } from "../config";
import { en, type Dictionary } from "./en";
import { bn } from "./bn";

const dictionaries: Record<Locale, Dictionary> = { en, bn };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
