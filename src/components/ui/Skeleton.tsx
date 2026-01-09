import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    animation?: 'pulse' | 'wave' | 'none'
    style?: React.CSSProperties
}

export function Skeleton({
    className,
    variant = 'rectangular',
    animation = 'pulse',
    style
}: SkeletonProps) {
    const baseClasses = cn(
        'bg-gray-200 dark:bg-gray-700',
        {
            'rounded-full': variant === 'circular',
            'rounded-md': variant === 'rectangular',
            'rounded h-4': variant === 'text',
        },
        {
            'animate-pulse': animation === 'pulse',
            'skeleton-wave': animation === 'wave',
        },
        className
    )

    if (animation === 'wave') {
        return (
            <div className={cn(baseClasses, 'relative overflow-hidden')} style={style}>
                <motion.div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
                    animate={{
                        translateX: ['100%', '100%']
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                />
            </div>
        )
    }

    return <div className={baseClasses} style={style} />
}

// Preset skeleton patterns
export function ProductCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-300 dark:border-gray-700 shadow-md">
            <Skeleton className="aspect-square w-full mb-3 rounded-lg" />
            <Skeleton variant="text" className="w-3/4 mb-2" />
            <Skeleton variant="text" className="w-1/2 mb-3" />
            <Skeleton variant="text" className="w-1/3" />
        </div>
    )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-gray-100 dark:border-gray-700">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <Skeleton variant="text" className={cn(
                        i === 0 && 'w-3/4',
                        i === 1 && 'w-1/2',
                        i === 2 && 'w-2/3',
                        i === 3 && 'w-1/3',
                        i === 4 && 'w-1/4',
                    )} />
                </td>
            ))}
        </tr>
    )
}

export function ClientCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700 p-6">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700" />
            <div className="pl-3 space-y-3">
                <Skeleton variant="text" className="w-2/3 h-5" />
                <Skeleton variant="text" className="w-1/3 h-4" />
                <div className="space-y-2 mt-4">
                    <Skeleton variant="text" className="w-full" />
                    <Skeleton variant="text" className="w-3/4" />
                    <Skeleton variant="text" className="w-5/6" />
                </div>
            </div>
        </div>
    )
}

export function DashboardStatSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-1/3" />
                    <Skeleton variant="text" className="w-2/3 h-7" />
                </div>
            </div>
        </div>
    )
}

export function DashboardHeroSkeleton() {
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl shadow-2xl border border-slate-800/50">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] opacity-50" />
            <div className="relative z-10 p-6 md:p-8">
                <div className="flex gap-3 mb-4">
                    <Skeleton className="h-8 w-48 rounded-full bg-white/10" />
                    <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
                </div>
                <Skeleton className="h-12 w-3/4 mb-3 bg-white/10" />
                <Skeleton className="h-6 w-2/3 bg-white/10" />
            </div>
        </div>
    )
}

export function DashboardChartSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700 shadow-md">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-2">
                    <Skeleton variant="text" className="h-6 w-40" />
                    <Skeleton variant="text" className="h-4 w-32" />
                </div>
                <Skeleton variant="circular" className="w-10 h-10" />
            </div>
            <div className="space-y-4">
                {/* Simulated chart bars */}
                <div className="flex items-end justify-between h-[250px] gap-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="flex-1 rounded-t-lg"
                            style={{ height: `${Math.random() * 60 + 40}%` }}
                        />
                    ))}
                </div>
                {/* X-axis labels */}
                <div className="flex justify-between px-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} variant="text" className="w-8" />
                    ))}
                </div>
            </div>
        </div>
    )
}

export function DashboardTopProductsSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 shadow-md h-[420px] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
                <Skeleton variant="text" className="h-6 w-40" />
            </div>
            <div className="flex-1 p-6 space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3 flex-1">
                                <Skeleton variant="circular" className="w-6 h-6" />
                                <Skeleton variant="text" className="w-1/3" />
                            </div>
                            <Skeleton variant="text" className="w-20" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function DashboardQuickActionSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton variant="text" className="w-20 h-3" />
                    <Skeleton variant="text" className="w-32 h-6" />
                </div>
                <Skeleton variant="circular" className="w-12 h-12" />
            </div>
        </div>
    )
}

