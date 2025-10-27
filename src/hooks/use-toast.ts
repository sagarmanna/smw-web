import { useCallback } from "react";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

/**
 * A lightweight custom toast hook.
 * Usage: const { toast } = useToast();
 * toast({ title: "Success", description: "Saved successfully", variant: "success" });
 */
export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    const { title, description, variant = "default", duration = 3000 } = options;

    // Create the toast container if not already present
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.position = "fixed";
      container.style.top = "1rem";
      container.style.right = "1rem";
      container.style.zIndex = "9999";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "0.5rem";
      document.body.appendChild(container);
    }

    // Create a toast element
    const toastEl = document.createElement("div");
    toastEl.style.minWidth = "260px";
    toastEl.style.padding = "12px 16px";
    toastEl.style.borderRadius = "8px";
    toastEl.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    toastEl.style.fontFamily = "sans-serif";
    toastEl.style.color = "white";
    toastEl.style.cursor = "pointer";
    toastEl.style.transition = "opacity 0.3s ease";

    // Choose color by variant
    switch (variant) {
      case "destructive":
        toastEl.style.backgroundColor = "#dc2626"; // red-600
        break;
      case "success":
        toastEl.style.backgroundColor = "#16a34a"; // green-600
        break;
      default:
        toastEl.style.backgroundColor = "#3b82f6"; // blue-500
    }

    toastEl.innerHTML = `
      <strong style="display:block; font-size:14px;">${title}</strong>
      ${description ? `<span style="font-size:13px; opacity:0.9;">${description}</span>` : ""}
    `;

    // Remove toast on click
    toastEl.addEventListener("click", () => {
      toastEl.style.opacity = "0";
      setTimeout(() => toastEl.remove(), 300);
    });

    // Append and auto-remove after duration
    container.appendChild(toastEl);
    setTimeout(() => {
      toastEl.style.opacity = "0";
      setTimeout(() => toastEl.remove(), 300);
    }, duration);
  }, []);

  return { toast };
}
