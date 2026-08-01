import type { PostFormData, PostVariant } from "../types";
import { LANGUAGES, PLATFORM_MAP, TONES } from "./constants";

function briefLines(form: PostFormData): string[] {
  return [
    `Produs: ${form.product}`,
    `Temă: ${form.theme}`,
    `Platformă: ${PLATFORM_MAP[form.platform].label}`,
    `Ton: ${TONES.find((t) => t.id === form.tone)?.label ?? form.tone}`,
    `Public țintă: ${form.audience}`,
    `Call to action: ${form.cta}`,
    `Limbă: ${LANGUAGES.find((l) => l.id === form.language)?.label ?? form.language}`,
  ];
}

export function variantsToText(form: PostFormData, variants: PostVariant[]): string {
  const header = ["SOCIAL MEDIA POST GENERATOR", "", ...briefLines(form), "", "---", ""];

  const body = variants.flatMap((variant, index) => {
    const block = [`VARIANTA ${index + 1}`, "", variant.text];
    if (variant.hashtags.length) block.push("", variant.hashtags.join(" "));
    block.push("", "---", "");
    return block;
  });

  return [...header, ...body].join("\n").trim();
}

export function variantsToMarkdown(form: PostFormData, variants: PostVariant[]): string {
  const header = [
    "# Social Media Post Generator",
    "",
    ...briefLines(form).map((line) => `- ${line}`),
    "",
  ];

  const body = variants.flatMap((variant, index) => {
    const block = [`## Varianta ${index + 1}`, "", variant.text];
    if (variant.hashtags.length) {
      block.push("", `\`${variant.hashtags.join(" ")}\``);
    }
    block.push("");
    return block;
  });

  return [...header, ...body].join("\n").trim();
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function timestampSlug(): string {
  return new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
}
