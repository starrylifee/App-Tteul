import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// 하드코딩 습작 id(1~64)와 겹치지 않도록 오프셋을 둠
const DB_ID_OFFSET = 10000;

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ items: [] });

  const { data, error } = await supabase
    .from("vibe_items")
    .select("id, title, url, description")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("vibe GET error:", error.message);
    return NextResponse.json({ items: [] });
  }

  const items = (data ?? []).map((row) => ({
    id: DB_ID_OFFSET + row.id,
    title: row.title,
    url: row.url,
    description: row.description ?? "",
  }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD_VIBE;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "관리자 비밀번호가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || body.password !== adminPassword) {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  const title = String(body.title ?? "").trim();
  let url = String(body.url ?? "").trim();
  if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
  const description = String(body.description ?? "").trim();

  if (!title || !url) {
    return NextResponse.json(
      { error: "제목과 URL은 필수입니다." },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabase.from("vibe_items").insert({
    title,
    url,
    description,
  });

  if (insertError) {
    console.error("vibe insert error:", insertError.message);
    return NextResponse.json(
      { error: "저장에 실패했습니다: " + insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
