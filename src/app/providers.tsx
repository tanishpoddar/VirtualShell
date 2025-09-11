'use client';

import { MotionConfig } from 'framer-motion';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MotionConfig
            transition={{
                type: 'spring',
                duration: 0.5,
            }}
        >
            {children}
        </MotionConfig>
    );
}
