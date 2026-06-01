export interface WeddingTheme {
  id: string;
  name: string;
  description: string;
  
  // Font Configs (CSS family names to be injected safely as inline styling or custom classes)
  fontHeadingFamily: string;
  fontBodyFamily: string;
  
  // Tailwind & CSS class styling mappings
  primaryColor: string; // hex
  secondaryColor: string; // hex
  accentColor: string; // hex
  textColor: string; // text hex/tailwind
  headingColor: string; // text hex/tailwind
  softBgColor: string; // bg hex
  accentGoldColor: string; // gold hex/tailwind
  
  // Custom styles for global container wrapper background
  wrapperBgClass: string; 
  cardBgClass: string;
  cardBorderClass: string;
  textMutedClass: string;
  
  // Buttons styles
  btnPrimaryClass: string;
  btnSecondaryClass: string;
  
  // Particles Configuration
  particleColors: string[];
  particleShape: "petal" | "dust" | "leaf" | "rose-petal";
  
  // Section configurations
  countdownCardClass: string;
  countdownNumberClass: string;
  rsvpCardClass: string;
  rsvpInputClass: string;
  giftCardBgClass: string;
  giftBankTheme: "blue" | "black-gold" | "sage" | "pink";
  footerBgClass: string;
  footerTextClass: string;
  
  // Floral decorations & UI Frame configs
  decorations: {
    heroOverlayClass: string;
    cornerBorderClass: string;
    topFloralBg: string; // unspash URL representing watercolor hydrangea, gold, eucalyptus, or blush peony
    bottomFloralBg: string;
    useGoldCorners: boolean;
    useSageLeaves: boolean;
    useRoseRibbons: boolean;
  };
}

