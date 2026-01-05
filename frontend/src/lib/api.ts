/**
 * バックエンドAPI呼び出しユーティリティ
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface AnalyzeRequest {
    url: string
    max_pages?: number
}

export interface SalonData {
    name: string
    url: string
    blog_count: number
    review_count: number
    coupon_prices: number[]
    min_price: number | null
    max_price: number | null
    average_price: number | null
}

export interface AnalyzeResponse {
    history_id: string
    salon_count: number
    salons: SalonData[]
}

export interface HistoryItem {
    id: string
    created_at: string
    target_url: string
    title?: string
    salon_count: number
}

export interface HistoryDetail {
    id: string
    created_at: string
    target_url: string
    title?: string
    user_id: string
    raw_data: SalonData[]
}

/**
 * HPB URLを分析
 */
export async function analyzeUrl(
    userId: string,
    request: AnalyzeRequest
): Promise<AnalyzeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId,
        },
        body: JSON.stringify(request),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(error.detail || `API Error: ${response.status}`)
    }

    return response.json()
}

/**
 * 検索履歴を取得
 */
export async function getHistory(userId: string): Promise<HistoryItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/history`, {
            headers: {
                'X-User-Id': userId,
            },
        })

        if (!response.ok) {
            return []
        }

        return response.json()
    } catch {
        return []
    }
}

/**
 * 特定の履歴詳細を取得
 */
export async function getHistoryDetail(
    userId: string,
    historyId: string
): Promise<HistoryDetail> {
    const response = await fetch(`${API_BASE_URL}/api/history/${historyId}`, {
        headers: {
            'X-User-Id': userId,
        },
    })

    if (!response.ok) {
        throw new Error('履歴の取得に失敗しました')
    }

    return response.json()
}

/**
 * APIサーバーのヘルスチェック
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            // 短いタイムアウト
            signal: AbortSignal.timeout(5000),
        })
        return response.ok
    } catch {
        return false
    }
}

/**
 * 検索履歴を削除
 */
export async function deleteHistory(
    userId: string,
    historyId: string
): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/history/${historyId}`, {
        method: 'DELETE',
        headers: {
            'X-User-Id': userId,
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: '削除に失敗しました' }))
        throw new Error(error.detail || `API Error: ${response.status}`)
    }

    return true
}
