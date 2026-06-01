import React from "react";
import { motion } from "motion/react";
import { Sparkles, Crown } from "lucide-react";
import { WeddingData } from "../../types";

interface CoverProps {
  data: WeddingData;
  coverStyle: any;
}

// Royal velvet curtains of red crimson and wine that slide apart with elegant gold rope lines
export const RoyalCrimsonCurtainGate: React.FC<CoverProps> = () => {
  return (
    <>
      {/* Royal Curtain Left */}
      <motion.div
        initial={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 2.0, ease: [0.76, 0, 0.24, 1] }}
        className="absolute left-0 top-0 bottom-0 w-1/2 z-10 border-r border-[#D4AF37]/60 flex items-center justify-end overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #5C0B0B 0%, #2A0505 50%, #140202 100%)",
          boxShadow: "15px 0 45px rgba(0,0,0,0.95)"
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#8B0000]/30 via-transparent to-transparent pointer-events-none" />
        
        {/* Subtle velvet striping / lighting effect */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(139,0,0,0.15)_0%,_transparent_10%,_rgba(92,11,11,0.1)_20%,_transparent_50%,_rgba(139,0,0,0.12)_80%,_transparent_100%)] pointer-events-none" />
        
        <div className="absolute top-8 right-8 text-[#F0D58A] opacity-25 scale-[1.7] animate-pulse">
          <Crown className="w-16 h-16 rotate-12" />
        </div>
        
        {/* Interactive glowing particles on curtain */}
        <div className="absolute bottom-12 right-12 text-[#D4AF37] opacity-20">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: "12s" }} />
        </div>
        
        {/* Decorative Velvet Rope/Gold Trim Accent */}
        <div className="w-2 h-full bg-gradient-to-b from-[#D4AF37] via-[#F0D58A] to-[#D4AF37] mr-px opacity-90 shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
      </motion.div>

      {/* Royal Curtain Right */}
      <motion.div
        initial={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 2.0, ease: [0.76, 0, 0.24, 1] }}
        className="absolute right-0 top-0 bottom-0 w-1/2 z-10 border-l border-[#D4AF37]/60 flex items-center justify-start overflow-hidden"
        style={{
          background: "linear-gradient(225deg, #8B0000 0%, #2A0505 50%, #140202 100%)",
          boxShadow: "-15px 0 45px rgba(0,0,0,0.95)"
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-[#5C0B0B]/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(270deg,_rgba(139,0,0,0.15)_0%,_transparent_10%,_rgba(92,11,11,0.1)_20%,_transparent_50%,_rgba(139,0,0,0.12)_80%,_transparent_100%)] pointer-events-none" />

        <div className="absolute top-8 left-8 text-[#F0D58A] opacity-25 scale-[1.7] animate-pulse">
          <Crown className="w-16 h-16 -rotate-12" />
        </div>
        
        <div className="absolute bottom-12 left-12 text-[#D4AF37] opacity-20">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: "15s" }} />
        </div>

        {/* Decorative Velvet Rope/Gold Trim Accent */}
        <div className="w-2 h-full bg-gradient-to-b from-[#D4AF37] via-[#F0D58A] to-[#D4AF37] ml-px opacity-90 shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
      </motion.div>
    </>
  );
};

interface GalleryProps {
  images: string[];
  setActiveImageIndex: (index: number) => void;
  LazyImage: any;
}

// Imperial high-class gallery layout with dynamic hover frame shimmers
export const RoyalCrimsonGallery: React.FC<GalleryProps> = ({ images, setActiveImageIndex, LazyImage }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5 px-1">
      {images.map((img, i) => (
        <motion.div
          key={img}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" }}
          onClick={() => setActiveImageIndex(i)}
          className="aspect-[4/5] relative overflow-hidden rounded-2xl cursor-pointer group border-2 border-[#D4AF37]/30 hover:border-[#F0D58A] shadow-[0_10px_25px_rgba(92,11,11,0.25)] hover:shadow-[0_15px_35px_rgba(212,175,55,0.35)] transition-all duration-500 bg-[#2A0505]"
        >
          {/* Symmetrical Internal Frameline Overlay */}
          <div className="absolute inset-1.5 border border-[#D4AF37]/45 rounded-xl pointer-events-none z-10 transition-colors duration-500 group-hover:border-[#F0D58A]/80" />
          
          <LazyImage 
            src={img} 
            alt={`Galeri Imperial ${i}`} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-108 brightness-[90%] group-hover:brightness-100"
            referrerPolicy="no-referrer"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#140202]/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-end pb-5 z-20">
            <Crown className="w-5 h-5 text-[#F0D58A] mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500" />
            <span className="text-[9px] tracking-[0.25em] text-[#F0D58A] font-mono font-bold uppercase">VIEW DETAILED PHOTO</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
