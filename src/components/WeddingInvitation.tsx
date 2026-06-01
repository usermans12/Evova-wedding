import React, { useState, useEffect, useRef } from "react";
import { WeddingData, GuestWish, GlobalFeatureToggles } from "../types";
import { getTheme } from "../themes";
import { safeLocalStorage, validateGoogleMapsUrl } from "../utils";
import { 
  Heart, Calendar, MapPin, Clock, Copy, Map, ChevronLeft, 
  ChevronRight, X, Gift, Volume2, VolumeX, MessageSquare, Send, Check,
  Image as ImageIcon, Share2, Facebook, MessageCircle, Users, UserCheck, UserX,
  HelpCircle, Sparkles, HeartHandshake, Compass, Music, ArrowUpDown, Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeVectorDecor, PremiumVectorQR } from "./ThemeVectorDecor";
import { defaultImages } from "../data";
import {
  NusantaraCurtainGate, NusantaraGallery,
  FairytaleCoverGates, FairytaleGallery,
  RoyalCurtainGate, RoyalGallery,
  SageCurtainGate, SageGallery,
  BlushPinkCurtainGate, BlushPinkGallery,
  BlueHydrangeaCurtainGate, BlueHydrangeaGallery,
  RoyalCrimsonCurtainGate, RoyalCrimsonGallery
} from "./themes";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, doc, setDoc, getDocs, query, orderBy, onSnapshot } from "firebase/firestore";


const getYouTubeVideoId = (url?: string) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) return match[2];
  
  if (url.includes("music.youtube.com")) {
    try {
      const urlParams = new URL(url);
      return urlParams.searchParams.get("v") || "";
    } catch (e) {
      return "";
    }
  }
  return "";
};

const isYouTubeUrl = (url?: string) => {
  return !!(url && (url.includes("youtube.com") || url.includes("youtu.be") || url.includes("music.youtube.com")));
};

const isSpotifyUrl = (url?: string) => {
  return !!(url && (url.includes("spotify.com") || url.includes("open.spotify.com")));
};

const getSpotifyEmbedUrl = (url?: string) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split("/");
    const type = pathParts[1]; // e.g. "playlist", "track", "album"
    const id = pathParts[2];
    if ((type === "playlist" || type === "track" || type === "album" || type === "artist") && id) {
      return `https://open.spotify.com/embed/${type}/${id}`;
    }
  } catch (e) {
    const match = url.match(/spotify\.com\/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/);
    if (match) {
      return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
    }
  }
  return "";
};

