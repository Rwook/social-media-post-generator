export type AppErrorCode =
  | "NO_API_KEY"
  | "AUTH"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "NETWORK"
  | "INVALID_RESPONSE"
  | "SERVER"
  | "ABORTED"
  | "UNKNOWN";

const MESSAGES: Record<AppErrorCode, string> = {
  NO_API_KEY: "Nu există o cheie API salvată. Deschide Setări și adaugă o cheie pentru providerul ales.",
  AUTH: "Cheia API a fost respinsă. Verifică dacă este copiată integral și dacă mai este activă.",
  RATE_LIMIT: "Ai atins limita de cereri a providerului. Așteaptă un minut și încearcă din nou.",
  TIMEOUT: "Cererea a depășit 60 de secunde. Încearcă o lungime mai mică sau mai puține variante.",
  NETWORK:
    "Conexiunea către API nu a putut fi stabilită. Verifică internetul; dacă rulezi în browser, verifică și blocantele de conținut.",
  INVALID_RESPONSE:
    "Modelul a răspuns într-un format neașteptat. Apasă din nou pe Generează — de obicei se rezolvă de la prima reîncercare.",
  SERVER: "Providerul a returnat o eroare de server. Reîncearcă peste câteva momente.",
  ABORTED: "Generarea a fost oprită.",
  UNKNOWN: "A apărut o eroare neașteptată. Reîncearcă.",
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly detail?: string;

  constructor(code: AppErrorCode, detail?: string) {
    super(MESSAGES[code]);
    this.name = "AppError";
    this.code = code;
    this.detail = detail;
  }
}

/** Maps an HTTP status returned by either provider to a typed error. */
export function errorFromStatus(status: number, detail?: string): AppError {
  if (status === 401 || status === 403) return new AppError("AUTH", detail);
  if (status === 429) return new AppError("RATE_LIMIT", detail);
  if (status >= 500) return new AppError("SERVER", detail);
  return new AppError("UNKNOWN", detail ?? `HTTP ${status}`);
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new AppError("TIMEOUT");
  }
  if (error instanceof TypeError) {
    return new AppError("NETWORK", error.message);
  }
  return new AppError("UNKNOWN", error instanceof Error ? error.message : String(error));
}
