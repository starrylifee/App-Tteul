import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 등록 폼 진입 전 비밀번호 확인
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const type = body?.type;
  const password = body?.password;

  const expected =
    type === "official"
      ? process.env.ADMIN_PASSWORD_OFFICIAL
      : type === "vibe"
        ? process.env.ADMIN_PASSWORD_VIBE
        : undefined;

  if (!expected) {
    return NextResponse.json(
      { error: "서버 환경변수가 설정되지 않았습니다." },
      { status: 503 }
    );
  }

  if (password !== expected) {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
