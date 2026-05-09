import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    "[supabase] 환경변수가 설정되지 않았습니다. .env.local을 확인하세요."
  );
}

export const supabase =
  url && key ? createClient(url, key) : null;
