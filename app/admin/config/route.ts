import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const categoria = req.nextUrl.searchParams.get("categoria") || "financeiro";

  const { data, error } = await supabase
    .from("scout_config")
    .select("*")
    .eq("categoria", categoria)
    .order("chave");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ configs: data });
}

export async function POST(req: NextRequest) {
  const { chave, valor } = await req.json();

  if (!chave || valor === undefined) {
    return NextResponse.json({ error: "chave e valor são obrigatórios" }, { status: 400 });
  }

  const { error } = await supabase
    .from("scout_config")
    .update({ valor, atualizado_em: new Date().toISOString() })
    .eq("chave", chave);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sucesso: true });
}
