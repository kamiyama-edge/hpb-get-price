'use client'

/**
 * 分析詳細ページ (shadcn/ui版)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { isAllowedEmail } from '@/lib/supabase'
import { getHistoryDetail } from '@/lib/api'
import type { HistoryDetail } from '@/lib/api'
import { PriceHistogram } from '@/components/PriceHistogram'
import { SalonDataTable } from '@/components/SalonDataTable'
import { ArrowLeft, BarChart3, Table, Loader2, ExternalLink, TrendingUp, Calendar } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"
import { Separator } from '@/components/ui/separator'

export default function AnalysisPage() {
    const router = useRouter()
    const params = useParams()
    const historyId = params.id as string

    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<HistoryDetail | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [highlightedSalon, setHighlightedSalon] = useState<string | null>(null)

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/')
                return
            }

            if (!isAllowedEmail(user.email)) {
                await supabase.auth.signOut()
                router.push('/?error=unauthorized')
                return
            }

            try {
                const historyData = await getHistoryDetail(user.id, historyId)
                setData(historyData)
            } catch (err) {
                console.error('Fetch error:', err)
                setError('データの取得に失敗しました')
            } finally {
                setLoading(false)
            }
        }

        checkAuthAndFetchData()
    }, [router, historyId])

    const salonsWithRank = useMemo(() => {
        if (!data) return []
        return data.raw_data.map((salon: any, index: number) => ({
            ...salon,
            rank: index + 1
        }))
    }, [data])

    const handleSalonClick = useCallback((name: string | null) => {
        if (name === null) {
            setHighlightedSalon(null)
        } else {
            setHighlightedSalon(prev => (prev === name ? null : name))
        }
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-emerald-600">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p className="font-bold text-slate-500">データを読み込み中...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-destructive/20 border-2">
                    <CardHeader className="text-center">
                        <CardTitle className="text-red-600">エラーが発生しました</CardTitle>
                        <CardDescription>{error || 'データが見つかりません'}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> ダッシュボードに戻る
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ヘッダー */}
            <Tabs defaultValue="chart" className="w-full">
                <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
                    <div className="container px-4 sm:px-8 max-w-7xl mx-auto">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/dashboard')}
                                    className="h-9 hover:bg-slate-100 font-bold text-slate-600"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> 戻る
                                </Button>
                                <Separator orientation="vertical" className="h-4 bg-slate-200" />
                                <div className="flex items-center gap-2 font-bold text-lg text-emerald-600">
                                    <TrendingUp className="w-5 h-5" />
                                    <span className="hidden sm:inline">分析結果</span>
                                </div>
                            </div>
                            <div />
                        </div>
                    </div>
                </header>

                <main className="container pt-6 pb-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
                    {/* ページタイトル情報セクション */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="flex flex-col gap-4 flex-1">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {data.created_at && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 ml-2">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{new Date(data.created_at).toLocaleString('ja-JP')}</span>
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
                                    {data.title && data.title.length > 0
                                        ? data.title
                                        : new URL(data.target_url).pathname}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
                                <a
                                    href={data.target_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 group"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500" />
                                    <span className="text-xs font-bold">元のページで確認</span>
                                </a>
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-black px-3 py-1.5 border-none shadow-sm text-xs">
                                    {data.raw_data.length} 件のサロンを収集済み
                                </Badge>
                            </div>
                        </div>

                        <TabsList className="bg-white p-1 border border-slate-200 shadow-sm rounded-xl h-11 shrink-0 self-start sm:self-end">
                            <TabsTrigger value="chart" className="rounded-lg px-6 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                                <BarChart3 className="mr-2 h-4 w-4" /> グラフ
                            </TabsTrigger>
                            <TabsTrigger value="table" className="rounded-lg px-6 font-bold data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                                <Table className="mr-2 h-4 w-4" /> テーブル
                            </TabsTrigger>
                        </TabsList>
                    </div>


                    <TabsContent value="chart" className="m-0 space-y-6">
                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white ring-1 ring-slate-200 overflow-hidden">
                            <CardHeader className="border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6">
                                <div className="space-y-0.5">
                                    <CardTitle className="text-xl font-black text-slate-800 tracking-tight">価格帯ヒストグラム</CardTitle>
                                    <CardDescription className="font-bold text-sm text-slate-400">価格ボリューム層と平均価格を可視化</CardDescription>
                                </div>

                                <div className="flex items-center gap-3 self-auto">
                                    <label className="text-sm font-bold text-slate-500 whitespace-nowrap">
                                        サロンを絞り込む
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={highlightedSalon || 'none'}
                                            onValueChange={(val) => handleSalonClick(val === 'none' ? null : val)}
                                        >
                                            <SelectTrigger className="h-9 w-[210px] sm:w-[260px] bg-white border-slate-200 rounded-lg shadow-sm font-bold text-slate-700 focus:ring-emerald-500 text-sm">
                                                <SelectValue placeholder="サロンを選択" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px] rounded-xl shadow-2xl border-slate-200">
                                                <SelectItem value="none" className="font-bold text-slate-400 text-sm">選択解除</SelectItem>
                                                {salonsWithRank
                                                    .filter((s: any) => s.average_price && s.average_price > 0)
                                                    .sort((a: any, b: any) => (a.average_price || 0) - (b.average_price || 0))
                                                    .map((s: any, i: number) => (
                                                        <SelectItem key={i} value={s.name} className="font-bold text-slate-700 text-sm">
                                                            {s.name} <span className="text-[10px] text-slate-400 ml-1 font-black">¥{(s.average_price || 0).toLocaleString()}</span>
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>

                                        {highlightedSalon && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleSalonClick(null)}
                                                className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 bg-white overflow-x-auto">
                                <div className="min-w-[500px]">
                                    <PriceHistogram
                                        salons={salonsWithRank}
                                        highlightedSalon={highlightedSalon}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="table" className="m-0">
                        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white ring-1 ring-slate-200 overflow-hidden">
                            <CardContent className="p-0">
                                <SalonDataTable
                                    salons={salonsWithRank}
                                    highlightedSalon={highlightedSalon}
                                    onSalonClick={handleSalonClick}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </main>
            </Tabs>
        </div>
    )
}
