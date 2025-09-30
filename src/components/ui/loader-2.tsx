import { cn } from "@/lib/utils";

export const LoaderComponent = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center justify-center space-x-4", className)}>
            <div className="loader">
                <svg viewBox="0 0 80 80" className="w-8 h-8">
                    <circle r="32" cy="40" cx="40" id="test"></circle>
                </svg>
            </div>

            <div className="loader triangle">
                <svg viewBox="0 0 86 80" className="w-8 h-8">
                    <polygon points="43 8 79 72 7 72"></polygon>
                </svg>
            </div>

            <div className="loader">
                <svg viewBox="0 0 80 80" className="w-8 h-8">
                    <rect height="64" width="64" y="8" x="8"></rect>
                </svg>
            </div>
        </div>
    );
};

// Export sebagai Component untuk kompatibilitas
export const Component = LoaderComponent;