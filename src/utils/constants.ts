import type {
  Length,
  LanguageCode,
  Platform,
  ProviderId,
  TemplateId,
  Tone,
} from "../types";

interface PlatformMeta {
  id: Platform;
  label: string;
  /** Practical character budget used by the character meter. */
  charLimit: number;
  /** Sweet spot the prompt asks the model to aim for. */
  sweetSpot: string;
  hashtagAdvice: string;
}

export const PLATFORMS: PlatformMeta[] = [
  {
    id: "facebook",
    label: "Facebook",
    charLimit: 2000,
    sweetSpot: "40–120 de cuvinte, primul rând trebuie să oprească scroll-ul",
    hashtagAdvice: "maximum 3 hashtag-uri, plasate la final",
  },
  {
    id: "instagram",
    label: "Instagram",
    charLimit: 2200,
    sweetSpot: "50–120 de cuvinte, cu un hook puternic în primele 125 de caractere",
    hashtagAdvice: "8–12 hashtag-uri, mix de nișă și generale",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    charLimit: 3000,
    sweetSpot: "80–200 de cuvinte, structurat pe paragrafe scurte",
    hashtagAdvice: "3–5 hashtag-uri profesionale",
  },
  {
    id: "x",
    label: "X (Twitter)",
    charLimit: 280,
    sweetSpot: "sub 280 de caractere, o singură idee, formulare tăioasă",
    hashtagAdvice: "maximum 2 hashtag-uri",
  },
  {
    id: "tiktok",
    label: "TikTok",
    charLimit: 2200,
    sweetSpot: "15–40 de cuvinte, ton de caption vorbit, ritm rapid",
    hashtagAdvice: "4–6 hashtag-uri orientate pe trend",
  },
];

export const PLATFORM_MAP: Record<Platform, PlatformMeta> = PLATFORMS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<Platform, PlatformMeta>,
);

export const TONES: { id: Tone; label: string; guidance: string }[] = [
  { id: "profesional", label: "Profesional", guidance: "sobru, credibil, fără exagerări" },
  { id: "prietenos", label: "Prietenos", guidance: "cald, apropiat, adresare directă" },
  { id: "amuzant", label: "Amuzant", guidance: "ludic, cu umor subtil, fără glume forțate" },
  { id: "inspirant", label: "Inspirant", guidance: "motivant, orientat pe transformare" },
  { id: "comercial", label: "Comercial", guidance: "orientat pe beneficiu și urgență, fără clickbait" },
  { id: "informativ", label: "Informativ", guidance: "clar, factual, educativ" },
];

export const LENGTHS: { id: Length; label: string; guidance: string }[] = [
  { id: "scurta", label: "Scurtă", guidance: "1–2 propoziții, maximum 40 de cuvinte" },
  { id: "medie", label: "Medie", guidance: "3–5 propoziții, 60–110 cuvinte" },
  { id: "lunga", label: "Lungă", guidance: "2–3 paragrafe scurte, 130–200 de cuvinte" },
];

export const LANGUAGES: { id: LanguageCode; label: string; name: string }[] = [
  { id: "ro", label: "Română", name: "română" },
  { id: "en", label: "English", name: "engleză" },
  { id: "de", label: "Deutsch", name: "germană" },
  { id: "fr", label: "Français", name: "franceză" },
  { id: "es", label: "Español", name: "spaniolă" },
  { id: "it", label: "Italiano", name: "italiană" },
];

export const TEMPLATES: { id: TemplateId; label: string; brief: string }[] = [
  { id: "liber", label: "Fără șablon", brief: "" },
  {
    id: "promotie",
    label: "Promoție",
    brief:
      "Construiește postarea în jurul unei reduceri sau al unui avantaj de preț. Menționează valoarea oferită și limitarea în timp, fără a inventa procente sau termene care nu au fost furnizate.",
  },
  {
    id: "lansare",
    label: "Lansare produs",
    brief:
      "Anunță ceva nou. Deschide cu noutatea în sine, explică ce problemă rezolvă și ce se schimbă pentru cititor.",
  },
  {
    id: "testimonial",
    label: "Testimonial",
    brief:
      "Scrie din perspectiva unui client mulțumit sau reformulează experiența acestuia. Nu inventa nume, cifre sau citate atribuite unor persoane reale — folosește formulări generice de tipul „un client”.",
  },
  {
    id: "oferta",
    label: "Ofertă / pachet",
    brief:
      "Prezintă un pachet sau o combinație de produse. Accentuează ce include și pentru cine este potrivit.",
  },
  {
    id: "eveniment",
    label: "Eveniment",
    brief:
      "Invită publicul la un eveniment. Fă clar ce se întâmplă și de ce merită prezența, fără a inventa dată, oră sau locație.",
  },
  {
    id: "sfaturi",
    label: "Sfaturi / educativ",
    brief:
      "Oferă 2–4 sfaturi practice legate de tema dată. Fiecare sfat trebuie să fie aplicabil imediat.",
  },
  {
    id: "behind_the_scenes",
    label: "Behind the scenes",
    brief:
      "Arată procesul din spatele produsului sau al echipei. Ton documentar, apropiat, fără promovare agresivă.",
  },
];

export interface ModelMeta {
  id: string;
  label: string;
  /** USD per 1M tokens. Editabil într-un singur loc — vezi README. */
  inputPricePerMTok: number;
  outputPricePerMTok: number;
}

export const MODELS: Record<ProviderId, ModelMeta[]> = {
  anthropic: [
    { id: "claude-sonnet-5", label: "Claude Sonnet 5", inputPricePerMTok: 3, outputPricePerMTok: 15 },
    { id: "claude-opus-5", label: "Claude Opus 5", inputPricePerMTok: 15, outputPricePerMTok: 75 },
    {
      id: "claude-haiku-4-5-20251001",
      label: "Claude Haiku 4.5",
      inputPricePerMTok: 1,
      outputPricePerMTok: 5,
    },
  ],
  openai: [
    { id: "gpt-4o-mini", label: "GPT-4o mini", inputPricePerMTok: 0.15, outputPricePerMTok: 0.6 },
    { id: "gpt-4o", label: "GPT-4o", inputPricePerMTok: 2.5, outputPricePerMTok: 10 },
    { id: "gpt-4.1-mini", label: "GPT-4.1 mini", inputPricePerMTok: 0.4, outputPricePerMTok: 1.6 },
  ],
};

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  anthropic: "Claude (Anthropic)",
  openai: "GPT (OpenAI)",
};

export const REQUEST_TIMEOUT_MS = 60_000;
export const MAX_HISTORY_ENTRIES = 20;
export const STORAGE_KEYS = {
  settings: "smpg.settings",
  history: "smpg.history",
  theme: "smpg.theme",
  lastForm: "smpg.lastForm",
} as const;
