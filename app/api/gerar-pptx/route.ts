import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─────────────────────────────────────────────
// SYSTEM PROMPT — Metodologia Proprietária Kick Off
// Baseado no Manifesto Técnico do Motor (versão governante, 29/01/2026)
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `Você é o Scout — agente de inteligência reputacional e due diligence de franquias da Kick Off Invest.

Você opera estritamente segundo a Metodologia Proprietária Kick Off para PMEs e Franquias no Brasil.
Seu papel é apoiar o investidor na leitura técnica, econômica e reputacional de uma franquia.
Você NÃO inventa dados. Se não encontrar uma informação via busca, sinaliza explicitamente como "dado a confirmar com franqueadora".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROCESSO OBRIGATÓRIO DE BUSCA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Antes de gerar qualquer análise, você DEVE buscar ativamente:
1. "[marca] franquia fundação história ABF" — para ano de fundação real
2. "[marca] Selo Excelência Franchising ABF premiação" — para reconhecimento ABF
3. "[marca] franquia número unidades 2024 2025" — para porte real da rede
4. "[marca] franquia Reclame Aqui reclamações" — para reputação verificável
5. "[marca] franquia investimento royalties COF" — para dados financeiros
6. "[marca] franquia [cidade] mercado" — para contexto local

Use os dados encontrados. Nunca substitua dados verificados por estimativas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRINCÍPIOS OBRIGATÓRIOS (NÃO NEGOCIÁVEIS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. VALUATION ≠ PREÇO ≠ PROMESSA
   Valuation é instrumento de leitura econômica, não promessa de retorno.

2. PAYBACK — USO RESTRITO E CORRETO
   Payback é métrica de TEMPO, não de valor econômico.
   - Payback SÓ é apontado como risco se superar o prazo contratual da franquia.
   - Jamais afirme "o investimento retorna em X anos".
   - Payback mais longo não inviabiliza investimento economicamente consistente.

3. TRANSPARÊNCIA TOTAL DE PREMISSAS
   Todo dado deve ter origem clara. Quando não verificável: "a confirmar com franqueadora".

4. RISCOS COM CRITÉRIO
   Só aponte como risco algo com base técnica ou reputacional verificável.
   Risco real = desvio identificável da operação, modelo, reputação ou contrato.
   Condições gerais de mercado NÃO são riscos.

5. LINGUAGEM CONTROLADA
   PROIBIDO: "retorno garantido", "o negócio se paga em X anos", "investimento seguro"
   PERMITIDO: "capacidade de geração de caixa", "viabilidade econômica sob as premissas adotadas"

6. RECONHECIMENTO ABF
   O Selo de Excelência em Franchising da ABF é o principal indicador de maturidade de rede no Brasil.
   Se a franquia for premiada consecutivamente, classifique como "Consolidada" ou "Referência de Mercado" — nunca "Emergente".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VEREDITO — CLASSIFICAÇÕES EXATAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use APENAS uma destas classificações:
• RECOMENDADO COM RESSALVAS — modelo comprovado, reputação sólida, riscos gerenciáveis
• PROCEDER COM CAUTELA — aspectos relevantes a validar antes de qualquer compromisso
• DUE DILIGENCE APROFUNDADA NECESSÁRIA — sinais de alerta reputacionais, contratuais ou operacionais
• EVITAR NO ESTÁGIO ATUAL — riscos estruturais que superam os benefícios identificados

O veredito DEVE citar o critério técnico específico que o determinou.`;

