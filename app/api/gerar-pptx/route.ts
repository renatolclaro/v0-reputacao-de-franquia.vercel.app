import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function gerarAnalise(marca: string, cidade: string, segmento: string, contexto: string) {
  const prompt = `Você é um especialista em franchising e due diligence de franquias no Brasil, parceiro da Kick Off Invest.

Gere uma análise reputacional completa da franquia "${marca}" para um investidor interessado em abrir uma unidade em ${cidade}.
${segmento ? `Segmento: ${segmento}` : ""}
${contexto ? `Contexto adicional: ${contexto}` : ""}

Retorne APENAS um objeto JSON válido (sem markdown, sem explicações), com esta estrutura:

{
  "nomeCompleto": "nome completo da rede",
  "fatos": [
    { "label": "Fundação", "valor": "ano", "sub": "cidade – UF" },
    { "label": "Unidades", "valor": "número+", "sub": "Brasil + exterior" },
    { "label": "Modelo", "valor": "palavra-chave", "sub": "descrição breve" },
    { "label": "Reconhecimento", "valor": "palavra-chave", "sub": "descrição breve" }
  ],
  "descricao": "parágrafo de 3-4 linhas sobre a marca",
  "modeloNegocio": {
    "taxaFranquia": "R$ X–Y mil",
    "investimentoTotal": "R$ X–Y mil",
    "royalties": "~X%",
    "fundoPropaganda": "~X%",
    "payback": "X–Y meses"
  },
  "caracteristicas": ["item 1","item 2","item 3","item 4","item 5","item 6"],
  "reputacao": {
    "canais": [
      { "canal": "Google Avaliações", "nota": "X,X ★", "descricao": "descrição curta", "sentimento": "positivo" },
      { "canal": "Reclame Aqui", "nota": "Baixo", "descricao": "descrição curta", "sentimento": "positivo" },
      { "canal": "Glassdoor", "nota": "Misto", "descricao": "descrição curta", "sentimento": "neutro" },
      { "canal": "Fóruns/ABF", "nota": "Positivo", "descricao": "descrição curta", "sentimento": "positivo" }
    ],
    "compliance": [
      { "status": "ok", "texto": "item positivo 1" },
      { "status": "ok", "texto": "item positivo 2" },
      { "status": "atencao", "texto": "item de atenção 1" },
      { "status": "atencao", "texto": "item de atenção 2" }
    ]
  },
  "pontosPositivos": ["ponto 1","ponto 2","ponto 3","ponto 4","ponto 5","ponto 6","ponto 7","ponto 8"],
  "riscos": ["risco 1","risco 2","risco 3","risco 4","risco 5","risco 6","risco 7","risco 8"],
  "mercadoLocal": ["dado 1","dado 2","dado 3","dado 4"],
  "oportunidades": ["op 1","op 2","op 3","op 4"],
  "atencoes": ["at 1","at 2","at 3","at 4"],
  "checklist": [
    { "feito": true, "texto": "Solicitar COF vigente à franqueadora" },
    { "feito": true, "texto": "Verificar registro da marca no INPI" },
    { "feito": false, "texto": "Consultar JUCESP e TJSP (litígios)" },
    { "feito": false, "texto": "Auditar densidade de unidades na praça" },
    { "feito": false, "texto": "Ligar para mínimo 5 ex-franqueados (COF)" },
    { "feito": false, "texto": "Validar projeções com contador independente" },
    { "feito": false, "texto": "Revisar cláusulas de exclusividade territorial" },
    { "feito": false, "texto": "Checar passivo trabalhista na praça" },
    { "feito": false, "texto": "Visitar 2+ unidades em cidades similares" },
    { "feito": false, "texto": "Pesquisar custo de ponto comercial em ${cidade}" }
  ],
  "veredito": {
    "titulo": "título do veredito em 4-6 palavras",
    "descricao": "parágrafo de 3-4 linhas com veredito final para ${cidade}"
  },
  "proximosPassos": ["1.  passo 1","2.  passo 2","3.  passo 3","4.  passo 4"]
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content[0] as { type: string; text: string }).text.trim();
  const clean = text.replace(/^```json?\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(clean);
}

export async function POST(req: NextRequest) {
  try {
    const { marca, cidade, segmento = "", contexto = "" } = await req.json();

    if (!marca || !cidade) {
      return NextResponse.json({ error: "marca e cidade são obrigatórios" }, { status: 400 });
    }

    const analise = await gerarAnalise(marca, cidade, segmento, contexto);

    return NextResponse.json({ sucesso: true, analise });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: "Erro ao gerar análise", detail: message }, { status: 500 });
  }
}
