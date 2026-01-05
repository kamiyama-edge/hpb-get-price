'use client'

/**
 * URL入力フォームコンポーネント (shadcn/ui版)
 */

import { useState } from 'react'
import { Search, Loader2, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Props {
    onSubmit: (url: string) => Promise<void>
    isLoading: boolean
    serverWaking?: boolean
}

export function UrlInputForm({ onSubmit, isLoading, serverWaking }: Props) {
    const [url, setUrl] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // バリデーション
        if (!url.trim()) {
            setError('URLを入力してください')
            return
        }

        if (!url.includes('hotpepper.jp')) {
            setError('ホットペッパービューティーのURLを入力してください')
            return
        }

        try {
            await onSubmit(url.trim())
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('エラーが発生しました')
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* ガイドテキストを上部に移動 */}

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Input
                        type="url"
                        placeholder="https://beauty.hotpepper.jp/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading}
                        className="h-12 pl-4 pr-10 rounded-xl transition-all"
                    />
                    {!isLoading && (
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    )}
                </div>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 px-8 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            収集中...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            収集開始
                        </>
                    )}
                </Button>
            </div>

            {/* サーバー起動中メッセージ */}
            {serverWaking && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">
                        サーバーを起動しています... 数十秒かかる場合があります
                    </span>
                </div>
            )}

            {/* エラーメッセージ */}
            {error && (
                <Alert variant="destructive" className="rounded-xl border-dashed">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>エラー</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </form>
    )
}
