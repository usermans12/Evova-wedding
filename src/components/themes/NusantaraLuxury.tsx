import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { WeddingData, LoveStoryItem } from "../../types";
import { ThemeVectorDecor } from "../ThemeVectorDecor";

interface CoverProps {
  data: WeddingData;
}

// 1. Sliding gunungan wayang traditional gates
export const NusantaraCurtainGate: React.FC<CoverProps> = ({ data }) => {
  return (
    <>
      {/* LEFT SLIDING GATE */}
      <motion.div
        initial={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
        className="absolute left-0 top-0 bottom-0 w-1/2 z-10 border-r border-[#D4AF37]/45 flex items-center justify-end overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #2A1A12 0%, #1E100A 100%)`,
          borderRightWidth: "1.5px",
          boxShadow: "15px 0 45px rgba(0,0,0,0.65)"
        }}
      >
        <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute -top-12 -left-12 w-64 h-64 opacity-[0.25]" />
        <ThemeVectorDecor themeId={data.theme} isBottom={true} className="absolute -bottom-12 -left-12 w-64 h-64 opacity-[0.25] rotate-90" />
        
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-repeat bg-center" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1611186711516-ec8cdd07590d')` }}
        />

        {/* Gunungan Wayang (Left side) */}
        <div className="relative translate-x-[45px] opacity-85 scale-90 md:scale-110 z-20 transition-all duration-700">
          <svg viewBox="0 0 100 200" width="100" height="200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 10 C50 65 40 105 100 190" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
            <path d="M100 10 C35 75 25 115 100 190 M100 40 C60 90 55 120 100 180" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.85" />
            <path d="M100 120 C70 110 65 95 60 80 M100 140 C80 135 70 120 65 110" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="65" cy="110" r="2.5" fill="#D4AF37" />
            <circle cx="60" cy="80" r="2.5" fill="#D4AF37" />
            <path d="M100 160 L80 160 L80 190" stroke="#D4AF37" strokeWidth="1.5" />
          </svg>
        </div>
      </motion.div>

      {/* RIGHT SLIDING GATE */}
      <motion.div
        initial={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
        className="absolute right-0 top-0 bottom-0 w-1/2 z-10 border-l border-[#D4AF37]/45 flex items-center justify-start overflow-hidden"
        style={{
          background: `linear-gradient(225deg, #1E100A 0%, #2A1A12 100%)`,
          borderLeftWidth: "1.5px",
          boxShadow: "-15px 0 45px rgba(0,0,0,0.65)"
        }}
      >
        <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute -top-12 -right-12 w-64 h-64 opacity-[0.25] rotate-[270deg]" />
        <ThemeVectorDecor themeId={data.theme} isBottom={true} className="absolute -bottom-12 -right-12 w-64 h-64 opacity-[0.25] rotate-180" />
        
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-repeat bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1611186711516-ec8cdd07590d')` }}
        />

        {/* Gunungan Wayang (Right side) */}
        <div className="relative -translate-x-[45px] opacity-85 scale-90 md:scale-110 z-20 transition-all duration-700">
          <svg viewBox="0 0 100 200" width="100" height="200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 C50 65 60 105 0 190" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
            <path d="M0 10 C65 75 75 115 0 190 M0 40 C40 90 45 120 0 180" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.85" />
            <path d="M0 120 C30 110 35 95 40 80 M0 140 C20 135 30 120 35 110" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="35" cy="110" r="2.5" fill="#D4AF37" />
            <circle cx="40" cy="80" r="2.5" fill="#D4AF37" />
            <path d="M0 160 L20 160 L20 190" stroke="#D4AF37" strokeWidth="1.5" />
          </svg>
        </div>
      </motion.div>
    </>
  );
};

interface GalleryProps {
  images: string[];
  setActiveImageIndex: (index: number) => void;
  LazyImage: any;
}

export const NusantaraGallery: React.FC<GalleryProps> = ({ images, setActiveImageIndex, LazyImage }) => {
  return (
    <div className="space-y-10 md:space-y-14 px-1">
      {images.map((img, i) => {
        const isEven = i % 2 === 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 70, scale: 0.98, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.3, ease: [0.25, 0.8, 0.25, 1], delay: (i % 2) * 0.1 }}
            onClick={() => setActiveImageIndex(i)}
            className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 items-center cursor-pointer group`}
          >
            {/* Enlarged Editorial Image with Gold Wood Frame */}
            <div className="w-full md:w-3/5 p-2.5 bg-[#EBDDC8]/30 border border-[#A67C52]/25 rounded-3xl transition-transform duration-700 hover:scale-[1.015] shadow-xl">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative border border-[#D4AF37]/35 shadow-inner bg-[#3E2723]/10">
                <LazyImage 
                  src={img} 
                  alt={`Momen Indah ${i}`} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/35 duration-500 flex items-center justify-center">
                  <span className="px-5 py-2 rounded-full bg-[#3E2723]/95 text-[#F5E8D8] border border-[#D4AF37]/50 text-[9px] tracking-widest uppercase opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 font-bold">
                    PERBESAR MOMEN
                  </span>
                </div>
              </div>
            </div>

            {/* Storytelling annotation alongside photo */}
            <div className="w-full md:w-2/5 text-center md:text-left space-y-3.5 md:px-5">
              <span className="font-mono text-[9px] tracking-widest text-[#A67C52] font-bold uppercase">MOMEN INDAH {i + 1}</span>
              <h4 className="text-xl font-light tracking-wide font-serif text-[#3E2723]">
                {i === 0 ? "Tatapan Penuh Makna" : i === 1 ? "Selasar Hangat Kebahagiaan" : i === 2 ? "Dua Jiwa Satu Tujuan" : "Langkah Bersama Menuju Masa Depan"}
              </h4>
              <div className="w-8 h-[1px] bg-[#A67C52] mx-auto md:mx-0"></div>
              <p className="text-[11px] leading-relaxed text-[#6B4423]/80 italic font-sans font-light">
                {i === 0 ? "Pertemuan pertama yang menumbuhkan rasa dan keyakinan suci dalam sanubari." : i === 1 ? "Kebersamaan yang dirajut dalam kesederhanaan, membawa rasa tenteram tiada tara." : i === 2 ? "Mengikat komitmen luhur di bawah restu semesta menuju ikatan pernikahan yang agung." : "Setiap jengkal kehidupan akan kita susuri bersama, dalam suka maupun duka mendampingi langkahmu."}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
