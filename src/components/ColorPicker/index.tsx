"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

// Predefined color palette (60 colors)
const COLOR_PALETTE = [
  "#000000", "#434343", "#666666", "#999999", "#B7B7B7", "#CCCCCC", "#D9D9D9", "#EFEFEF", "#F3F3F3", "#FFFFFF",
  "#980000", "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#4A86E8", "#0000FF", "#9900FF", "#FF00FF",
  "#E6B8AF", "#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#D0E0E3", "#C9DAF8", "#CFE2F3", "#D9D2E9", "#EAD1DC",
  "#DD7E6B", "#EA9999", "#F9CB9C", "#FFE599", "#B6D7A8", "#A2C4C9", "#A4C2F4", "#9FC5E8", "#B4A7D6", "#D5A6BD",
  "#CC4125", "#E06666", "#F6B26B", "#FFD966", "#93C47D", "#76A5AF", "#6D9EEB", "#6FA8DC", "#8E7CC3", "#C27BA0",
  "#A61C00", "#CC0000", "#E69138", "#F1C232", "#6AA84F", "#45818E", "#3C78D8", "#3D85C6", "#674EA7", "#A64D79",
  "#85200C", "#990000", "#B45F06", "#BF9000", "#38761D", "#134F5C", "#1155CC", "#0B5394", "#351C75", "#741B47",
  "#5B0F00", "#660000", "#783F04", "#7F6000", "#274E13", "#0C343D", "#1C4587", "#073763", "#20124D", "#4C1130",
];