export const themes: Record<string, WeddingTheme> = {
  "theme-blue-hydrangea": {
    id: "theme-blue-hydrangea",
    name: "Elegant Blue Hydrangea & Watercolor Floral",
    description: "Elegant Luxury, Soft Romantic, Cold Luxury, Watercolor Floral Aesthetic, Calm Blue Atmosphere",
    fontHeadingFamily: "'Great Vibes', 'Allura', 'Cormorant Garamond', cursive, serif",
    fontBodyFamily: "'Poppins', 'Montserrat', 'Open Sans', sans-serif",
    primaryColor: "#7C9FCF",
    secondaryColor: "#AFC6E9",
    accentColor: "#DDE9F7",
    textColor: "#2E3A4D",
    headingColor: "#1E2A38",
    softBgColor: "#F4F8FA",
    accentGoldColor: "#D4C1A3",
    
    wrapperBgClass: "bg-gradient-to-br from-slate-50 via-[#E8F1FB] to-sky-100/60 min-h-screen text-[#2E3A4D]",
    cardBgClass: "bg-white/80 backdrop-blur-md text-slate-800",
    cardBorderClass: "border border-white/60 shadow-xl",
    textMutedClass: "text-[#5A6D86]",
    
    btnPrimaryClass: "bg-gradient-to-tr from-[#7C9FCF] to-[#5C7FA2] hover:bg-[#5C7FA2] text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
    btnSecondaryClass: "bg-sky-50 text-[#426987] border border-[#a9c7dd] hover:bg-sky-100 transition-all",
    
    particleColors: ["#b9d3e8", "#e0ebf5", "#f6d5da", "#f0e6cc"],
    particleShape: "petal",
    
    countdownCardClass: "bg-white/80 border border-sky-150 backdrop-blur-md shadow-lg",
    countdownNumberClass: "text-[#5582a2] font-semibold text-3xl",
    rsvpCardClass: "bg-white/90 border border-sky-150 shadow-xl",
    rsvpInputClass: "border-slate-200 focus:border-[#7C9FCF] focus:ring-1 focus:ring-[#7C9FCF] bg-white",
    giftCardBgClass: "bg-gradient-to-tr from-[#7C9FCF]/90 to-[#AFC6E9]/90 border border-white/40 shadow-xl",
    giftBankTheme: "blue",
    footerBgClass: "bg-[#1E2A38] text-slate-100",
    footerTextClass: "text-slate-300",
    
    decorations: {
      heroOverlayClass: "bg-sky-100/40 backdrop-blur-[1px]",
      cornerBorderClass: "border-[#7C9FCF]/40",
      topFloralBg: "", // soft dreamy blue watercolor floral painting
      bottomFloralBg: "",
      useGoldCorners: true,
      useSageLeaves: false,
      useRoseRibbons: false
    }
  },
  "theme-royal-black-gold": {
    id: "theme-royal-black-gold",
    name: "Royal Black & Gold Luxury Wedding",
    description: "Royal Luxury, Elegant Black Tie, Premium Gold, Dark Luxury, Dramatic Luxury & Premium Glamour",
    fontHeadingFamily: "'Cinzel Decorative', 'Cormorant Garamond', 'Playfair Display', serif",
    fontBodyFamily: "'Poppins', 'Lato', 'Montserrat', sans-serif",
    primaryColor: "#0F0F0F",
    secondaryColor: "#1C1C1C",
    accentColor: "#D4AF37",
    textColor: "#F8F5F0",
    headingColor: "#E8C96B",
    softBgColor: "#1C1C1C",
    accentGoldColor: "#D4AF37",
    
    wrapperBgClass: "bg-radial-at-t from-[#262626] via-[#121212] to-[#0A0A0A] min-h-screen text-[#F8F5F0] antialiased",
    cardBgClass: "bg-black/75 backdrop-blur-xl text-stone-100 border border-[#D4AF37]/35 shadow-[0_0_25px_rgba(212,175,55,0.12)]",
    cardBorderClass: "border-2 border-[#D4AF37]/45 shadow-[0_10px_35px_rgba(212,175,55,0.15)]",
    textMutedClass: "text-stone-400",
    
    btnPrimaryClass: "bg-gradient-to-tr from-[#D4AF37] via-[#E8C96B] to-[#D4AF37] hover:brightness-110 text-black font-semibold shadow-[0_4px_15px_rgba(212,175,55,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]",
    btnSecondaryClass: "bg-zinc-900 text-[#E8C96B] border border-[#D4AF37]/40 hover:bg-zinc-800 transition-all",
    
    particleColors: ["#D4AF37", "#E8C96B", "#F3E5AB", "#FFDF73", "#121212"],
    particleShape: "dust",
    
    countdownCardClass: "bg-black/8 w-full border border-[#D4AF37]/30 backdrop-blur-md shadow-2xl",
    countdownNumberClass: "text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#E8C96B] font-bold text-3xl",
    rsvpCardClass: "bg-[#181818] border-2 border-[#D4AF37]/35 shadow-2l",
    rsvpInputClass: "border-zinc-800 bg-[#222222] text-[#F8F5F0] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]",
    giftCardBgClass: "bg-gradient-to-tr from-[#121212] to-[#2B2B2B] border-2 border-[#D4AF37]/40 shadow-inner",
    giftBankTheme: "black-gold",
    footerBgClass: "bg-[#090909] text-stone-200 border-t border-[#D4AF37]/30",
    footerTextClass: "text-[#F8F5F0]/70",
    
    decorations: {
      heroOverlayClass: "bg-black/50 backdrop-blur-[2px]",
      cornerBorderClass: "border-[#D4AF37]/60",
      topFloralBg: "", // luxury aesthetic black gold sparkles
      bottomFloralBg: "",
      useGoldCorners: true,
      useSageLeaves: false,
      useRoseRibbons: false
    }
  },
  "theme-sage-botanical": {
    id: "theme-sage-botanical",
    name: "Sage Green Botanical Garden Wedding",
    description: "Botanical Garden, Natural Elegant, Earth Tone Luxury, Fresh Romantic, Calm Nature & Organic Premium",
    fontHeadingFamily: "'Cormorant Garamond', 'Playfair Display', 'Parisienne', serif, cursive",
    fontBodyFamily: "'Poppins', 'Nunito', 'Open Sans', sans-serif",
    primaryColor: "#8FAF9B",
    secondaryColor: "#AFC9B7",
    accentColor: "#F6F3EE",
    textColor: "#3F4A42",
    headingColor: "#2A362D",
    softBgColor: "#FAFAF8",
    accentGoldColor: "#8B6F5A",
    
    wrapperBgClass: "bg-gradient-to-br from-[#FAFAF8] via-[#EAEFED] to-[#AFC9B7]/40 min-h-screen text-[#3F4A42]",
    cardBgClass: "bg-[#FAFAF8]/90 backdrop-blur-md text-[#3F4A42] border border-[#8FAF9B]/40 shadow-lg",
    cardBorderClass: "border-2 border-[#8FAF9B]/55 shadow-2xl rounded-3xl",
    textMutedClass: "text-emerald-850/60",
    
    btnPrimaryClass: "bg-gradient-to-tr from-[#8FAF9B] to-[#6E8B74] hover:bg-[#6E8B74] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
    btnSecondaryClass: "bg-[#FAFAF8] text-[#6E8B74] border border-[#8FAF9B] hover:bg-[#EAEFED] transition-all",
    
    particleColors: ["#8FAF9B", "#AFC9B7", "#6E8B74", "#D8E2DC", "#F6F3EE"],
    particleShape: "leaf",
    
    countdownCardClass: "bg-[#FAFAF8]/85 border border-[#8FAF9B]/30 backdrop-blur-sm shadow-md",
    countdownNumberClass: "text-[#6E8B74] font-semibold text-3xl",
    rsvpCardClass: "bg-[#FAFAF8] border border-[#8FAF9B]/40 shadow-lg",
    rsvpInputClass: "border-slate-200 bg-[#FAFAF8] focus:border-[#8FAF9B] focus:ring-1 focus:ring-[#8FAF9B]",
    giftCardBgClass: "bg-gradient-to-tr from-[#8FAF9B]/85 to-[#AFC9B7]/85 border border-white/60 shadow-md",
    giftBankTheme: "sage",
    footerBgClass: "bg-[#2F3A31] text-emerald-50 border-t border-[#8FAF9B]/20",
    footerTextClass: "text-emerald-100/75",
    
    decorations: {
      heroOverlayClass: "bg-emerald-50/20 backdrop-blur-[1px]",
      cornerBorderClass: "border-[#8FAF9B]/40",
      topFloralBg: "", // elegant premium eucalyptus watercolor botanical leaves
      bottomFloralBg: "",
      useGoldCorners: false,
      useSageLeaves: true,
      useRoseRibbons: false
    }
  },
  "theme-blush-pink-rose": {
    id: "theme-blush-pink-rose",
    name: "Blush Pink Rose & Soft Nude Luxury Wedding",
    description: "Feminine Luxury, Romantic Soft Pink, Elegant Nude Aesthetic, Korean Luxury Wedding, Soft Pastel Glamour",
    fontHeadingFamily: "'Great Vibes', 'Parisienne', 'Playfair Display', cursive, serif",
    fontBodyFamily: "'Poppins', 'Nunito', 'Montserrat', sans-serif",
    primaryColor: "#E8B7C4",
    secondaryColor: "#F3D6DE",
    accentColor: "#F7E9E4",
    textColor: "#5A4B4B",
    headingColor: "#2F1E1E",
    softBgColor: "#FFF9F7",
    accentGoldColor: "#D8A7A7",
    
    wrapperBgClass: "bg-gradient-to-br from-[#FFF9F7] via-[#F7E9E4] to-[#F3D6DE]/60 min-h-screen text-[#5A4B4B]",
    cardBgClass: "bg-[#FFF9F7]/90 backdrop-blur-md text-[#5A4B4B] border border-[#F3D6DE] shadow-xl",
    cardBorderClass: "border-2 border-pink-200/50 shadow-2xl rounded-3xl",
    textMutedClass: "text-[#8E7474]",
    
    btnPrimaryClass: "bg-gradient-to-tr from-[#E8B7C4] to-[#D8A7A7] hover:bg-[#D8A7A7] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
    btnSecondaryClass: "bg-[#FFF9F7] text-[#D8A7A7] border border-[#E8B7C4] hover:bg-[#F7E9E4] transition-all",
    
    particleColors: ["#E8B7C4", "#F3D6DE", "#F7E9E4", "#D8A7A7", "#FFF3FE"],
    particleShape: "rose-petal",
    
    countdownCardClass: "bg-[#FFF9F7]/85 border border-[#F3D6DE] backdrop-blur-sm shadow-md",
    countdownNumberClass: "text-[#E8B7C4] font-semibold text-3xl",
    rsvpCardClass: "bg-[#FFF9F7] border border-[#F3D6DE] shadow-xl",
    rsvpInputClass: "border-purple-100 bg-[#FFF9F7] focus:border-[#E8B7C4] focus:ring-1 focus:ring-[#E8B7C4]",
    giftCardBgClass: "bg-gradient-to-tr from-[#E8B7C4]/85 to-[#F3D6DE]/85 border border-white/60 shadow-md",
    giftBankTheme: "pink",
    footerBgClass: "bg-[#3D2C2E] text-rose-50 border-t border-[#F3D6DE]/20",
    footerTextClass: "text-rose-100/80",
    
    decorations: {
      heroOverlayClass: "bg-rose-50/20 backdrop-blur-[1px]",
      cornerBorderClass: "border-[#E8B7C4]/40",
      topFloralBg: "", // premium soft pink roses
      bottomFloralBg: "",
      useGoldCorners: false,
      useSageLeaves: false,
      useRoseRibbons: true
    }
  },
  "theme-nusantara-luxury": {
    id: "theme-nusantara-luxury",
    name: "Nusantara Heritage Wood & Gold",
    description: "Premium Indonesian Culture, Luxurious Warm Wood Brown, Elegant Java-Balinese Gold Accent, Rich Cream Batik Fabric Texture",
    fontHeadingFamily: "'Cormorant Garamond', 'Cinzel', 'Playfair Display', serif",
    fontBodyFamily: "'Poppins', 'Inter', 'Montserrat', sans-serif",
    primaryColor: "#6B4423", // Warm Wood Brown
    secondaryColor: "#A67C52", // Golden Brown
    accentColor: "#F5E8D8", // Cream
    textColor: "#1E1A17", // Warm Black
    headingColor: "#3E2723", // Dark Brown
    softBgColor: "#F5E8D8",
    accentGoldColor: "#D4AF37", // Gold Accent
    
    wrapperBgClass: "bg-gradient-to-br from-[#F5E8D8] via-[#E2D2BC] to-[#D5BEA1]/40 min-h-screen text-[#1E1A17] antialiased",
    cardBgClass: "bg-white/95 backdrop-blur-md text-[#1E1A17] border border-[#A67C52]/30 shadow-[0_15px_40px_rgba(107,68,35,0.06)] relative overflow-hidden rounded-3xl",
    cardBorderClass: "border-2 border-[#D4AF37]/65 shadow-[0_20px_50px_rgba(166,124,82,0.18)] rounded-3xl",
    textMutedClass: "text-[#6B4423]/85 font-sans",
    
    btnPrimaryClass: "bg-gradient-to-tr from-[#3E2723] via-[#6B4423] to-[#3E2723] hover:brightness-110 text-[#F5E8D8] font-semibold border border-[#D4AF37]/45 shadow-[0_4px_15px_rgba(107,68,35,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]",
    btnSecondaryClass: "bg-[#F5E8D8] text-[#3E2723] border border-[#A67C52] hover:bg-[#EBDDC8] transition-all",
    
    particleColors: ["#D4AF37", "#A67C52", "#6B4423", "#3E2723", "#F5E8D8"],
    particleShape: "dust",
    
    countdownCardClass: "bg-[#EBDDC8]/30 border border-[#A67C52]/45 backdrop-blur-md shadow-lg",
    countdownNumberClass: "text-[#3E2723] font-bold text-3xl font-serif",
    rsvpCardClass: "bg-white/95 border-2 border-[#A67C52]/45 shadow-2xl rounded-3xl",
    rsvpInputClass: "border-[#A67C52]/30 bg-[#F5E8D8]/50 text-[#1E1A17] focus:border-[#3E2723] focus:ring-1 focus:ring-[#3E2723] rounded-xl",
    giftCardBgClass: "bg-gradient-to-tr from-[#3E2723] via-[#6B4423] to-[#1E1A17] border-2 border-[#D4AF37]/55 shadow-xl rounded-3xl",
    giftBankTheme: "black-gold",
    footerBgClass: "bg-[#1E1A17] text-[#F5E8D8] border-t-2 border-[#D4AF37]",
    footerTextClass: "text-[#F5E8D8]/85",
    
    decorations: {
      heroOverlayClass: "bg-[#1E1A17]/40 backdrop-blur-[1px]",
      cornerBorderClass: "border-[#D4AF37]/75",
      topFloralBg: "",
      bottomFloralBg: "",
      useGoldCorners: true,
      useSageLeaves: false,
      useRoseRibbons: false
    }
  },
  "theme-fairytale-moonlight-blue": {
    id: "theme-fairytale-moonlight-blue",
    name: "Moonlight Blue Fairytale Garden",
    description: "Dreamy Moonlight Garden, Magical Blue & Lavender Rose Glow, Cinderella Luxury Crystal Glassmorphism",
    fontHeadingFamily: "'Parisienne', 'Cormorant Garamond', 'Playfair Display', cursive, serif",
    fontBodyFamily: "'Poppins', 'Montserrat', sans-serif",
    primaryColor: "#7FA7E8", // Moonlight Blue
    secondaryColor: "#AFCBFF", // Fairy Dust Blue
    accentColor: "#C8B6FF", // Soft Lavender
    textColor: "#E7ECF7", // Silver Mist text
    headingColor: "#FAFBFF", // Soft White Glow heading
    softBgColor: "#101F3E",
    accentGoldColor: "#AFCBFF",
    
    wrapperBgClass: "bg-gradient-to-b from-[#243B67] via-[#101F3E] to-[#0A1224] min-h-screen text-[#E7ECF7] antialiased relative overflow-hidden",
    cardBgClass: "bg-[#243B67]/40 backdrop-blur-xl text-[#FAFBFF] border border-[#AFCBFF]/25 shadow-[0_0_35px_rgba(127,167,232,0.12)] rounded-3xl",
    cardBorderClass: "border-2 border-[#AFCBFF]/50 shadow-[0_15px_45px_rgba(175,203,255,0.18)] rounded-3xl",
    textMutedClass: "text-[#AFCBFF]/85 font-sans",
    
    btnPrimaryClass: "bg-gradient-to-r from-[#7FA7E8] via-[#C8B6FF] to-[#7FA7E8] hover:brightness-115 text-[#101F3E] font-bold border border-[#FAFBFF]/40 shadow-[0_4px_20px_rgba(127,167,232,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]",
    btnSecondaryClass: "bg-[#243B67]/50 text-[#AFCBFF] border border-[#AFCBFF]/40 hover:bg-[#243B67]/70 transition-all",
    
    particleColors: ["#7FA7E8", "#AFCBFF", "#C8B6FF", "#E7ECF7", "#FAFBFF"],
    particleShape: "dust",
    
    countdownCardClass: "bg-[#FAFBFF]/5 border border-[#AFCBFF]/25 backdrop-blur-md shadow-xl rounded-2xl",
    countdownNumberClass: "text-transparent bg-clip-text bg-gradient-to-r from-[#AFCBFF] to-[#C8B6FF] font-bold text-3xl font-serif drop-shadow-[0_2px_10px_rgba(175,203,255,0.45)]",
    rsvpCardClass: "bg-[#101F3E]/75 border-2 border-[#AFCBFF]/35 backdrop-blur-2xl shadow-2xl rounded-3xl",
    rsvpInputClass: "border-[#AFCBFF]/30 bg-[#243B67]/30 text-[#FAFBFF] focus:border-[#AFCBFF] focus:ring-1 focus:ring-[#AFCBFF] rounded-xl",
    giftCardBgClass: "bg-gradient-to-tr from-[#1a2d52] via-[#243B67] to-[#40265c] border-2 border-[#AFCBFF]/40 shadow-2xl rounded-3xl",
    giftBankTheme: "blue",
    footerBgClass: "bg-[#0A1224] text-[#E7ECF7] border-t-2 border-[#AFCBFF]/35",
    footerTextClass: "text-[#E7ECF7]/75",
    
    decorations: {
      heroOverlayClass: "bg-[#0A1224]/30 backdrop-blur-[0.5px]",
      cornerBorderClass: "border-[#AFCBFF]/45",
      topFloralBg: "",
      bottomFloralBg: "",
      useGoldCorners: false,
      useSageLeaves: false,
      useRoseRibbons: true
    }
  },
  "theme-royal-red-imperial": {
    id: "theme-royal-red-imperial",
    name: "Royal Crimson Imperial Wedding",
    description: "Royal Palace Wedding, Imperial Crimson Velvet & Majestic Gold, Sultry Red Elegance, High-Class Cinematic Ballroom",
    fontHeadingFamily: "'Cinzel', 'Playfair Display', serif",
    fontBodyFamily: "'Poppins', 'Montserrat', sans-serif",
    primaryColor: "#8B0000", // Royal Crimson
    secondaryColor: "#A11212", // Imperial Red
    accentColor: "#D4AF37", // Luxury Gold
    textColor: "#F7F2EC", // Royal Cream
    headingColor: "#F0D58A", // Champagne Gold
    softBgColor: "#5C0B0B", // Velvet Wine / Dark Burgundy
    accentGoldColor: "#D4AF37",
    
    wrapperBgClass: "bg-[#2A0505] bg-radial-at-t from-[#5C0B0B] via-[#2A0505] to-[#140202] min-h-screen text-[#F7F2EC] antialiased relative overflow-hidden",
    cardBgClass: "bg-[#2A0505]/85 backdrop-blur-xl text-[#F7F2EC] border border-[#D4AF37]/35 shadow-[0_0_35px_rgba(139,0,0,0.25)] rounded-3xl",
    cardBorderClass: "border-2 border-[#D4AF37]/55 shadow-[0_15px_45px_rgba(212,175,55,0.22)] rounded-3xl",
    textMutedClass: "text-[#F0D58A]/85 font-sans",
    
    btnPrimaryClass: "bg-gradient-to-r from-[#D4AF37] via-[#F0D58A] to-[#D4AF37] hover:brightness-115 text-[#2A0505] font-bold border border-[#F0D58A]/40 shadow-[0_4px_20px_rgba(212,175,55,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]",
    btnSecondaryClass: "bg-[#5C0B0B]/50 text-[#F0D58A] border border-[#D4AF37]/45 hover:bg-[#5C0B0B]/75 transition-all",
    
    particleColors: ["#D4AF37", "#F0D58A", "#8B0000", "#A11212", "#F7F2EC"],
    particleShape: "rose-petal",
    
    countdownCardClass: "bg-[#F7F2EC]/5 border border-[#D4AF37]/30 backdrop-blur-md shadow-xl rounded-2xl",
    countdownNumberClass: "text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F0D58A] font-bold text-3xl font-serif drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]",
    rsvpCardClass: "bg-[#2A0505]/90 border-2 border-[#D4AF37]/40 backdrop-blur-2xl shadow-2xl rounded-3xl",
    rsvpInputClass: "border-[#D4AF37]/30 bg-[#5C0B0B]/40 text-[#F7F2EC] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl",
    giftCardBgClass: "bg-gradient-to-tr from-[#2A0505] via-[#5C0B0B] to-[#140202] border-2 border-[#D4AF37]/45 shadow-2xl rounded-3xl",
    giftBankTheme: "black-gold",
    footerBgClass: "bg-[#140202] text-[#F7F2EC] border-t-2 border-[#D4AF37]",
    footerTextClass: "text-[#F7F2EC]/75",
    
    decorations: {
      heroOverlayClass: "bg-[#140202]/35 backdrop-blur-[0.5px]",
      cornerBorderClass: "border-[#D4AF37]/70",
      topFloralBg: "",
      bottomFloralBg: "",
      useGoldCorners: true,
      useSageLeaves: false,
      useRoseRibbons: true
    }
  }
};

