// app/api/generate/image/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/replicate";
import { validatePrompt, checkRateLimit, getClientIdentifier } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const identifier = getClientIdentifier(req);
    const rateLimit = checkRateLimit(identifier);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Muitas requisições. Tente novamente em ${rateLimit.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const prompt = validatePrompt(body.prompt);
    const aspectRatio = typeof body.aspectRatio === "string" ? body.aspectRatio : "1:1";

    // TODO: antes de gerar, verifique aqui os créditos do usuário logado
    // (ex: consultando o Supabase) e debite o custo somente após sucesso.

    const result = await generateImage(prompt, aspectRatio);

    return NextResponse.json({
      status: "succeeded",
      output: result.output, // URL(s) da imagem gerada
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
