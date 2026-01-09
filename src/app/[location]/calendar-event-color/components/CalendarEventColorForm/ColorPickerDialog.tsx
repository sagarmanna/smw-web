"use client";

import * as React from "react";
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Predefined color palette (60 colors from ColorPicker)
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

interface ColorPickerDialogProps {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

// Convert hex to HSL
const hexToHsl = (hex: string) => {
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
};

// Convert HSL to hex
const hslToHex = (h: number, s: number, l: number) => {
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
};

export function ColorPickerDialog({ value, onChange, onClose }: ColorPickerDialogProps) {
  const [hexValue, setHexValue] = React.useState(value);
  const [hue, setHue] = React.useState(210);
  const [saturation, setSaturation] = React.useState(100);
  const [lightness, setLightness] = React.useState(50);

  React.useEffect(() => {
    const hsl = hexToHsl(value);
    setHexValue(value);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  }, [value]);

  const handleHexChange = (newHex: string) => {
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newHex) || newHex === "") {
      setHexValue(newHex);
      if (newHex.length === 7) {
        const hsl = hexToHsl(newHex);
        setHue(hsl.h);
        setSaturation(hsl.s);
        setLightness(hsl.l);
        onChange(newHex);
      }
    }
  };

  const handleColorSelect = (color: string) => {
    setHexValue(color);
    const hsl = hexToHsl(color);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    onChange(color);
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value);
    setHue(newHue);
    const newHex = hslToHex(newHue, saturation, lightness);
    setHexValue(newHex);
    onChange(newHex);
  };

  const handleSaturationLightnessChange = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    const newSaturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newLightness = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    setSaturation(newSaturation);
    setLightness(newLightness);
    const newHex = hslToHex(hue, Math.round(newSaturation), Math.round(newLightness));
    setHexValue(newHex);
    onChange(newHex);
  };

  const saturationLightnessGradient = `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%)), linear-gradient(to top, black, transparent, white)`;
  const hueGradient = "linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)";

  const handleChoose = () => {
    onChange(hexValue);
    onClose();
  };

  const handleCancel = () => {
    setHexValue(value);
    const hsl = hexToHsl(value);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
    onClose();
  };

  return (
    <PopoverContent
      align="start"
      className="w-[calc(100vw-2rem)] max-w-[500px] p-4"
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <div className="flex gap-4">
        {/* Left Panel: Color Palette Grid */}
        <div className="flex-shrink-0">
          <div className="grid grid-cols-10 gap-1">
            {COLOR_PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "h-6 w-6 rounded border-2 transition-all hover:scale-110",
                  hexValue.toLowerCase() === color.toLowerCase()
                    ? "border-orange-500 ring-2 ring-offset-1"
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
        </div>

        {/* Right Panel: Advanced Color Selection */}
        <div className="flex-1 space-y-3">
          {/* Saturation/Lightness Picker with Hue Slider */}
          <div className="flex gap-3">
            {/* Saturation/Lightness Picker */}
            <div className="flex-1 space-y-2">
              <div
                className="relative h-32 w-full rounded border border-gray-300 cursor-crosshair"
                style={{ background: saturationLightnessGradient }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const targetElement = e.currentTarget as HTMLDivElement;
                  const rect = targetElement.getBoundingClientRect();
                  handleSaturationLightnessChange(e.clientX, e.clientY, rect);

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    moveEvent.preventDefault();
                    handleSaturationLightnessChange(moveEvent.clientX, moveEvent.clientY, rect);
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                  };

                  document.addEventListener("mousemove", handleMouseMove);
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
              
              {/* Grayscale/Lightness Slider */}
              <div className="relative h-2 w-full cursor-pointer rounded border border-gray-300">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lightness}
                  onChange={(e) => {
                    const newLightness = parseInt(e.target.value);
                    setLightness(newLightness);
                    const newHex = hslToHex(hue, saturation, newLightness);
                    setHexValue(newHex);
                    onChange(newHex);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  style={{
                    WebkitAppearance: "none",
                    appearance: "none",
                  }}
                />
                <div
                  className="absolute inset-0 rounded pointer-events-none"
                  style={{
                    background: `linear-gradient(to right, white, black)`,
                  }}
                />
                <div
                  className="absolute top-0 w-1 h-full bg-white border border-gray-400 rounded pointer-events-none"
                  style={{
                    left: `${lightness}%`,
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
            </div>

            {/* Hue Slider */}
            <div className="relative h-32 w-6 cursor-pointer flex-shrink-0">
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={handleHueChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                style={{
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
              />
              <div
                className="absolute inset-0 rounded border border-gray-300 pointer-events-none"
                style={{
                  background: hueGradient,
                }}
              />
              <div
                className="absolute left-0 w-full h-1 bg-white border border-gray-400 rounded pointer-events-none"
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
              className="h-10 w-10 rounded border border-gray-300 flex-shrink-0"
              style={{ backgroundColor: hexValue }}
            />
            <div className="flex-1">
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
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleChoose} className="bg-primary hover:bg-primary/90">
              Choose
            </Button>
          </div>
        </div>
      </div>
    </PopoverContent>
  );
}


