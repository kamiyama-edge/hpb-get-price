'use client'

/**
 * サロンデータテーブル (shadcn/ui版)
 */

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, FilterX, ArrowUpDown } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface SalonData {
    name: string
    url: string
    blog_count: number
    review_count: number
    coupon_prices: number[]
    min_price: number | null
    max_price: number | null
    average_price: number | null
    rank?: number
}

interface Props {
    salons: SalonData[]
    highlightedSalon?: string | null
    onSalonClick?: (name: string | null) => void
}

type SortKey = 'rank' | 'name' | 'blog_count' | 'review_count' | 'min_price' | 'max_price' | 'average_price'
type SortOrder = 'asc' | 'desc'

/**
 * ソートボタンコンポーネント
 */
interface SortBtnProps {
    columnKey: SortKey
    label: string
    currentSortKey: SortKey
    currentSortOrder: SortOrder
    onSort: (key: SortKey) => void
    align?: "left" | "right"
}

function SortBtn({ columnKey, label, currentSortKey, currentSortOrder, onSort, align = "left" }: SortBtnProps) {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort(columnKey)}
            className={`h-8 font-black text-xs uppercase tracking-wider px-2 -ml-2 transition-colors
                       ${columnKey === 'average_price' ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-600 hover:text-slate-900'}
                       ${align === "right" ? "justify-end w-full" : "justify-start"}`}
        >
            {label}
            {currentSortKey === columnKey ? (
                currentSortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3 text-emerald-600" /> : <ChevronDown className="ml-1 h-3 w-3 text-emerald-600" />
            ) : (
                <ArrowUpDown className="ml-1 h-3 w-3 opacity-20" />
            )}
        </Button>
    )
}

export function SalonDataTable({ salons, highlightedSalon, onSalonClick }: Props) {
    const [sortKey, setSortKey] = useState<SortKey>('rank')
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

    const filteredAndSortedSalons = useMemo(() => {
        const result = [...salons]


        result.sort((a, b) => {
            let comparison = 0
            switch (sortKey) {
                case 'rank':
                    comparison = (a.rank ?? 999) - (b.rank ?? 999)
                    break
                case 'name':
                    comparison = a.name.localeCompare(b.name, 'ja')
                    break
                case 'blog_count':
                    comparison = a.blog_count - b.blog_count
                    break
                case 'review_count':
                    comparison = a.review_count - b.review_count
                    break
                case 'min_price':
                    comparison = (a.min_price ?? Infinity) - (b.min_price ?? Infinity)
                    break
                case 'max_price':
                    comparison = (a.max_price ?? Infinity) - (b.max_price ?? Infinity)
                    break
                case 'average_price':
                    comparison = (a.average_price ?? Infinity) - (b.average_price ?? Infinity)
                    break
            }
            return sortOrder === 'asc' ? comparison : -comparison
        })

        return result
    }, [salons, sortKey, sortOrder])

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortOrder((key === 'name' || key === 'rank') ? 'asc' : 'desc')
        }
    }

    return (
        <div className="w-full">

            <div className="bg-white">
                <Table>
                    <TableHeader className="bg-white">
                        <TableRow className="hover:bg-transparent border-b border-slate-200">
                            <TableHead className="py-2 pl-6 w-[80px]">
                                <SortBtn columnKey="rank" label="順位" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="py-2 pl-2">
                                <SortBtn columnKey="name" label="サロン名" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="text-right py-2 w-[100px]">
                                <SortBtn columnKey="blog_count" label="ブログ" align="right" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="text-right py-2 w-[100px]">
                                <SortBtn columnKey="review_count" label="口コミ" align="right" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="text-right py-2 w-[120px]">
                                <SortBtn columnKey="min_price" label="最低価格" align="right" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="text-right py-2 w-[120px]">
                                <SortBtn columnKey="max_price" label="最高価格" align="right" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            </TableHead>
                            <TableHead className="text-right py-2 w-[120px]">
                                <SortBtn columnKey="average_price" label="平均価格" align="right" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {salons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                                        <FilterX className="w-8 h-8 opacity-20" />
                                        <p className="font-bold">一致するサロンが見つかりません</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedSalons.map((salon, index) => {
                                const isHighlighted = highlightedSalon === salon.name

                                return (
                                    <TableRow
                                        key={index}
                                        onClick={() => {
                                            onSalonClick?.(salon.name)
                                            window.open(salon.url, '_blank')
                                        }}
                                        className={`cursor-pointer transition-all border-slate-50 hover:bg-slate-50/80 
                                                  ${isHighlighted ? 'bg-emerald-50/80 hover:bg-emerald-50 ring-1 ring-inset ring-emerald-200 shadow-sm z-10' : ''}`}
                                    >
                                        <TableCell className="pl-6 w-[80px]">
                                            <span className="text-xs font-bold text-slate-600 tabular-nums">
                                                {salon.rank}
                                            </span>
                                        </TableCell>
                                        <TableCell className="pl-2 max-w-[200px] sm:max-w-none">
                                            <span className={`text-sm font-bold truncate ${isHighlighted ? 'text-emerald-900' : 'text-slate-800'}`}>
                                                {salon.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-600 tabular-nums text-sm">
                                            {salon.blog_count}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-slate-600 tabular-nums text-sm">
                                            {salon.review_count}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-sm font-bold text-slate-600 tabular-nums">
                                                {salon.min_price
                                                    ? `¥${salon.min_price.toLocaleString()}`
                                                    : '-'
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-sm font-bold text-slate-600 tabular-nums">
                                                {salon.max_price
                                                    ? `¥${salon.max_price.toLocaleString()}`
                                                    : '-'
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <span className="text-sm font-black text-emerald-600 tabular-nums">
                                                {salon.average_price
                                                    ? `¥${salon.average_price.toLocaleString()}`
                                                    : '-'
                                                }
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* ページネーションフッター（現在は件数のみ） */}
            <div className="flex items-center justify-end px-6 py-4 bg-slate-50/30 text-xs font-bold text-slate-400 border-t border-slate-100">
                表示件数: {salons.length}件
            </div>
        </div>
    )
}
