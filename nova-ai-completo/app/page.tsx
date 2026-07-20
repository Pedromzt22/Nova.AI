// app/page.tsx
"use client";

import { useState, useRef } from "react";

const MODELS = ["Flux.1", "SDXL", "Playground v2.5"];
const RATIOS = [
  { label: "1:1", value: "1:1", w: 40, h: 40 },
  { label: "16:9", value: "16:9", w: 52, h: 30 },
  { label: "9:16", value: "9:16", w: 30, h: 52 },
];

const GALLERY_LABELS = [
  "Cidade neon à noite",
  "Retrato ciberpunk",
  "Androide sob chuva",
  "Skyline futurista",
  "Beco iluminado",
  "Carro voador",
  "Holograma urbano",
  "Mercado noturno",
];

const CANNED_REPLIES = [
  "Boa ideia! Tente adicionar detalhes de iluminação, como 'neon roxo refletido na chuva' — isso costuma melhorar bastante o resultado.",
  "O CFG scale controla o quanto o modelo segue seu prompt ao pé da letra. Valores entre 6 e 9 costumam dar o melhor equilíbrio.",
  "Para cenas cyberpunk, o Flux.1 costuma capturar melhor os reflexos de neon. Para arte mais estilizada, experimente o Playground v2.5.",
  "Você pode combinar 'Image-to-Video' com um motion scale baixo pra manter a cena mais estável e cinematográfica.",
];

