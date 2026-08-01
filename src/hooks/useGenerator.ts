import { useCallback, useState } from "react";
import { generatePosts, regenerateSingle } from "../services/ai";
import { toAppError } from "../services/errors";
import type { GenerationMeta, PostFormData, PostVariant, ProviderSettings } from "../types";
import { useToast } from "./useToast";

interface UseGeneratorArgs {
  onGenerated: (form: PostFormData, variants: PostVariant[], meta: GenerationMeta) => void;
}

export function useGenerator({ onGenerated }: UseGeneratorArgs) {
  const { notify } = useToast();
  const [variants, setVariants] = useState<PostVariant[]>([]);
  const [meta, setMeta] = useState<GenerationMeta | null>(null);
  const [activeForm, setActiveForm] = useState<PostFormData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const generate = useCallback(
    async (form: PostFormData, settings: ProviderSettings) => {
      setIsGenerating(true);
      try {
        const outcome = await generatePosts(form, settings);
        setVariants(outcome.variants);
        setMeta(outcome.meta);
        setActiveForm(form);
        onGenerated(form, outcome.variants, outcome.meta);
        notify("success", `${outcome.variants.length} variante generate`);
      } catch (error) {
        const appError = toAppError(error);
        notify("error", appError.message, appError.detail);
      } finally {
        setIsGenerating(false);
      }
    },
    [notify, onGenerated],
  );

  const regenerateOne = useCallback(
    async (variantId: string, settings: ProviderSettings) => {
      if (!activeForm) return;
      setRegeneratingId(variantId);
      try {
        const others = variants.filter((v) => v.id !== variantId).map((v) => v.text);
        const { variant } = await regenerateSingle(activeForm, settings, others);
        setVariants((current) =>
          current.map((item) => (item.id === variantId ? { ...variant, id: item.id } : item)),
        );
        notify("success", "Varianta a fost regenerată");
      } catch (error) {
        const appError = toAppError(error);
        notify("error", appError.message, appError.detail);
      } finally {
        setRegeneratingId(null);
      }
    },
    [activeForm, variants, notify],
  );

  const updateVariantText = useCallback((variantId: string, text: string) => {
    setVariants((current) =>
      current.map((item) => (item.id === variantId ? { ...item, text } : item)),
    );
  }, []);

  const loadFromHistory = useCallback(
    (form: PostFormData, saved: PostVariant[], savedMeta: GenerationMeta) => {
      setActiveForm(form);
      setVariants(saved);
      setMeta(savedMeta);
    },
    [],
  );

  const clear = useCallback(() => {
    setVariants([]);
    setMeta(null);
    setActiveForm(null);
  }, []);

  return {
    variants,
    meta,
    activeForm,
    isGenerating,
    regeneratingId,
    generate,
    regenerateOne,
    updateVariantText,
    loadFromHistory,
    clear,
  };
}
