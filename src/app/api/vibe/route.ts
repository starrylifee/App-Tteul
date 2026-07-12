import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { error: "비밀번호가 올바르지 않습니다." },
    { status: 401 }
  );
}

function notConfigured() {
  return NextResponse.json(
    { error: "서버 환경변수가 설정되지 않았습니다." },
    { status: 503 }
  );
}

function normalizeUrl(value: string): string {
  const s = value.trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : "https://" + s;
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ items: [] });

  const { data, error } = await supabase
    .from("vibe_items")
    .select("id, title, url, description")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("vibe GET error:", error.message);
    return NextResponse.json({ items: [] });
  }

  const items = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description ?? "",
  }));

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  const adminPassword = process.env.ADMIN_PASSWORD_VIBE;
  if (!supabase || !adminPassword) return notConfigured();

  const body = await request.json().catch(() => null);
  if (!body || body.password !== adminPassword) return unauthorized();

  const title = String(body.title ?? "").trim();
  const url = normalizeUrl(String(body.url ?? ""));
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

export async function PUT(request: Request) {
  const supabase = getSupabaseAdmin();
  const adminPassword = process.env.ADMIN_PASSWORD_VIBE;
  if (!supabase || !adminPassword) return notConfigured();

  const body = await request.json().catch(() => null);
  if (!body || body.password !== adminPassword) return unauthorized();

  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "잘못된 항목 id입니다." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const url = normalizeUrl(String(body.url ?? ""));
  const description = String(body.description ?? "").trim();

  if (!title || !url) {
    return NextResponse.json(
      { error: "제목과 URL은 필수입니다." },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("vibe_items")
    .update({ title, url, description })
    .eq("id", id);

  if (updateError) {
    console.error("vibe update error:", updateError.message);
    return NextResponse.json(
      { error: "수정에 실패했습니다: " + updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = getSupabaseAdmin();
  const adminPassword = process.env.ADMIN_PASSWORD_VIBE;
  if (!supabase || !adminPassword) return notConfigured();

  const body = await request.json().catch(() => null);
  if (!body || body.password !== adminPassword) return unauthorized();

  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "잘못된 항목 id입니다." }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from("vibe_items")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("vibe delete error:", deleteError.message);
    return NextResponse.json(
      { error: "삭제에 실패했습니다: " + deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
