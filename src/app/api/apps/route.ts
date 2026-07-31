import { NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin, THUMBNAIL_BUCKET } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const CATEGORIES = ["교과", "학급운영", "창체", "연수"] as const;

const DEFAULT_THUMBNAILS = [
  "/defaults/sprout.svg",
  "/defaults/book.svg",
  "/defaults/art.svg",
  "/defaults/game.svg",
  "/defaults/math.svg",
  "/defaults/school.svg",
];

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

// Supabase Storage 공개 URL에서 버킷 내부 경로 추출 (우리 버킷 파일일 때만)
function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${THUMBNAIL_BUCKET}/`;
  const i = url.indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

async function removeStorageThumbnail(
  supabase: SupabaseClient,
  thumbnailUrl: string
) {
  const path = storagePathFromUrl(thumbnailUrl);
  if (path) {
    await supabase.storage.from(THUMBNAIL_BUCKET).remove([path]);
  }
}

async function uploadThumbnail(
  supabase: SupabaseClient,
  file: File
): Promise<{ url?: string; error?: string }> {
  if (file.size > 4 * 1024 * 1024) {
    return { error: "썸네일은 4MB 이하여야 합니다." };
  }
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `official/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, file, { contentType: file.type || "image/png" });
  if (error) {
    return { error: "썸네일 업로드에 실패했습니다: " + error.message };
  }
  return {
    url: supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(path).data
      .publicUrl,
  };
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ items: [] });

  const { data, error } = await supabase
    .from("apps")
    .select("id, title, description, thumbnail, url, category, tags")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("apps GET error:", error.message);
    return NextResponse.json({ items: [] });
  }

  const items = (data ?? []).map((row) => ({
    id: row.id,
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
  const adminPassword = process.env.ADMIN_PASSWORD_OFFICIAL;
  if (!supabase || !adminPassword) return notConfigured();

  const form = await request.formData();
  if (form.get("password") !== adminPassword) return unauthorized();

  const title = String(form.get("title") ?? "").trim();
  const url = normalizeUrl(String(form.get("url") ?? ""));
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

  let thumbnailUrl = "";
  const file = form.get("thumbnail");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadThumbnail(supabase, file);
    if (uploaded.error) {
      return NextResponse.json({ error: uploaded.error }, { status: 400 });
    }
    thumbnailUrl = uploaded.url!;
  } else {
    const defaultThumbnail = String(form.get("defaultThumbnail") ?? "");
    if (DEFAULT_THUMBNAILS.includes(defaultThumbnail)) {
      thumbnailUrl = defaultThumbnail;
    }
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

export async function PUT(request: Request) {
  const supabase = getSupabaseAdmin();
  const adminPassword = process.env.ADMIN_PASSWORD_OFFICIAL;
  if (!supabase || !adminPassword) return notConfigured();

  const form = await request.formData();
  if (form.get("password") !== adminPassword) return unauthorized();

  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "잘못된 항목 id입니다." }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("apps")
    .select("id, thumbnail")
    .eq("id", id)
    .single();
  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "항목을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const title = String(form.get("title") ?? "").trim();
  const url = normalizeUrl(String(form.get("url") ?? ""));
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

  // 썸네일 처리: 새 파일 > 기본 썸네일 선택 > 삭제 요청 > 유지
  const update: Record<string, unknown> = {
    title,
    url,
    description,
    category,
    tags,
  };
  const file = form.get("thumbnail");
  const defaultThumbnail = String(form.get("defaultThumbnail") ?? "");
  const removeThumbnail = String(form.get("removeThumbnail") ?? "") === "1";

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadThumbnail(supabase, file);
    if (uploaded.error) {
      return NextResponse.json({ error: uploaded.error }, { status: 400 });
    }
    update.thumbnail = uploaded.url!;
    await removeStorageThumbnail(supabase, existing.thumbnail ?? "");
  } else if (DEFAULT_THUMBNAILS.includes(defaultThumbnail)) {
    update.thumbnail = defaultThumbnail;
    await removeStorageThumbnail(supabase, existing.thumbnail ?? "");
  } else if (removeThumbnail) {
    update.thumbnail = "";
    await removeStorageThumbnail(supabase, existing.thumbnail ?? "");
  }

  const { error: updateError } = await supabase
    .from("apps")
    .update(update)
    .eq("id", id);

  if (updateError) {
    console.error("apps update error:", updateError.message);
    return NextResponse.json(
      { error: "수정에 실패했습니다: " + updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = getSupabaseAdmin();
  const adminPassword = process.env.ADMIN_PASSWORD_OFFICIAL;
  if (!supabase || !adminPassword) return notConfigured();

  const body = await request.json().catch(() => null);
  if (!body || body.password !== adminPassword) return unauthorized();

  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "잘못된 항목 id입니다." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("apps")
    .select("id, thumbnail")
    .eq("id", id)
    .single();

  const { error: deleteError } = await supabase
    .from("apps")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("apps delete error:", deleteError.message);
    return NextResponse.json(
      { error: "삭제에 실패했습니다: " + deleteError.message },
      { status: 500 }
    );
  }

  if (existing?.thumbnail) {
    await removeStorageThumbnail(supabase, existing.thumbnail);
  }

  return NextResponse.json({ ok: true });
}
