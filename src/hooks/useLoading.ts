'use client';

import { useState, useEffect } from 'react';

export const usePageLoading = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate 3 seconds loading on initial page load
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return { isLoading, setIsLoading };
};

export const useLoginLoading = () => {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = () => {
        setIsLoading(true);
        // Auto stop after 3 seconds
        setTimeout(() => {
            setIsLoading(false);
        }, 3000);
    };

    return { isLoading, startLoading, setIsLoading };
};