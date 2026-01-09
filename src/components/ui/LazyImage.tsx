import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LazyImageProps {
    src: string
    alt: string
    className?: string
    placeholderClassName?: string
    fallback?: React.ReactNode
    aspectRatio?: string
    onLoad?: () => void
    onError?: () => void
}

export function LazyImage({
    src,
    alt,
    className,
    placeholderClassName,
    fallback,
    aspectRatio = 'aspect-square',
    onLoad,
    onError,
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const [hasError, setHasError] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true)
                        observer.disconnect()
                    }
                })
            },
            {
                rootMargin: '50px', // Start loading 50px before element enters viewport
                threshold: 0.01,
            }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [])

    // Handle image load
    useEffect(() => {
        if (!isInView || !imgRef.current) return

        const img = imgRef.current

        const handleLoad = () => {
            setIsLoaded(true)
            onLoad?.()
        }

        const handleError = () => {
            setHasError(true)
            onError?.()
        }

        if (img.complete) {
            handleLoad()
        } else {
            img.addEventListener('load', handleLoad)
            img.addEventListener('error', handleError)
        }

        return () => {
            img.removeEventListener('load', handleLoad)
            img.removeEventListener('error', handleError)
        }
    }, [isInView, onLoad, onError])

    return (
        <div
            ref={containerRef}
            className={cn('relative overflow-hidden bg-gray-100 dark:bg-gray-700', aspectRatio, placeholderClassName)}
        >
            <AnimatePresence mode="wait">
                {hasError ? (
                    // Fallback UI when image fails to load
                    <motion.div
                        key="fallback"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600"
                    >
                        {fallback || (
                            <svg className="w-1/3 h-1/3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                    </motion.div>
                ) : (
                    <>
                        {/* Blur placeholder while loading */}
                        {!isLoaded && isInView && (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0"
                            >
                                {/* Animated shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
                                    animate={{
                                        x: ['-100%', '100%'],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                />
                            </motion.div>
                        )}

                        {/* Actual image */}
                        {isInView && (
                            <motion.img
                                ref={imgRef}
                                src={src}
                                alt={alt}
                                className={cn(
                                    'absolute inset-0 w-full h-full object-cover',
                                    className
                                )}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={isLoaded ? {
                                    opacity: 1,
                                    scale: 1,
                                    transition: {
                                        duration: 0.4,
                                        ease: [0.4, 0, 0.2, 1]
                                    }
                                } : {}}
                            />
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

// Variant for background images
export function LazyBackgroundImage({
    src,
    className,
    children,
}: {
    src: string
    className?: string
    children?: React.ReactNode
}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true)
                        observer.disconnect()
                    }
                })
            },
            { rootMargin: '50px' }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!isInView) return

        const img = new Image()
        img.src = src
        img.onload = () => setIsLoaded(true)
    }, [isInView, src])

    return (
        <div
            ref={containerRef}
            className={cn('relative overflow-hidden', className)}
        >
            <AnimatePresence mode="wait">
                {!isLoaded && isInView && (
                    <motion.div
                        key="bg-placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse"
                    />
                )}
            </AnimatePresence>

            <motion.div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: isLoaded ? `url(${src})` : 'none' }}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />

            <div className="relative z-10">{children}</div>
        </div>
    )
}
