// lib/replicate.ts
//
// Este arquivo roda SOMENTE no servidor (nunca é enviado ao navegador).
// A chave REPLICATE_API_TOKEN vive em uma variável de ambiente e nunca
// aparece no código do front-end nem no bundle enviado ao cliente.

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

// IDs de versão de modelo na Replicate mudam com o tempo.
// Confira a versão atual na página do modelo em replicate.com antes de usar
// em produção e ajuste as variáveis de ambiente correspondentes.
const IMAGE_MODEL_VERSION =
  process.env.REPLICATE_IMAGE_MODEL_VERSION ??
  "black-forest-labs/flux-schnell"; // exemplo: modelo rápido de texto-para-imagem

const VIDEO_MODEL_VERSION =
  process.env.REPLICATE_VIDEO_MODEL_VERSION ??
  "stability-ai/stable-video-diffusion";

interface CreatePredictionParams {
  model: string;
  input: Record<string, unknown>;
}

async function createPrediction({ model, input }: CreatePredictionParams) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error(
      "REPLICATE_API_TOKEN não configurado. Adicione sua chave no arquivo .env.local (veja .env.local.example)."
    );
  }

  const res = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      Prefer: "wait", // pede pra Replicate esperar um pouco antes de responder
    },
    body: JSON.stringify({
      // Para modelos "oficiais" (owner/name) a Replicate aceita o campo "model".
      // Para versões fixas (hash), troque "model" por "version".
      model,
      input,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro na Replicate (${res.status}): ${errText}`);
  }

  return res.json();
}

async function pollPrediction(id: string, token: string, timeoutMs = 60000) {
  const start = Date.now();
  const statusUrl = `${REPLICATE_API_URL}/${id}`;

  while (Date.now() - start < timeoutMs) {
    const res = await fetch(statusUrl, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await res.json();

    if (data.status === "succeeded") return data;
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Geração falhou: ${data.error ?? "motivo desconhecido"}`);
    }

    await new Promise((r) => setTimeout(r, 1500));
  }

  throw new Error("Tempo limite excedido esperando a geração terminar.");
}

export async function generateImage(prompt: string, aspectRatio = "1:1") {
  const token = process.env.REPLICATE_API_TOKEN!;
  const prediction = await createPrediction({
    model: IMAGE_MODEL_VERSION,
    input: {
      prompt,
      aspect_ratio: aspectRatio,
    },
  });

  // Se "Prefer: wait" já retornou o resultado final, evita poll desnecessário
  if (prediction.status === "succeeded") return prediction;
  return pollPrediction(prediction.id, token);
}

export async function generateVideo(prompt: string, durationSeconds = 5) {
  const token = process.env.REPLICATE_API_TOKEN!;
  const prediction = await createPrediction({
    model: VIDEO_MODEL_VERSION,
    input: {
      prompt,
      num_frames: durationSeconds * 6, // ajuste conforme o modelo escolhido
    },
  });

  if (prediction.status === "succeeded") return prediction;
  return pollPrediction(prediction.id, token);
}
