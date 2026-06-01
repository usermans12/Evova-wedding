import React from "react";
import { motion } from "motion/react";
import { Sparkles, Award } from "lucide-react";
import { WeddingData } from "../../types";

interface CoverProps {
  data: WeddingData;
  coverStyle: any;
}

// Royal luxurious curtains that open elegantly from the center with gold glow
export const RoyalCurtainGate: React.FC<CoverProps> = ({ data, coverStyle }) => {
  return (
    <>
      {/* Royal Curtain Left */}
      <motion.div
        initial={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
        className="absolute left-0 top-0 bottom-0 w-1/2 z-10 border-r border-[#D4AF37]/50 flex items-center justify-end overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #151515 0%, #080808 100%)",
          boxShadow: "10px 0 35px rgba(0,0,0,0.85)"
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-800/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-4 right-4 text-[#D4AF37] opacity-20 scale-150">
          <Award className="w-20 h-20 rotate-12" />
        </div>
        
        {/* Decorative Golden Pattern on Curtain Edge */}
        <div className="w-1.5 h-full bg-gradient-to-b from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] mr-[1px] opacity-80" />
      </motion.div>

      {/* Royal Curtain Right */}
      <motion.div
        initial={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 1.8, ease: [0.76, 0, 0.24, 1] }}
        className="absolute right-0 top-0 bottom-0 w-1/2 z-10 border-l border-[#D4AF37]/50 flex items-center justify-start overflow-hidden"
        style={{
          background: "linear-gradient(225deg, #0d0d0d 0%, #151515 100%)",
          boxShadow: "-10px 0 35px rgba(0,0,0,0.85)"
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-zinc-800/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4 text-[#D4AF37] opacity-20 scale-150">
          <Award className="w-20 h-20 -rotate-12" />
        </div>

        {/* Decorative Golden Pattern on Curtain Edge */}
        <div className="w-1.5 h-full bg-gradient-to-b from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] ml-[1px] opacity-80" />
      </motion.div>
    </>
  );
};

interface GalleryProps {
  images: string[];
  setActiveImageIndex: (index: number) => void;
  LazyImage: any;
}

export const RoyalGallery: React.FC<GalleryProps> = ({ images, setActiveImageIndex, LazyImage }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-1">
      {images.map((img, i) => (
        <motion.div
          key={img}
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
          onClick={() => setActiveImageIndex(i)}
          className="aspect-square relative overflow-hidden rounded-2xl cursor-pointer group border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/60 shadow-lg"
        >
          <LazyImage 
            src={img} 
            alt={`Galeri Royal ${i}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <span className="text-[10px] tracking-widest text-[#E8C96B] font-mono font-bold uppercase">VIEW PHOTO</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
