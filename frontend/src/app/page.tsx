import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { isAllowedEmail } from '@/lib/supabase'
import { LoginButton } from '@/components/LoginButton'
import { TrendingUp, BarChart3, Search, Sparkles, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

/**
 * ルートページ (shadcn/ui版)
 */
export default async function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#F8FAFC]">

      {/* Modern blurred background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-6xl w-full grid lg:grid-cols-2 gap-20 items-center">
        {/* Left: Hero content */}
        <div className="text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Exclusive for Edge-i
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              HPB Price <br />
              <span className="text-emerald-600">Analyzer</span>
            </h1>
            <p className="text-lg lg:text-xl font-medium text-slate-500 max-w-lg leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
              ホットペッパービューティーの市場価格を瞬時に分析。
              競合サロンの価格帯とトレンドを、高品質なチャートで可視化します。
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            {[
              "エリア内全サロンの平均価格を自動算出",
              "500円刻みのヒストグラムでボリューム層を特定",
              "ブログ数・口コミ数と価格の相関をチェック"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-emerald-100 p-0.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-slate-600">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login card */}
        <div className="flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-700 delay-400">
          <div className="w-full max-w-md p-10 rounded-[32px] bg-white border border-slate-200 shadow-2xl shadow-emerald-900/10 relative overflow-hidden group">
            {/* Soft decorative ring inside */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-50 rounded-full transition-transform group-hover:scale-150 duration-700"></div>

            <div className="relative z-10 text-center space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-[24px] bg-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-200 ring-8 ring-emerald-50">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    WELCOME BACK
                  </h2>
                  <p className="text-sm font-bold text-slate-400 mt-1">
                    分析を開始するにはログインしてください
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <LoginButton />

                <div className="flex items-center gap-4 px-2">
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Workspace Only</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed text-center">
                    ※ 本ツールは <span className="text-emerald-600">@edge-i.jp</span> ドメインを <br />
                    所有するアカウントのみ利用可能です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
