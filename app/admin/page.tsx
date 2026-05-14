"use client";

import { useState, useEffect, useCallback } from "react";

// ─── TIPOS ───────────────────────────────────────────
type ConfigItem = {
  id: string;
  chave: string;
  categoria: string;
  descricao: string;
  valor: unknown;
  atualizado_em: string;
};

type Tab = "financeiro" | "risco" | "veredito" | "reconhecimento" | "checklist" | "sistema";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "financeiro", label: "Parâmetros Financeiros", icon: "₿" },
  { id: "risco", label: "Critérios de Risco", icon: "⚠" },
  { id: "veredito", label: "Critérios do Veredito", icon: "◈" },
  { id: "reconhecimento", label: "Reconhecimento ABF", icon: "★" },
  { id: "checklist", label: "Checklist Due Diligence", icon: "✓" },
  { id: "sistema", label: "Prompt do Sistema", icon: "⌥" },
];

// ─── COMPONENTE PRINCIPAL ────────────────────────────
export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");
  const [erroAuth, setErroAuth] = useState(false);
  const [tabAtiva, setTabAtiva] = useState<Tab>("financeiro");
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [editando, setEditando] = useState<Record<string, string>>({});

  const SENHA_ADM = process.env.NEXT_PUBLIC_ADM_SENHA || "kickoff2025";

  function autenticar() {
    if (senha === SENHA_ADM) {
      setAutenticado(true);
      setErroAuth(false);
    } else {
      setErroAuth(true);
    }
  }

  const carregarConfigs = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch(`/api/admin/config?categoria=${tabAtiva}`);
      const data = await res.json();
      setConfigs(data.configs || []);
      const inicial: Record<string, string> = {};
      for (const c of data.configs || []) {
        inicial[c.chave] = typeof c.valor === "string"
          ? c.valor
          : JSON.stringify(c.valor, null, 2);
      }
      setEditando(inicial);
    } catch {
      setConfigs([]);
    } finally {
      setCarregando(false);
    }
  }, [tabAtiva]);

  useEffect(() => {
    if (autenticado) carregarConfigs();
  }, [autenticado, tabAtiva, carregarConfigs]);

  async function salvar(chave: string) {
    setSalvando(chave);
    try {
      let valorParsed: unknown;
      try {
        valorParsed = JSON.parse(editando[chave]);
      } catch {
        valorParsed = editando[chave];
      }
      await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave, valor: valorParsed }),
      });
      setSavedMsg(chave);
      setTimeout(() => setSavedMsg(null), 2500);
    } finally {
      setSalvando(null);
    }
  }

  // ─── TELA DE LOGIN ─────────────────────────────────
  if (!autenticado) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0a", display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace"
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');`}</style>
        <div style={{
          width: 380, padding: "48px 40px", background: "#111",
          border: "1px solid #222", borderTop: "3px solid #C0201A"
        }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "#C0201A", letterSpacing: 4, fontWeight: 500, marginBottom: 8 }}>
              KICK OFF INVEST
            </div>
            <div style={{ fontSize: 26, color: "#fff", fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
              Scout ADM
            </div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
              Painel de Governança Metodológica
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8 }}>SENHA DE ACESSO</div>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={e => e.key === "Enter" && autenticar()}
              placeholder="••••••••••"
              style={{
                width: "100%", padding: "12px 16px", background: "#0a0a0a",
                border: erroAuth ? "1px solid #C0201A" : "1px solid #333",
                color: "#fff", fontSize: 14, outline: "none",
                fontFamily: "'DM Mono', monospace", boxSizing: "border-box"
              }}
            />
            {erroAuth && (
              <div style={{ fontSize: 11, color: "#C0201A", marginTop: 6 }}>
                Senha incorreta.
              </div>
            )}
          </div>

          <button
            onClick={autenticar}
            style={{
              width: "100%", padding: "13px", background: "#C0201A",
              border: "none", color: "#fff", fontSize: 12, fontWeight: 500,
              letterSpacing: 3, cursor: "pointer", fontFamily: "'DM Mono', monospace"
            }}
          >
            ACESSAR
          </button>
        </div>
      </div>
    );
  }

  // ─── PAINEL PRINCIPAL ──────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        textarea:focus, input:focus { outline: none; border-color: #C0201A !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; }
        .tab-btn:hover { background: #1a1a1a !important; }
        .save-btn:hover { background: #a01818 !important; }
      `}</style>

      {/* HEADER */}
      <div style={{
        borderBottom: "1px solid #1e1e1e", padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60, background: "#0d0d0d"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 3, height: 24, background: "#C0201A" }} />
          <div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#fff" }}>
              Scout
            </span>
            <span style={{ fontSize: 11, color: "#C0201A", marginLeft: 10, letterSpacing: 2 }}>
              ADM
            </span>
          </div>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginLeft: 8 }}>
            GOVERNANÇA METODOLÓGICA
          </div>
        </div>
        <button
          onClick={() => setAutenticado(false)}
          style={{
            background: "none", border: "1px solid #333", color: "#555",
            fontSize: 11, padding: "6px 16px", cursor: "pointer",
            letterSpacing: 2, fontFamily: "'DM Mono', monospace"
          }}
        >
          SAIR
        </button>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 60px)" }}>

        {/* SIDEBAR */}
        <div style={{
          width: 240, borderRight: "1px solid #1a1a1a",
          padding: "24px 0", background: "#0d0d0d", flexShrink: 0
        }}>
          <div style={{ padding: "0 20px", marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: "#444", letterSpacing: 3 }}>CONFIGURAÇÕES</div>
          </div>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className="tab-btn"
              onClick={() => setTabAtiva(tab.id)}
              style={{
                width: "100%", padding: "12px 20px", background: tabAtiva === tab.id ? "#1a1a1a" : "transparent",
                border: "none", borderLeft: tabAtiva === tab.id ? "2px solid #C0201A" : "2px solid transparent",
                color: tabAtiva === tab.id ? "#fff" : "#555", cursor: "pointer",
                textAlign: "left", fontSize: 12, fontFamily: "'DM Mono', monospace",
                display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s"
              }}
            >
              <span style={{ color: tabAtiva === tab.id ? "#C0201A" : "#444", fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          <div style={{ margin: "32px 20px 0", paddingTop: 24, borderTop: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 9, color: "#333", letterSpacing: 2, marginBottom: 12 }}>MANIFESTO BASE</div>
            <div style={{ fontSize: 10, color: "#444", lineHeight: 1.8 }}>
              Payback ≠ risco isolado<br />
              Valuation ≠ promessa<br />
              Dado sem fonte → "a confirmar"<br />
              Risco = desvio verificável
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>

          {carregando ? (
            <div style={{ color: "#444", fontSize: 12, letterSpacing: 2 }}>CARREGANDO...</div>
          ) : configs.length === 0 ? (
            <div style={{ color: "#444", fontSize: 12 }}>
              Nenhuma configuração encontrada para esta categoria.<br />
              <span style={{ color: "#333", fontSize: 11 }}>Execute o SQL no Supabase para criar os parâmetros.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {configs.map(config => (
                <div key={config.chave} style={{
                  background: "#111", border: "1px solid #1e1e1e",
                  padding: "24px 28px"
                }}>
                  {/* Header do item */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                      <div style={{ width: 6, height: 6, background: "#C0201A", borderRadius: "50%" }} />
                      <div style={{ fontSize: 11, color: "#C0201A", letterSpacing: 2 }}>
                        {config.chave}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#888", marginLeft: 18 }}>
                      {config.descricao}
                    </div>
                    <div style={{ fontSize: 10, color: "#333", marginLeft: 18, marginTop: 4 }}>
                      Atualizado: {new Date(config.atualizado_em).toLocaleString("pt-BR")}
                    </div>
                  </div>

                  {/* Editor */}
                  <textarea
                    value={editando[config.chave] || ""}
                    onChange={e => setEditando(prev => ({ ...prev, [config.chave]: e.target.value }))}
                    rows={typeof config.valor === "object" ? 14 : 3}
                    style={{
                      width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a",
                      color: "#ccc", fontSize: 12, padding: "14px 16px",
                      fontFamily: "'DM Mono', monospace", lineHeight: 1.7,
                      resize: "vertical", transition: "border-color 0.15s"
                    }}
                  />

                  {/* Ações */}
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 12, gap: 12 }}>
                    {savedMsg === config.chave && (
                      <div style={{ fontSize: 11, color: "#4CAF50", letterSpacing: 2 }}>
                        ✓ SALVO
                      </div>
                    )}
                    <button
                      className="save-btn"
                      onClick={() => salvar(config.chave)}
                      disabled={salvando === config.chave}
                      style={{
                        background: "#C0201A", border: "none", color: "#fff",
                        fontSize: 11, padding: "9px 24px", cursor: "pointer",
                        letterSpacing: 3, fontFamily: "'DM Mono', monospace",
                        opacity: salvando === config.chave ? 0.6 : 1,
                        transition: "all 0.15s"
                      }}
                    >
                      {salvando === config.chave ? "SALVANDO..." : "SALVAR"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
