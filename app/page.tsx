"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    marca: "",
    cidade: "",
    verba: "",
    segmento: "",
    contexto: "",
  });
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErro("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.marca.trim() || !form.cidade.trim()) {
      setErro("Preencha ao menos a marca e a cidade.");
      return;
    }
    setLoading(true);
    setErro("");
    setResultado(null);
    setProgresso("Consultando fontes e gerando análise...");

    try {
      const response = await fetch("/api/gerar-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao gerar análise");
      setResultado(data.analise);
      setProgresso("");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-white font-bold text-xl">Scout</span>
          <span className="text-red-600 text-sm font-medium ml-2">by Kick Off Invest</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">{user?.email}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white text-sm transition-colors">
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {!resultado && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
            <h2 className="text-white font-semibold text-xl mb-6">Nova Análise Reputacional</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Franquia <span className="text-red-500">*</span></label>
                  <input name="marca" value={form.marca} onChange={handleChange} placeholder="Ex: Pure Pilates" disabled={loading} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cidade alvo <span className="text-red-500">*</span></label>
                  <input name="cidade" value={form.cidade} onChange={handleChange} placeholder="Ex: Araxá" disabled={loading} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Verba disponível</label>
                  <input name="verba" value={form.verba} onChange={handleChange} placeholder="Ex: R$ 300 mil" disabled={loading} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Segmento</label>
                  <input name="segmento" value={form.segmento} onChange={handleChange} placeholder="Ex: fitness, alimentação..." disabled={loading} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Contexto adicional</label>
                <textarea name="contexto" value={form.contexto} onChange={handleChange} placeholder="Ex: cliente já tem imóvel disponível..." disabled={loading} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none" />
              </div>
              {erro && <div className="bg-red-950 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">{erro}</div>}
              <button type="submit" disabled={loading} className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading ? (
                  <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>{progresso}</>
                ) : "Gerar Análise Scout"}
              </button>
            </form>
          </div>
        )}

        {resultado && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-2xl">{resultado.nomeCompleto}</h2>
                <p className="text-gray-400 text-sm mt-1">Análise para {form.cidade}</p>
              </div>
              <button onClick={() => setResultado(null)} className="text-gray-400 hover:text-white text-sm border border-gray-700 px-4 py-2 rounded-lg transition-colors">
                Nova consulta
              </button>
            </div>
            <div className="bg-gray-900 border border-red-900 rounded-2xl p-6">
              <p className="text-red-500 text-xs font-semibold uppercase tracking-widest mb-2">Veredito Scout</p>
              <h3 className="text-white font-bold text-xl mb-2">{resultado.veredito?.titulo}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{resultado.veredito?.descricao}</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {resultado.fatos?.map((f: any, i: number) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-1">{f.label}</p>
                  <p className="text-red-500 font-bold text-lg">{f.valor}</p>
                  <p className="text-gray-400 text-xs mt-1">{f.sub}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-green-900 rounded-xl p-5">
                <p className="text-green-500 text-xs font-semibold uppercase tracking-widest mb-3">Pontos Positivos</p>
                <ul className="space-y-2">
                  {resultado.pontosPositivos?.map((p: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-green-500 mt-0.5">✓</span>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-900 border border-red-900 rounded-xl p-5">
                <p className="text-red-500 text-xs font-semibold uppercase tracking-widest mb-3">Riscos & Atenção</p>
                <ul className="space-y-2">
                  {resultado.riscos?.map((r: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-red-500 mt-0.5">⚠</span>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">Próximos Passos</p>
              <ul className="space-y-2">
                {resultado.proximosPassos?.map((p: string, i: number) => (
                  <li key={i} className="text-gray-300 text-sm">{p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
