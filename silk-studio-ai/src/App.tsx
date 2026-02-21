import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  RefreshCw,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PROMPT = `CRITICAL INSTRUCTION: Do not recreate, redraw, or reinterpret the scarf. You must isolate the EXACT pixels of the scarf from the uploaded image and place them into the new environment.

Isolate and relight the exact uploaded product. Keep the scarf 100% unchanged — do not alter the design, colors, proportions, folds, or fabric texture in any way.

Remove the original background completely.

Place the scarf into a high-end fashion studio setting with a smooth warm beige-grey seamless backdrop, elegant and minimal.

Lighting setup:
Use soft diffused key light from the front-left to illuminate the scarf evenly.
Add a gentle secondary fill light to soften harsh shadows while maintaining depth.
Introduce a subtle rim light from the back-right to create elegant edge separation and dimension.
Enhance natural highlights along the silk folds to emphasize smoothness and fluidity.
Increase micro-contrast slightly to make the fabric texture more tactile and premium.
Apply a very soft luminous glow to the brightest silk areas (not glossy, not reflective, not overexposed).

Maintain accurate original colors — do not oversaturate.
Create a soft natural shadow beneath the product for grounding.
The silk should appear soft, airy, fluid, and luxurious — visually touchable.

Luxury fashion catalog photography, refined, elegant, high-end brand aesthetic, no props, no text, no watermark.`;

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateImage = async () => {
    if (!image) return;

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-2.5-flash-image";

      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: PROMPT,
            },
          ],
        },
      });

      let generatedImageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (generatedImageUrl) {
        setResult(generatedImageUrl);
      } else {
        throw new Error("No image was generated. Please try again.");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = 'silk-studio-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-luxury-ink/10 py-6 px-8 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-luxury-ink rounded-full flex items-center justify-center">
            <Sparkles className="text-luxury-cream w-4 h-4" />
          </div>
          <h1 className="serif text-2xl font-medium tracking-tight">Silk Studio AI</h1>
        </div>
        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-semibold opacity-60">
          <a href="#" className="hover:opacity-100 transition-opacity">Collection</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Process</a>
          <a href="#" className="hover:opacity-100 transition-opacity">About</a>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Input */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="serif text-5xl md:text-6xl leading-tight font-light">
                Elevate your <br />
                <span className="italic">product aesthetic.</span>
              </h2>
              <p className="text-luxury-ink/60 max-w-md leading-relaxed">
                Transform raw product photography into museum-grade catalog imagery. 
                Our AI preserves every thread of your original design while crafting 
                the perfect studio environment.
              </p>
            </div>

            <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-[4/3] rounded-3xl border-2 border-dashed border-luxury-ink/10 bg-white/30 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/50 hover:border-luxury-ink/20 group overflow-hidden",
                  image && "border-solid border-luxury-ink/5"
                )}
              >
                {image ? (
                  <>
                    <img src={image} alt="Original" className="w-full h-full object-contain p-8" />
                    <div className="absolute inset-0 bg-luxury-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" /> Change Image
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-luxury-cream rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Upload className="text-luxury-ink/40 w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">Upload product image</p>
                      <p className="text-xs text-luxury-ink/40">Drag and drop or click to browse</p>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <button
                onClick={generateImage}
                disabled={!image || isGenerating}
                className={cn(
                  "w-full py-5 rounded-2xl font-medium transition-all flex items-center justify-center gap-3 shadow-lg shadow-luxury-ink/5",
                  !image || isGenerating 
                    ? "bg-luxury-ink/10 text-luxury-ink/30 cursor-not-allowed" 
                    : "bg-luxury-ink text-luxury-cream hover:bg-luxury-ink/90 active:scale-[0.98]"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Crafting Studio Environment...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Catalog Image
                  </>
                )}
              </button>

              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 py-3 rounded-xl border border-red-100">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <div className="aspect-[4/5] bg-white rounded-[2rem] shadow-2xl shadow-luxury-ink/10 overflow-hidden relative group">
                    <img 
                      src={result} 
                      alt="Generated Result" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-6 right-6">
                      <span className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold shadow-sm flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Studio Rendered
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={downloadResult}
                      className="flex-1 py-4 bg-white border border-luxury-ink/10 rounded-2xl font-medium hover:bg-luxury-cream transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download High-Res
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="px-6 py-4 bg-white border border-luxury-ink/10 rounded-2xl font-medium hover:bg-luxury-cream transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="aspect-[4/5] bg-luxury-ink/[0.02] rounded-[2rem] border border-luxury-ink/5 flex flex-col items-center justify-center p-12 text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ImageIcon className="text-luxury-ink/10 w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="serif text-2xl font-medium">Studio Preview</h3>
                    <p className="text-sm text-luxury-ink/40 max-w-[240px] mx-auto">
                      Upload an image and click generate to see the studio transformation.
                    </p>
                  </div>
                  
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center rounded-[2rem]">
                      <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-luxury-ink" />
                        <div className="space-y-1 text-center">
                          <p className="font-medium">Refining Texture</p>
                          <p className="text-[10px] uppercase tracking-widest opacity-40">Please wait</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decorative Elements */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-luxury-gold/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-luxury-ink/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-8 border-t border-luxury-ink/5 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-40">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest font-bold">Powered by Gemini Vision</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
            © 2026 Silk Studio AI — All Rights Reserved
          </p>
          <div className="flex gap-6 text-[10px] uppercase tracking-widest font-bold opacity-40">
            <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
