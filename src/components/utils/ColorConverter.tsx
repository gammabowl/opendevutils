import { useState, useEffect, useCallback, type CSSProperties } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, RotateCcw, Pipette, BookOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUtilKeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { CopyButton } from "@/components/ui/copy-button";
import { useToast } from "@/hooks/use-toast";

interface ColorValues {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hsv: string;
}

interface ColorConverterProps {
  initialContent?: string;
  action?: string;
}

// A broad set of commonly used web/UI colours, grouped by hue, light to dark.
const COMMON_COLORS: { name: string; hex: string }[] = [
  { name: "Red Light", hex: "#FCA5A5" }, { name: "Red", hex: "#EF4444" }, { name: "Red Dark", hex: "#B91C1C" },
  { name: "Orange Light", hex: "#FDBA74" }, { name: "Orange", hex: "#F97316" }, { name: "Orange Dark", hex: "#C2410C" },
  { name: "Amber Light", hex: "#FCD34D" }, { name: "Amber", hex: "#F59E0B" }, { name: "Amber Dark", hex: "#B45309" },
  { name: "Yellow Light", hex: "#FDE047" }, { name: "Yellow", hex: "#EAB308" }, { name: "Yellow Dark", hex: "#A16207" },
  { name: "Lime Light", hex: "#BEF264" }, { name: "Lime", hex: "#84CC16" }, { name: "Lime Dark", hex: "#4D7C0F" },
  { name: "Green Light", hex: "#86EFAC" }, { name: "Green", hex: "#22C55E" }, { name: "Green Dark", hex: "#15803D" },
  { name: "Emerald Light", hex: "#6EE7B7" }, { name: "Emerald", hex: "#10B981" }, { name: "Emerald Dark", hex: "#047857" },
  { name: "Teal Light", hex: "#5EEAD4" }, { name: "Teal", hex: "#14B8A6" }, { name: "Teal Dark", hex: "#0F766E" },
  { name: "Cyan Light", hex: "#67E8F9" }, { name: "Cyan", hex: "#06B6D4" }, { name: "Cyan Dark", hex: "#0E7490" },
  { name: "Sky Light", hex: "#7DD3FC" }, { name: "Sky", hex: "#0EA5E9" }, { name: "Sky Dark", hex: "#0369A1" },
  { name: "Blue Light", hex: "#93C5FD" }, { name: "Blue", hex: "#3B82F6" }, { name: "Blue Dark", hex: "#1D4ED8" },
  { name: "Indigo Light", hex: "#A5B4FC" }, { name: "Indigo", hex: "#6366F1" }, { name: "Indigo Dark", hex: "#4338CA" },
  { name: "Violet Light", hex: "#C4B5FD" }, { name: "Violet", hex: "#8B5CF6" }, { name: "Violet Dark", hex: "#6D28D9" },
  { name: "Purple Light", hex: "#D8B4FE" }, { name: "Purple", hex: "#A855F7" }, { name: "Purple Dark", hex: "#7E22CE" },
  { name: "Fuchsia Light", hex: "#F0ABFC" }, { name: "Fuchsia", hex: "#D946EF" }, { name: "Fuchsia Dark", hex: "#A21CAF" },
  { name: "Pink Light", hex: "#F9A8D4" }, { name: "Pink", hex: "#EC4899" }, { name: "Pink Dark", hex: "#BE185D" },
  { name: "Rose Light", hex: "#FDA4AF" }, { name: "Rose", hex: "#F43F5E" }, { name: "Rose Dark", hex: "#BE123C" },
  { name: "Brown Light", hex: "#D6B89C" }, { name: "Brown", hex: "#92400E" }, { name: "Brown Dark", hex: "#5C2E0D" },
  { name: "Grey Light", hex: "#D1D5DB" }, { name: "Grey", hex: "#6B7280" }, { name: "Grey Dark", hex: "#374151" },
  { name: "Slate Light", hex: "#CBD5E1" }, { name: "Slate", hex: "#64748B" }, { name: "Slate Dark", hex: "#334155" },
  { name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" },
];

export function ColorConverter({ initialContent, action }: ColorConverterProps) {
  const [inputColor, setInputColor] = useState(initialContent || "#3b82f6");
  const [colorValues, setColorValues] = useState<ColorValues>({
    hex: "#3b82f6",
    rgb: "rgb(59, 130, 246)",
    rgba: "rgba(59, 130, 246, 1)",
    hsl: "hsl(217, 91%, 60%)",
    hsla: "hsla(217, 91%, 60%, 1)",
    hsv: "hsv(217, 76%, 96%)"
  });
  const [error, setError] = useState("");
  const [hexInput, setHexInput] = useState("#3B82F6");
  const [rgbInput, setRgbInput] = useState("rgb(59, 130, 246)");
  const { toast } = useToast();

  useEffect(() => {
    if (initialContent && action === "convert") {
      convertColor(initialContent);
    }
  }, [initialContent, action]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the dedicated Hex/RGB fields in sync whenever the colour changes
  // from any source (picker, generic input, palette clicks, etc).
  useEffect(() => {
    setHexInput(colorValues.hex);
    setRgbInput(colorValues.rgb);
  }, [colorValues]);

  const hexToRgb = (hex: string): [number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  };

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const rgbToHsv = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const v = max;

    if (diff !== 0) {
      switch (max) {
        case r: h = ((g - b) / diff) % 6; break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
      }
      h /= 6;
    }

    if (h < 0) h += 1;

    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
  };

  const convertColor = useCallback((input: string) => {
    try {
      setError("");
      let hex = input;
      
      // Handle different input formats
      if (input.startsWith("rgb")) {
        const matches = input.match(/\d+/g);
        if (matches && matches.length >= 3) {
          const [r, g, b] = matches.map(Number);
          hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        }
      } else if (input.startsWith("hsl")) {
        // Basic HSL to RGB conversion
        const matches = input.match(/\d+/g);
        if (matches && matches.length >= 3) {
          const [h, s, l] = matches.map(Number);
          const rgb = hslToRgb(h, s, l);
          hex = `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`;
        }
      }

      // Ensure hex format
      if (!hex.startsWith("#")) {
        hex = "#" + hex;
      }

      const rgb = hexToRgb(hex);
      if (!rgb) {
        throw new Error("Invalid color format");
      }

      const [r, g, b] = rgb;
      const [h, s, l] = rgbToHsl(r, g, b);
      const [hue, sat, val] = rgbToHsv(r, g, b);

      setColorValues({
        hex: hex.toUpperCase(),
        rgb: `rgb(${r}, ${g}, ${b})`,
        rgba: `rgba(${r}, ${g}, ${b}, 1)`,
        hsl: `hsl(${h}, ${s}%, ${l}%)`,
        hsla: `hsla(${h}, ${s}%, ${l}%, 1)`,
        hsv: `hsv(${hue}, ${sat}%, ${val}%)`
      });
      
      setInputColor(hex);
    } catch (err) {
      setError("Invalid color format. Please use hex, rgb, or hsl format.");
    }
  }, []);

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const copyToClipboard = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "Copied!",
        description: "Colour value copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  }, [toast]);

  const clearAll = useCallback(() => {
    setInputColor("#3b82f6");
    setColorValues({
      hex: "#3B82F6",
      rgb: "rgb(59, 130, 246)",
      rgba: "rgba(59, 130, 246, 1)",
      hsl: "hsl(217, 91%, 60%)",
      hsla: "hsla(217, 91%, 60%, 1)",
      hsv: "hsv(217, 76%, 96%)"
    });
    setError("");
  }, []);

  // Keyboard shortcuts
  useUtilKeyboardShortcuts({
    onExecute: () => convertColor(inputColor),
    onClear: clearAll,
    onCopy: () => copyToClipboard(colorValues.hex),
  });

  const toHex = (rgb: [number, number, number]) =>
    `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`.toUpperCase();

  const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

  const generatePaletteRows = () => {
    const rgb = hexToRgb(inputColor);
    if (!rgb) return [];

    const [r, g, b] = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);

    // Mixed with white, in increasing amounts
    const tints = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t) =>
      toHex([mix(r, 255, t), mix(g, 255, t), mix(b, 255, t)])
    );

    // Mixed with black, in increasing amounts
    const shades = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t) =>
      toHex([mix(r, 0, t), mix(g, 0, t), mix(b, 0, t)])
    );

    // Desaturated toward grey at the same lightness
    const tones = [100, 85, 70, 55, 40, 25, 10, 0].map((stop) =>
      toHex(hslToRgb(h, (s * stop) / 100, l))
    );

    // Evenly rotated around the colour wheel — includes the complementary
    // (index 6), triadic (4, 8) and analogous (1, 11) angles.
    const hues = Array.from({ length: 12 }, (_, i) =>
      toHex(hslToRgb((h + i * 30) % 360, s, l))
    );

    // Neutral greys, independent of hue
    const greyscale = [95, 85, 75, 65, 55, 45, 35, 25, 15, 5].map((stop) =>
      toHex(hslToRgb(0, 0, stop))
    );

    return [
      { label: "Tints", colors: tints },
      { label: "Shades", colors: shades },
      { label: "Tones", colors: tones },
      { label: "Hues", colors: hues },
      { label: "Greyscale", colors: greyscale },
    ];
  };

  const generateShadeStrip = () => {
    const rgb = hexToRgb(colorValues.hex);
    if (!rgb) return [];
    const [r, g, b] = rgb;

    const tintStops = [0.85, 0.7, 0.55, 0.4, 0.25, 0.1].map((t) =>
      toHex([mix(r, 255, t), mix(g, 255, t), mix(b, 255, t)])
    );
    const shadeStops = [0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((t) =>
      toHex([mix(r, 0, t), mix(g, 0, t), mix(b, 0, t)])
    );

    return [...tintStops, colorValues.hex, ...shadeStops];
  };

  const generateOpacityRow = () => {
    const rgb = hexToRgb(inputColor);
    if (!rgb) return [];
    const [r, g, b] = rgb;
    return [100, 90, 80, 70, 60, 50, 40, 30, 20, 10].map((pct) => {
      const alpha = pct / 100;
      return { value: `rgba(${r}, ${g}, ${b}, ${alpha})`, alpha };
    });
  };

  const checkerStyle = (rgba: string): CSSProperties => ({
    backgroundImage: `linear-gradient(${rgba}, ${rgba}), linear-gradient(45deg, #94a3b8 25%, transparent 25%), linear-gradient(-45deg, #94a3b8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #94a3b8 75%), linear-gradient(-45deg, transparent 75%, #94a3b8 75%)`,
    backgroundSize: "100% 100%, 8px 8px, 8px 8px, 8px 8px, 8px 8px",
    backgroundPosition: "0 0, 0 0, 0 4px, 4px -4px, -4px 0px",
    backgroundColor: "white",
  });

  return (
    <Card className="tool-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Palette className="h-5 w-5 text-dev-primary" />
            Colour Converter
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                All Formats
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <div className="space-y-1">
                {Object.entries(colorValues).map(([format, value]) => (
                  <div key={format} className="flex items-center justify-between p-2 bg-muted/50 rounded-md gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-6 h-6 rounded border border-border/50 flex-shrink-0" style={{ backgroundColor: format === 'hex' ? value : inputColor }} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground uppercase">{format}</div>
                        <div className="text-xs text-muted-foreground font-mono truncate">{value}</div>
                      </div>
                    </div>
                    <CopyButton text={value} title={`Copy ${format}`} />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="convert" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="convert">Convert</TabsTrigger>
            <TabsTrigger value="palette">Palette</TabsTrigger>
          </TabsList>
          
          <TabsContent value="convert" className="space-y-4">
            <div>
              <label htmlFor="color-input" className="block text-sm font-medium mb-2 text-foreground">
                Colour Input
              </label>
              <div className="flex gap-2">
                <div
                  className="relative flex-shrink-0"
                  title="Click to open the colour picker"
                >
                  <Input
                    id="color-picker"
                    type="color"
                    value={inputColor}
                    onChange={(e) => {
                      setInputColor(e.target.value);
                      convertColor(e.target.value);
                    }}
                    className="w-11 h-10 p-1 bg-muted/50 border-border/50 cursor-pointer"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-background border border-border shadow-sm pointer-events-none">
                    <Pipette className="h-2.5 w-2.5 text-dev-primary" />
                  </span>
                </div>
                <Input
                  id="color-input"
                  placeholder="Enter hex, rgb, or hsl..."
                  value={inputColor}
                  onChange={(e) => {
                    setInputColor(e.target.value);
                    setTimeout(() => convertColor(e.target.value), 300);
                  }}
                  className="flex-1 font-mono bg-muted/50 border-border/50"
                />
                <Button onClick={() => convertColor(inputColor)} className="bg-dev-primary hover:bg-dev-primary/80 text-dev-primary-foreground px-4 hidden sm:inline-flex">
                  <Pipette className="h-4 w-4 mr-2" />
                  Convert
                </Button>
              </div>
              <Button onClick={() => convertColor(inputColor)} className="w-full mt-2 bg-dev-primary hover:bg-dev-primary/80 text-dev-primary-foreground sm:hidden">
                <Pipette className="h-4 w-4 mr-2" />
                Convert
              </Button>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-dev-primary mb-2">Hex ⇄ RGB</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="hex-input" className="block text-xs font-medium mb-1.5 text-muted-foreground">
                    Hex
                  </label>
                  <div className="flex gap-1.5">
                    <Input
                      id="hex-input"
                      value={hexInput}
                      onChange={(e) => setHexInput(e.target.value)}
                      onBlur={() => convertColor(hexInput)}
                      onKeyDown={(e) => e.key === "Enter" && convertColor(hexInput)}
                      placeholder="#3B82F6"
                      className="flex-1 font-mono bg-muted/50 border-border/50"
                    />
                    <CopyButton text={colorValues.hex} title="Copy hex" />
                  </div>
                </div>
                <div>
                  <label htmlFor="rgb-input" className="block text-xs font-medium mb-1.5 text-muted-foreground">
                    RGB
                  </label>
                  <div className="flex gap-1.5">
                    <Input
                      id="rgb-input"
                      value={rgbInput}
                      onChange={(e) => setRgbInput(e.target.value)}
                      onBlur={() => convertColor(rgbInput)}
                      onKeyDown={(e) => e.key === "Enter" && convertColor(rgbInput)}
                      placeholder="rgb(59, 130, 246)"
                      className="flex-1 font-mono bg-muted/50 border-border/50"
                    />
                    <CopyButton text={colorValues.rgb} title="Copy rgb" />
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                Edit either field and press Enter (or click away) — the other updates automatically.
              </div>
            </div>

            {error && (
              <div className="text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-dev-primary">Colour Preview</h4>
              <div
                className="h-24 rounded-md border border-border/50"
                style={{ backgroundColor: colorValues.hex }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold text-dev-primary">Shades of This Colour</h4>
              <div className="flex gap-1.5">
                {generateShadeStrip().map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`flex-1 h-14 sm:h-20 rounded-md border cursor-pointer hover:scale-105 hover:z-10 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-dev-primary focus:z-10 ${
                      color.toUpperCase() === colorValues.hex.toUpperCase()
                        ? "border-dev-primary ring-2 ring-dev-primary ring-offset-1 ring-offset-background z-10"
                        : "border-border/50"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => copyToClipboard(color)}
                    title={`${color} — click to copy`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Click any shade to copy its hex value
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="palette" className="space-y-5">
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-dev-primary">Common Colours</h4>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(1.75rem,1fr))] gap-1.5">
                {COMMON_COLORS.map((color) => {
                  const isSelected = color.hex === colorValues.hex.toUpperCase();
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      className={`aspect-square rounded-sm border cursor-pointer hover:scale-125 hover:z-10 hover:shadow-md hover:rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-dev-primary focus:z-10 ${
                        isSelected
                          ? "border-dev-primary ring-2 ring-dev-primary ring-offset-1 ring-offset-background z-10"
                          : "border-border/50"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => {
                        convertColor(color.hex);
                        copyToClipboard(color.hex);
                      }}
                      title={`${color.name} — ${color.hex} — click to use as current colour`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                Click a colour to make it the current colour — the rows below update to match.
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-dev-primary">Based on Current Colour</h4>
              {generatePaletteRows().map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {row.label}
                  </span>
                  <div className="flex gap-1.5">
                    {row.colors.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        className="flex-1 h-10 sm:h-12 rounded-md border border-border/50 cursor-pointer hover:scale-105 hover:z-10 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-dev-primary focus:z-10"
                        style={{ backgroundColor: color }}
                        onClick={() => copyToClipboard(color)}
                        title={`${color} — click to copy`}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Opacity
                </span>
                <div className="flex gap-1.5">
                  {generateOpacityRow().map(({ value, alpha }, index) => (
                    <button
                      key={index}
                      type="button"
                      className="flex-1 h-10 sm:h-12 rounded-md border border-border/50 cursor-pointer overflow-hidden hover:scale-105 hover:z-10 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-dev-primary focus:z-10"
                      style={checkerStyle(value)}
                      onClick={() => copyToClipboard(value)}
                      title={`${Math.round(alpha * 100)}% opacity — ${value} — click to copy`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              Click any colour to copy its value
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>


    </Card>
  );
}