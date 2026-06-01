import React from "react";
import { motion } from "motion/react";
import { Sparkles, Moon } from "lucide-react";
import { WeddingData } from "../../types";

interface CoverProps {
  data: WeddingData;
  coverStyle: any;
}

// Dreamy sparkling celestial gates
export const FairytaleCoverGates: React.FC<CoverProps> = ({ data, coverStyle }) => {
  return (
    <>
      {/* Dynamic Starry Sky Background */}
      <motion.div 
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0 z-0 bg-cover bg-center overflow-hidden"
        style={{ 
          background: `radial-gradient(circle at center, #1b2f5c 0%, #0d172e 100%)` 
        }}
      >
        {/* Shimmering Moonlight Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[#9cb9f3] rounded-full filter blur-[120px] opacity-25 animate-pulse" />
        
        {/* Floating Stars Layer 1 */}
        <div className="absolute inset-0 bg-repeat opacity-30 mix-blend-screen pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px)`,
            backgroundSize: '120px 120px',
            backgroundPosition: '0 0'
          }}
        />

        {/* Floating Stars Layer 2 */}
        <div className="absolute inset-0 bg-repeat opacity-45 mix-blend-screen pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(white, rgba(255,255,255,.15) 1.5px, transparent 30px)`,
            backgroundSize: '90px 90px',
            backgroundPosition: '30px 40px'
          }}
        />
        
        {/* Twinkling Crescent Moon Overlay */}
        <div className="absolute top-10 right-10 opacity-30 scale-90 md:scale-110">
          <Moon className="w-16 h-16 text-[#C8B6FF] filter drop-shadow-[0_0_15px_#C8B6FF]" />
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

export const FairytaleGallery: React.FC<GalleryProps> = ({ images, setActiveImageIndex, LazyImage }) => {
  return (
    <div className="space-y-12 md:space-y-16 px-1">
      {images.map((img, i) => {
        const isEven = i % 2 === 0;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 80, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setActiveImageIndex(i)}
            className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center cursor-pointer group relative`}
          >
            {/* Glowing fantasy aura container */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#7FA7E8]/0 via-[#C8B6FF]/10 to-[#7FA7E8]/0 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 select-none pointer-events-none" />
            
            {/* Enlarged Editorial Image with Silver / Lavender Glass Frame */}
            <div className="w-full md:w-3/5 p-3 bg-white/5 backdrop-blur-md border border-[#AFCBFF]/20 rounded-3xl transition-all duration-700 hover:scale-[1.02] shadow-[0_4px_30px_rgba(0,0,0,0.1)] group-hover:shadow-[0_10px_40px_rgba(127,167,232,0.2)]">
               <div className="aspect-[16/10] rounded-2xl overflow-hidden relative border border-[#C8B6FF]/30 bg-slate-900/40">
                <LazyImage 
                  src={img} 
                  alt={`Cerita Dongeng ${i}`} 
                  className="w-full h-full object-cover transition-transform duration-[1.8s] group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[#101F3E]/10 group-hover:bg-[#101F3E]/40 duration-500 flex items-center justify-center">
                  <span className="px-5 py-2 rounded-full bg-[#243B67]/95 text-[#FAFBFF] border border-[#AFCBFF]/44 text-[9px] tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 font-bold backdrop-blur-sm shadow-[0_0_15px_rgba(127,167,232,0.3)]">
                    BUKA JENDELA MIMPI
                  </span>
                </div>
              </div>
            </div>

            {/* Storytelling annotation alongside photo */}
            <div className="w-full md:w-2/5 text-center md:text-left space-y-4 md:px-6 relative z-10">
              <span className="font-mono text-[9px] tracking-[0.25em] text-[#AFCBFF] font-bold uppercase block">Kisah Ajaib No. {i + 1}</span>
              <h4 className="text-2xl font-light tracking-wide text-[#FAFBFF] drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]" style={{ fontFamily: "'Parisienne', 'Playfair Display', serif" }}>
                {i === 0 ? "Awal Rasa yang Indah" : i === 1 ? "Melangkah di Selasar Mimpi" : i === 2 ? "Janji di Bawah Sinar Rembulan" : "Menapaki Alur Takdir Bersama"}
              </h4>
              <div className="w-10 h-[1.5px] bg-[#C8B6FF] mx-auto md:mx-0 shadow-[0_0_8px_#C8B6FF]"></div>
              <p className="text-[11px] leading-relaxed text-[#E7ECF7]/80 italic font-sans font-light">
                {i === 0 ? "Seperti kuncup bunga di taman rahasia yang tergerak oleh embun pagi, tatapan pertama menautkan hati." : i === 1 ? "Berjalan beriringan menggenggam jemari luhur, menjadikan setiap detik magis dalam alunan asmara." : i === 2 ? "Dua takdir yang dipersatukan di dekap malam yang teduh, bersumpah setia sehidup semati." : "Bersamamu hari-hari biasa berganti dongeng romantis yang tiada akhir, mengukir senyum di setiap langkah."}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
