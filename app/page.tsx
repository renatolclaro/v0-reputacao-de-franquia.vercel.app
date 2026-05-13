"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({ marca: "", cidade: "", segmento: "", contexto: "" });
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErro("");
    setSucesso(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.marca.trim() || !form.cidade.trim()) {
      setErro("Preencha ao menos a marca e a cidade.");
      return;
    }
    setLoading(true);
    setErro("");
    setSucesso(false);
    setProgresso("Gerando análise com IA...");

    try {
      const response = await fetch("/api/gerar-pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao gerar análise");
      }

      setProgresso("Análise gerada! Baixando PPTX...");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${form.marca}_${form.cidade}_Analise.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSucesso(true);
      setProgresso("Download iniciado!");
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Análise Reputacional de Franquias</h1>
          <p className="text-gray-400 mt-2">Kick Off Invest · Gere relatórios PPTX com inteligência artificial</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Franquia <span className="text-red-500">*</span>
                </label>
                <input
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                  placeholder="Ex: Pure Pilates"
                  disabled={loading}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cidade alvo <span className="text-red-500">*</span>
                </label>
                <input
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  placeholder="Ex: Araxá"
                  disabled={loading}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Segmento (opcional)</label>
              <input
                name="segmento"
                value={form.segmento}
                onChange={handleChange}
                placeholder="Ex: fitness, alimentação, educação..."
                disabled={loading}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contexto adicional (opcional)</label>
              <textarea
                name="contexto"
                value={form.contexto}
                onChange={handleChange}
                placeholder="Ex: cliente tem R$ 300 mil, prefere mercados menores..."
                disabled={loading}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              />
            </div>

            {erro && (
              <div className="bg-red-950 border border-red-800 rounded-lg px-4 py-3 text-red-300 text-sm">{erro}</div>
            )}

            {sucesso && (
              <div className="bg-green-950 border border-green-800 rounded-lg px-4 py-3 text-green-300 text-sm">
                ✔ Download iniciado! Verifique sua pasta de downloads.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {progresso}
                </>
              ) : (
                "Gerar Análise + Download PPTX"
              )}
            </button>
          </form>

          <p className="text-xs text-gray-600 mt-4 text-center">
            A geração leva entre 30 e 60 segundos. O arquivo será baixado automaticamente.
          </p>
        </div>
      </div>
    </main>
  );
}