// ─────────────────────────────────────────────
// BUSCA + ANÁLISE COM WEB SEARCH NATIVO
// ─────────────────────────────────────────────
async function gerarAnalise(
  marca: string,
  cidade: string,
  segmento: string,
  contexto: string,
  verbaMil?: number
) {
  const verbaContexto = verbaMil
    ? `Verba disponível do investidor: R$ ${verbaMil} mil. Contextualize se o investimento da franquia é compatível.`
    : "";

  const prompt = `Pesquise ativamente sobre a franquia "${marca}" usando as buscas obrigatórias definidas no seu sistema antes de analisar.

Dados a buscar obrigatoriamente:
- Ano real de fundação da rede (não da master brasileira — da rede original)
- Histórico de premiações ABF (Selo de Excelência em Franchising — quantos anos consecutivos)
- Número atual de unidades
- Dados de Reclame Aqui
- Investimento total e royalties (se públicos no COF ou site)
- Prazo típico de contrato

Após as buscas, gere análise reputacional e de due diligence para investidor considerando abrir unidade em ${cidade}.
${segmento ? `Segmento: ${segmento}` : ""}
${verbaContexto}
${contexto ? `Contexto adicional: ${contexto}` : ""}

REGRAS CRÍTICAS:
- Use APENAS dados encontrados nas buscas ou sinalize "a confirmar com franqueadora"
- Payback NÃO é risco isolado — só mencione se houver evidência de que supera o prazo contratual
- Riscos devem ter base técnica verificável — sem riscos genéricos de mercado
- Se a franquia tiver Selo ABF consecutivo, classifique reconhecimento como "Consolidada" ou "Referência de Mercado", nunca "Emergente"

Retorne APENAS um objeto JSON válido (sem markdown, sem explicações):

{
  "nomeCompleto": "nome completo da rede",
  "fontesConsultadas": ["fonte 1 consultada na busca", "fonte 2", "fonte 3"],
  "fatos": [
    { "label": "Fundação", "valor": "ano verificado via busca", "sub": "cidade de origem" },
    { "label": "Unidades", "valor": "número verificado+", "sub": "descrição expansão" },
    { "label": "Modelo", "valor": "palavra-chave do modelo", "sub": "descrição breve" },
    { "label": "Reconhecimento", "valor": "classificação baseada em dados reais", "sub": "base verificada (ABF, prêmios, anos consecutivos)" }
  ],
  "descricao": "parágrafo de 3-4 linhas baseado nos dados encontrados — sem adjetivos vazios",
  "modeloNegocio": {
    "taxaFranquia": "R$ X–Y mil (fonte) ou 'a confirmar com COF'",
    "investimentoTotal": "R$ X–Y mil (fonte) ou 'a confirmar com COF'",
    "royalties": "~X% ou 'a confirmar'",
    "fundoPropaganda": "~X% ou 'a confirmar'",
    "prazoContrato": "X anos ou 'a confirmar' — dado crítico para análise de viabilidade",
    "notaPayback": "O período de recuperação do capital deve ser validado contra o prazo contratual acima. Não é critério de risco isolado."
  },
  "caracteristicas": ["item 1","item 2","item 3","item 4","item 5","item 6"],
  "reputacao": {
    "canais": [
      { "canal": "Google Avaliações", "nota": "nota verificada ou 'sem dados públicos'", "descricao": "descrição baseada em dados reais", "sentimento": "positivo|neutro|negativo" },
      { "canal": "Reclame Aqui", "nota": "classificação verificada", "descricao": "padrão de reclamações encontrado", "sentimento": "positivo|neutro|negativo" },
      { "canal": "Glassdoor / Indeed", "nota": "classificação ou 'sem dados'", "descricao": "percepção dos colaboradores", "sentimento": "positivo|neutro|negativo" },
      { "canal": "ABF / Premiações", "nota": "histórico verificado de selos e prêmios", "descricao": "anos de premiação e classificação ABF", "sentimento": "positivo|neutro|negativo" }
    ],
    "compliance": [
      { "status": "ok", "texto": "item verificado 1" },
      { "status": "ok", "texto": "item verificado 2" },
      { "status": "atencao", "texto": "ponto de atenção com base técnica 1" },
      { "status": "atencao", "texto": "ponto de atenção com base técnica 2" }
    ]
  },
  "pontosPositivos": ["ponto 1","ponto 2","ponto 3","ponto 4","ponto 5","ponto 6"],
  "riscos": ["risco com base verificável 1 — SEM payback isolado, SEM genéricos","risco 2","risco 3","risco 4","risco 5","risco 6"],
  "mercadoLocal": ["dado específico sobre ${cidade} 1","dado 2","dado 3","dado 4"],
  "oportunidades": ["oportunidade 1","oportunidade 2","oportunidade 3","oportunidade 4"],
  "atencoes": ["atenção com critério técnico 1","atenção 2","atenção 3","atenção 4"],
  "checklist": [
    { "feito": false, "texto": "Solicitar COF vigente e ler prazo contratual e cláusulas de rescisão" },
    { "feito": false, "texto": "Verificar registro da marca no INPI (situação atual)" },
    { "feito": false, "texto": "Consultar JUCESP e TJSP — litígios com franqueados" },
    { "feito": false, "texto": "Checar Reclame Aqui — padrão e resposta da franqueadora" },
    { "feito": false, "texto": "Ligar para mínimo 5 ex-franqueados listados no COF" },
    { "feito": false, "texto": "Validar projeções financeiras com contador independente" },
    { "feito": false, "texto": "Revisar cláusulas de exclusividade territorial e renovação" },
    { "feito": false, "texto": "Verificar passivo trabalhista da franqueadora (Receita Federal)" },
    { "feito": false, "texto": "Visitar 2+ unidades em cidades de perfil similar a ${cidade}" },
    { "feito": false, "texto": "Pesquisar custo real de ponto comercial em ${cidade} para este modelo" },
    { "feito": false, "texto": "Solicitar DRE de unidade madura para validar premissas de margem" },
    { "feito": false, "texto": "Calcular NCG real antes de comprometer capital de giro" }
  ],
  "veredito": {
    "classificacao": "uma das quatro classificações exatas da metodologia Kick Off",
    "criterioTecnico": "critério técnico específico e verificável que determinou esta classificação — cite dados reais encontrados nas buscas",
    "titulo": "título do veredito em 4-6 palavras",
    "descricao": "parágrafo de 3-4 linhas com veredito para ${cidade} — cite pelo menos um dado verificado"
  },
  "proximosPassos": [
    "1. passo concreto 1",
    "2. passo concreto 2",
    "3. passo concreto 3",
    "4. passo concreto 4"
  ]
}`;

  // Primeira chamada com web search habilitado
  let mensagens: Anthropic.MessageParam[] = [
    { role: "user", content: prompt },
  ];

  let respostaAtual = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
    messages: mensagens,
  });

  // Loop até o modelo parar de buscar e gerar o JSON final
  while (respostaAtual.stop_reason === "tool_use") {
    mensagens.push({ role: "assistant", content: respostaAtual.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = respostaAtual.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use")
      .map((b) => ({
        type: "tool_result" as const,
        tool_use_id: b.id,
        content: (b.input as { query?: string }).query
          ? `Busca executada: ${(b.input as { query: string }).query}`
          : "Busca executada.",
      }));

    mensagens.push({ role: "user", content: toolResults });

    respostaAtual = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305" as const, name: "web_search" }],
      messages: mensagens,
    });
  }

  // Extrai o texto final (JSON)
  let textoFinal = "";
  for (const block of respostaAtual.content) {
    if (block.type === "text") {
      textoFinal = block.text;
    }
  }

  const clean = textoFinal
    .trim()
    .replace(/^```json?\s*/i, "")
    .replace(/```\s*$/i, "");

  return JSON.parse(clean);
}

// ─────────────────────────────────────────────
// ENDPOINT
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const {
      marca,
      cidade,
      segmento = "",
      contexto = "",
      verbaMil,
    } = await req.json();

    if (!marca || !cidade) {
      return NextResponse.json(
        { error: "marca e cidade são obrigatórios" },
        { status: 400 }
      );
    }

    const analise = await gerarAnalise(marca, cidade, segmento, contexto, verbaMil);

    return NextResponse.json({ sucesso: true, analise });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao gerar análise", detail: message },
      { status: 500 }
    );
  }
}
