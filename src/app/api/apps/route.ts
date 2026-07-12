import { NextResponse } from "next/server";
import { getSupabaseAdmin, THUMBNAIL_BUCKET } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const CATEGORIES = ["교과", "학급운영", "창체"] as const;

// DB에 등록된 앱 id가 하드코딩 id(1~999)와 겹치지 않도록 오프셋을 둠
const DB_ID_OFFSET = 10000;

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ items: [] });

  const { data, error } = await supabase
    .from("apps")
    .select("id, title, description, thumbnail, url, category, tags")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("apps GET error:", error.message);
    return NextResponse.json({ items: [] });
  }

  const items = (data ?? []).map((row) => ({
    id: DB_ID_OFFSET + row.id,
    title: row.title,
    description: row.description ?? "",
    thumbnail: row.thumbnail ?? "",
    url: row.url,
    category: row.category,
    tags: row.tags ?? [],
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

  const adminPassword = process.env.ADMIN_PASSWORD_OFFICIAL;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "관리자 비밀번호가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  const form = await request.formData();

  if (form.get("password") !== adminPassword) {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  const title = String(form.get("title") ?? "").trim();
  const url = String(form.get("url") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const category = String(form.get("category") ?? "");
  const tags = String(form.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!title || !url) {
    return NextResponse.json(
      { error: "제목과 URL은 필수입니다." },
      { status: 400 }
    );
  }
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return NextResponse.json(
      { error: "카테고리가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  // 썸네일 업로드 (선택)
  let thumbnailUrl = "";
  const file = form.get("thumbnail");
  if (file instanceof File && file.size > 0) {
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "썸네일은 4MB 이하여야 합니다." },
        { status: 400 }
      );
    }
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `official/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(THUMBNAIL_BUCKET)
      .upload(path, file, { contentType: file.type || "image/png" });

    if (uploadError) {
      console.error("thumbnail upload error:", uploadError.message);
      return NextResponse.json(
        { error: "썸네일 업로드에 실패했습니다: " + uploadError.message },
        { status: 500 }
      );
    }
    thumbnailUrl = supabase.storage
      .from(THUMBNAIL_BUCKET)
      .getPublicUrl(path).data.publicUrl;
  }

  const { error: insertError } = await supabase.from("apps").insert({
    title,
    description,
    thumbnail: thumbnailUrl,
    url,
    category,
    tags,
  });

  if (insertError) {
    console.error("apps insert error:", insertError.message);
    return NextResponse.json(
      { error: "저장에 실패했습니다: " + insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