/**
 * Returns the corresponding theme based on ID or various dynamic string variations.
 */
export function getTheme(themeName: string | undefined): WeddingTheme {
  const normalized = (themeName || "").toLowerCase().trim();
  
  if (normalized.includes("imperial") || normalized.includes("royal-red") || normalized.includes("crimson") || normalized.includes("red-imperial") || normalized.includes("red-gold") || normalized.includes("luxury-red")) {
    return themes["theme-royal-red-imperial"];
  }

  if (normalized.includes("nusantara") || normalized.includes("indonesia") || normalized.includes("jawa") || normalized.includes("adat") || normalized.includes("traditional") || normalized.includes("culture") || normalized.includes("heritage")) {
    return themes["theme-nusantara-luxury"];
  }

  if (normalized.includes("fairytale") || normalized.includes("moonlight") || normalized.includes("blue-dream") || normalized.includes("dreamy") || normalized.includes("cinderella") || normalized.includes("fantasy") || normalized.includes("bintang")) {
    return themes["theme-fairytale-moonlight-blue"];
  }

  if (normalized.includes("black") || normalized.includes("royal-black-gold") || normalized.includes("golden royal") || normalized.includes("royal-black")) {
    return themes["theme-royal-black-gold"];
  }
  
  if (normalized.includes("sage") || normalized.includes("botanical") || normalized.includes("forest") || normalized.includes("hijau")) {
    return themes["theme-sage-botanical"];
  }
  
  if (normalized.includes("pink") || normalized.includes("blush") || normalized.includes("peony") || normalized.includes("rose") || normalized.includes("feminin")) {
    return themes["theme-blush-pink-rose"];
  }
  
  // Default is Theme 1 Blue Hydrangea
  return themes["theme-blue-hydrangea"];
}
