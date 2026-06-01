import React from "react";
import { motion } from "motion/react";
import { Heart } from "lucide-react";
import { WeddingData } from "../../types";

interface CoverProps {
  data: WeddingData;
  coverStyle: any;
}

// Romantic Rose garden cover gates with graceful fading transitions
export const BlushPinkCurtainGate: React.FC<CoverProps> = ({ data, coverStyle }) => {
  return (
    <>
      {/* Rosebud soft romantic cover backdrop */}
      <motion.div 
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0 z-0 bg-cover bg-center overflow-hidden flex flex-col items-center justify-center"
        style={{ 
          background: "linear-gradient(135deg, #fff3f5 0%, #fae1e6 100%)" 
        }}
      >
        <div className="absolute top-10 left-10 text-[#E8B7C4] opacity-20 scale-[2.5] animate-bounce-slow">
          <Heart className="w-16 h-16 fill-[#E8B7C4]/20" />
        </div>
        <div className="absolute bottom-10 right-10 text-[#E8B7C4] opacity-20 scale-[2] animate-bounce-slow" style={{ animationDelay: '1s' }}>
          <Heart className="w-16 h-16 fill-[#E8B7C4]/20" />
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

export const BlushPinkGallery: React.FC<GalleryProps> = ({ images, setActiveImageIndex, LazyImage }) => {
  return (
    <div className="grid grid-cols-2 gap-3 px-1">
      {images.map((img, i) => (
        <motion.div
          key={img}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
          onClick={() => setActiveImageIndex(i)}
          className="aspect-square relative overflow-hidden rounded-3xl cursor-pointer group border border-[#F3D6DE] shadow-sm hover:shadow-lg"
        >
          <LazyImage 
            src={img} 
            alt={`Galeri Blush Pink ${i}`} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[#3D2C2E]/20 group-hover:bg-[#3D2C2E]/40 transition-colors flex items-center justify-center">
            <span className="px-4 py-1.5 text-[9px] tracking-widest text-[#FFF9F7] font-bold border border-[#E8B7C4]/60 bg-[#E8B7C4]/84 rounded-full opacity-0 group-hover:opacity-100 duration-300">
              LIHAT DISINI
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
