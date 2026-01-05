'use client'

/**
 * 価格帯ヒストグラム (shadcn/ui版 & ハイライト機能付)
 */

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
    Label,
} from 'recharts'
import { useMemo } from 'react'

interface SalonData {
    name: string
    url: string
    blog_count: number
    review_count: number
    coupon_prices: number[]
    min_price: number | null
    max_price: number | null
    average_price: number | null
}

interface Props {
    salons: SalonData[]
    highlightedSalon?: string | null
}

interface PriceBin {
    range: string
    count: number
    minPrice: number
    maxPrice: number
    salons: string[]
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: PriceBin }> }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="p-4 rounded-xl bg-white border shadow-2xl animate-in fade-in zoom-in duration-200">
                <p className="font-black text-slate-800 mb-2 border-b pb-1 text-sm tracking-tight">
                    {data.range}
                </p>
                <div className="flex items-center gap-2 text-lg font-black text-emerald-600 mb-3">
                    {data.count} <span className="text-xs font-bold text-slate-400">件のサロン</span>
                </div>
                {data.salons.length > 0 && (
                    <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">主なサロン</p>
                        <ul className="space-y-1">
                            {data.salons.slice(0, 4).map((name, i) => (
                                <li key={i} className="text-xs font-bold text-slate-600 truncate flex items-center gap-1.5">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400" />
                                    {name}
                                </li>
                            ))}
                            {data.salons.length > 4 && (
                                <li className="text-[10px] text-slate-300 font-bold pl-2.5">他 {data.salons.length - 4} 件...</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        )
    }
    return null
}

export function PriceHistogram({ salons, highlightedSalon }: Props) {
    const selectedSalon = highlightedSalon || 'none'

    const { histogramData, validSalons, overallAverage, maxCount } = useMemo(() => {
        const validS = salons.filter(s => s.average_price !== null)

        if (validS.length === 0) {
            return { histogramData: [], validSalons: [], overallAverage: 0, maxCount: 0 }
        }

        const pricesList = validS.map(s => s.average_price!)
        const maxPriceValue = Math.ceil(Math.max(...pricesList) / 500) * 500
        const bins: PriceBin[] = []

        for (let price = 0; price < maxPriceValue; price += 500) {
            const binMin = price
            const binMax = price + 500
            const salonInBin = validS.filter(s =>
                s.average_price! >= binMin && s.average_price! < binMax
            )

            bins.push({
                range: `¥${binMin.toLocaleString()}~`,
                count: salonInBin.length,
                minPrice: binMin,
                maxPrice: binMax,
                salons: salonInBin.map(s => s.name)
            })
        }

        const avg = validS.reduce((sum, s) => sum + s.average_price!, 0) / validS.length
        const maxC = Math.max(...bins.map(d => d.count))

        return { histogramData: bins, validSalons: validS, overallAverage: avg, maxCount: maxC }
    }, [salons])

    const highlightedBinIndex = useMemo(() => {
        if (selectedSalon === 'none') return -1
        const salon = validSalons.find(s => s.name === selectedSalon)
        if (!salon || salon.average_price === null) return -1

        return histogramData.findIndex(bin =>
            salon.average_price! >= bin.minPrice && salon.average_price! < bin.maxPrice
        )
    }, [selectedSalon, validSalons, histogramData])

    if (histogramData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400 font-medium">
                価格データがありません
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="relative px-2 sm:px-4">
                {/* Legend */}
                <div className="flex flex-wrap items-center justify-end gap-6 mb-0.5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-3.5 h-3.5 rounded-md bg-emerald-500 shadow-sm shadow-emerald-200" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">ボリューム層</span>
                    </div>
                    {selectedSalon !== 'none' && (
                        <div className="flex items-center gap-2.5">
                            <div className="w-3.5 h-3.5 rounded-md bg-amber-500 shadow-sm shadow-amber-200 animate-pulse" />
                            <span className="text-[11px] font-black text-amber-600 uppercase tracking-wider">選択中サロン</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-[2px] rounded-full bg-amber-500/40 border-b-2 border-dashed border-amber-500" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">全体平均価格</span>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={histogramData}
                        margin={{ top: 30, right: 0, bottom: 20, left: 30 }}
                    >
                        <XAxis
                            dataKey="range"
                            tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }}
                            axisLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                            tickLine={{ stroke: '#E2E8F0' }}
                            angle={-45}
                            textAnchor="end"
                            height={45}
                            interval={validSalons.length > 20 ? 1 : 0}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }}
                            axisLine={{ stroke: '#E2E8F0', strokeWidth: 1 }}
                            tickLine={{ stroke: '#E2E8F0' }}
                            width={35}
                        >
                            <Label
                                value="サロン件数 (件)"
                                position="top"
                                offset={12}
                                fill="#334155"
                                fontSize={10}
                                fontWeight={900}
                                style={{ letterSpacing: '0.05em' }}
                            />
                        </YAxis>
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: '#F1F5F9', opacity: 0.5 }}
                        />

                        {overallAverage > 0 && (
                            <ReferenceLine
                                x={`¥${(Math.floor(overallAverage / 500) * 500).toLocaleString()}~`}
                                stroke="#F59E0B"
                                strokeWidth={2}
                                strokeDasharray="8 4"
                            >
                                <Label
                                    value={`AREA AVG: ¥${Math.round(overallAverage).toLocaleString()}`}
                                    position="top"
                                    fill="#D97706"
                                    fontSize={10}
                                    fontWeight={900}
                                    offset={20}
                                    style={{ letterSpacing: '0.05em' }}
                                />
                            </ReferenceLine>
                        )}

                        <Bar
                            dataKey="count"
                            radius={[6, 6, 0, 0]}
                            animationDuration={1200}
                            animationEasing="ease-out"
                        >
                            {histogramData.map((entry, index) => {
                                let fill = '#ECFDF5'
                                if (selectedSalon !== 'none') {
                                    fill = index === highlightedBinIndex ? '#F59E0B' : '#F1F5F9'
                                } else if (entry.count === maxCount) {
                                    fill = '#10B981'
                                } else if (entry.count > 0) {
                                    fill = '#6EE7B7'
                                }

                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={fill}
                                        style={{ transition: 'fill 0.4s ease' }}
                                    />
                                )
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
