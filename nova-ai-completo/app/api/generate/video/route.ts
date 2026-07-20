// app/api/generate/video/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateVideo } from "@/lib/replicate";
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
    const duration = [3, 5, 10].includes(body.durationSeconds) ? body.durationSeconds : 5;

    // TODO: verifique créditos do usuário antes de gerar (vídeo custa mais que imagem)

    const result = await generateVideo(prompt, duration);

    return NextResponse.json({
      status: "succeeded",
      output: result.output, // URL do vídeo gerado
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
