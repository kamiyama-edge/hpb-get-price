'use client'

/**
 * ダッシュボードページ (shadcn/ui版)
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { isAllowedEmail } from '@/lib/supabase'
import { UrlInputForm } from '@/components/UrlInputForm'
import { analyzeUrl, getHistory, checkApiHealth, deleteHistory } from '@/lib/api'
import { LogOut, History, TrendingUp, Calendar, Loader2, LayoutDashboard, Info, ChevronRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface HistoryItem {
    id: string
    created_at: string
    target_url: string
    title?: string
    salon_count: number
}

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [serverWaking, setServerWaking] = useState(false)
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // 認証チェック
    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/')
                return
            }

            // ドメインチェック
            if (!isAllowedEmail(user.email)) {
                await supabase.auth.signOut()
                router.push('/?error=unauthorized')
                return
            }

            setUser(user)
            setLoading(false)

            // 履歴を取得
            fetchHistory(user.id)
        }

        checkAuth()
    }, [router])

    // 履歴取得
    const fetchHistory = async (userId: string) => {
        try {
            const data = await getHistory(userId)
            setHistory(data || [])
        } catch (error) {
            console.log('履歴取得:', error)
            setHistory([])
        }
    }

    // 分析実行
    const handleAnalyze = async (url: string) => {
        if (!user) return

        setAnalyzing(true)

        // サーバーヘルスチェック
        const isHealthy = await checkApiHealth()
        if (!isHealthy) {
            setServerWaking(true)
        }

        try {
            const result = await analyzeUrl(user.id, { url })
            router.push(`/analysis/${result.history_id}`)
        } finally {
            setAnalyzing(false)
            setServerWaking(false)
        }
    }

    // 履歴削除
    const handleDeleteHistory = async (e: React.MouseEvent, historyId: string) => {
        e.stopPropagation() // 行のクリックイベントを防止

        if (!user) return
        if (!window.confirm('この検索履歴を削除してもよろしいですか？')) return

        setDeletingId(historyId)
        try {
            await deleteHistory(user.id, historyId)
            await fetchHistory(user.id) // リストを更新
        } catch (error) {
            console.error('履歴削除:', error)
            alert('削除に失敗しました')
        } finally {
            setDeletingId(null)
        }
    }

    // ログアウト
    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-sm border-none shadow-xl">
                    <CardHeader className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
                        <CardTitle>読み込み中</CardTitle>
                        <CardDescription>セッションをロードしています...</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ヘッダー */}
            <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container h-16 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 leading-none">ダッシュボード</h1>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">価格情報収集ツール</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/guide">
                            <Button variant="ghost" className="h-10 px-4 rounded-xl font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all gap-2">
                                <Info className="w-4 h-4" />
                                <span className="hidden sm:inline">使い方</span>
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            className="h-10 px-4 rounded-xl font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all gap-2"
                            onClick={handleSignOut}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">ログアウト</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-x-hidden">
                {/* 分析セクション - ブランドカラーの背景で強調 */}
                <section className="bg-emerald-50/40 border-b border-emerald-100/50 relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>

                    <div className="container py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 relative z-10">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                                価格情報を収集
                            </h2>
                            <p className="text-slate-600 font-medium">
                                ホットペッパービューティーの検索結果からサロンの価格情報を一括で収集します。
                            </p>
                        </div>

                        <Card className="border-none shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-100 bg-white">
                            <CardContent className="p-8">
                                <UrlInputForm
                                    onSubmit={handleAnalyze}
                                    isLoading={analyzing}
                                    serverWaking={serverWaking}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 履歴セクション - 標準的な背景でアーカイブ感を出す */}
                <section className="container py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 pb-32">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-2xl">
                                <History className="w-6 h-6 text-slate-700" />
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">検索履歴</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">収集の履歴</p>
                            </div>
                        </div>
                        {history.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="px-3 py-1 font-black bg-slate-100 text-slate-600 border-none">
                                    {history.length} <span className="ml-1 opacity-60 font-medium text-[10px]">件</span>
                                </Badge>
                            </div>
                        )}
                    </div>

                    {history.length === 0 ? (
                        <Card className="border-dashed border-2 bg-slate-50/50">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                                    <LayoutDashboard className="w-8 h-8 text-slate-300" />
                                </div>
                                <p className="text-slate-400 font-medium">まだ履歴がありません</p>
                                <p className="text-slate-400 text-sm">上のフォームから最初の分析を開始しましょう</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px] font-bold text-slate-500 py-4 pl-6 text-xs uppercase tracking-wider">分析日時</TableHead>
                                        <TableHead className="font-bold text-slate-500 py-4 text-xs uppercase tracking-wider">タイトル / URL</TableHead>
                                        <TableHead className="w-[100px] font-bold text-slate-500 py-4 text-xs uppercase tracking-wider text-right">件数</TableHead>
                                        <TableHead className="w-[100px] py-4 pr-6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="group cursor-pointer hover:bg-slate-50/50 transition-colors"
                                            onClick={() => router.push(`/analysis/${item.id}`)}
                                        >
                                            <TableCell className="py-4 pl-6">
                                                <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {new Date(item.created_at).toLocaleString('ja-JP', {
                                                        year: 'numeric', month: '2-digit', day: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                                        {item.title && item.title.length > 0
                                                            ? item.title
                                                            : new URL(item.target_url).pathname}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                                                        {item.target_url}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-bold border-none text-[11px] px-2.5 py-0.5">
                                                    {item.salon_count} <span className="text-[9px] ml-0.5 font-medium opacity-70">件</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                                        onClick={(e) => handleDeleteHistory(e, item.id)}
                                                        disabled={deletingId === item.id}
                                                    >
                                                        {deletingId === item.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all group-hover:translate-x-0.5" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    )}
                </section>
            </main>
        </div>
    )
}