export default function HomePage() {
  const [prompt, setPrompt] = useState(
    "uma rua molhada de neon roxo e rosa à noite, estilo Blade Runner, cinematográfico"
  );
  const [model, setModel] = useState("Flux.1");
  const [ratio, setRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [credits, setCredits] = useState(248);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Oi! Sou o copiloto do Nova.ai. Posso sugerir prompts melhores, explicar os parâmetros ou te ajudar a escolher o modelo certo. É só perguntar." },
  ]);
  const chatInputRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const res = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio: ratio }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao gerar imagem.");
      }

      const output = Array.isArray(data.output) ? data.output[0] : data.output;
      setImageUrl(output);
      setCredits((c) => Math.max(0, c - 4));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao gerar a imagem.");
    } finally {
      setLoading(false);
    }
  }

  function sendChat() {
    const text = chatInputRef.current?.value.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    if (chatInputRef.current) chatInputRef.current.value = "";
    setTimeout(() => {
      const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    }, 500);
  }

  return (
    <>
      <div className="glow" />
      <div className="grid-floor" />

      <nav>
        <div className="logo"><div className="logo-mark" />Nova.ai</div>
        <div className="nav-links">
          <a href="#recursos">Recursos</a>
          <a href="#studio">Studio</a>
          <a href="#galeria">Galeria</a>
          <a href="#precos">Preços</a>
        </div>
        <div className="nav-cta">
          <a href="#entrar" className="btn btn-ghost">Entrar</a>
          <a className="btn btn-primary">Começar grátis</a>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow">● Studio conectado a uma API real de geração</div>
        <h1>Transforme palavras em imagens e vídeos impossíveis</h1>
        <p>Um estúdio criativo com IA para gerar imagens e vídeos de alta qualidade a partir de texto, em segundos.</p>
        <div className="hero-ctas">
          <a className="btn btn-primary btn-lg" href="#studio">Gerar agora</a>
          <a className="btn btn-ghost btn-lg" href="#galeria">Ver galeria ↓</a>
        </div>

        <div className="showcase">
          <div className="show-card"><span className="tag">Text-to-Image</span></div>
          <div className="show-card"><span className="tag">Image-to-Video</span></div>
          <div className="show-card"><span className="tag">Upscale 4K</span></div>
          <div className="show-card"><span className="tag">Text-to-Video</span></div>
        </div>
      </section>

      <section className="section" id="recursos">
        <div className="section-head">
          <div className="kicker">Recursos</div>
          <h2>Tudo que um estúdio de IA precisa</h2>
        </div>
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon" />
            <h3>Text-to-Image</h3>
            <p>Gere imagens em alta definição com SDXL, Flux.1 ou Playground v2.5, com controle total de estilo e proporção.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" />
            <h3>Image-to-Video</h3>
            <p>Anime qualquer imagem com controle de movimento e duração de até 10 segundos.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" />
            <h3>Assistente com IA</h3>
            <p>Um copiloto integrado que ajuda a escrever prompts melhores e explica os ajustes avançados em tempo real.</p>
          </div>
        </div>
      </section>

      <div className="app-frame" id="studio">
        <div className="section-head">
          <div className="kicker">Studio</div>
          <h2>Gere sua primeira imagem</h2>
        </div>
        <div className="app-window">
          <div className="app-sidebar">
            <div className="brand"><div className="logo-mark" />Nova.ai</div>
            <div className="side-link"><span className="side-dot" />Dashboard</div>
            <div className="side-link active"><span className="side-dot" />Gerador de imagens</div>
            <div className="side-link"><span className="side-dot" />Gerador de vídeos</div>
            <div className="side-link"><span className="side-dot" />Galeria</div>
            <div className="side-link"><span className="side-dot" />Assinatura</div>
            <div className="credits-box">
              <div className="num">{credits}</div>
              créditos restantes
            </div>
          </div>

          <div className="app-controls">
            <div>
              <div className="ctrl-label">Prompt</div>
              <textarea
                className="prompt-box"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div>
              <div className="ctrl-label">Modelo</div>
              <div className="chip-row">
                {MODELS.map((m) => (
                  <div
                    key={m}
                    className={`chip ${model === m ? "active" : ""}`}
                    onClick={() => setModel(m)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="ctrl-label">Proporção</div>
              <div className="ratio-row">
                {RATIOS.map((r) => (
                  <div
                    key={r.value}
                    className={`ratio-box ${ratio === r.value ? "active" : ""}`}
                    style={{ width: r.w, height: r.h }}
                    onClick={() => setRatio(r.value)}
                  >
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
            <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
              {loading ? "Gerando..." : "✦ Gerar imagem"}
            </button>
            {error && <div className="error-box">{error}</div>}
          </div>

          <div className="app-canvas">
            <div className="canvas-frame">
              {loading && (
                <div className="progress-wrap">
                  <div className="progress-track"><div className="progress-bar" style={{ width: "70%" }} /></div>
                  <div className="progress-txt">Gerando na API real...</div>
                </div>
              )}
              {!loading && !imageUrl && (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Sua imagem aparecerá aqui</div>
              )}
              {!loading && imageUrl && (
                <img src={imageUrl} alt="Imagem gerada" className="result-img" />
              )}
            </div>
            {imageUrl && !loading && (
              <div className="canvas-actions">
                <a className="icon-btn" href={imageUrl} download target="_blank" rel="noreferrer">↓ Baixar</a>
                <div className="icon-btn">⤢ Upscale</div>
                <div className="icon-btn" onClick={handleGenerate}>↻ Refazer</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="section" id="galeria">
        <div className="section-head">
          <div className="kicker">Galeria</div>
          <h2>Criações da comunidade</h2>
        </div>
        <div className="gallery-grid">
          {GALLERY_LABELS.map((label) => (
            <div className="gallery-item" key={label}>
              <div className="gallery-overlay">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="entrar">
        <div className="section-head">
          <div className="kicker">Conta</div>
          <h2>Entre no Nova.ai</h2>
        </div>
        <div className="login-wrap">
          <div className="login-card">
            <h3>Bem-vindo de volta</h3>
            <p>Entre para continuar criando com IA.</p>
            <div className="login-field">
              <label>E-mail</label>
              <input type="email" placeholder="voce@email.com" />
            </div>
            <div className="login-field">
              <label>Senha</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <button className="login-btn">Entrar</button>
            <div className="login-divider">ou</div>
            <button className="login-google">Continuar com Google</button>
            <div className="login-switch">Não tem conta? <a href="#">Criar conta grátis</a></div>
          </div>
        </div>
      </section>

      <section className="section" id="precos">
        <div className="section-head">
          <div className="kicker">Preços</div>
          <h2>Comece grátis, escale quando precisar</h2>
        </div>
        <div className="pricing">
          <div className="price-card">
            <h3>Free</h3>
            <div className="amount">R$0</div>
            <ul>
              <li>20 créditos por mês</li>
              <li>Geração de imagens</li>
              <li>Marca d'água Nova.ai</li>
            </ul>
            <a className="btn btn-ghost">Começar</a>
          </div>
          <div className="price-card highlight">
            <h3>Pro</h3>
            <div className="amount">R$49<span>/mês</span></div>
            <ul>
              <li>1.000 créditos por mês</li>
              <li>Imagens e vídeos</li>
              <li>Upscale 4K</li>
              <li>Sem marca d'água</li>
            </ul>
            <a className="btn btn-primary">Assinar Pro</a>
          </div>
          <div className="price-card">
            <h3>Enterprise</h3>
            <div className="amount">Sob consulta</div>
            <ul>
              <li>Créditos ilimitados</li>
              <li>API dedicada</li>
              <li>Suporte prioritário</li>
            </ul>
            <a className="btn btn-ghost">Falar com vendas</a>
          </div>
        </div>
      </section>

      <footer>Nova.ai · imagens geradas por uma API real via backend seguro</footer>

      <div className="assistant-bubble" onClick={() => setAssistantOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.4" fill="white" />
        </svg>
      </div>
      <div className={`assistant-panel ${assistantOpen ? "open" : ""}`}>
        <div className="assistant-head">
          <div className="dot" />
          <div>
            <strong>Copiloto Nova</strong>
            <span>Ajuda com prompts e ajustes</span>
          </div>
        </div>
        <div className="assistant-body">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.from}`}>{m.text}</div>
          ))}
        </div>
        <div className="assistant-input">
          <input type="text" placeholder="Pergunte algo..." ref={chatInputRef} onKeyDown={(e) => e.key === "Enter" && sendChat()} />
          <button onClick={sendChat}>↑</button>
        </div>
      </div>
    </>
  );
}
