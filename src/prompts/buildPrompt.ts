import type { PostFormData } from "../types";
import { LANGUAGES, LENGTHS, PLATFORM_MAP, TEMPLATES, TONES } from "../utils/constants";

export interface BuiltPrompt {
  system: string;
  user: string;
}

const OUTPUT_CONTRACT = `Răspunzi EXCLUSIV cu un array JSON valid, fără text introductiv, fără explicații și fără blocuri de cod markdown.
Structura exactă:
[
  { "text": "textul postării", "hashtags": ["#exemplu", "#altul"] }
]
Câmpul "hashtags" este întotdeauna prezent; dacă hashtag-urile nu sunt cerute, îl lași ca array gol.
În câmpul "text" nu incluzi hashtag-uri și nu incluzi eticheta variantei.`;

export const SYSTEM_PROMPT = `Ești un copywriter senior specializat în social media, cu experiență în campanii pentru branduri din România.

Reguli pe care le respecți fără excepție:
1. Nu inventezi NICIODATĂ informații despre produs: prețuri, procente, date, locații, cifre, premii, certificări sau caracteristici care nu apar în brief. Dacă un detaliu lipsește, scrii în jurul lui.
2. Fiecare variantă generată folosește un unghi de abordare diferit (de exemplu: întrebare directă, poveste scurtă, beneficiu concret, comparație înainte/după, obiecție rezolvată, statement îndrăzneț). Nu repeți ideea centrală, structura sau formularea de deschidere între variante.
3. Scrii într-o limbă naturală și fluentă, ca un om, nu ca un model. Eviți clișeele de agenție: „în era digitală", „soluția perfectă pentru tine", „nu rata ocazia", „descoperă acum".
4. Adaptezi lungimea, ritmul și formatarea la platforma indicată.
5. Respecți tonul cerut pe toată lungimea postării.
6. Te adresezi direct publicului țintă indicat, cu vocabularul lui.
7. Integrezi call-to-action-ul cerut natural în text, nu ca pe o etichetă lipită la final.
8. Când limba de scriere este româna, folosești diacritice corecte (ă, â, î, ș, ț).

${OUTPUT_CONTRACT}`;

function describeBrief(form: PostFormData): string {
  const platform = PLATFORM_MAP[form.platform];
  const tone = TONES.find((t) => t.id === form.tone);
  const length = LENGTHS.find((l) => l.id === form.length);
  const language = LANGUAGES.find((l) => l.id === form.language);
  const template = TEMPLATES.find((t) => t.id === form.template);

  const lines = [
    `Produs / serviciu: ${form.product}`,
    `Descriere furnizată de client: ${form.description}`,
    `Tema postării: ${form.theme}`,
    `Public țintă: ${form.audience}`,
    `Call to action: ${form.cta}`,
    `Platformă: ${platform.label} — ${platform.sweetSpot}`,
    `Ton: ${tone?.label} (${tone?.guidance})`,
    `Lungime: ${length?.label} — ${length?.guidance}`,
    `Limba de scriere: ${language?.name}`,
    `Emoji: ${form.emoji ? "da, 1–4 emoji folosite cu măsură, integrate în text" : "nu, niciun emoji"}`,
    form.hashtags
      ? `Hashtag-uri: da — ${platform.hashtagAdvice}. Le returnezi separat, în câmpul "hashtags".`
      : `Hashtag-uri: nu — câmpul "hashtags" rămâne array gol.`,
  ];

  if (template && template.brief) {
    lines.push(`Tip de postare: ${template.label}. ${template.brief}`);
  }

  return lines.join("\n");
}

export function buildGenerationPrompt(form: PostFormData): BuiltPrompt {
  const platform = PLATFORM_MAP[form.platform];

  const user = `Generează exact ${form.variantCount} variante de postare pentru brief-ul de mai jos.

BRIEF
${describeBrief(form)}

CERINȚE SUPLIMENTARE
- Exact ${form.variantCount} obiecte în array, nici unul în plus, nici unul în minus.
- Fiecare variantă pornește de la un unghi creativ diferit față de celelalte.
- Textul unei variante nu depășește ${platform.charLimit} de caractere.
- Nu adaugi comentarii, numerotare sau titluri în câmpul "text".

${OUTPUT_CONTRACT}`;

  return { system: SYSTEM_PROMPT, user };
}

export function buildRegenerationPrompt(
  form: PostFormData,
  existingTexts: string[],
): BuiltPrompt {
  const platform = PLATFORM_MAP[form.platform];

  const existing = existingTexts.length
    ? existingTexts.map((t, i) => `${i + 1}. ${t}`).join("\n\n")
    : "(niciuna)";

  const user = `Generează exact 1 variantă nouă de postare pentru brief-ul de mai jos.

BRIEF
${describeBrief(form)}

VARIANTE CARE EXISTĂ DEJA (nu le repeta, nu le parafraza, nu relua unghiul lor)
${existing}

CERINȚE SUPLIMENTARE
- Exact 1 obiect în array.
- Unghiul creativ trebuie să fie clar diferit de variantele existente: altă deschidere, altă structură, alt tip de argument.
- Textul nu depășește ${platform.charLimit} de caractere.

${OUTPUT_CONTRACT}`;

  return { system: SYSTEM_PROMPT, user };
}
