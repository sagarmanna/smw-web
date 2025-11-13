"use client";

import { useEffect } from "react";

/**
 * Handles webpack chunk loading errors that can occur after deployments
 * When a chunk fails to load (404), it automatically retries or reloads the page
 * 
 * This is especially important in production when:
 * - A new deployment changes chunk hashes
 * - Users have old chunks cached
 * - CDN/proxy serves stale chunks
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleChunkError = (event: ErrorEvent) => {
      const target = event.target as HTMLElement;
      const error = event.error || event.message;
      
      // Check if it's a script loading error for webpack chunks
      const isChunkError = 
        (target?.tagName === "SCRIPT" && 
         (target as HTMLScriptElement).src?.includes("_next/static/chunks")) ||
        error?.message?.includes("Loading chunk") ||
        error?.message?.includes("Failed to fetch dynamically imported module") ||
        error?.message?.includes("ChunkLoadError") ||
        error?.name === "ChunkLoadError" ||
        (error?.message && error.message.includes("webpack"));
      
      if (isChunkError) {
        const scriptSrc = (target as HTMLScriptElement)?.src;
        const filename = scriptSrc?.split('/').pop();
        
        console.warn("🔴 Chunk loading error detected, attempting recovery...", {
          error: error?.message || error,
          src: scriptSrc,
          filename,
          timestamp: new Date().toISOString(),
        });
        
        // Prevent default error handling
        event.preventDefault();
        
        // Retry loading the chunk after a short delay
        setTimeout(() => {
          if (typeof window !== "undefined") {
            // Only reload if we haven't already tried recently (prevent infinite reload loop)
            const lastReload = sessionStorage.getItem("chunkErrorReload");
            const now = Date.now();
            
            if (!lastReload || now - parseInt(lastReload) > 5000) {
              console.log("🔄 Reloading page to recover from chunk error...");
              sessionStorage.setItem("chunkErrorReload", now.toString());
              // Force a hard reload to clear cache and get fresh chunks
              window.location.reload();
            } else {
              console.warn("⏸️ Chunk error reload already attempted recently, skipping to prevent loop");
            }
          }
        }, 1000);
      }
    };

    // Handle script errors (catches 404s on script tags)
    window.addEventListener("error", handleChunkError, true);
    
    // Handle unhandled promise rejections (chunk loading can fail as promises)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const isChunkRejection = 
        reason?.message?.includes("Loading chunk") ||
        reason?.message?.includes("Failed to fetch dynamically imported module") ||
        reason?.message?.includes("ChunkLoadError") ||
        reason?.name === "ChunkLoadError" ||
        (reason?.message && reason.message.includes("webpack")) ||
        (reason?.stack && reason.stack.includes("_next/static/chunks"));
      
      if (isChunkRejection) {
        console.warn("🔴 Chunk loading promise rejection detected, attempting recovery...", {
          reason: reason?.message || reason,
          stack: reason?.stack,
          timestamp: new Date().toISOString(),
        });
        
        // Prevent default error handling
        event.preventDefault();
        
        // Retry after a delay
        setTimeout(() => {
          if (typeof window !== "undefined") {
            const lastReload = sessionStorage.getItem("chunkErrorReload");
            const now = Date.now();
            
            if (!lastReload || now - parseInt(lastReload) > 5000) {
              console.log("🔄 Reloading page to recover from chunk error...");
              sessionStorage.setItem("chunkErrorReload", now.toString());
              window.location.reload();
            } else {
              console.warn("⏸️ Chunk error reload already attempted recently, skipping to prevent loop");
            }
          }
        }, 1000);
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("error", handleChunkError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}

