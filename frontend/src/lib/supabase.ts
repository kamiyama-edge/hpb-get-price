/**
 * Supabaseクライアント初期化
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 許可されたドメイン
export const ALLOWED_DOMAIN = '@edge-i.jp'

/**
 * ドメインチェック
 */
export function isAllowedEmail(email: string | undefined): boolean {
  if (!email) return false
  return email.endsWith(ALLOWED_DOMAIN)
}
