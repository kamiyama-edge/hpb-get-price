import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAllowedEmail } from '@/lib/supabase'

/**
 * 認証ミドルウェア
 * - セッションチェック
 * - ドメイン制限
 * - 未認証時リダイレクト
 */
export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // セッション確認
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 保護されたルート
    const protectedPaths = ['/dashboard', '/analysis']
    const isProtectedPath = protectedPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath) {
        if (!user) {
            // 未認証 → ログインページへ
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/'
            return NextResponse.redirect(redirectUrl)
        }

        // ドメインチェック
        if (!isAllowedEmail(user.email)) {
            // 許可されていないドメイン → ログアウト＆リダイレクト
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = '/'
            redirectUrl.searchParams.set('error', 'unauthorized')
            return NextResponse.redirect(redirectUrl)
        }
    }

    // 認証済みでルートページにアクセス → ダッシュボードへ
    if (request.nextUrl.pathname === '/' && user && isAllowedEmail(user.email)) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * 以下を除くすべてのリクエストパスにマッチ:
         * - _next/static (静的ファイル)
         * - _next/image (画像最適化ファイル)
         * - favicon.ico (ファビコン)
         * - 画像・動画などの静的アセット
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
