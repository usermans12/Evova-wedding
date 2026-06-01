import React from "react";
import { motion } from "motion/react";
import { Compass } from "lucide-react";
import { WeddingData } from "../../types";

interface CoverProps {
  data: WeddingData;
  coverStyle: any;
}

// Quiet, elegant watercolour gates/slides that fade gracefully
export const BlueHydrangeaCurtainGate: React.FC<CoverProps> = ({ data, coverStyle }) => {
  return (
    <>
      <motion.div 
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute inset-0 z-0 bg-cover bg-center overflow-hidden"
        style={{ 
          background: "linear-gradient(135deg, #f4f8fa 0%, #dde9f7 100%)" 
        }}
      >
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-[#bfd3e8] rounded-full filter blur-[100px] opacity-35 animate-pulse" />
      </motion.div>
    </>
  );
};

interface GalleryProps {
  images: string[];
  setActiveImageIndex: (index: number) => void;
  LazyImage: any;
}

export const BlueHydrangeaGallery: React.FC<GalleryProps> = ({ images, setActiveImageIndex, LazyImage }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-1">
      {images.map((img, i) => (
        <motion.div
          key={img}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.08 }}
          onClick={() => setActiveImageIndex(i)}
          className="aspect-[4/3] md:aspect-square relative overflow-hidden rounded-2xl cursor-pointer group border border-white/60 shadow-md hover:shadow-xl hover:scale-[1.01] transition-transform"
        >
          <LazyImage 
            src={img} 
            alt={`Galeri Hydrangea ${i}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-radial-at-t from-transparent via-[#1E2A38]/10 to-[#1E2A38]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-[10px] tracking-widest text-[#FAFBFF] font-semibold bg-[#7C9FCF]/90 px-3.5 py-1.5 rounded-full shadow-md">
              PERBESAR
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
