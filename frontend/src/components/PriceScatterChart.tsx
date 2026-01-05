'use client'

/**
 * 散布図コンポーネント - 口コミ数 vs 平均価格
 */

import { useState, useCallback } from 'react'
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'
import { X, TrendingUp } from 'lucide-react'

interface SalonData {
    name: string
    review_count: number
    average_price: number | null
    prices: number[]
}

interface Props {
    salons: SalonData[]
}

// カスタムツールチップ
function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: SalonData }[] }) {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="p-4 rounded-xl animate-scale-in"
                style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-xl)'
                }}>
                <p className="font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {data.name}
                </p>
                <div className="space-y-1">
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        口コミ: <span className="font-semibold tabular-nums text-emerald-600">{data.review_count}件</span>
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        平均価格: <span className="font-semibold tabular-nums text-rose-600">¥{data.average_price?.toLocaleString()}</span>
                    </p>
                </div>
            </div>
        )
    }
    return null
}

export function PriceScatterChart({ salons }: Props) {
    const [selectedSalon, setSelectedSalon] = useState<string | null>(null)

    // グラフ用にデータを変換（平均価格がnullのものを除外）
    const chartData = salons.filter(s => s.average_price !== null)

    const handleClick = useCallback((data: SalonData) => {
        setSelectedSalon(prev => (prev === data.name ? null : data.name))
    }, [])

    const handleClear = () => {
        setSelectedSalon(null)
    }

    return (
        <div className="w-full">
            {selectedSalon && (
                <div className="mb-5 flex items-center justify-between p-4 rounded-xl animate-fade-in"
                    style={{
                        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                        border: '1px solid #6ee7b7'
                    }}>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-700" />
                        <span className="font-semibold text-emerald-900">
                            選択中: {selectedSalon}
                        </span>
                    </div>
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/50
                                 hover:bg-white transition-all text-emerald-800 font-medium text-sm"
                    >
                        <X className="w-4 h-4" />
                        解除
                    </button>
                </div>
            )}

            <div className="bg-white rounded-xl p-6 border border-gray-200">
                <ResponsiveContainer width="100%" height={450}>
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 70 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="#e7e5e4" strokeOpacity={0.5} />
                        <XAxis
                            type="number"
                            dataKey="review_count"
                            name="口コミ数"
                            label={{
                                value: '口コミ数',
                                position: 'bottom',
                                offset: 40,
                                style: { fill: '#78716c', fontWeight: 600, fontSize: 13 }
                            }}
                            tick={{ fontSize: 12, fill: '#a8a29e', fontFamily: 'DM Sans' }}
                            stroke="#d6d3d1"
                        />
                        <YAxis
                            type="number"
                            dataKey="average_price"
                            name="平均価格"
                            label={{
                                value: '平均価格 (円)',
                                angle: -90,
                                position: 'insideLeft',
                                offset: -50,
                                style: { fill: '#78716c', fontWeight: 600, fontSize: 13 }
                            }}
                            tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12, fill: '#a8a29e', fontFamily: 'DM Sans' }}
                            stroke="#d6d3d1"
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter
                            name="サロン"
                            data={chartData}
                            onClick={(data) => handleClick(data)}
                            cursor="pointer"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        selectedSalon === entry.name
                                            ? '#fb7185' // Coral: 選択中
                                            : '#10b981' // Emerald: 通常
                                    }
                                    stroke={selectedSalon === entry.name ? '#f43f5e' : '#059669'}
                                    strokeWidth={selectedSalon === entry.name ? 3 : 2}
                                    r={selectedSalon === entry.name ? 12 : 7}
                                    opacity={selectedSalon === entry.name ? 1 : 0.7}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                <p className="text-center text-sm mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
                    💡 ドットをクリックして詳細を確認
                </p>
            </div>
        </div>
    )
}
