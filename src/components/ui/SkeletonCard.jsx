import React from 'react';

/**
 * Skeleton Card for loading states
 * Usage: <SkeletonCard /> or <SkeletonCard variant="compact" />
 */
export const SkeletonCard = ({ variant = 'default' }) => {
    if (variant === 'compact') {
        return (
            <div className="glass-card rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-800 rounded-full w-3/4" />
                        <div className="h-2 bg-slate-800 rounded-full w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-3xl p-5 border border-white/5 animate-pulse">
            <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-800 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-800 rounded-full w-3/4" />
                    <div className="h-3 bg-slate-800 rounded-full w-1/2" />
                    <div className="flex gap-2 mt-2">
                        <div className="h-6 bg-slate-800 rounded-lg w-16" />
                        <div className="h-6 bg-slate-800 rounded-lg w-20" />
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Skeleton List - renders multiple skeleton cards
 * @param {number} count - Number of skeleton cards to show
 */
export const SkeletonList = ({ count = 3, variant = 'default' }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} variant={variant} />
        ))}
    </div>
);

export default SkeletonCard;
