/**
 * APIユーティリティのテスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'


// fetch をモック
const mockFetch = vi.fn()
global.fetch = mockFetch

// 動的インポートでモックを適用
const { analyzeUrl, getHistory, getHistoryDetail, checkApiHealth } = await import('@/lib/api')


describe('analyzeUrl', () => {
    beforeEach(() => {
        mockFetch.mockReset()
    })

    it('正常なレスポンスを返す', async () => {
        const mockResponse = {
            history_id: 'test-id',
            salon_count: 5,
            salons: []
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        })

        const result = await analyzeUrl('user-id', { url: 'https://beauty.hotpepper.jp/test' })

        expect(result).toEqual(mockResponse)
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/analyze'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'X-User-Id': 'user-id'
                })
            })
        )
    })

    it('エラーレスポンスでエラーをスロー', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: () => Promise.resolve({ detail: 'Bad Request' })
        })

        await expect(
            analyzeUrl('user-id', { url: 'https://example.com' })
        ).rejects.toThrow('Bad Request')
    })
})


describe('getHistory', () => {
    beforeEach(() => {
        mockFetch.mockReset()
    })

    it('履歴リストを返す', async () => {
        const mockHistory = [
            { id: '1', created_at: '2026-01-01', target_url: 'url1', salon_count: 10 }
        ]
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockHistory)
        })

        const result = await getHistory('user-id')

        expect(result).toEqual(mockHistory)
    })
})


describe('getHistoryDetail', () => {
    beforeEach(() => {
        mockFetch.mockReset()
    })

    it('履歴詳細を返す', async () => {
        const mockDetail = {
            id: 'history-1',
            created_at: '2026-01-01',
            target_url: 'url',
            user_id: 'user-id',
            raw_data: []
        }
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockDetail)
        })

        const result = await getHistoryDetail('user-id', 'history-1')

        expect(result).toEqual(mockDetail)
    })
})


describe('checkApiHealth', () => {
    beforeEach(() => {
        mockFetch.mockReset()
    })

    it('ヘルスチェック成功時はtrueを返す', async () => {
        mockFetch.mockResolvedValueOnce({ ok: true })

        const result = await checkApiHealth()

        expect(result).toBe(true)
    })

    it('ヘルスチェック失敗時はfalseを返す', async () => {
        mockFetch.mockResolvedValueOnce({ ok: false })

        const result = await checkApiHealth()

        expect(result).toBe(false)
    })

    it('ネットワークエラー時はfalseを返す', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network Error'))

        const result = await checkApiHealth()

        expect(result).toBe(false)
    })
})
