'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    ArrowLeft,
    Search,
    BarChart3,
    Zap,
    CheckCircle2,
    MousePointer2,
    LayoutDashboard
} from 'lucide-react'

export default function GuidePage() {
    const steps = [
        {
            title: "ホットペッパービューティーで検索",
            description: "分析したいエリアやジャンルの「サロン一覧ページ」のURLをコピーします。",
            icon: Search,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "URLを貼り付けて分析開始",
            description: "ダッシュボードの入力フォームにURLを貼り付け、「分析開始」をクリックします。",
            icon: MousePointer2,
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        },
        {
            title: "結果を確認・比較",
            description: "生成されたヒストグラムや一覧テーブルを使用して、市場価格を分析します。",
            icon: BarChart3,
            color: "text-amber-500",
            bg: "bg-amber-50"
        }
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container h-16 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-slate-200 transition-colors">
                            <ArrowLeft className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="font-bold text-slate-800">ダッシュボードへ戻る</span>
                    </Link>
                </div>
            </header>

            <main className="container py-12 px-4 sm:px-8 max-w-4xl mx-auto space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">使い方ガイド</h1>
                    <p className="text-lg text-slate-500 font-medium">
                        HPB Price Analyzer を最大限に活用するためのステップを紹介します。
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid gap-6">
                    {steps.map((step, index) => (
                        <Card key={index} className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
                            <div className="flex flex-col sm:flex-row">
                                <div className={`sm:w-32 py-8 flex items-center justify-center ${step.bg}`}>
                                    <step.icon className={`w-10 h-10 ${step.color}`} />
                                </div>
                                <CardContent className="p-8 flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <h2 className="text-xl font-black text-slate-800">{step.title}</h2>
                                    </div>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        {step.description}
                                    </p>
                                </CardContent>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Technical Features */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                        主な機能
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { title: "全件自動取得", desc: "ページネーションを自動で巡回し、エリア内の全サロンを網羅します。" },
                            { title: "価格ヒストグラム", desc: "500円刻みのグラフで、どの価格帯が最も多いか一目で分かります。" },
                            { title: "競合詳細比較", desc: "ブログ投稿数や口コミ数と価格の相関をテーブルで詳細に比較できます。" },
                            { title: "履歴保存", desc: "過去の分析結果は自動的に保存され、いつでも再確認可能です。" }
                        ].map((feature, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <h3 className="font-bold text-slate-800">{feature.title}</h3>
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Call to Action */}
                <div className="bg-emerald-600 rounded-[32px] p-10 text-center space-y-6 shadow-xl shadow-emerald-200">
                    <h2 className="text-2xl font-black text-white">準備はできましたか？</h2>
                    <p className="text-emerald-50 font-medium max-w-md mx-auto">
                        今すぐ気になるエリアの分析を始めて、競合優位性を築きましょう。
                    </p>
                    <Link href="/dashboard" className="inline-block">
                        <Button className="h-14 px-10 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 font-black shadow-lg transition-transform active:scale-95">
                            <LayoutDashboard className="mr-2 h-5 w-5" />
                            分析を始める
                        </Button>
                    </Link>
                </div>
            </main>

            {/* Footer space */}
            <div className="h-20"></div>
        </div>
    )
}