const formatNameForScript = (name?: string) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "relative w-full h-full overflow-hidden",
  style,
  referrerPolicy,
  onClick,
  loading = "lazy"
}: { 
  src: string; 
  alt: string; 
  className?: string; 
  containerClassName?: string;
  style?: React.CSSProperties;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
  loading?: "lazy" | "eager";
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={containerClassName} style={style}>
      {!loaded && src && (
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-xl scale-110 opacity-60 animate-pulse"
          style={{ backgroundImage: `url(${src})` }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        referrerPolicy={referrerPolicy}
        onClick={onClick}
        className={`${className} transition-all duration-1000 ease-out ${loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"}`}
      />
    </div>
  );
};

interface CouplePhotoFrameProps {
  themeId: string;
  src: string;
  alt: string;
  primaryColor: string;
  midColor: string;
}

const CouplePhotoFrame: React.FC<CouplePhotoFrameProps> = ({ themeId, src, alt, primaryColor, midColor }) => {
  // 1. Nusantara
  if (themeId === "theme-nusantara-luxury") {
    return (
      <motion.div 
        animate={{ 
          boxShadow: [
            "0px 8px 16px rgba(159,44,44,0.2), 0 0 0px rgba(212,175,55,0.1)", 
            "0px 16px 32px rgba(159,44,44,0.4), 0 0 12px rgba(212,175,55,0.5)", 
            "0px 8px 16px rgba(159,44,44,0.2), 0 0 0px rgba(212,175,55,0.1)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative w-full max-w-[210px] aspect-[3/4] mx-auto p-1.5 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#9F2C2C] to-[#1E100A] relative z-10 group-hover:scale-[1.03] transition-all duration-700 ease-out border border-[#D4AF37]/50"
      >
        <div className="absolute inset-1 border border-[#D4AF37]/60 pointer-events-none rounded-xl" />
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37] pointer-events-none rounded-tl-xs" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37] pointer-events-none rounded-tr-xs" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37] pointer-events-none rounded-bl-xs" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37] pointer-events-none rounded-br-xs" />
        <div className="w-full h-full rounded-xl overflow-hidden relative">
          <LazyImage 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 duration-1000 transition-all ease-out"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    );
  }

  // 2. Fairytale
  if (themeId === "theme-fairytale-moonlight-blue") {
    return (
      <motion.div 
        animate={{ 
          y: [0, -6, 0],
          boxShadow: [
            "0 10px 20px rgba(13,23,46,0.5), 0 0 10px rgba(200,182,255,0.3)", 
            "0 15px 30px rgba(13,23,46,0.6), 0 0 22px rgba(200,182,255,0.6)", 
            "0 10px 20px rgba(13,23,46,0.5), 0 0 10px rgba(200,182,255,0.3)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        className="relative w-full max-w-[210px] aspect-[2/3] mx-auto p-1.5 rounded-t-full rounded-b-2xl bg-gradient-to-t from-[#0d172e] via-[#1b2f5c] to-[#C8B6FF]/30 border-2 border-[#C8B6FF]/50 relative z-10 group-hover:scale-[1.03] transition-all duration-700 ease-out"
      >
        <div className="absolute inset-0.5 border border-[#AFCBFF]/30 pointer-events-none rounded-t-full rounded-b-xl" />
        <div className="w-full h-full rounded-t-full rounded-b-xl overflow-hidden relative">
          <LazyImage 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover brightness-[95%] group-hover:brightness-100 group-hover:scale-105 duration-1000 transition-all ease-out"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    );
  }

  // 2.5 Royal Crimson Imperial
  if (themeId === "theme-royal-red-imperial") {
    return (
      <motion.div 
        animate={{ 
          y: [0, -7, 0],
          boxShadow: [
            "0 15px 30px rgba(92,11,11,0.5), 0 0 10px rgba(212,175,55,0.35)", 
            "0 20px 45px rgba(92,11,11,0.7), 0 0 25px rgba(212,175,55,0.68)", 
            "0 15px 30px rgba(92,11,11,0.5), 0 0 10px rgba(212,175,55,0.35)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }}
        className="relative w-full max-w-[210px] aspect-[11/16] mx-auto p-2 bg-gradient-to-br from-[#D4AF37] via-[#5C0B0B] to-[#F0D58A] border border-[#D4AF37]/80 rounded-2xl relative z-10 group-hover:scale-[1.04] transition-all duration-700 ease-out shadow-[0_15px_30px_rgba(92,11,11,0.5)]"
      >
        <div className="absolute inset-1.5 border-2 border-[#D4AF37]/50 rounded-xl pointer-events-none" />
        <div className="absolute inset-2 border border-[#F0D58A]/30 rounded-lg pointer-events-none" />
        
        {/* Symmetrical Palace Corner Accents */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37]" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37]" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37]" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]" />
        
        <div className="w-full h-full rounded-lg overflow-hidden relative">
          <LazyImage 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover brightness-[95%] group-hover:brightness-105 group-hover:scale-105 duration-1000 transition-all ease-out"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    );
  }

  // 3. Royal
  if (themeId === "theme-royal-black-gold") {
    return (
      <motion.div 
        animate={{ 
          y: [0, -4, 0],
          boxShadow: [
            "0_10px_20px_rgba(0,0,0,0.85), 0_0_10px_rgba(212,175,55,0.2)",
            "0_15px_30px_rgba(0,0,0,0.95), 0_0_22px_rgba(212,175,55,0.45)",
            "0_10px_20px_rgba(0,0,0,0.85), 0_0_10px_rgba(212,175,55,0.2)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="relative w-full max-w-[210px] aspect-[3/4] mx-auto p-2 bg-gradient-to-br from-[#D4AF37] via-zinc-900 to-[#E8C96B] border border-[#D4AF37]/70 rounded-xl relative z-10 group-hover:scale-[1.03] transition-all duration-700 ease-out"
      >
        <div className="absolute inset-1 border border-[#D4AF37]/50 pointer-events-none rounded-lg" />
        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[#D4AF37]/80 pointer-events-none" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[#D4AF37]/80 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[#D4AF37]/80 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[#D4AF37]/80 pointer-events-none" />
        <div className="w-full h-full rounded-lg overflow-hidden relative">
          <LazyImage 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover grayscale-[25%] group-hover:grayscale-0 group-hover:scale-105 duration-1000 transition-all ease-out"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    );
  }

  // 4. Sage Botanical
  if (themeId === "theme-sage-botanical") {
    return (
      <motion.div 
        animate={{ 
          rotate: [-0.6, 0.6, -0.6], 
          y: [0, -5, 0],
          boxShadow: [
            "0_10px_20px_rgba(110,139,116,0.12)",
            "0_15px_30px_rgba(110,139,116,0.25)",
            "0_10px_20px_rgba(110,139,116,0.12)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="relative w-full max-w-[210px] aspect-[3/4] mx-auto p-1.5 bg-gradient-to-br from-[#8FAF9B]/40 to-[#dbe2dd]/15 border border-[#8FAF9B]/40 rounded-tl-[80px] rounded-br-[80px] rounded-tr-[24px] rounded-bl-[24px] relative z-10 group-hover:scale-[1.02] transition-all duration-700 ease-out"
      >
        <div className="w-full h-full rounded-tl-[72px] rounded-br-[72px] rounded-tr-[18px] rounded-bl-[18px] overflow-hidden relative border border-white/50">
          <LazyImage 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover group-hover:scale-105 duration-1000 transition-all ease-out"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    );
  }

  // 5. Blush Pink Rose
  if (themeId === "theme-blush-pink-rose") {
    return (
      <motion.div 
        animate={{ 
          scale: [1, 1.018, 1], 
          y: [0, -5, 0],
          boxShadow: [
            "0_10px_20px_rgba(232,183,196,0.2)",
            "0_16px_32px_rgba(232,183,196,0.35)",
            "0_10px_20px_rgba(232,183,196,0.2)"
          ]
        }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="relative w-full max-w-[210px] aspect-[3/4] mx-auto p-1.5 bg-gradient-to-br from-[#E8B7C4] to-[#fae1e6] border border-white rounded-tr-[80px] rounded-bl-[80px] rounded-tl-[24px] rounded-br-[24px] relative z-10 group-hover:scale-[1.03] transition-all duration-700 ease-out"
      >
        <div className="w-full h-full rounded-tr-[72px] rounded-bl-[72px] rounded-tl-[18px] rounded-br-[18px] overflow-hidden relative border border-[#E8B7C4]/30">
          <LazyImage 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover group-hover:scale-105 duration-1000 transition-all ease-out"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    );
  }

  // 6. Blue Hydrangea
  return (
    <motion.div 
      animate={{ 
        y: [0, -5, 0],
        boxShadow: [
          "0_10px_20px_rgba(124,159,207,0.15)",
          "0_15px_30px_rgba(124,159,207,0.32)",
          "0_10px_20px_rgba(124,159,207,0.15)"
        ]
      }}
      transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
      className="relative w-full max-w-[210px] aspect-[3/4] mx-auto p-1.5 bg-gradient-to-br from-[#7C9FCF]/40 to-[#F4F8FA] border border-[#7C9FCF]/30 rounded-[32px] relative z-10 group-hover:scale-[1.03] transition-all duration-700 ease-out"
    >
      <div className="w-full h-full rounded-[26px] overflow-hidden relative border border-white">
        <LazyImage 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover group-hover:scale-105 duration-1000 transition-all ease-out"
          referrerPolicy="no-referrer"
        />
      </div>
    </motion.div>
  );
};

interface WeddingInvitationProps {
  data: WeddingData;
  globalToggles?: GlobalFeatureToggles;
  clientId?: string;
}

export default function WeddingInvitation({ data: rawData, globalToggles, clientId }: WeddingInvitationProps) {
  const data = globalToggles ? {
    ...rawData,
    enableRSVP: rawData.enableRSVP && globalToggles.rsvp,
    enableGuestbook: rawData.enableGuestbook && globalToggles.guestbook,
    enableMusic: rawData.enableMusic && globalToggles.music,
    enableCountdown: rawData.enableCountdown && globalToggles.countdown,
    enableLoveStory: rawData.enableLoveStory && globalToggles.loveStory,
    enableGiftDigital: rawData.enableGiftDigital && globalToggles.giftDigital,
    enableGoogleMaps: rawData.enableGoogleMaps && globalToggles.googleMaps,
  } : rawData;

  const activeTheme = getTheme(data.theme);
  
  const primaryColor = activeTheme.primaryColor;
  
  // Compute matching mid-tone accents and opacity variations for consistent branding
  const midColor = activeTheme.id === "theme-royal-black-gold" ? "#E8C96B"
    : activeTheme.id === "theme-sage-botanical" ? "#6E8B74"
    : activeTheme.id === "theme-blush-pink-rose" ? "#D8A7A7"
    : activeTheme.id === "theme-nusantara-luxury" ? "#D4AF37"
    : activeTheme.id === "theme-fairytale-moonlight-blue" ? "#AFCBFF"
    : activeTheme.id === "theme-royal-red-imperial" ? "#F0D58A"
    : "#5582a2";

  const softBg = activeTheme.id === "theme-royal-black-gold" ? "rgba(232, 201, 107, 0.08)"
    : activeTheme.id === "theme-sage-botanical" ? "rgba(110, 139, 116, 0.08)"
    : activeTheme.id === "theme-blush-pink-rose" ? "rgba(216, 167, 167, 0.08)"
    : activeTheme.id === "theme-nusantara-luxury" ? "rgba(212, 175, 55, 0.08)"
    : activeTheme.id === "theme-fairytale-moonlight-blue" ? "rgba(175, 203, 255, 0.08)"
    : activeTheme.id === "theme-royal-red-imperial" ? "rgba(240, 213, 138, 0.08)"
    : "rgba(85, 130, 162, 0.08)";

  const lightAcc = activeTheme.id === "theme-royal-black-gold" ? "rgba(212, 175, 55, 0.15)"
    : activeTheme.id === "theme-sage-botanical" ? "rgba(143, 175, 155, 0.15)"
    : activeTheme.id === "theme-blush-pink-rose" ? "rgba(232, 183, 196, 0.15)"
    : activeTheme.id === "theme-nusantara-luxury" ? "rgba(212, 175, 55, 0.15)"
    : activeTheme.id === "theme-fairytale-moonlight-blue" ? "rgba(200, 182, 255, 0.15)"
    : activeTheme.id === "theme-royal-red-imperial" ? "rgba(240, 213, 138, 0.15)"
    : "rgba(124, 159, 207, 0.15)";
  
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSpotifyPlayer, setShowSpotifyPlayer] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [petals, setPetals] = useState<{ id: number; left: number; delay: number; duration: number; size: number; color: string; rotate: number }[]>([]);
  
  // RSVP form states
  const [guestName, setGuestName] = useState("");
  const [attendance, setAttendance] = useState<"Hadir" | "Tidak Hadir" | "Ragu-ragu">("Hadir");
  const [wishText, setWishText] = useState("");
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Greeting parameter from URL query (e.g., ?to=Andi)
  const [guestNameParam, setGuestNameParam] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const to = params.get("to") || params.get("name") || params.get("guest");
      if (to) {
        const decoded = decodeURIComponent(to);
        setGuestNameParam(decoded);
        const cleanName = decoded.replace(/^(Yth\.\s+Bapak|Yth\.\s+Ibu|Bapak\/Ibu\/Saudara\/i|Kak|Adek|Sdr\/i|Sahabatku|Keluarga\s+Besar)\s+/i, "");
        setGuestName(cleanName);
      }
    }
  }, []);

  const heroImages = data.images && data.images.length > 0 
    ? data.images.slice(0, Math.min(data.images.length, 3)) 
    : [defaultImages[0]];

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Audio elements
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const targetDate = new Date(`${data.weddingDate}T08:00:00`).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [data.weddingDate]);

  // Load Wishes and sync from Firestore in real-time if available
  useEffect(() => {
    if (!clientId) {
      setWishes([]);
      return;
    }

    const wishesRef = collection(db, "clients", clientId, "wishes");
    const q = query(wishesRef, orderBy("createdAt", "desc"));
    
    const unsubscribeWishes = onSnapshot(q, (snapshot) => {
      const cloudWishes: GuestWish[] = [];
      snapshot.forEach((snap) => {
        cloudWishes.push(snap.data() as GuestWish);
      });
      setWishes(cloudWishes);
    }, (err) => {
      console.error("Gagal mengunduh review tamu live secara real-time dari Firestore:", err);
    });

    return () => unsubscribeWishes();
  }, [clientId]);

  // Initialize petals background particles
  useEffect(() => {
    if (isOpen) {
      const colors = activeTheme.particleColors;
      const generated = Array.from({ length: 42 }).map((_, i) => {
        return {
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 12,
          duration: 9 + Math.random() * 12,
          size: activeTheme.particleShape === "dust" ? 3 + Math.random() * 5 : 8 + Math.random() * 18,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotate: Math.random() * 360
        };
      });
      setPetals(generated);
    }
  }, [isOpen, data.theme]);

  // Handle native audio creation and binding (runs only when source changes)
  useEffect(() => {
    const hasBase64Audio = !!data.customAudioBase64;
    const isYouTube = !hasBase64Audio && isYouTubeUrl(data.customAudioUrl);
    const isSpotify = !hasBase64Audio && isSpotifyUrl(data.customAudioUrl);

    if (isYouTube || isSpotify) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const audioUrl = data.customAudioBase64 || data.customAudioUrl || "https://assets.mixkit.co/music/preview/mixkit-delicate-piano-372.mp3";
    
    // Stop and clean up previous audio element if source changes
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.loop = true;
    audioRef.current = audio;

    if (isOpen && isPlaying) {
      audio.play().catch(e => console.log("Audio play postponed until context interaction:", e));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [data.customAudioUrl, data.customAudioBase64]);

  // Handle active play / pause toggling cleanly without recreating the Audio instance
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isOpen && isPlaying) {
      audioRef.current.play().catch(e => {
        console.log("Audio play deferred to user touch/click interaction:", e);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isOpen, isPlaying]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setIsPlaying(true);
    
    // Auto-trigger audio instantly following human click interaction (highly robust for all iOS & Android browsers)
    const hasBase64Audio = !!data.customAudioBase64;
    const isYouTube = !hasBase64Audio && isYouTubeUrl(data.customAudioUrl);
    const isSpotify = !hasBase64Audio && isSpotifyUrl(data.customAudioUrl);
    
    if (isSpotify) {
      setShowSpotifyPlayer(true);
    }
    
    if (!isYouTube && !isSpotify) {
      const audioUrl = data.customAudioBase64 || data.customAudioUrl || "https://assets.mixkit.co/music/preview/mixkit-delicate-piano-372.mp3";
      
      // Stop and replace any passive background audio element with a gesture-unlocked one
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(audioUrl);
      audio.preload = "auto";
      audio.loop = true;
      audioRef.current = audio;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log("Audio play gesture failed, retrying on window interaction:", err);
          // Fallback user activity unlock
          const unlock = () => {
            if (audioRef.current) {
              audioRef.current.play().catch(() => {});
            }
            window.removeEventListener("touchstart", unlock);
            window.removeEventListener("click", unlock);
          };
          window.addEventListener("touchstart", unlock, { passive: true });
          window.addEventListener("click", unlock, { passive: true });
        });
      }
    }
  };

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const hasBase64Audio = !!data.customAudioBase64;
    const isSpotify = !hasBase64Audio && isSpotifyUrl(data.customAudioUrl);
    
    if (isSpotify) {
      setShowSpotifyPlayer(!showSpotifyPlayer);
      setIsPlaying(!showSpotifyPlayer);
      return;
    }

    if (!hasBase64Audio && isYouTubeUrl(data.customAudioUrl)) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (!audioRef.current) {
      const audioUrl = data.customAudioBase64 || data.customAudioUrl || "https://assets.mixkit.co/music/preview/mixkit-delicate-piano-372.mp3";
      audioRef.current = new Audio(audioUrl);
      audioRef.current.preload = "auto";
      audioRef.current.loop = true;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.log(e));
      setIsPlaying(true);
    }
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(data.bankAccount);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !wishText.trim()) return;

    setSubmitting(true);
    
    const newWish: GuestWish = {
      id: "w_" + Date.now(),
      name: guestName,
      attendance: attendance,
      wish: wishText,
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " ")
    };

    const updatedWishes = [newWish, ...wishes];
    setWishes(updatedWishes);

    // Upload to Firestore if clientId is present
    if (clientId) {
      try {
        const wishDocRef = doc(db, "clients", clientId, "wishes", newWish.id);
        await setDoc(wishDocRef, newWish);
      } catch (err) {
        console.error("Gagal mengirim doa restu ke Cloud Firestore:", err);
      }
    }

    // Small delay to simulate gorgeous premium submission feeling
    setTimeout(() => {
      // Clear Form Fields
      setWishText("");
      setSubmitting(false);

      // Fire Premium Success Toast
      setToastMessage("RSVP & Doa Restu Anda Berhasil Terkirim!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4500);
    }, 500);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    setActiveImageIndex(activeImageIndex === 0 ? data.images.length - 1 : activeImageIndex - 1);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeImageIndex === null) return;
    setActiveImageIndex(activeImageIndex === data.images.length - 1 ? 0 : activeImageIndex + 1);
  };

  // Aesthetic backgrounds
  const coverPhotoBg = data.images && data.images.length > 4 
    ? data.images[4] 
    : (data.images && data.images.length > 0 ? data.images[0] : null);

  const getDecorBgStyle = (isBottom: boolean = false) => {
    return {
      backgroundImage: '',
      mixBlendMode: 'multiply' as any,
    };
  };

  // Prewedding landscape / portrait sorting for a premium, non-tight masonry grid look
  const photoGridFormat = (idx: number) => {
    // Elegant rhythm spacing heights
    if (idx % 3 === 0) return "col-span-2 md:col-span-1 h-[280px] md:h-[350px]";
    if (idx % 2 === 0) return "col-span-1 h-[220px] md:h-[420px]";
    return "col-span-1 h-[250px] md:h-[310px]";
  };

  const getCoverThemeStyles = () => {
    switch (activeTheme.id) {
      case "theme-fairytale-moonlight-blue":
        return {
          bg: "#101F3E",
          overlay: "linear-gradient(to bottom, rgba(36, 59, 103, 0.45) 0%, rgba(16, 31, 62, 0.6) 50%, rgba(10, 18, 36, 0.98) 100%)",
          accentText: "#AFCBFF",
          borderColor: "rgba(175, 203, 255, 0.35)",
          btnBg: "linear-gradient(135deg, rgba(127, 167, 232, 0.75) 0%, rgba(200, 182, 255, 0.85) 100%)",
          btnTextColor: "#101F3E",
          indicatorColor: "#C8B6FF",
        };
      case "theme-nusantara-luxury":
        return {
          bg: "#100D0B",
          overlay: "linear-gradient(to bottom, rgba(30, 26, 23, 0.4) 0%, rgba(62, 39, 35, 0.55) 50%, rgba(16, 13, 11, 0.98) 100%)",
          accentText: "#D4AF37",
          borderColor: "rgba(212, 175, 55, 0.35)",
          btnBg: "linear-gradient(135deg, rgba(166, 124, 82, 0.75) 0%, rgba(212, 175, 55, 0.85) 100%)",
          btnTextColor: "#1E1A17",
          indicatorColor: "#D4AF37",
        };
      case "theme-royal-black-gold":
        return {
          bg: "#0c0c0c",
          overlay: "linear-gradient(to bottom, rgba(12, 12, 12, 0.45) 0%, rgba(22, 22, 22, 0.5) 50%, rgba(8, 8, 8, 0.96) 100%)",
          accentText: "#E8C96B",
          borderColor: "rgba(212, 175, 55, 0.25)",
          btnBg: "linear-gradient(135deg, rgba(212, 175, 55, 0.35) 0%, rgba(232, 201, 107, 0.45) 100%)",
          btnTextColor: "#ffffff",
          indicatorColor: "#D4AF37",
        };
      case "theme-sage-botanical":
        return {
          bg: "#1a251e",
          overlay: "linear-gradient(to bottom, rgba(26, 37, 30, 0.45) 0%, rgba(35, 48, 39, 0.5) 50%, rgba(22, 31, 25, 0.95) 100%)",
          accentText: "#AFC9B7",
          borderColor: "rgba(143, 175, 155, 0.25)",
          btnBg: "linear-gradient(135deg, rgba(143, 175, 155, 0.35) 0%, rgba(110, 139, 116, 0.45) 100%)",
          btnTextColor: "#ffffff",
          indicatorColor: "#8FAF9B",
        };
      case "theme-blush-pink-rose":
        return {
          bg: "#2b1c20",
          overlay: "linear-gradient(to bottom, rgba(43, 28, 32, 0.45) 0%, rgba(54, 35, 40, 0.5) 50%, rgba(38, 24, 28, 0.96) 100%)",
          accentText: "#F3D6DE",
          borderColor: "rgba(232, 183, 196, 0.25)",
          btnBg: "linear-gradient(135deg, rgba(232, 183, 196, 0.35) 0%, rgba(216, 167, 167, 0.45) 100%)",
          btnTextColor: "#ffffff",
          indicatorColor: "#E8B7C4",
        };
      case "theme-royal-red-imperial":
        return {
          bg: "#1c0303",
          overlay: "linear-gradient(to bottom, rgba(92, 11, 11, 0.45) 0%, rgba(42, 5, 5, 0.6) 50%, rgba(20, 2, 2, 0.98) 100%)",
          accentText: "#F0D58A",
          borderColor: "rgba(212, 175, 55, 0.4)",
          btnBg: "linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(240, 213, 138, 0.9) 100%)",
          btnTextColor: "#2A0505",
          indicatorColor: "#D4AF37",
        };
      case "theme-blue-hydrangea":
      default:
        return {
          bg: "#0c1524",
          overlay: "linear-gradient(to bottom, rgba(12, 21, 36, 0.50) 0%, rgba(15, 29, 46, 0.45) 45%, rgba(10, 18, 29, 0.88) 100%)",
          accentText: "#E8C96B",
          borderColor: "rgba(124, 159, 207, 0.2)",
          btnBg: "linear-gradient(135deg, rgba(124, 159, 207, 0.4) 0%, rgba(85, 130, 162, 0.5) 100%)",
          btnTextColor: "#ffffff",
          indicatorColor: "#E8C96B",
        };
    }
  };

  const coverStyle = getCoverThemeStyles();

  return (
    <div 
      className={`relative min-h-screen transition-all duration-1000 ease-in-out ${activeTheme.wrapperBgClass} ${!isOpen ? "overflow-hidden h-screen" : "overflow-y-auto"}`}
      style={{
        fontFamily: activeTheme.fontBodyFamily
      }}
    >
      {/* HIGH-END TOAST MESSAGE */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3.5 px-6 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-lg"
            style={{
              backgroundColor: '#FFFFFFEE',
              borderColor: '#CEDFEC',
              boxShadow: '0 20px 40px rgba(85, 130, 162, 0.15)'
            }}
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-slate-800">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING FLOWERS PETAL PARTICLES */}
      {isOpen && petals.map((p) => (
        <div 
          key={p.id}
          className="animate-petal shadow-xs"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: (activeTheme.particleShape === 'petal' || activeTheme.particleShape === 'rose-petal') ? '60% 0 60% 60%' 
                         : activeTheme.particleShape === 'leaf' ? '100% 0 100% 0' 
                         : '50%',
            transform: `rotate(${p.rotate}deg)`,
            opacity: activeTheme.id === "theme-fairytale-moonlight-blue" ? 0.85 : 0.65,
            filter: activeTheme.id === "theme-fairytale-moonlight-blue" ? 'blur(0.2px)' : 'blur(0.3px)',
            boxShadow: activeTheme.id === "theme-fairytale-moonlight-blue" 
              ? `0 0 10px ${p.color}, 0 0 4px ${p.color}, inset 0 0 2px white`
              : undefined
          }}
        />
      ))}

      {/* ABSOLUTE BACKGROUND LUXURY WATERCOLOR DESIGN WASHES */}
      <div className="absolute top-0 left-0 w-full h-[80vh] overflow-hidden pointer-events-none select-none z-0">
        <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute -top-12 -left-12 w-64 md:w-96 h-64 md:h-96 opacity-[0.22]" />
        <ThemeVectorDecor themeId={data.theme} isBottom={true} className="absolute top-1/4 -right-16 w-52 md:w-80 h-52 md:h-80 opacity-[0.15] transform rotate-45" />
      </div>

      {/* LUXURY WATERMARK BANNER FOR INDONESIAN HERITAGE THEME */}
      {isOpen && activeTheme.id === "theme-nusantara-luxury" && (
        <div 
          className="absolute inset-x-0 top-0 bottom-0 pointer-events-none mix-blend-overlay z-0 opacity-[0.04]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1611186711516-ec8cdd07590d')`,
            backgroundSize: '450px',
            backgroundRepeat: 'repeat',
            filter: 'contrast(125%) brightness(95%)'
          }}
        />
      )}

      {/* FULLSCREEN CINEMATIC HERO SPLASH / COVER OVERLAY */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div 
            exit={{ opacity: 1 }}
            transition={{ duration: 1.8 }}
            className="fixed inset-0 z-50 overflow-hidden select-none flex"
          >
            {/* MODULAR CURTAINS / GATE SPLIT PER SELECTED THEME */}
            {activeTheme.id === "theme-nusantara-luxury" ? (
              <NusantaraCurtainGate data={data} />
            ) : activeTheme.id === "theme-fairytale-moonlight-blue" ? (
              <FairytaleCoverGates data={data} coverStyle={coverStyle} />
            ) : activeTheme.id === "theme-royal-black-gold" ? (
              <RoyalCurtainGate data={data} coverStyle={coverStyle} />
            ) : activeTheme.id === "theme-sage-botanical" ? (
              <SageCurtainGate data={data} coverStyle={coverStyle} />
            ) : activeTheme.id === "theme-blush-pink-rose" ? (
              <BlushPinkCurtainGate data={data} coverStyle={coverStyle} />
            ) : activeTheme.id === "theme-royal-red-imperial" ? (
              <RoyalCrimsonCurtainGate data={data} coverStyle={coverStyle} />
            ) : activeTheme.id === "theme-blue-hydrangea" ? (
              <BlueHydrangeaCurtainGate data={data} coverStyle={coverStyle} />
            ) : (
              /* Standard Fallback Cover */
              <motion.div 
                exit={{ opacity: 0, scale: 1.05, y: "-100%" }}
                transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundColor: coverStyle.bg }}
              />
            )}

            {/* FULL CONTENT WRAPPER - FLOATED ON TOP */}
            <motion.div
              exit={{ opacity: 0, scale: 0.94, y: -30, transition: { duration: 0.9, ease: "easeOut" } }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden"
            >
              {/* Slideshow background only for standard simple theme */}
              {activeTheme.id !== "theme-nusantara-luxury" && (
                <div className="absolute inset-0 z-0 select-none pointer-events-none">
                  {heroImages.map((img, i) => {
                    const isActive = i === currentBgIndex;
                    return (
                      <motion.div 
                        key={img}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
                        style={{ 
                          backgroundImage: `url(${img})`,
                          display: (isActive || i === (currentBgIndex - 1 + heroImages.length) % heroImages.length) ? 'block' : 'none'
                        }}
                      />
                    );
                  })}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: coverStyle.overlay,
                      backdropFilter: 'blur(1.5px)'
                    }}
                  />
                </div>
              )}

              {/* Shadow Overlay for Beautiful Contrast inside Gate */}
              {activeTheme.id === "theme-nusantara-luxury" && (
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none opacity-90" />
              )}

              {/* Subtle premium luxury frame border overlay */}
              <div 
                className="absolute inset-4 md:inset-8 border pointer-events-none z-10 rounded-[2rem]" 
                style={{ borderColor: coverStyle.borderColor }}
              />
              
              {/* Top Minimal Line/Label */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 1.0 }}
                className="text-center mt-10 relative z-10 space-y-2 select-none"
              >
                <div 
                  className="tracking-[0.4em] text-[10px] md:text-[11px] font-bold uppercase"
                  style={{ color: coverStyle.indicatorColor }}
                >
                  THE WEDDING CELEBRATION OF
                </div>
                <div className="text-white/40 font-mono text-[8px] md:text-[9px] tracking-widest uppercase">
                  WALIMATUL 'URS
                </div>
              </motion.div>

              {/* Central Masterpiece Typography with abundance of negative space */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1.2 }}
                className="w-full max-w-xl text-center relative z-10 select-none px-4"
              >
                {/* The Couples Names with dynamic styling */}
                <h1 
                  className="text-5xl md:text-7xl font-extralight py-4 tracking-wide leading-tight text-white drop-shadow-md flex flex-col gap-2 md:gap-3 items-center"
                  style={{ fontFamily: activeTheme.fontHeadingFamily }}
                >
                  <span 
                    className="capitalize text-white tracking-normal font-script hover:scale-105 transition-transform duration-700 select-all block"
                    style={{
                      textShadow: activeTheme.id === "theme-fairytale-moonlight-blue" ? "0 0 15px rgba(175,203,255,0.75), 0 0 4px #C8B6FF" : undefined
                    }}
                  >
                    {formatNameForScript(data.groomNick || data.groomName.split(" ")[0])}
                  </span>
                  <span 
                    className="text-xl md:text-2xl font-serif italic font-light my-1"
                    style={{ color: coverStyle.accentText }}
                  >&amp;</span>
                  <span 
                    className="capitalize text-white tracking-normal font-script hover:scale-105 transition-transform duration-700 select-all block"
                    style={{
                      textShadow: activeTheme.id === "theme-fairytale-moonlight-blue" ? "0 0 15px rgba(175,203,255,0.75), 0 0 4px #C8B6FF" : undefined
                    }}
                  >
                    {formatNameForScript(data.brideNick || data.brideName.split(" ")[0])}
                  </span>
                </h1>

                <div 
                  className="w-20 h-[1px] mx-auto my-6 bg-gradient-to-r from-transparent via-transparent to-transparent"
                  style={{ backgroundImage: `linear-gradient(to right, transparent, ${coverStyle.borderColor}, transparent)` }}
                />

                {/* Guest recipient section positioned beautifully */}
                <p className="text-[11px] md:text-xs text-white/60 tracking-wider font-light uppercase space-y-2 mt-2">
                  <span>Kepada Yth. Bapak/Ibu/Saudara/i:</span>
                  <br />
                  {guestNameParam ? (
                    <span 
                      className="font-normal text-sm md:text-base mt-2 inline-block px-7 py-2.5 rounded-full border border-white/10 backdrop-blur-xs font-serif text-white uppercase tracking-widest shadow-lg select-all"
                      style={{ 
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {guestNameParam}
                    </span>
                  ) : (
                    <span 
                      className="font-light text-[10px] mt-2 inline-block px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-white/50 tracking-widest"
                    >
                      Tamu Undangan Terhormat
                    </span>
                  )}
                </p>

                {/* Luxury Cinematic Unlock button */}
                <div className="mt-10">
                  <button
                    onClick={handleOpenInvitation}
                    className="group relative select-none inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full font-semibold text-[10px] md:text-xs tracking-[0.2em] uppercase text-white shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border"
                    style={{
                      background: coverStyle.btnBg,
                      borderColor: coverStyle.borderColor
                    }}
                  >
                    <Music className="w-3.5 h-3.5 animate-spin-slow group-hover:scale-110 transition-transform" style={{ color: coverStyle.indicatorColor }} />
                    <span className="relative z-10 text-white transition-colors font-sans font-bold">BUKA UNDANGAN</span>
                  </button>
                </div>
              </motion.div>

              {/* Bottom Celebration of Love Footer */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1.0 }}
                className="text-center pb-8 relative z-10 select-none space-y-3"
              >
                <div className="text-[8px] md:text-[9px] tracking-[0.3em] font-medium text-white/50 uppercase">THE DATE OF CELEBRATION</div>
                <div 
                  className="text-xs md:text-sm font-semibold tracking-wider font-serif"
                  style={{ color: coverStyle.indicatorColor }}
                >
                  {data.weddingTimeFormat}
                </div>
                
                {/* Ultra smooth bounce scroll indicator */}
                <div className="w-[1.5px] h-8 rounded-full bg-white/20 mx-auto overflow-hidden relative mt-4">
                  <motion.div 
                    animate={{ 
                      y: [0, 16, 0],
                    }}
                    transition={{
                      duration: 2.0,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-full h-1/2 rounded-full absolute top-0" 
                    style={{ backgroundColor: coverStyle.indicatorColor }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING VINYL DISC MUSIC CONTROLLER */}
      {data.enableMusic && isOpen && (
        <>
          {/* Loop YouTube Frame back-end if needed */}
          {!data.customAudioBase64 && data.customAudioUrl && isYouTubeUrl(data.customAudioUrl) && (
            <iframe
              width="1"
              height="1"
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(data.customAudioUrl)}?autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=${getYouTubeVideoId(data.customAudioUrl)}&controls=0&mute=${isPlaying ? 0 : 1}`}
              title="Wedding BG Audio player"
              allow="autoplay; encrypted-media"
              className="absolute pointer-events-none opacity-0"
            />
          )}

          {/* Loop Spotify Player Card if selected */}
          {!data.customAudioBase64 && data.customAudioUrl && isSpotifyUrl(data.customAudioUrl) && (
            <AnimatePresence>
              {showSpotifyPlayer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  className="fixed bottom-[156px] md:bottom-20 right-6 z-40 w-[230px] md:w-[260px] rounded-2xl overflow-hidden shadow-2xl border bg-white/95 backdrop-blur-md"
                  style={{ borderColor: lightAcc, boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15)' }}
                >
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 bg-slate-50/50">
                    <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                      <Music className="w-3 h-3 text-[#1DB954]" /> Spotify Player
                    </span>
                    <button 
                      onClick={() => setShowSpotifyPlayer(false)}
                      className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <iframe
                    src={getSpotifyEmbedUrl(data.customAudioUrl)}
                    width="100%"
                    height="182"
                    frameBorder="0"
                    allowFullScreen={false}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="block"
                  />
                  <div className="p-1.5 px-3 text-[8px] text-slate-400 bg-slate-50/50 text-center leading-tight">
                    Ketuk tombol <strong className="text-slate-600">Putar/Play</strong> di atas untuk menikmati lagu.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <style>{`
            @keyframes musicMarquee {
              0% { transform: translate3d(105%, 0, 0); }
              100% { transform: translate3d(-105%, 0, 0); }
            }
            .music-marquee-bar {
              display: inline-block;
              white-space: nowrap;
              padding-left: 10px;
              animation: musicMarquee 15s linear infinite;
            }
            @keyframes musicSpin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .music-vinyl-rotate {
              animation: musicSpin 6s linear infinite;
            }
            @keyframes eqBarPulse {
              0%, 100% { transform: scaleY(0.3); }
              50% { transform: scaleY(1); }
            }
            .eq-wave-1 { animation: eqBarPulse 0.8s ease-in-out infinite alternate; transform-origin: bottom; }
            .eq-wave-2 { animation: eqBarPulse 1.2s ease-in-out infinite alternate; transform-origin: bottom; }
            .eq-wave-3 { animation: eqBarPulse 0.9s ease-in-out infinite alternate; transform-origin: bottom; }
          `}</style>

          <div 
            className="fixed bottom-24 md:bottom-6 right-6 z-40 flex items-center gap-2.5 px-3.5 py-2 rounded-full shadow-2xl border select-none overflow-hidden max-w-[230px] md:max-w-[260px] transition-all duration-300 bg-white/80 border-white/60 backdrop-blur-md"
            style={{ boxShadow: '0 15px 35px rgba(85, 130, 162, 0.12)' }}
          >
            {/* Spinning visual vinyl or heart */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-radial from-[#1e293b] to-[#0f172a] border border-slate-700 relative shadow-md ${isPlaying ? 'music-vinyl-rotate' : ''}`}>
              <div className="w-1.5 h-1.5 bg-white rounded-full z-15" />
              <Heart className="w-2.5 h-2.5 text-rose-400 absolute top-1 right-1 opacity-70" />
            </div>

            {/* Song Meta Information */}
            <div className="flex flex-col min-w-[80px] max-w-[110px] md:max-w-[120px] overflow-hidden leading-tight">
              <span className="text-[7px] text-slate-400 font-bold tracking-widest uppercase">BACKGROUND MUSIC</span>
              <div className="relative w-full overflow-hidden h-3.5 whitespace-nowrap">
                <span className={`inline-block text-[9px] font-medium text-[#426987] music-marquee-bar ${isPlaying ? '' : 'paused'}`}>
                  {data.customAudioTitle || (data.customAudioBase64 ? (data.customAudioFileName || "Musik Berkas Lokal") : (isSpotifyUrl(data.customAudioUrl) ? "Spotify Track/Playlist" : (isYouTubeUrl(data.customAudioUrl) ? "Wedding Song (YouTube)" : "Delicate Piano - Acoustic")))}
                </span>
              </div>
            </div>

            {/* EQ graphic wave indicator */}
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3 px-0.5 mt-1 flex-shrink-0">
                <div className="w-0.5 h-2.5 rounded-full eq-wave-1" style={{ backgroundColor: primaryColor }} />
                <div className="w-0.5 h-2.5 rounded-full eq-wave-2" style={{ backgroundColor: midColor }} />
                <div className="w-0.5 h-2.5 rounded-full eq-wave-3" style={{ backgroundColor: primaryColor }} />
              </div>
            )}

            {/* Circular Music Toggle Controller */}
            <button
              onClick={toggleMusic}
              className="p-1.5 rounded-full hover:brightness-105 active:scale-90 text-white shadow-sm transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${midColor} 100%)`
              }}
              title={isPlaying ? "Matikan Musik" : "Putar Musik"}
            >
              {isPlaying ? (
                <Volume2 className="w-3 h-3 text-white" />
              ) : (
                <VolumeX className="w-3 h-3 text-white" />
              )}
            </button>
          </div>
        </>
      )}

      {/* PERSISTENT FLOATING BOTTOM CODES NAVIGATION ROW */}
      {isOpen && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between gap-1 p-1.5 rounded-full shadow-2xl border bg-white/80 border-white/60 backdrop-blur-md transition-transform duration-300"
          style={{ boxShadow: `0 15px 40px ${lightAcc}` }}
        >
          {/* Couple section link */}
          <button
            onClick={() => scrollToSection("invite-section-couple")}
            className="flex flex-col items-center justify-center w-14 h-11 rounded-full text-center transition-all duration-200 hover:scale-[1.05] active:scale-95 group cursor-pointer"
          >
            <Heart className="w-4 h-4 transition-colors" style={{ color: primaryColor }} />
            <span className="text-[8px] font-bold text-slate-500 mt-0.5 tracking-wider uppercase">Mempelai</span>
          </button>

          {/* Location details section link */}
          <button
            onClick={() => scrollToSection("invite-section-lokasi")}
            className="flex flex-col items-center justify-center w-14 h-11 rounded-full text-center transition-all duration-200 hover:scale-[1.05] active:scale-95 group cursor-pointer"
          >
            <MapPin className="w-4 h-4 transition-colors" style={{ color: primaryColor }} />
            <span className="text-[8px] font-bold text-slate-500 mt-0.5 tracking-wider uppercase">Lokasi</span>
          </button>

          {/* Photo prewedding gallery section link */}
          {data.images.length > 0 && (!globalToggles || globalToggles.gallery) && (
            <button
              onClick={() => scrollToSection("invite-section-galeri")}
              className="flex flex-col items-center justify-center w-14 h-11 rounded-full text-center transition-all duration-200 hover:scale-[1.05] active:scale-95 group cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 transition-colors" style={{ color: primaryColor }} />
              <span className="text-[8px] font-bold text-slate-500 mt-0.5 tracking-wider uppercase">Galeri</span>
            </button>
          )}

          {/* RSVP and wishes link */}
          {(data.enableRSVP || data.enableGuestbook) && (
            <button
              onClick={() => scrollToSection("invite-section-rsvp")}
              className="flex flex-col items-center justify-center w-14 h-11 rounded-full text-center transition-all duration-200 hover:scale-[1.05] active:scale-95 group cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 transition-colors" style={{ color: primaryColor }} />
              <span className="text-[8px] font-bold text-slate-500 mt-0.5 tracking-wider uppercase">RSVP</span>
            </button>
          )}
        </div>
      )}

      {/* CORE DISPLAY PAGES */}
      {isOpen && (
        <div id="wedding-invitation-body" className="max-w-3xl mx-auto px-4 pb-24 pt-10 relative z-10 space-y-16">
          
          {/* PART 1: WELCOMING CARD & AR-RUM VERSE */}
          <section className="text-center space-y-6 pt-12 pb-6 relative px-4 md:px-12 overflow-hidden">
            {/* Top delicate center bouquet hanging */}
            <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 opacity-[0.22] pointer-events-none transform scale-y-[-1]" />

            {/* Inner aesthetic watercolor washed botanical circles */}
            <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 md:w-[480px] h-80 md:h-[480px] opacity-[0.05] pointer-events-none select-none" />

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9 }}
              className="space-y-4"
            >
              <p className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: midColor }}>ASSALAMUALAIKUM WR. WB.</p>
              
              <div className="w-10 h-10 rounded-full border flex items-center justify-center mx-auto bg-white/80 shadow-xs" style={{ borderColor: lightAcc }}>
                <Heart className="w-4 h-4 animate-pulse" style={{ color: midColor }} />
              </div>
            </motion.div>

            {/* Gilded Double Border Quote Frame Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className={`px-6 py-8 md:py-10 rounded-3xl backdrop-blur-md max-w-xl mx-auto space-y-5 relative overflow-hidden ${activeTheme.cardBgClass}`}
            >
              {/* Corner sprigs */}
              <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute top-0 left-0 w-16 h-16 opacity-[0.14] pointer-events-none" />
              <ThemeVectorDecor themeId={data.theme} isBottom={true} className="absolute bottom-0 right-0 w-16 h-16 opacity-[0.14] pointer-events-none transform rotate-180" />

              <p className="italic text-xs md:text-sm leading-relaxed font-serif relative z-10 font-[400]" style={{ color: activeTheme.textColor }}>
                "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir."
              </p>
              
              <div className="w-10 h-px bg-slate-200 mx-auto" />

              <div className="font-semibold text-[9px] tracking-[0.2em] font-mono relative z-10" style={{ color: midColor }}>
                SURAH AR-RUM : 21
              </div>
            </motion.div>
          </section>

          {/* PART 2: THE HAPPY COUPLE DETAILS */}
          <section id="invite-section-couple" className="space-y-8 relative overflow-hidden py-4">
            <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 md:w-[600px] h-96 md:h-[600px] opacity-[0.03] pointer-events-none select-none" />

            <div className="text-center relative py-4 max-w-md mx-auto space-y-1.5">
              <span className="text-[10px] tracking-[0.3em] font-bold" style={{ color: midColor }}>Tahta Suci Mempelai</span>
              <h2 className="tracking-wide text-2xl font-light" style={{ fontFamily: activeTheme.fontHeadingFamily, color: activeTheme.headingColor }}>
                Kedua Mempelai
              </h2>
              <div className="w-10 h-[1.5px] mx-auto mt-2" style={{ backgroundColor: primaryColor }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* GROOM PANEL */}
              <motion.div 
                initial={{ opacity: 0, y: 60, scale: 0.98, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.25, 0.8, 0.25, 1] }}
                className={`p-6 text-center space-y-4 relative overflow-hidden rounded-3xl group ${activeTheme.cardBgClass}`}
              >
                {/* Background corners foliage */}
                <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute -top-6 -right-6 w-24 h-24 opacity-[0.14] pointer-events-none" />
                <ThemeVectorDecor themeId={data.theme} isBottom={true} className="absolute -bottom-6 -left-6 w-24 h-24 opacity-[0.14] pointer-events-none transform rotate-180" />

                {/* Aesthetic Thin Gold corners inside Card */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#D4C1A3]/80 rounded-tl-xs pointer-events-none" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#D4C1A3]/80 rounded-tr-xs pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#D4C1A3]/80 rounded-bl-xs pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#D4C1A3]/80 rounded-br-xs pointer-events-none" />

                <CouplePhotoFrame 
                  themeId={data.theme} 
                  src={data.images[0] || "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ"} 
                  alt={data.groomName} 
                  primaryColor={primaryColor} 
                  midColor={midColor} 
                />

                <div className="relative z-10 space-y-1.5 pt-2">
                  <h3 className="text-xl font-bold tracking-wide font-serif" style={{ color: activeTheme.headingColor }}>{data.groomName}</h3>
                  {data.groomTitle && (
                    <span 
                      className="inline-block px-3 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border"
                      style={{ backgroundColor: softBg, color: midColor, borderColor: lightAcc }}
                    >
                      {data.groomTitle}
                    </span>
                  )}
                </div>

                <div className="w-8 h-px bg-slate-200 mx-auto" />

                <p className="text-xs font-light max-w-xs mx-auto leading-relaxed relative z-10 font-[400]" style={{ color: activeTheme.textColor, opacity: 0.85 }}>
                  {data.groomParents || "Putra tercinta dari Bpk. Latif Syarifudin & Ibu Wardah"}
                </p>
              </motion.div>

              {/* BRIDE PANEL */}
              <motion.div 
                initial={{ opacity: 0, y: 60, scale: 0.98, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, delay: 0.15, ease: [0.25, 0.8, 0.25, 1] }}
                className={`p-6 text-center space-y-4 relative overflow-hidden rounded-3xl group ${activeTheme.cardBgClass}`}
              >
                {/* Background corners foliage */}
                <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute -top-6 -right-6 w-24 h-24 opacity-[0.14] pointer-events-none" />
                <ThemeVectorDecor themeId={data.theme} isBottom={true} className="absolute -bottom-6 -left-6 w-24 h-24 opacity-[0.14] pointer-events-none transform rotate-180" />

                {/* Aesthetic Thin Gold corners inside Card */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#D4C1A3]/80 rounded-tl-xs pointer-events-none" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#D4C1A3]/80 rounded-tr-xs pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#D4C1A3]/80 rounded-bl-xs pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#D4C1A3]/80 rounded-br-xs pointer-events-none" />

                <CouplePhotoFrame 
                  themeId={data.theme} 
                  src={data.images[1] || "https://lh3.googleusercontent.com/d/1zH5qr-5ADf9IzFa1KmPD5C355xd4Ek-Y"} 
                  alt={data.brideName} 
                  primaryColor={primaryColor} 
                  midColor={midColor} 
                />

                <div className="relative z-10 space-y-1.5 pt-2">
                  <h3 className="text-xl font-bold tracking-wide font-serif" style={{ color: activeTheme.headingColor }}>{data.brideName}</h3>
                  {data.brideTitle && (
                    <span 
                      className="inline-block px-3 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border"
                      style={{ backgroundColor: softBg, color: midColor, borderColor: lightAcc }}
                    >
                      {data.brideTitle}
                    </span>
                  )}
                </div>

                <div className="w-8 h-px bg-slate-200 mx-auto" />

                <p className="text-xs font-light max-w-xs mx-auto leading-relaxed relative z-10 font-[400]" style={{ color: activeTheme.textColor, opacity: 0.85 }}>
                  {data.brideParents || "Putri tercinta dari Bpk. H. Apriyani Slamet & Ibu Hj. Aminah Nur"}
                </p>
              </motion.div>

            </div>
          </section>

          {/* PART 3: COUNTDOWN REVEAL TIMERS */}
          {data.enableCountdown && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1 }}
              className={`rounded-3xl p-6 md:p-8 text-center shadow-xl space-y-6 relative overflow-hidden ${activeTheme.cardBgClass}`}
            >
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url(${coverPhotoBg || defaultImages[0]})` }}></div>
              
              <div className="relative z-10 space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: midColor }}>COUNTDOWN TIMERS</div>
                <h3 className="text-3xl font-extralight italic" style={{ fontFamily: activeTheme.fontHeadingFamily, color: activeTheme.headingColor }}>
                  Save The Date
                </h3>
                <div className="text-xs font-mono text-slate-400 font-semibold">{data.weddingTimeFormat}</div>

                {/* Clock Boxes */}
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto pt-4">
                  {[
                    { label: "Hari", val: timeLeft.days },
                    { label: "Jam", val: timeLeft.hours },
                    { label: "Menit", val: timeLeft.minutes },
                    { label: "Detik", val: timeLeft.seconds }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -3, scale: 1.03 }}
                      className="p-3.5 rounded-2xl text-center border transition-all duration-300 shadow-xs"
                      style={{ 
                        backgroundColor: activeTheme.id === "theme-fairytale-moonlight-blue" ? "rgba(255, 255, 255, 0.04)" : softBg, 
                        borderColor: activeTheme.id === "theme-fairytale-moonlight-blue" ? "rgba(175, 203, 255, 0.25)" : lightAcc,
                        boxShadow: activeTheme.id === "theme-fairytale-moonlight-blue" ? "0 0 15px rgba(200, 182, 255, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.05)" : undefined
                      }}
                    >
                      <span 
                        className="block text-2xl md:text-3xl font-bold tracking-tight font-mono" 
                        style={{ 
                          color: activeTheme.id === "theme-fairytale-moonlight-blue" ? "#FAFBFF" : midColor,
                          textShadow: activeTheme.id === "theme-fairytale-moonlight-blue" ? "0 0 10px rgba(175, 203, 255, 0.6)" : undefined 
                        }}
                      >
                        {item.val}
                      </span>
                      <span 
                        className="text-[9px] uppercase tracking-wider block mt-0.5 font-mono font-medium"
                        style={{ color: activeTheme.id === "theme-fairytale-moonlight-blue" ? "#AFCBFF" : "rgb(148, 163, 184)" }}
                      >
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4">
                  {(() => {
                    const cleanDate = (data.weddingDate || "2026-06-11").replace(/-/g, "");
                    return (
                      <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan+${encodeURIComponent(data.groomName)}+%26+${encodeURIComponent(data.brideName)}&dates=${cleanDate}T080000Z/${cleanDate}T170000Z&details=Undangan+Pernikahan+digital+mewah.+Lokasi:+${encodeURIComponent(data.akadLocation)}&location=${encodeURIComponent(data.akadLocation)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-md hover:brightness-105 active:scale-95 transition-all"
                        style={{
                          background: `linear-gradient(to right, ${primaryColor}, ${midColor})`
                        }}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Sematkan ke Google Calendar
                      </a>
                    );
                  })()}
                </div>
              </div>
            </motion.section>
          )}

          {/* PART 4: DETAILED SERVICES INFO & GOOGLE MAPS */}
          <section id="invite-section-lokasi" className="space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] tracking-[0.3em] font-bold" style={{ color: midColor }}>Akad &amp; Resepsi</span>
              <h2 className="tracking-wide text-2xl font-light" style={{ fontFamily: activeTheme.fontHeadingFamily, color: activeTheme.headingColor }}>
                Jadwal &amp; Lokasi Acara
              </h2>
              <div className="w-10 h-[1.5px] mx-auto mt-2" style={{ backgroundColor: primaryColor }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* AKAD CARD */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className={`rounded-3xl border shadow-lg overflow-hidden flex flex-col justify-between group ${activeTheme.cardBgClass}`}
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }}></div>
                <div className="p-6 text-center space-y-4 flex-grow relative overflow-hidden">
                  <ThemeVectorDecor themeId={data.theme} isBottom={false} className="absolute top-0 right-0 w-20 h-20 opacity-[0.06] pointer-events-none" />
                  
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 font-semibold"
                    style={{ backgroundColor: softBg, color: midColor }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: activeTheme.headingColor }}>AKAD NIKAH</h3>
                  
                  <div className="space-y-1.5 py-1 text-xs font-medium" style={{ color: activeTheme.textColor, opacity: 0.85 }}>
                    <div className="flex items-center justify-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                      <strong>{data.weddingTimeFormat}</strong>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                      Pukul {data.akadTime}
                    </div>
                  </div>

                  <div className="w-6 h-px bg-slate-150 mx-auto" />
                  
                  <p className="text-xs leading-relaxed max-w-xs mx-auto font-[400]" style={{ color: activeTheme.textColor, opacity: 0.8 }}>
                    {data.akadLocation}
                  </p>
                </div>
              </motion.div>

              {/* RESEPSI CARD */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className={`rounded-3xl border shadow-lg overflow-hidden flex flex-col justify-between group ${activeTheme.cardBgClass}`}
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: midColor }}></div>
                <div className="p-6 text-center space-y-4 flex-grow relative overflow-hidden">
                  <ThemeVectorDecor themeId={data.theme} isBottom={true} className="absolute bottom-0 left-0 w-20 h-20 opacity-[0.06] pointer-events-none transform rotate-180" />

                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 font-semibold"
                    style={{ backgroundColor: softBg, color: midColor }}
                  >
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm tracking-widest uppercase" style={{ color: activeTheme.headingColor }}>RESEPSI PERNIKAHAN</h3>
                  
                  <div className="space-y-1.5 py-1 text-xs font-medium" style={{ color: activeTheme.textColor, opacity: 0.85 }}>
                    <div className="flex items-center justify-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" style={{ color: midColor }} />
                      <strong>{data.weddingTimeFormat}</strong>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5" style={{ color: midColor }} />
                      Pukul {data.resepsiTime}
                    </div>
                  </div>

                  <div className="w-6 h-px bg-slate-150 mx-auto" />
                  
                  <p className="text-xs leading-relaxed max-w-xs mx-auto font-[400]" style={{ color: activeTheme.textColor, opacity: 0.8 }}>
                    {data.resepsiLocation}
                  </p>
                </div>
              </motion.div>

            </div>

            {/* INTEGRATED MAPS COMPACT AREA */}
            {data.enableGoogleMaps && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className={`rounded-[2.25rem] p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100/80 overflow-hidden relative ${activeTheme.cardBgClass}`}
              >
                <div 
                  className="absolute top-3.5 right-5 text-[9px] font-bold px-3 py-1 rounded-full border z-10 font-mono tracking-wider shadow-sm"
                  style={{ color: midColor, backgroundColor: softBg, borderColor: lightAcc }}
                >
                  PETA LOKASI
                </div>
                
                {/* Artist watercolor canvas frame with soft shadows to seamlessly blend */}
                <div className="p-2 sm:p-2.5 bg-white/70 hover:bg-white/90 backdrop-blur-md rounded-[1.75rem] border border-slate-100 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] transition duration-300">
                  <div className="relative aspect-video rounded-[1.35rem] overflow-hidden bg-slate-50 shadow-inner">
                    <iframe 
                      title="Location Coordinate Map"
                      src={validateGoogleMapsUrl(data.mapsLink, data.akadLocation || data.resepsiLocation).embedUrl}
                      className="absolute inset-0 w-full h-full border-none filter contrast-[105%] saturate-[95%] rounded-[1.35rem]"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>

                <div className="p-3 text-center mt-1">
                  <a
                    href={data.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.akadLocation)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold text-white shadow-md hover:brightness-105 active:scale-95 transition-all"
                    style={{
                      background: `linear-gradient(to right, ${primaryColor}, ${midColor})`
                    }}
                  >
                    <Compass className="w-4 h-4 text-sky-100 animate-spin-slow" />
                    Buka Rute &amp; Jalan di Google Maps
                  </a>
                </div>
              </motion.div>
            )}
          </section>

          {/* PART 5: MASONRY PRESET GALLERY & LIGHTBOX */}
          {data.images.length > 0 && (!globalToggles || globalToggles.gallery) && (
            <section id="invite-section-galeri" className="space-y-6 animate-fade-in">
              <div className="text-center space-y-1">
                <span className="text-[10px] tracking-[0.3em] font-bold" style={{ color: midColor }}>Momen Indah Kedua Mempelai</span>
                <h2 className="tracking-wide text-2xl font-light" style={{ fontFamily: activeTheme.fontHeadingFamily, color: activeTheme.headingColor }}>
                  Galeri Prewedding
                </h2>
                <div className="w-10 h-[1.5px] mx-auto mt-2" style={{ backgroundColor: primaryColor }} />
              </div>

              {/* MODULAR PHOTO GALLERY CAROUSEL PER SELECTED THEME */}
              {activeTheme.id === "theme-nusantara-luxury" ? (
                <NusantaraGallery images={data.images} setActiveImageIndex={setActiveImageIndex} LazyImage={LazyImage} />
              ) : activeTheme.id === "theme-fairytale-moonlight-blue" ? (
                <FairytaleGallery images={data.images} setActiveImageIndex={setActiveImageIndex} LazyImage={LazyImage} />
              ) : activeTheme.id === "theme-royal-black-gold" ? (
                <RoyalGallery images={data.images} setActiveImageIndex={setActiveImageIndex} LazyImage={LazyImage} />
              ) : activeTheme.id === "theme-sage-botanical" ? (
                <SageGallery images={data.images} setActiveImageIndex={setActiveImageIndex} LazyImage={LazyImage} />
              ) : activeTheme.id === "theme-blush-pink-rose" ? (
                <BlushPinkGallery images={data.images} setActiveImageIndex={setActiveImageIndex} LazyImage={LazyImage} />
              ) : activeTheme.id === "theme-royal-red-imperial" ? (
                <RoyalCrimsonGallery images={data.images} setActiveImageIndex={setActiveImageIndex} LazyImage={LazyImage} />
              ) : activeTheme.id === "theme-blue-hydrangea" ? (
                <BlueHydrangeaGallery images={data.images} setActiveImageIndex={setActiveImageIndex} LazyImage={LazyImage} />
              ) : (
                /* Standard Fallback Masonry Gallery */
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 px-0.5 masonry-gallery">
                  {data.images.map((img, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 50, scale: 0.97, filter: "blur(8px)" }}
                      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ 
                        type: "tween",
                        ease: [0.25, 0.8, 0.25, 1],
                        duration: 1.2,
                        delay: (i % 3) * 0.12
                      }}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative cursor-pointer rounded-2xl border border-slate-100/40 group ${photoGridFormat(i)} bg-transparent`}
                    >
                      <div 
                        className="absolute -inset-1.5 rounded-3xl opacity-0 group-hover:opacity-25 blur-lg group-hover:blur-xl transition-all duration-700 pointer-events-none -z-10"
                        style={{
                          background: `radial-gradient(circle, ${activeTheme.primaryColor} 0%, transparent 100%)`
                        }}
                      />
                      
                      <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-[0_4px_12px_-2px_rgba(0,0,0,0.04),_0_2px_4px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_35px_-6px_rgba(0,0,0,0.08),_0_10px_20px_-8px_rgba(0,0,0,0.04)] transition-all duration-500 bg-white">
                        <LazyImage 
                          src={img} 
                          alt={`Galeri Prewedding ${i}`} 
                          className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.10]"
                          referrerPolicy="no-referrer"
                          loading={i < 4 ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-slate-900/15 group-hover:bg-slate-900/35 transition-all duration-500 flex items-center justify-center">
                          <div className="px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-bold tracking-wider text-slate-700 shadow-md border border-white opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 duration-500 font-sans">
                            PERBESAR FOTO
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* PART 6: LOVE STORY (IF CONFIGURED) */}
          {data.enableLoveStory && data.loveStories && (
            <section className="space-y-8">
              <div className="text-center space-y-1">
                <span className="text-[10px] tracking-[0.3em] font-bold" style={{ color: midColor }}>Memorabilia Cinta</span>
                <h2 className="tracking-wide text-2xl font-light" style={{ fontFamily: activeTheme.fontHeadingFamily, color: activeTheme.headingColor }}>
                  Kisah Perjalanan Indah
                </h2>
                <div className="w-10 h-[1.5px] mx-auto mt-2" style={{ backgroundColor: primaryColor }} />
              </div>

              {/* Fine timeline vertical line */}
              <div 
                className={`relative ml-4 md:ml-32 space-y-10 py-2 ${
                  activeTheme.id === "theme-nusantara-luxury" ? "border-l-2 border-double" 
                  : activeTheme.id === "theme-royal-red-imperial" ? "border-l-2 border-double"
                  : activeTheme.id === "theme-fairytale-moonlight-blue" ? "border-l border-dashed shadow-[0_0_8px_#AFCBFF20]"
                  : "border-l"
                }`} 
                style={{ 
                  borderColor: activeTheme.id === "theme-nusantara-luxury" ? "#D4AF3790" 
                    : activeTheme.id === "theme-royal-red-imperial" ? "#D4AF3780"
                    : activeTheme.id === "theme-fairytale-moonlight-blue" ? "#AFCBFF60"
                    : `${primaryColor}40` 
                }}
              >
                {data.loveStories.map((story, si) => (
                  <motion.div 
                    key={story.id} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: si * 0.1, duration: 0.8 }}
                    className="relative pl-6 md:pl-8"
                  >
                    {/* Central ring indicator */}
                    {activeTheme.id === "theme-nusantara-luxury" ? (
                      <div className="absolute -left-[8px] top-1.5 w-4 h-4 rounded-full border border-[#D4AF37] flex items-center justify-center bg-[#3E2723] shadow-md z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      </div>
                    ) : activeTheme.id === "theme-royal-red-imperial" ? (
                      <div className="absolute -left-[9px] top-1.5 w-4.5 h-4.5 rounded-full border border-[#F0D58A] flex items-center justify-center bg-[#2A0505] shadow-[0_0_8px_rgba(212,175,55,0.4)] z-10 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      </div>
                    ) : activeTheme.id === "theme-fairytale-moonlight-blue" ? (
                      <div className="absolute -left-[8px] top-1.5 w-4 h-4 rounded-full border border-[#AFCBFF] flex items-center justify-center bg-[#101F3E] shadow-[0_0_10px_#AFCBFF] z-10">
                        <Sparkles className="w-2 h-2 text-[#C8B6FF] animate-pulse" />
                      </div>
                    ) : (
                      <div className="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full border flex items-center justify-center bg-white shadow-xs z-10" style={{ borderColor: primaryColor }}>
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: midColor }} />
                      </div>
                    )}

                    {/* Timeline detail Card */}
                    <div 
                      className={`p-5 rounded-2xl relative md:-translate-x-12 md:left-0 border ${activeTheme.cardBgClass}`}
                      style={{
                        borderColor: activeTheme.id === "theme-nusantara-luxury" ? "#A67C5235" 
                          : activeTheme.id === "theme-royal-red-imperial" ? "rgba(212, 175, 55, 0.3)"
                          : activeTheme.id === "theme-fairytale-moonlight-blue" ? "#AFCBFF25"
                          : undefined,
                        boxShadow: activeTheme.id === "theme-nusantara-luxury" ? "0 10px 25px -5px rgba(62,39,35,0.06)" 
                          : activeTheme.id === "theme-royal-red-imperial" ? "0 12px 30px -5px rgba(92,11,11,0.5)"
                          : activeTheme.id === "theme-fairytale-moonlight-blue" ? "0 10px 30px -5px rgba(127,167,232,0.1)"
                          : undefined
                      }}
                    >
                      {/* Floating Year Bubble */}
                      {activeTheme.id === "theme-nusantara-luxury" ? (
                        <div className="absolute -top-3.5 left-4 px-3 py-1 text-[#F5E8D8] rounded-lg text-[9px] font-mono tracking-widest font-bold border border-[#D4AF37]/30 shadow-md flex items-center gap-1 bg-gradient-to-r from-[#3E2723] to-[#6B4423]">
                          <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" /> {story.year}
                        </div>
                      ) : activeTheme.id === "theme-royal-red-imperial" ? (
                        <div className="absolute -top-3.5 left-4 px-3 py-1 text-[#F0D58A] rounded-lg text-[9px] font-mono tracking-widest font-bold border border-[#D4AF37]/40 shadow-[0_0_12px_rgba(212,175,55,0.4)] flex items-center gap-1 bg-gradient-to-r from-[#5C0B0B] to-[#2A0505]">
                          <Sparkles className="w-2.5 h-2.5 text-[#F0D58A] animate-spin-slow" /> {story.year}
                        </div>
                      ) : activeTheme.id === "theme-fairytale-moonlight-blue" ? (
                        <div className="absolute -top-3.5 left-4 px-3 py-1 text-[#FAFBFF] rounded-lg text-[9px] font-mono tracking-widest font-bold border border-[#AFCBFF]/40 shadow-[0_0_12px_rgba(127,167,232,0.3)] flex items-center gap-1 bg-gradient-to-r from-[#243B67] to-[#40265c]">
                          <Sparkles className="w-2.5 h-2.5 text-[#AFCBFF] animate-spin-slow" /> {story.year}
                        </div>
                      ) : (
                        <div className="absolute -top-3 left-4 px-3 py-0.5 text-white rounded-full text-[9px] font-mono tracking-widest font-bold" style={{ backgroundColor: midColor }}>
                          {story.year}
                        </div>
                      )}
                      
                      <h4 className="font-bold text-xs mt-1.5 tracking-wide font-sans" style={{ color: activeTheme.headingColor }}>{story.title}</h4>
                      <p className="text-xs leading-relaxed mt-1.5 font-normal" style={{ color: activeTheme.textColor, opacity: 0.85 }}>{story.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* PART 7: DIGITAL CASH GIFTS (WEDDING GIFTS) */}
          {data.enableGiftDigital && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className={`rounded-3xl p-6 md:p-8 text-center shadow-xl space-y-6 relative overflow-hidden ${activeTheme.cardBgClass}`}
            >
              <div className="absolute inset-x-0 top-0 h-40 bg-cover bg-center opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url(${coverPhotoBg || defaultImages[0]})` }}></div>
              
              <div className="relative z-10 space-y-4">
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center mx-auto border font-semibold"
                  style={{ backgroundColor: softBg, color: midColor, borderColor: lightAcc }}
                >
                  <Gift className="w-5 h-5 animate-bounce" />
                </div>
                <h3 className="text-2xl font-extralight italic" style={{ fontFamily: activeTheme.fontHeadingFamily, color: activeTheme.headingColor }}>
                  Kado Digital &amp; Amplop Kasih
                </h3>
                <p className="text-xs max-w-sm mx-auto leading-relaxed font-normal" style={{ color: activeTheme.textColor, opacity: 0.85 }}>
                  Doa restu Anda merupakan berkah terindah bagi hidup kami. Namun apabila Anda berniat menambahkan tanda kasih kado pernikahan digital, Anda dapat menyalurkannya lewat:
                </p>

                {/* Elegant Blueprint Credit/Bank Card Graphic */}
                <div 
                  className="w-full max-w-sm mx-auto p-6 rounded-3xl border text-left space-y-5 relative overflow-hidden transition-all duration-500 hover:shadow-2xl border-white/30"
                  style={{
                    background: `linear-gradient(to top right, ${primaryColor}, ${midColor}, ${activeTheme.primaryColor}dd)`
                  }}
                >
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full pointer-events-none opacity-10 bg-white" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono tracking-[0.2em] text-white/70">PREMIUM WEDDING APPRECIATION</span>
                    <span className="text-[11px] font-bold tracking-wider text-white font-mono">{data.bankName}</span>
                  </div>

                  <div className="py-1">
                    <div className="text-[9px] text-white/75 font-mono">NOMOR REKENING:</div>
                    <div className="text-lg md:text-xl font-mono tracking-wider font-bold text-white flex items-center gap-2 mt-1 select-all">
                      {data.bankAccount}
                      
                      <button
                        onClick={copyAccountNumber}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer border border-white/10"
                        title="Salin No Rekening"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-[#10b981] animate-pulse" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-1">
                    <div>
                      <div className="text-[9px] text-white/75 font-mono">PENERIMA (A/N):</div>
                      <div className="text-xs font-semibold uppercase text-white tracking-wide mt-0.5 font-sans">{data.bankUser}</div>
                    </div>
                    {copiedAccount && (
                      <span className="text-[8px] font-semibold text-[#10b981] bg-white rounded px-2.5 py-1 animate-pulse">
                        TERSLIN!
                      </span>
                    )}
                  </div>
                </div>

                {/* QRIS Graphic compact frame if present */}
                {data.qrisImage && (
                  <div className="pt-4 max-w-xs mx-auto space-y-2 rounded-2xl p-4 border" style={{ backgroundColor: softBg, borderColor: lightAcc }}>
                    <div className="text-[9px] font-bold tracking-wider mb-2" style={{ color: midColor }}>PINDAI QRIS TRANSFER</div>
                    {data.qrisImage.includes("unsplash.com") ? (
                      <PremiumVectorQR 
                        name={data.bankUser || "ABDUL LATIF"} 
                        account={data.bankAccount || "7211002345"} 
                        themeColor={activeTheme.primaryColor} 
                      />
                    ) : (
                      <div className="w-36 h-36 rounded-xl bg-slate-50 p-2 border border-slate-150 mx-auto overflow-hidden">
                        <LazyImage 
                          src={data.qrisImage} 
                          alt="QRIS QR Code" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="text-[9px] font-medium mt-2" style={{ color: activeTheme.textColor, opacity: 0.75 }}>Scan QRIS di atas untuk melakukan transfer praktis.</div>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* PART 8: RSVP & GUESTBOOK COMBINED SYSTEM */}
          <section id="invite-section-rsvp" className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Live RSVP Status Counters */}
            <div className={`col-span-1 md:col-span-2 rounded-3xl p-6 border shadow-lg space-y-4 relative overflow-hidden ${activeTheme.cardBgClass}`}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full filter blur-[45px] opacity-10 pointer-events-none" style={{ backgroundColor: primaryColor }} />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10 relative z-10 font-[500]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-medium" style={{ backgroundColor: `${primaryColor}15`, color: midColor }}>
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs tracking-widest uppercase" style={{ color: activeTheme.headingColor }}>
                      Laporan Absensi Tamu (RSVP)
                    </h3>
                    <p className="text-[9px] font-medium mt-0.5" style={{ color: activeTheme.textColor, opacity: 0.75 }}>Integrasi data real-time absensi tamu</p>
                  </div>
                </div>
              </div>

              {/* Grid indicators */}
              <div className="grid grid-cols-3 gap-3 relative z-10">
                {/* Attending count */}
                <div className="rounded-2xl p-3 border text-center relative overflow-hidden group bg-emerald-500/5 border-emerald-500/20">
                  <div className="mx-auto w-6 h-6 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 mb-2">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold font-mono text-emerald-500">
                    {wishes.filter((w) => w.attendance === "Hadir").length}
                  </div>
                  <div className="text-[9px] font-bold tracking-wider uppercase text-emerald-600 mt-1">
                    Hadir
                  </div>
                </div>

                {/* Tentative count */}
                <div className="rounded-2xl p-3 border text-center relative overflow-hidden group bg-amber-500/5 border-amber-500/20">
                  <div className="mx-auto w-6 h-6 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-500 mb-2">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold font-mono text-amber-500">
                    {wishes.filter((w) => w.attendance === "Ragu-ragu").length}
                  </div>
                  <div className="text-[9px] font-bold tracking-wider uppercase text-amber-600 mt-1">
                    Ragu-Ragu
                  </div>
                </div>

                {/* Absen count */}
                <div className="rounded-2xl p-3 border text-center relative overflow-hidden group bg-rose-500/5 border-rose-500/20">
                  <div className="mx-auto w-6 h-6 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-500 mb-2">
                    <UserX className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold font-mono text-rose-500">
                    {wishes.filter((w) => w.attendance === "Tidak Hadir").length}
                  </div>
                  <div className="text-[9px] font-bold tracking-wider uppercase text-rose-600 mt-1">
                    Absen
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance RSVP Form */}
            {data.enableRSVP && (
              <div className={`rounded-3xl p-6 border shadow-lg space-y-4 ${activeTheme.cardBgClass}`}>
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Calendar className="w-4 h-4" style={{ color: primaryColor }} />
                  <h3 className="font-bold text-xs tracking-wider uppercase" style={{ color: activeTheme.headingColor }}>Konfirmasi Kehadiran</h3>
                </div>

                <form onSubmit={handleWishSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold" style={{ color: activeTheme.textColor, opacity: 0.9 }}>Nama Lengkap Tamu</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Masukkan nama lengkap..."
                      className={`w-full px-4 py-2 border rounded-xl text-xs outline-none transition-all ${activeTheme.rsvpInputClass}`}
                      style={{
                        borderColor: guestName ? primaryColor : undefined
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold" style={{ color: activeTheme.textColor, opacity: 0.9 }}>Status Absen</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Hadir", "Tidak Hadir", "Ragu-ragu"] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setAttendance(status)}
                          className="py-1.5 px-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer bg-black/10 text-slate-400 hover:text-white"
                          style={{
                            backgroundColor: attendance === status ? primaryColor : undefined,
                            borderColor: attendance === status ? primaryColor : undefined,
                            color: attendance === status ? "white" : undefined,
                            fontWeight: attendance === status ? "bold" : undefined
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold" style={{ color: activeTheme.textColor, opacity: 0.9 }}>Pesan Doa Restu Terbaik</label>
                    <textarea
                      required
                      value={wishText}
                      onChange={(e) => setWishText(e.target.value)}
                      placeholder="Doa untuk mempelai..."
                      rows={3}
                      className={`w-full px-4 py-2.5 border rounded-xl text-xs outline-none resize-none transition-all ${activeTheme.rsvpInputClass}`}
                      style={{
                        borderColor: wishText ? primaryColor : undefined
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !guestName.trim() || !wishText.trim()}
                    className="w-full py-2.5 px-4 rounded-xl text-[10px] tracking-wider font-bold text-white shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: `linear-gradient(to right, ${primaryColor}, ${midColor})`
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? "Mengirim..." : "Kirim Absen (RSVP)"}
                  </button>
                </form>
              </div>
            )}

            {/* Scrollable Guestbook feed */}
            {data.enableGuestbook && (
              <div className={`rounded-3xl p-3.5 sm:p-6 border shadow-lg space-y-2.5 sm:space-y-4 max-h-[490px] flex flex-col ${activeTheme.cardBgClass}`}>
                <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-1.5 flex-wrap xs:flex-nowrap">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: primaryColor }} />
                    <h3 className="font-bold text-[9.5px] sm:text-xs tracking-wider uppercase truncate" style={{ color: activeTheme.headingColor }}>Buku Tamu Live</h3>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[7.5px] sm:text-[9px] font-mono font-bold border transition-all duration-300 hover:scale-[1.03] active:scale-97 cursor-pointer"
                      style={{ 
                        backgroundColor: softBg, 
                        color: midColor, 
                        borderColor: lightAcc 
                      }}
                      title={sortOrder === "newest" ? "Urutkan Terlama" : "Urutkan Terbaru"}
                    >
                      <ArrowUpDown className="w-2.5 h-2.5" />
                      <span>{sortOrder === "newest" ? "Terbaru" : "Terlama"}</span>
                    </button>
                    <span 
                      className="px-2 py-1 rounded-lg text-[7.5px] sm:text-[9px] font-mono font-extrabold border"
                      style={{ backgroundColor: softBg, color: midColor, borderColor: lightAcc }}
                    >
                      {wishes.length} Ucapan
                    </span>
                  </div>
                </div>

                {/* Search Input Field */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                    <Search className="h-3 w-3 sm:h-3.5 sm:w-3.5" style={{ color: midColor, opacity: 0.6 }} />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari nama tamu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7.5 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs outline-none transition-all duration-300 border font-medium"
                    style={{
                      backgroundColor: softBg,
                      borderColor: lightAcc,
                      color: activeTheme.headingColor
                    }}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-xs opacity-60 hover:opacity-100 transition-opacity"
                      style={{ color: activeTheme.headingColor }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div 
                  className="flex-grow overflow-y-auto overscroll-y-contain scroll-smooth [scrollbar-width:thin] space-y-3.5 pr-1 py-1 h-[280px]"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {wishes.length === 0 ? (
                    <p className="text-xs text-center py-10" style={{ color: activeTheme.textColor, opacity: 0.6 }}>Belum ada pesan ucapan. Kirim doa restu pertamamu!</p>
                  ) : [...wishes].filter((w) => {
                      if (!searchTerm.trim()) return true;
                      return w.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
                    }).length === 0 ? (
                    <p className="text-xs text-center py-10" style={{ color: activeTheme.textColor, opacity: 0.6 }}>Tidak menemukan ucapan dari tamu bernama "{searchTerm}"</p>
                  ) : (
                    [...wishes]
                      .filter((w) => {
                        if (!searchTerm.trim()) return true;
                        return w.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
                      })
                      .sort((a, b) => {
                        const dateA = a.createdAt || "";
                        const dateB = b.createdAt || "";
                        return sortOrder === "newest" 
                          ? dateB.localeCompare(dateA) 
                          : dateA.localeCompare(dateB);
                      })
                      .map((w) => (
                        <div 
                          key={w.id} 
                          className="p-3.5 rounded-2xl border space-y-2 relative"
                          style={{ backgroundColor: softBg, borderColor: lightAcc }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold" style={{ color: activeTheme.headingColor }}>{w.name}</span>
                            <span 
                              className="px-2 py-0.2 rounded text-[8px] font-extrabold border"
                              style={{ 
                                backgroundColor: w.attendance === "Hadir" ? "rgba(16, 185, 129, 0.1)" : w.attendance === "Tidak Hadir" ? "rgba(244, 63, 94, 0.1)" : "rgba(251, 191, 36, 0.1)",
                                color: w.attendance === "Hadir" ? "#10b981" : w.attendance === "Tidak Hadir" ? "#f43f5e" : "#fbbf24",
                                borderColor: w.attendance === "Hadir" ? "#10b98140" : w.attendance === "Tidak Hadir" ? "#f43f5e40" : "#fbbf2540",
                              }}
                            >
                              {w.attendance}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed font-[400]" style={{ color: activeTheme.textColor, opacity: 0.95 }}>{w.wish}</p>
                          <div className="text-[8px] font-mono text-right" style={{ color: activeTheme.textColor, opacity: 0.6 }}>{w.createdAt}</div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

          </section>

          {/* PART 9: WEDDING FOOTER CLOSING STATEMENT */}
          <section className="text-center space-y-6 pt-10 pb-5">
            <div className="w-16 h-px mx-auto bg-slate-200" />
            
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-[400]">
              Suatu kehormatan sekaligus rasa syukur tanpa batas bagi kami sekeluarga seandainya Bapak/Ibu/Saudara/i berkenan menyisihkan waktu menghadiri dan membagikan doa restu bagi kami.
            </p>

            <div className="space-y-1 pt-2">
              <div className="uppercase tracking-[0.2em] text-[8px] font-bold text-slate-400">KAMI YANG BERBAHAGIA</div>
              <h4 className="text-3xl font-semibold tracking-wide" style={{ fontFamily: activeTheme.fontHeadingFamily, color: midColor }}>
                <span className="capitalize">{formatNameForScript(data.groomNick || data.groomName.split(" ")[0])}</span> &amp; <span className="capitalize">{formatNameForScript(data.brideNick || data.brideName.split(" ")[0])}</span>
              </h4>
              <div className="text-[8px] mt-1 tracking-widest font-bold text-slate-400 uppercase">KELUARGA BESAR KEDUA MEMPELAI</div>
            </div>

            {/* SOCIAL SHARES AREA */}
            <div className="pt-6 pb-2 space-y-3 max-w-md mx-auto relative z-10">
              <span className="uppercase tracking-[0.16em] text-[8px] font-bold text-slate-400">BAGIKAN ACARA HARI SAKRAL INI</span>
              <div className="flex gap-2 justify-center flex-wrap">
                <a 
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent((data.groomNick || data.groomName.split(" ")[0]) + " & " + (data.brideNick || data.brideName.split(" ")[0]) + " Wedding Invitation:\n" + (typeof window !== "undefined" ? window.location.href : ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs hover:scale-[1.03] duration-300 ${activeTheme.btnSecondaryClass}`}
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  WhatsApp
                </a>

                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs hover:scale-[1.03] duration-300 ${activeTheme.btnSecondaryClass}`}
                >
                  <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                  Facebook
                </a>

                <button 
                  onClick={() => {
                    const url = typeof window !== "undefined" ? window.location.href : "";
                    navigator.clipboard.writeText(url).then(() => {
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    });
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs hover:scale-[1.03] duration-300 cursor-pointer ${activeTheme.btnSecondaryClass}`}
                >
                  {shareCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  )}
                  {shareCopied ? "Disalin!" : "Salin Link"}
                </button>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* LIGHTBOX SINGLE COMPACT OVERLAY SLIDESHOW */}
      <AnimatePresence>
        {activeImageIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImageIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          >
            {/* Control buttons */}
            <button 
              onClick={() => setActiveImageIndex(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Tutup Galeri"
            >
              <X className="w-6 h-6" />
            </button>

            <button 
              onClick={handlePrevImage}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button 
              onClick={handleNextImage}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Berikutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* High-quality display frame */}
            <div className="max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl relative border border-white/10 bg-slate-950" onClick={(e) => e.stopPropagation()}>
              <LazyImage 
                src={data.images[activeImageIndex]} 
                alt={`Lightbox view ${activeImageIndex}`}
                containerClassName="relative w-full max-h-[85vh] overflow-hidden flex items-center justify-center rounded-2xl"
                className="max-w-full max-h-[85vh] object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-xs text-white rounded-full text-[10px] font-mono">
                FOTO {activeImageIndex + 1} / {data.images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
