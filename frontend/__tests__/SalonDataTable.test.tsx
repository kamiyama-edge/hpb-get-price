/**
 * SalonDataTableコンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SalonDataTable } from '@/components/SalonDataTable'


const mockSalons = [
    { name: 'サロンA', review_count: 100, average_price: 5000, prices: [5000] },
    { name: 'サロンB', review_count: 50, average_price: 8000, prices: [8000] },
    { name: 'サロンC', review_count: 200, average_price: 3000, prices: [3000] },
]


describe('SalonDataTable', () => {
    it('すべてのサロンが表示される', () => {
        render(<SalonDataTable salons={mockSalons} />)

        expect(screen.getByText('サロンA')).toBeInTheDocument()
        expect(screen.getByText('サロンB')).toBeInTheDocument()
        expect(screen.getByText('サロンC')).toBeInTheDocument()
    })

    it('価格が正しくフォーマットされる', () => {
        render(<SalonDataTable salons={mockSalons} />)

        expect(screen.getByText('¥5,000')).toBeInTheDocument()
        expect(screen.getByText('¥8,000')).toBeInTheDocument()
    })

    it('口コミ数が表示される', () => {
        render(<SalonDataTable salons={mockSalons} />)

        expect(screen.getByText('100件')).toBeInTheDocument()
        expect(screen.getByText('50件')).toBeInTheDocument()
    })

    it('フィルターで絞り込みができる', () => {
        render(<SalonDataTable salons={mockSalons} />)

        const input = screen.getByPlaceholderText('サロン名で検索...')
        fireEvent.change(input, { target: { value: 'サロンA' } })

        expect(screen.getByText('サロンA')).toBeInTheDocument()
        expect(screen.queryByText('サロンB')).not.toBeInTheDocument()
        expect(screen.queryByText('サロンC')).not.toBeInTheDocument()
    })

    it('件数表示が正しい', () => {
        render(<SalonDataTable salons={mockSalons} />)

        expect(screen.getByText('3件 / 全3件')).toBeInTheDocument()
    })

    it('フィルター後の件数表示が更新される', () => {
        render(<SalonDataTable salons={mockSalons} />)

        const input = screen.getByPlaceholderText('サロン名で検索...')
        fireEvent.change(input, { target: { value: 'サロンA' } })

        expect(screen.getByText('1件 / 全3件')).toBeInTheDocument()
    })

    it('サロンクリック時にコールバックが呼ばれる', () => {
        const mockOnClick = vi.fn()
        render(<SalonDataTable salons={mockSalons} onSalonClick={mockOnClick} />)

        fireEvent.click(screen.getByText('サロンA'))

        expect(mockOnClick).toHaveBeenCalledWith('サロンA')
    })

    it('ハイライトされたサロンがスタイル変更される', () => {
        render(<SalonDataTable salons={mockSalons} highlightedSalon="サロンA" />)

        const salonARow = screen.getByText('サロンA').closest('tr')
        expect(salonARow).toHaveClass('bg-red-50')
    })
})
