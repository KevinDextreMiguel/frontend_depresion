import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Settings, Moon, Sun, ZoomIn, ZoomOut } from "lucide-react";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("normal");

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "large") {
      root.style.fontSize = "18px";
    } else if (fontSize === "xlarge") {
      root.style.fontSize = "20px";
    } else {
      root.style.fontSize = "16px";
    }
  }, [fontSize]);

  const increaseFontSize = () => {
    if (fontSize === "normal") setFontSize("large");
    else if (fontSize === "large") setFontSize("xlarge");
  };

  const decreaseFontSize = () => {
    if (fontSize === "xlarge") setFontSize("large");
    else if (fontSize === "large") setFontSize("normal");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 w-12 h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        aria-label="Abrir menú de accesibilidad"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Card className="fixed top-6 left-6 w-72 shadow-2xl z-50">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Accesibilidad</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            ✕
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <Label htmlFor="dark-mode">Modo oscuro</Label>
          </div>
          <Switch
            id="dark-mode"
            checked={isDarkMode}
            onCheckedChange={setIsDarkMode}
          />
        </div>

        <div className="space-y-2">
          <Label>Tamaño de fuente</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={decreaseFontSize}
              disabled={fontSize === "normal"}
              className="h-9 w-9"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center text-sm font-medium">
              {fontSize === "normal" && "Normal"}
              {fontSize === "large" && "Grande"}
              {fontSize === "xlarge" && "Muy grande"}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={increaseFontSize}
              disabled={fontSize === "xlarge"}
              className="h-9 w-9"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600">
            Estos ajustes mejoran la legibilidad y comodidad visual.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
