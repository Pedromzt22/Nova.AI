// lib/security.ts
//
// Proteções básicas de servidor:
// 1. Validação do prompt (tamanho, presença)
// 2. Rate limiting simples por IP (em memória — para produção real com
//    múltiplas instâncias de servidor, troque por Redis/Upstash)

const MAX_PROMPT_LENGTH = 500;

export function validatePrompt(prompt: unknown): string {
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("O prompt é obrigatório.");
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(`O prompt deve ter no máximo ${MAX_PROMPT_LENGTH} caracteres.`);
  }
  return prompt.trim();
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // janela de 1 minuto
const MAX_REQUESTS_PER_WINDOW = 5; // ajuste conforme seu plano/custos

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const bucket = buckets.get(identifier);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function getClientIdentifier(req: Request): string {
  // Atrás de proxies (Vercel, etc.) o IP real vem em x-forwarded-for
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() ?? "unknown";
}
