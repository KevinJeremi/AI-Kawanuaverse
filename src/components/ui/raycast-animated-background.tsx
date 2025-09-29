import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import UnicornScene from "unicornstudio-react";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize);

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { ...windowSize, isMounted };
};

export const Component = () => {
  const { width, height, isMounted } = useWindowSize();

  // Don't render on server or before mount to prevent hydration mismatch
  if (!isMounted || width === 0 || height === 0) {
    return (
      <div className={cn("flex flex-col items-center w-full h-full")}>
        <div className="w-full h-full bg-transparent" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center")}>
        <UnicornScene
        production={true} projectId="cbmTT38A0CcuYxeiyj5H" width={width} height={height} />
    </div>
  );
};