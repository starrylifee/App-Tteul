// 관리자 기능(등록/수정 폼)에서 함께 쓰는 클라이언트 헬퍼

export const DEFAULT_THUMBNAILS = [
  { path: "/defaults/sprout.svg", label: "새싹" },
  { path: "/defaults/book.svg", label: "책" },
  { path: "/defaults/art.svg", label: "미술" },
  { path: "/defaults/game.svg", label: "게임" },
  { path: "/defaults/math.svg", label: "수학" },
  { path: "/defaults/school.svg", label: "학교" },
];

// "www.naver.com"처럼 입력해도 https://를 자동으로 붙임
export function normalizeUrl(value: string): string {
  const s = value.trim();
  if (!s) return s;
  return /^https?:\/\//i.test(s) ? s : "https://" + s;
}

// 큰 이미지는 업로드 전에 브라우저에서 자동으로 줄임
// 카드 표시 크기의 2배(레티나 대응)면 충분하므로 800px + webp 압축
const MAX_THUMB_DIM = 800;
const WEBP_QUALITY = 0.8;

export async function resizeImage(
  file: File
): Promise<{ blob: Blob; name: string }> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return { blob: file, name: file.name };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_THUMB_DIM / Math.max(bitmap.width, bitmap.height)
    );
    if (scale === 1 && file.size <= 300 * 1024) {
      return { blob: file, name: file.name };
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return { blob: file, name: file.name };
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
    );
    if (!blob) return { blob: file, name: file.name };
    return { blob, name: file.name.replace(/\.[^.]+$/, "") + ".webp" };
  } catch {
    return { blob: file, name: file.name };
  }
}

export const ADMIN_SESSION_KEYS = {
  official: "apptteul_admin_official",
  vibe: "apptteul_admin_vibe",
} as const;
