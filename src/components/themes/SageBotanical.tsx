import React from "react";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";
import { WeddingData } from "../../types";

interface CoverProps {
  data: WeddingData;
  coverStyle: any;
}

// Gentle fading organic gates representing natural botanical conservatory doors
export const SageCurtainGate: React.FC<CoverProps> = ({ data, coverStyle }) => {
  return (
    <>
      {/* Sliding Leaves Overlay on cover */}
      <motion.div 
        exit={{ opacity: 0, scale: 1.02, y: "-100%" }}
        transition={{ duration: 1.6, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-0 z-0 bg-cover bg-center overflow-hidden flex flex-col items-center justify-center"
        style={{ 
          background: "linear-gradient(135deg, #f2f5f3 0%, #dbe2dd 100%)" 
        }}
      >
        <div className="absolute top-1/4 left-1/4 text-[#8FAF9B] opacity-15 rotate-45 scale-[3]">
          <Leaf className="w-16 h-16" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-[#8FAF9B] opacity-15 -rotate-[30deg] scale-[2.5]">
          <Leaf className="w-16 h-16" />
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

export const SageGallery: React.FC<GalleryProps> = ({ images, setActiveImageIndex, LazyImage }) => {
  return (
    <div className="grid grid-cols-2 gap-3.5 px-1">
      {images.map((img, i) => (
        <motion.div
          key={img}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.1 }}
          onClick={() => setActiveImageIndex(i)}
          className="aspect-[4/3] relative overflow-hidden rounded-2xl cursor-pointer group border border-[#8FAF9B]/30 shadow-md hover:shadow-xl transition-shadow"
        >
          <LazyImage 
            src={img} 
            alt={`Galeri Sage ${i}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/45 duration-305 flex items-center justify-center">
            <span className="px-4 py-2 text-[9px] tracking-wider text-white border border-white/40 bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity uppercase font-semibold">
              Buka Lipatan
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
