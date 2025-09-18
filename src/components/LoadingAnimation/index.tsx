"use client";

import Lottie from "lottie-react";
import musicLoaderAnimation from "@/assets/animations/music-loader.json";

interface LoadingAnimationProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  showText?: boolean;
}

export function LoadingAnimation({ 
  size = "md", 
  className = "", 
  text = "Loading...",
  showText = true
}: LoadingAnimationProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg"
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Lottie
        animationData={musicLoaderAnimation}
        loop={true}
        autoplay={true}
        className={sizeClasses[size]}
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
        }}
      />
      {showText && text && (
        <div className={`text-muted-foreground font-medium ${textSizeClasses[size]} text-center`}>
          {text}
        </div>
      )}
    </div>
  );
}