export function ColorPicker({ value = "#3d85c6", onChange, className, disabled = false }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [hexValue, setHexValue] = React.useState(value);
  const [hue, setHue] = React.useState(210);
  const [saturation, setSaturation] = React.useState(100);
  const [lightness, setLightness] = React.useState(50);

  // Convert hex to HSL
  const hexToHsl = React.useCallback((hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
          break;
        case g:
          h = ((b - r) / d + 2) * 60;
          break;
        case b:
          h = ((r - g) / d + 4) * 60;
          break;
      }
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }, []);

  // Convert HSL to hex
  const hslToHex = React.useCallback((h: number, s: number, l: number) => {
    l /= 100;
    const a = (s / 100) * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }, []);

  // Use ref to track previous prop value to detect external changes
  const prevValueRef = React.useRef(value);
  const isInternalUpdateRef = React.useRef(false);

  // Update HSL when hex value changes externally (from prop)
  React.useEffect(() => {
    // Only update if value prop changed externally (not from our internal updates)
    if (value && value !== prevValueRef.current && !isInternalUpdateRef.current) {
      prevValueRef.current = value;
      setHexValue(value);
      const hsl = hexToHsl(value);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
    }
  }, [value, hexToHsl]);

  const handleHexChange = (newHex: string) => {
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newHex) || newHex === "") {
      isInternalUpdateRef.current = true;
      setHexValue(newHex);
      if (newHex.length === 7) {
        prevValueRef.current = newHex;
        const hsl = hexToHsl(newHex);
        setHue(hsl.h);
        setSaturation(hsl.s);
        setLightness(hsl.l);
        onChange?.(newHex);
      }
      // Reset flag in next tick to allow state updates to complete
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 0);
    }
  };

  const handleColorSelect = (color: string) => {
    isInternalUpdateRef.current = true;
    prevValueRef.current = color;
    setHexValue(color);
    const hsl = hexToHsl(color);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    onChange?.(color);
    // Reset flag in next tick to allow state updates to complete
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isInternalUpdateRef.current = true;
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    const newHex = hslToHex(newHue, saturation, lightness);
    prevValueRef.current = newHex;
    setHexValue(newHex);
    onChange?.(newHex);
    // Reset flag in next tick to allow state updates to complete
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  };

  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isInternalUpdateRef.current = true;
    
    const targetElement = e.currentTarget as HTMLDivElement;
    const rect = targetElement.getBoundingClientRect();
    
    // Check if it's mobile (horizontal) or desktop (vertical)
    const isMobile = window.innerWidth < 640; // sm breakpoint
    
    let newHue: number;
    if (isMobile) {
      // Horizontal slider on mobile
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      newHue = Math.max(0, Math.min(360, Math.round((x / rect.width) * 360)));
    } else {
      // Vertical slider on desktop
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
      newHue = Math.max(0, Math.min(360, Math.round((y / rect.height) * 360)));
    }
    
    setHue(newHue);
    const newHex = hslToHex(newHue, saturation, lightness);
    prevValueRef.current = newHex;
    setHexValue(newHex);
    onChange?.(newHex);
    
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  };

  const handleHueWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isInternalUpdateRef.current = true;
    
    // Determine scroll direction and calculate new hue
    const delta = e.deltaY > 0 ? 5 : -5; // Adjust step size as needed
    const newHue = Math.max(0, Math.min(360, hue + delta));
    
    setHue(newHue);
    const newHex = hslToHex(newHue, saturation, lightness);
    prevValueRef.current = newHex;
    setHexValue(newHex);
    onChange?.(newHex);
    
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  };



  const handleChoose = () => {
    onChange?.(hexValue);
    setOpen(false);
  };

  const handleCancel = () => {
    setHexValue(value);
    const hsl = hexToHsl(value);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    setOpen(false);
  };

  // Generate gradient for saturation/lightness picker
  const saturationLightnessGradient = `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%)), linear-gradient(to top, black, transparent, white)`;

  // Generate hue gradient
  const hueGradient = "linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start gap-2 px-3 text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div
            className="h-4 w-4 rounded border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: hexValue }}
          />
          <span className="flex-1 text-left">{hexValue}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="right"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] max-w-[320px] sm:max-w-[360px] md:max-w-[400px] p-3 sm:p-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-4">
          {/* Color Palette Grid */}
          <div className="grid grid-cols-10 gap-1">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "h-6 w-6 rounded border-2 transition-all hover:scale-110",
                  hexValue.toLowerCase() === color.toLowerCase()
                    ? "border-gray-900 dark:border-gray-100 ring-2 ring-offset-1"
                    : "border-gray-300 dark:border-gray-600"
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              >
                {hexValue.toLowerCase() === color.toLowerCase() && (
                  <Check className="h-3 w-3 text-white drop-shadow-md m-auto" />
                )}
              </button>
            ))}
          </div>

          {/* Color Selector Area */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Saturation/Lightness Picker */}
            <div className="flex-1 space-y-2">
              <div
                className="relative h-24 sm:h-32 w-full rounded border border-gray-300 cursor-crosshair"
                style={{ background: saturationLightnessGradient }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isInternalUpdateRef.current = true;
                  
                  const targetElement = e.currentTarget as HTMLDivElement;
                  
                  let animationFrameId: number | null = null;
                  
                  const updateColor = (clientX: number, clientY: number) => {
                    if (animationFrameId !== null) {
                      cancelAnimationFrame(animationFrameId);
                    }
                    
                    animationFrameId = requestAnimationFrame(() => {
                      const rect = targetElement.getBoundingClientRect();
                      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
                      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
                      // Use precise values without rounding for smoother movement
                      const newSaturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
                      const newLightness = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
                      setSaturation(newSaturation);
                      setLightness(newLightness);
                      const newHex = hslToHex(hue, Math.round(newSaturation), Math.round(newLightness));
                      prevValueRef.current = newHex;
                      setHexValue(newHex);
                      onChange?.(newHex);
                      animationFrameId = null;
                    });
                  };

                  // Handle initial click
                  updateColor(e.clientX, e.clientY);

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    moveEvent.preventDefault();
                    updateColor(moveEvent.clientX, moveEvent.clientY);
                  };

                  const handleMouseUp = () => {
                    if (animationFrameId !== null) {
                      cancelAnimationFrame(animationFrameId);
                      animationFrameId = null;
                    }
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                    // Reset flag in next tick to allow state updates to complete
                    setTimeout(() => {
                      isInternalUpdateRef.current = false;
                    }, 0);
                  };

                  document.addEventListener("mousemove", handleMouseMove, { passive: false });
                  document.addEventListener("mouseup", handleMouseUp);
                }}
              >
                <div
                  className="absolute h-3 w-3 rounded-full border-2 border-white shadow-lg pointer-events-none"
                  style={{
                    left: `${saturation}%`,
                    top: `${100 - lightness}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              </div>
            </div>

            {/* Hue Slider */}
            <div 
              className="relative h-6 sm:h-32 w-full sm:w-6 cursor-pointer"
              onClick={handleHueClick}
              onWheel={handleHueWheel}
            >
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={handleHueChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                style={{ 
                  scrollBehavior: 'smooth',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              {/* Mobile: Horizontal gradient */}
              <div
                className="absolute inset-0 rounded border border-gray-300 sm:hidden pointer-events-none"
                style={{
                  background: `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
                }}
              />
              {/* Desktop: Vertical gradient */}
              <div
                className="hidden sm:block absolute inset-0 rounded border border-gray-300 pointer-events-none"
                style={{
                  background: hueGradient,
                }}
              />
              {/* Mobile: Horizontal indicator */}
              <div
                className="absolute top-0 w-1 h-full bg-white border border-gray-400 rounded pointer-events-none sm:hidden"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              />
              {/* Desktop: Vertical indicator */}
              <div
                className="hidden sm:block absolute left-0 w-full h-1 bg-white border border-gray-400 rounded pointer-events-none"
                style={{
                  top: `${(hue / 360) * 100}%`,
                  transform: "translateY(-50%)",
                }}
              />
            </div>
          </div>

          {/* Current Color Display and Hex Input */}
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: hexValue }}
            />
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Hex</label>
              <Input
                type="text"
                value={hexValue}
                onChange={(e) => handleHexChange(e.target.value)}
                className="h-8 font-mono text-sm"
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleChoose}>
              Choose
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

