import React from "react";
import { Heart, Sparkles, Moon, Sun, Flower } from "lucide-react";

interface ThemeIllustrationProps {
  themeSlug: string;
  className?: string;
}

export default function ThemeIllustration({ themeSlug, className = "w-full h-full" }: ThemeIllustrationProps) {
  const baseClass = `relative overflow-hidden flex flex-col items-center justify-center text-center p-4 select-none ${className}`;

  switch (themeSlug) {
    case "theme-blue-hydrangea":
      return (
        <div className={`${baseClass} bg-gradient-to-tr from-sky-50 to-indigo-100 border border-sky-200/40`}>
          {/* Floral Ornaments Vector */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
            <svg className="w-40 h-40 text-indigo-400" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 15c-5 10-15 10-15 20s10 15 15 15 15-5 15-15-10-10-15-20z" />
              <path d="M50 85c-5-10-15-10-15-20s10-15 15-15 15 5 15 15-10 10-15 20z" />
              <path d="M15 50c10-5 10-15 20-15s15 10 15 15-5 15-15 15-10-10-20-15z" />
              <path d="M85 50c-10-5-10-15-20-15s-15 10-15 15 5 15 15 15 10-10 20-15z" />
            </svg>
          </div>
          {/* Gold Frame SVG Overlay */}
          <div className="absolute inset-4 border border-yellow-600/30 rounded-xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between text-yellow-600/50 text-[8px] font-serif"><span>✦</span><span>✦</span></div>
            <div className="flex justify-between text-yellow-600/50 text-[8px] font-serif"><span>✦</span><span>✦</span></div>
          </div>
          <div className="relative z-10 space-y-1.5 flex flex-col items-center">
            <Flower className="w-5 h-5 text-indigo-500 animate-pulse" />
            <div className="font-serif italic text-xs text-indigo-900 tracking-tight">The Wedding of</div>
            <div className="font-serif font-black text-slate-800 text-sm tracking-widest uppercase">BLUE ROSE</div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[7px] text-indigo-700 font-bold uppercase tracking-widest font-mono">
              Watercolor Floral
            </span>
          </div>
        </div>
      );

    case "theme-royal-black-gold":
      return (
        <div className={`${baseClass} bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-950`}>
          {/* Subtle gold grid pattern */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#eab308_1px,transparent_1px),linear-gradient(to_bottom,#eab308_1px,transparent_1px)] bg-[size:10px_10px]" />
          {/* Ornate Gold Frame Overlay */}
          <div className="absolute inset-4 border-2 border-double border-amber-500/20 rounded-xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between text-amber-500/60 text-xs"><span>⚜</span><span>⚜</span></div>
            <div className="flex justify-between text-amber-500/60 text-xs"><span>⚜</span><span>⚜</span></div>
          </div>
          <div className="relative z-10 space-y-2 flex flex-col items-center">
            <span className="text-amber-500 text-base">⚜</span>
            <div className="font-serif italic text-[11px] text-amber-500/80 tracking-normal">Save The Date</div>
            <div className="font-mono text-xs font-semibold text-white tracking-[0.25em] uppercase pl-1">ROYAL GOLD</div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[7px] text-amber-400 font-bold uppercase tracking-widest font-mono">
              Luxury Velvet
            </span>
          </div>
        </div>
      );

    case "theme-sage-botanical":
      return (
        <div className={`${baseClass} bg-gradient-to-tr from-stone-50 to-emerald-50/75 border border-emerald-100`}>
          {/* Leaf illustrations */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
            <svg className="w-36 h-36 text-emerald-600" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 80 Q 50 50 90 20" />
              <path d="M50 50 Q 30 40 25 25" />
              <path d="M50 50 Q 70 60 75 75" />
              <path d="M30 65 Q 15 60 10 45" />
              <path d="M70 35 Q 85 40 90 55" />
            </svg>
          </div>
          {/* Inner frame */}
          <div className="absolute inset-5 border border-emerald-900/15 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between text-emerald-800/40 text-[6px]"><span>✿</span><span>✿</span></div>
            <div className="flex justify-between text-emerald-800/40 text-[6px]"><span>✿</span><span>✿</span></div>
          </div>
          <div className="relative z-10 space-y-2 flex flex-col items-center">
            <span className="text-emerald-700/80 text-xs">🌿</span>
            <div className="font-serif italic text-xs text-emerald-900/90 tracking-tight">The Intimate Wedding Of</div>
            <div className="font-sans font-black text-stone-850 text-xs tracking-[0.15em] uppercase">SAGE GARDEN</div>
            <span className="px-2 py-0.5 bg-emerald-500/15 text-[7px] font-bold text-emerald-800 uppercase tracking-widest rounded-lg font-mono">
              Botanical Green
            </span>
          </div>
        </div>
      );

    case "theme-blush-pink-rose":
      return (
        <div className={`${baseClass} bg-gradient-to-br from-rose-50 to-pink-100 border border-pink-150`}>
          {/* Hearts & flowers floating */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex justify-center items-center">
            <Heart className="w-16 h-16 text-rose-300 fill-rose-100 animate-pulse" />
          </div>
          <div className="absolute inset-4 border border-rose-300/30 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between text-rose-455 text-[8px]"><span>❀</span><span>❀</span></div>
            <div className="flex justify-between text-rose-455 text-[8px]"><span>❀</span><span>❀</span></div>
          </div>
          <div className="relative z-10 space-y-1.5 flex flex-col items-center">
            <span className="text-xs">🌸</span>
            <div className="font-serif italic text-xs text-rose-800">Together In Love</div>
            <div className="font-serif font-black text-rose-900 text-sm tracking-widest uppercase">BLUSH ROSE</div>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[7px] text-rose-700 font-bold uppercase tracking-widest font-mono">
              Korean Soft Pink
            </span>
          </div>
        </div>
      );

    case "theme-nusantara-luxury":
      return (
        <div className={`${baseClass} bg-gradient-to-tr from-stone-900 via-amber-950 to-red-950 border border-amber-900/50`}>
          {/* Ethnic vector outlines overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <svg className="w-44 h-44 text-amber-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M50 5 L95 50 L50 95 L5 50 Z" />
              <path d="M50 15 L85 50 L50 85 L15 50 Z" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="10" />
            </svg>
          </div>
          <div className="absolute inset-4 border border-amber-500/20 rounded-xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between text-amber-500/40 text-[9px] font-serif"><span>ꦛ</span><span>ꦛ</span></div>
            <div className="flex justify-between text-amber-500/40 text-[9px] font-serif"><span>ꦛ</span><span>ꦛ</span></div>
          </div>
          <div className="relative z-10 space-y-2 flex flex-col items-center">
            <div className="font-serif italic text-[10px] text-amber-400/80 tracking-wide">Pernikahan Agung</div>
            <div className="font-serif font-black text-amber-300 text-xs tracking-widest uppercase text-center">NUSANTARA HERITAGE</div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/20 text-[7px] text-amber-400 font-bold uppercase tracking-widest font-mono">
              Crimson Red &amp; Gold
            </span>
          </div>
        </div>
      );

    case "theme-fairytale-moonlight-blue":
      return (
        <div className={`${baseClass} bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border border-indigo-900`}>
          {/* Starfield background */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:16px_16px]" />
          <div className="absolute top-6 right-6 opacity-30">
            <Moon className="w-12 h-12 text-yellow-100 fill-yellow-50/50" />
          </div>
          <div className="absolute inset-4 border border-indigo-500/30 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between text-indigo-400/60 text-xs"><span>★</span><span>★</span></div>
            <div className="flex justify-between text-indigo-400/60 text-xs"><span>★</span><span>★</span></div>
          </div>
          <div className="relative z-10 space-y-1.5 flex flex-col items-center">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="font-serif italic text-xs text-indigo-200">The Fairytale of</div>
            <div className="font-serif font-black text-white text-xs tracking-[0.2em] uppercase pl-1">MOONLIGHT GARDEN</div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[7px] text-indigo-300 font-bold uppercase tracking-widest font-mono">
              Magical Crystal
            </span>
          </div>
        </div>
      );

    case "theme-royal-red-imperial":
      return (
        <div className={`${baseClass} bg-gradient-to-tr from-rose-950 via-red-950 to-amber-950 border border-rose-900`}>
          {/* Royal Crowns overlay style */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
            <svg className="w-36 h-36 text-amber-500" viewBox="0 0 100 100" fill="currentColor">
              <path d="M10 80 L30 35 L50 60 L70 35 L90 80 Z" />
            </svg>
          </div>
          <div className="absolute inset-4 border-2 border-dashed border-amber-500/20 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between text-amber-500/50 text-[10px]"><span>♛</span><span>♛</span></div>
            <div className="flex justify-between text-amber-500/50 text-[10px]"><span>♛</span><span>♛</span></div>
          </div>
          <div className="relative z-10 space-y-1.5 flex flex-col items-center">
            <span className="text-amber-500 text-xs">👑</span>
            <div className="font-serif italic text-xs text-rose-300/80">The Imperial Union</div>
            <div className="font-serif font-black text-rose-100 text-xs tracking-widest uppercase">ROYAL CRIMSON</div>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[7px] text-amber-400 font-bold uppercase tracking-widest font-mono">
              Crimson &amp; Luxury Gold
            </span>
          </div>
        </div>
      );

    default:
      return (
        <div className={`${baseClass} bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300`}>
          <div className="relative z-10 space-y-1 flex flex-col items-center">
            <Heart className="w-5 h-5 text-slate-400" />
            <div className="font-serif font-semibold text-slate-800">Wedding Template</div>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              Modern Minimalist
            </span>
          </div>
        </div>
      );
  }
}
