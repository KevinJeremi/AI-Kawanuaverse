'use client';

import { LoadingScreen } from "@/components/ui/loading-screen";
import { usePageLoading } from "@/hooks/useLoading";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface ClientLoadingWrapperProps {
    children: React.ReactNode;
}

export const ClientLoadingWrapper = ({ children }: ClientLoadingWrapperProps) => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { isLoading: pageLoading, setIsLoading } = usePageLoading();
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        // If user is already authenticated, skip the 3-second loading
        if (isAuthenticated && !authLoading) {
            setIsLoading(false);
            setShowLoading(false);
        } else if (!authLoading) {
            // If not authenticated and auth check is done, show normal loading
            setShowLoading(pageLoading);
        }
    }, [isAuthenticated, authLoading, pageLoading, setIsLoading]);

    // Show loading only if auth is still loading OR if page is loading for non-authenticated users
    const shouldShowLoading = authLoading || (showLoading && !isAuthenticated);

    return (
        <>
            <LoadingScreen
                isVisible={shouldShowLoading}
                message={authLoading ? "Checking authentication..." : "Initializing AI Kawanuaverse..."}
            />
            <div className={shouldShowLoading ? "hidden" : "block"}>
                {children}
            </div>
        </>
    );
};