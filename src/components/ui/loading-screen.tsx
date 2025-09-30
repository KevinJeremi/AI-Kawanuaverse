import { LoaderComponent } from "@/components/ui/loader-2";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
    isVisible: boolean;
    message?: string;
    className?: string;
}

export const LoadingScreen = ({ isVisible, message = "Loading...", className }: LoadingScreenProps) => {
    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex flex-col items-center justify-center",
                "bg-gray-950/90 backdrop-blur-md",
                "transition-opacity duration-300",
                className
            )}
        >
            {/* Loading animation */}
            <div className="mb-6">
                <LoaderComponent className="scale-150" />
            </div>

            {/* Loading message */}
            <p className="text-white/70 text-center font-medium">
                {message}
            </p>

            {/* Loading dots animation */}
            <div className="flex space-x-1 mt-4">
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
        </div>
    );
};