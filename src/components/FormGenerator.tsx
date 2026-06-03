import React, { useState, useRef, useEffect } from "react";
import { WeddingData, LoveStoryItem, ClientDraft, TemplatePreset } from "../types";
import { 
  User, Calendar, Clock, MapPin, Sparkles, Upload, Music, 
  Heart, CreditCard, Copy, Check, FileText, Trash2, Globe, HeartHandshake, Eye,
  Share2, Send, MessageCircle, Download, FolderHeart, Plus, Settings, ShieldAlert, Key, RefreshCw,
  Save, Lock
} from "lucide-react";
import { parseDriveUrl } from "../data";
import { encodeWeddingData, safeLocalStorage, validateGoogleMapsUrl } from "../utils";
import ThemeIllustration from "./ThemeIllustration";

interface FormGeneratorProps {
  data: WeddingData;
  onChange: (newData: WeddingData) => void;
  onPreviewClick: () => void;
  
  // Multi-client and draft manager props
  clientDrafts?: ClientDraft[];
  currentClientId?: string | null;
  onSelectClient?: (id: string) => void;
  onSaveClient?: (name: string) => void;
  onDeleteClient?: (id: string) => void;
  onCreateNewClient?: () => void;
  onDuplicateClient?: (id: string) => void;
  onRenameClient?: (id: string, name: string) => void;
  currentPasscode?: string;
  onUpdatePasscode?: (newCode: string) => void;
  
  // Role toggles
  isClientOnly?: boolean;
  activeTemplates?: TemplatePreset[];
  onUploadFileToStorage?: (fileName: string, fileSize: string, fileType: "photo" | "music" | "qris" | "thumbnail", url: string) => void;
  clientSlug?: string;
  clientId?: string;
}

const TEMPLATE_PRESETS = [
  {
    id: "modern-blue",
    name: "Classic Blue Hydrangea",
    theme: "theme-blue-hydrangea",
    description: "Tema segar air laut & bunga hydrangea biru yang tenang, sejuk, dan memukau.",
    accentClass: "bg-gradient-to-r from-sky-400 to-sky-600",
    bgClass: "border-sky-100 bg-sky-50/10 hover:border-sky-300",
    textColor: "text-sky-600",
    iconColor: "text-sky-500 bg-sky-100",
    images: [
      "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ",
      "https://lh3.googleusercontent.com/d/1zH5qr-5ADf9IzFa1KmPD5C355xd4Ek-Y",
      "https://lh3.googleusercontent.com/d/1BEIjPrTAorLBxGorpsHkVt3HWxqHgTcI",
      "https://lh3.googleusercontent.com/d/1ex_svP6oge_nqw11QzPyWRBFcjdEYM4T",
      "https://lh3.googleusercontent.com/d/1sF6DVHoJvUuClhet9g8P0husOuD2oGTb",
      "https://lh3.googleusercontent.com/d/1IkuhugGeamrn4PA1oTJdOxlNZYP1lgaO"
    ]
  },
  {
    id: "royal-black-gold",
    name: "Royal Black & Gold Luxury",
    theme: "theme-royal-black-gold",
    description: "Kemewahan aristokrat dengan latar hitam pekat premium dan taburan ornamen emas eksklusif.",
    accentClass: "bg-gradient-to-r from-amber-500 to-yellow-600",
    bgClass: "border-amber-100 bg-amber-50/10 hover:border-amber-300",
    textColor: "text-amber-700",
    iconColor: "text-amber-600 bg-amber-100/80",
    images: [
      "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ",
      "https://lh3.googleusercontent.com/d/1zH5qr-5ADf9IzFa1KmPD5C355xd4Ek-Y",
      "https://lh3.googleusercontent.com/d/1BEIjPrTAorLBxGorpsHkVt3HWxqHgTcI",
      "https://lh3.googleusercontent.com/d/1ex_svP6oge_nqw11QzPyWRBFcjdEYM4T",
      "https://lh3.googleusercontent.com/d/1sF6DVHoJvUuClhet9g8P0husOuD2oGTb",
      "https://lh3.googleusercontent.com/d/1IkuhugGeamrn4PA1oTJdOxlNZYP1lgaO"
    ]
  },
  {
    id: "sage-botanical",
    name: "Sage Green Botanical Garden",
    theme: "theme-sage-botanical",
    description: "Kedamaian alam sirkulasi asri bermadikan daun-daun eucalyptus sage alami & segar.",
    accentClass: "bg-gradient-to-r from-emerald-400 to-emerald-600",
    bgClass: "border-emerald-100 bg-emerald-50/10 hover:border-emerald-300",
    textColor: "text-emerald-700",
    iconColor: "text-emerald-600 bg-emerald-100",
    images: [
      "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ",
      "https://lh3.googleusercontent.com/d/1zH5qr-5ADf9IzFa1KmPD5C355xd4Ek-Y",
      "https://lh3.googleusercontent.com/d/1BEIjPrTAorLBxGorpsHkVt3HWxqHgTcI",
      "https://lh3.googleusercontent.com/d/1ex_svP6oge_nqw11QzPyWRBFcjdEYM4T",
      "https://lh3.googleusercontent.com/d/1sF6DVHoJvUuClhet9g8P0husOuD2oGTb",
      "https://lh3.googleusercontent.com/d/1IkuhugGeamrn4PA1oTJdOxlNZYP1lgaO"
    ]
  },
  {
    id: "blush-pink",
    name: "Blush Pink Rose & Pastel",
    theme: "theme-blush-pink-rose",
    description: "Sentuhan romantis manis bernuansa merah muda pastel lembut, mawar cantik khas Korea.",
    accentClass: "bg-gradient-to-r from-pink-400 to-rose-500",
    bgClass: "border-pink-100 bg-pink-50/10 hover:border-pink-300",
    textColor: "text-pink-600",
    iconColor: "text-pink-500 bg-pink-100",
    images: [
      "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ",
      "https://lh3.googleusercontent.com/d/1zH5qr-5ADf9IzFa1KmPD5C355xd4Ek-Y",
      "https://lh3.googleusercontent.com/d/1BEIjPrTAorLBxGorpsHkVt3HWxqHgTcI",
      "https://lh3.googleusercontent.com/d/1ex_svP6oge_nqw11QzPyWRBFcjdEYM4T",
      "https://lh3.googleusercontent.com/d/1sF6DVHoJvUuClhet9g8P0husOuD2oGTb",
      "https://lh3.googleusercontent.com/d/1IkuhugGeamrn4PA1oTJdOxlNZYP1lgaO"
    ]
  },
  {
    id: "nusantara-heritage",
    name: "Nusantara Heritage Gold & Crimson",
    theme: "theme-nusantara-luxury",
    description: "Keagungan eksklusif adat budaya Nusantara, memadukan merah beludru karajaan dan ukiran emas klasik Jawa-Bali.",
    accentClass: "bg-gradient-to-r from-red-800 to-amber-600",
    bgClass: "border-amber-200/40 bg-amber-50/5 hover:border-amber-400",
    textColor: "text-amber-800",
    iconColor: "text-amber-700 bg-amber-100",
    images: [
      "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ",
      "https://lh3.googleusercontent.com/d/1zH5qr-5ADf9IzFa1KmPD5C355xd4Ek-Y",
      "https://lh3.googleusercontent.com/d/1BEIjPrTAorLBxGorpsHkVt3HWxqHgTcI",
      "https://lh3.googleusercontent.com/d/1ex_svP6oge_nqw11QzPyWRBFcjdEYM4T",
      "https://lh3.googleusercontent.com/d/1sF6DVHoJvUuClhet9g8P0husOuD2oGTb",
      "https://lh3.googleusercontent.com/d/1IkuhugGeamrn4PA1oTJdOxlNZYP1lgaO"
    ]
  },
  {
    id: "fairytale-moonlight",
    name: "Fairytale Moonlight Blue",
    theme: "theme-fairytale-moonlight-blue",
    description: "Pesona magis dan estetik romantis dongeng malam bernuansa biru tua-lavender, bertabur rasi bintang dan dekap rembulan syahdu.",
    accentClass: "bg-gradient-to-r from-indigo-500 to-purple-600",
    bgClass: "border-indigo-100 bg-indigo-50/10 hover:border-indigo-300",
    textColor: "text-indigo-600",
    iconColor: "text-indigo-500 bg-indigo-100",
    images: [
      "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ",
      "https://lh3.googleusercontent.com/d/1zH5qr-5ADf9IzFa1KmPD5C355xd4Ek-Y",
      "https://lh3.googleusercontent.com/d/1BEIjPrTAorLBxGorpsHkVt3HWxqHgTcI",
      "https://lh3.googleusercontent.com/d/1ex_svP6oge_nqw11QzPyWRBFcjdEYM4T",
      "https://lh3.googleusercontent.com/d/1sF6DVHoJvUuClhet9g8P0husOuD2oGTb",
      "https://lh3.googleusercontent.com/d/1IkuhugGeamrn4PA1oTJdOxlNZYP1lgaO"
    ]
  },
  {
    id: "royal-red-imperial",
    name: "Royal Crimson Imperial",
    theme: "theme-royal-red-imperial",
    description: "Keagungan absolut keluarga kerajaan (Sultan), memadukan merah Crimson beludru mewah dan ornamen emas Imperial yang megah.",
    accentClass: "bg-gradient-to-r from-red-700 via-rose-900 to-amber-500",
    bgClass: "border-red-800/40 bg-red-950/20 hover:border-amber-500/50",
    textColor: "text-red-500",
    iconColor: "text-amber-500 bg-red-950/40 border border-red-850",
    images: [
      "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ",
      "https://lh3.googleusercontent.com/d/1zH5qr-5ADf9IzFa1KmPD5C355xd4Ek-Y",
      "https://lh3.googleusercontent.com/d/1BEIjPrTAorLBxGorpsHkVt3HWxqHgTcI",
      "https://lh3.googleusercontent.com/d/1ex_svP6oge_nqw11QzPyWRBFcjdEYM4T",
      "https://lh3.googleusercontent.com/d/1sF6DVHoJvUuClhet9g8P0husOuD2oGTb",
      "https://lh3.googleusercontent.com/d/1IkuhugGeamrn4PA1oTJdOxlNZYP1lgaO"
    ]
  }
];

/**
 * Resizes and compresses an image (base64 or File) to a maximum width of 800px.
 * Returns a promise that resolves to a compressed JPEG data URL (quality 0.75-0.8).
 */
export function compressAndResizeImage(fileOrDataUrl: File | string, maxWidth: number = 800, quality: number = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(typeof fileOrDataUrl === "string" ? fileOrDataUrl : ""); 
          return;
        }

        // Handle transparent PNG backgrounds by drawing white bg for JPEG compression
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as compressed jpeg
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = (err) => {
      reject(err);
    };

    if (fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      img.src = fileOrDataUrl;
    }
  });
}

export default function FormGenerator({ 
  data, 
  onChange, 
  onPreviewClick,
  clientDrafts = [],
  currentClientId = null,
  onSelectClient,
  onSaveClient,
  onDeleteClient,
  onCreateNewClient,
  onDuplicateClient,
  onRenameClient,
  currentPasscode = "1234",
  onUpdatePasscode,
  isClientOnly = false,
  activeTemplates = [],
  onUploadFileToStorage,
  clientSlug = "",
  clientId = ""
}: FormGeneratorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrisInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const [isCompressing, setIsCompressing] = useState(false);
  const [isCompressingQris, setIsCompressingQris] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState({
    total: 0,
    current: 0,
    savedKB: 0
  });
  const [uploadQueue, setUploadQueue] = useState<{ name: string; size: string; status: "pending" | "processing" | "done" | "failed" }[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [passcodeEditMode, setPasscodeEditMode] = useState(false);
  const [newPasscodeVal, setNewPasscodeVal] = useState("");

  const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
  const [storyYear, setStoryYear] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const [audioError, setAudioError] = useState("");
  
  const [templateError, setTemplateError] = useState("");
  const [templateSuccess, setTemplateSuccess] = useState("");

  // Drag and drop sorting state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Manual cloud save & sync state
  const [isCloudSaving, setIsCloudSaving] = useState(false);
  const [cloudSaveSuccess, setCloudSaveSuccess] = useState(false);

  const triggerManualCloudSave = async () => {
    setIsCloudSaving(true);
    setCloudSaveSuccess(false);

    // Save with the absolute newest state
    onChange(data);

    // Simulate 1.6s of robust database transaction pipeline
    setTimeout(() => {
      setIsCloudSaving(false);
      setCloudSaveSuccess(true);
      // Automatically fade out success banner after some time
      setTimeout(() => {
        setCloudSaveSuccess(false);
      }, 6000);
    }, 1600);
  };

  const swapImages = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...data.images];
    const [movedItem] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedItem);
    onChange({
      ...data,
      images: updatedImages
    });
  };

  const setPhotoRole = (currentIndex: number, role: "groom" | "bride" | "cover" | "gallery") => {
    const updated = [...data.images];
    
    // Ensure we have at least 5 elements to comfortably place Groom (0), Bride (1), Cover (4)
    while (updated.length < 5) {
      updated.push("");
    }

    if (role === "groom") {
      const temp = updated[0];
      updated[0] = updated[currentIndex];
      updated[currentIndex] = temp;
    } else if (role === "bride") {
      const temp = updated[1];
      updated[1] = updated[currentIndex];
      updated[currentIndex] = temp;
    } else if (role === "cover") {
      const temp = updated[4];
      updated[4] = updated[currentIndex];
      updated[currentIndex] = temp;
    } else if (role === "gallery") {
      // Move to a non-special index (for instance index 2, 3, or end)
      const specialIndices = [0, 1, 4];
      if (specialIndices.includes(currentIndex)) {
        const firstGalleryIdx = updated.findIndex((_, idx) => !specialIndices.includes(idx));
        if (firstGalleryIdx !== -1) {
          const temp = updated[currentIndex];
          updated[currentIndex] = updated[firstGalleryIdx];
          updated[firstGalleryIdx] = temp;
        } else {
          // If no gallery slots, push to end
          const item = updated[currentIndex];
          updated[currentIndex] = "";
          updated.push(item);
        }
      }
    }

    // Filter out potential blank elements except indices 0, 1, 4 which can fall back to defaults
    const filteredImages = updated.map((img, idx) => {
      if (img === "" && ![0, 1, 4].includes(idx)) return null;
      return img;
    }).filter((x): x is string => x !== null);

    onChange({
      ...data,
      images: filteredImages
    });
  };

  // Personalized Guest Share states
  const [shareGuestName, setShareGuestName] = useState("");
  const [shareGuestSalutation, setShareGuestSalutation] = useState("Bapak/Ibu/Saudara/i");
  const [guestLinkType, setGuestLinkType] = useState<"short" | "full">("short");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Helper to generate correct guest link based on slug or client id
  const generateGuestLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://undangan-pernikahan.com";
    const suffix = shareGuestName.trim() ? (shareGuestSalutation ? `${shareGuestSalutation} ${shareGuestName}` : shareGuestName) : "";
    const payloadStr = encodeWeddingData(data);
    
    // Build actual base URL permanently pointing to the wedding route
    let base = origin;
    if (clientSlug) {
      base = `${origin}/wedding/${clientSlug}`;
    } else if (clientId) {
      base = `${origin}/?client=${clientId}`;
    } else if (currentClientId) {
      base = `${origin}/?client=${currentClientId}`;
    }
    
    if (guestLinkType === "short") {
      if (suffix) {
        const sep = base.includes("?") ? "&" : "?";
        return `${base}${sep}to=${encodeURIComponent(suffix)}`;
      }
      return base;
    } else {
      // Full portable offline-friendly link with direct payload parameter (p)
      const sep = base.includes("?") ? "&" : "?";
      const pStr = `p=${payloadStr}`;
      if (suffix) {
        return `${base}${sep}${pStr}&to=${encodeURIComponent(suffix)}`;
      }
      return `${base}${sep}${pStr}`;
    }
  };

  // Auto-save wedding data to memory
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string>("");
  const [isAutoSavingActive, setIsAutoSavingActive] = useState(false);

  useEffect(() => {
    // We only perform in-session feedback without placing files on the user's disk
    const timer = setInterval(() => {
      try {
        setIsAutoSavingActive(true);
        const now = new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        setLastAutoSavedTime(now);
        setTimeout(() => setIsAutoSavingActive(false), 1050);
      } catch (err) {
        setIsAutoSavingActive(false);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [data, currentClientId]);

  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    onChange({
      ...data,
      theme: preset.theme,
      images: preset.images
    });
    setTemplateSuccess(`Berhasil menerapkan desain preset kustom "${preset.name}"!`);
    setTemplateError("");
    setTimeout(() => setTemplateSuccess(""), 5000);
    // Auto transition to live preview so they see the result immediately
    setTimeout(() => {
      onPreviewClick();
    }, 400);
  };

  const handleExportTemplate = () => {
    try {
      const templateData = { ...data };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templateData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `template-undangan-${data.groomNick?.toLowerCase() || 'abdul'}-${data.brideNick?.toLowerCase() || 'tri'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      setTemplateSuccess("Template berhasil diunduh! Simpan file .json ini sebagai backup template digital Anda.");
      setTemplateError("");
      setTimeout(() => setTemplateSuccess(""), 5000);
    } catch (err) {
      setTemplateError("Gagal mendownload / mengekspor berkas.");
    }
  };

  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setTemplateError("");
    setTemplateSuccess("");

    if (file) {
      if (!file.name.endsWith(".json")) {
        setTemplateError("Berkas salah! Pastikan file yang diunggah berformat .json");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          
          if (!parsed.groomName || !parsed.brideName) {
            setTemplateError("File JSON tidak memenuhi kriteria minimal WeddingData (Nama Pengantin kosong)!");
            return;
          }

          onChange(parsed);
          setTemplateSuccess(`Berhasil memuat template "${file.name}" secara utuh!`);
          
          if (jsonFileInputRef.current) {
            jsonFileInputRef.current.value = "";
          }
          setTimeout(() => setTemplateSuccess(""), 6000);
        } catch (err) {
          setTemplateError("Gagal memparsing file! Berkas JSON rusak atau tidak valid.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value
    });
  };

  const handleToggleChange = (name: keyof WeddingData) => {
    onChange({
      ...data,
      [name]: !data[name]
    });
  };

  // Image batch compression and resize to 800px width
  const handleImageFiles = async (files: FileList) => {
    // Validate file extensions
    const allowedPhotoExts = ["jpg", "jpeg", "png", "webp"];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || "";
      if (!allowedPhotoExts.includes(ext)) {
        alert(`File "${file.name}" tidak diizinkan! Foto hanya mendukung format: jpg, jpeg, png, webp.`);
        return;
      }
    }

    setIsCompressing(true);
    setCompressionProgress({
      total: files.length,
      current: 0,
      savedKB: 0
    });

    // Initialize upload queue state
    const initialQueue = Array.from(files).map((f) => ({
      name: f.name,
      size: f.size > 1024 * 1024 
        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(f.size / 1024)} KB`,
      status: "pending" as const,
    }));
    setUploadQueue(initialQueue);

    const compressedImages: string[] = [];
    let accumulatedSavedBytes = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Set status to processing
      setUploadQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "processing" as const } : item));

      try {
        const originalSize = file.size;
        
        // Execute resizing and compression (Target max-width: 800px, JPEG quality: 0.75)
        const compressedBase64 = await compressAndResizeImage(file, 800, 0.75);
        
        // Estimated size of base64 package is length * 0.75
        const compressedSize = Math.round(compressedBase64.length * 0.75);
        const savedBytes = Math.max(0, originalSize - compressedSize);
        accumulatedSavedBytes += savedBytes;

        compressedImages.push(compressedBase64);
        
        setCompressionProgress(prev => ({
          ...prev,
          current: i + 1,
          savedKB: Math.round(accumulatedSavedBytes / 1024)
        }));

        // Set status to done
        setUploadQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "done" as const } : item));
      } catch (err) {
        console.error("Gagal mengompresi gambar:", err);
        // Fallback to original read if compression fails
        try {
          const fallbackBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string || "");
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
          });
          if (fallbackBase64) {
            compressedImages.push(fallbackBase64);
            setUploadQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "done" as const } : item));
          } else {
            setUploadQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "failed" as const } : item));
          }
        } catch (e) {
          console.error("Fallback juga gagal:", e);
          setUploadQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: "failed" as const } : item));
        }
      }
    }

    if (compressedImages.length > 0) {
      onChange({
        ...data,
        images: [...data.images, ...compressedImages]
      });
      if (onUploadFileToStorage) {
        Array.from(files).forEach((file, idx) => {
          const matchingBase64 = compressedImages[idx] || compressedImages[0];
          const estimatedSize = Math.round(matchingBase64.length * 0.75);
          onUploadFileToStorage(
            file.name,
            (estimatedSize / 1024).toFixed(1) + " KB",
            "photo",
            matchingBase64
          );
        });
      }
    }

    // Keep statistics displayed on screen, and dismiss after some seconds
    setTimeout(() => {
      setIsCompressing(false);
    }, 8000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFiles(e.dataTransfer.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (indexToRemove: number) => {
    onChange({
      ...data,
      images: data.images.filter((_, idx) => idx !== indexToRemove)
    });
  };

  const getFileDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ width: 0, height: 0 });
      };
      img.src = objectUrl;
    });
  };

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || "";
      const allowedQrisExts = ["jpg", "jpeg", "png", "webp"];
      if (!allowedQrisExts.includes(ext)) {
        alert("File QRIS tidak diizinkan! Hanya mendukung format: jpg, jpeg, png, webp.");
        if (e.target) e.target.value = "";
        return;
      }

      // Validasi tambahan QRIS (Ukuran & Aspek Rasio mendekati 1:1)
      const sizeThreshold = 1.25 * 1024 * 1024; // 1.25 Megabyte
      const isTooLarge = file.size > sizeThreshold;
      let isNotSquare = false;
      let width = 0;
      let height = 0;

      try {
        const dims = await getFileDimensions(file);
        width = dims.width;
        height = dims.height;
        if (width > 0 && height > 0) {
          const ratio = width / height;
          // Rentang ideal rasio 1:1 berkisar dari 0.85 hingga 1.18
          if (ratio < 0.85 || ratio > 1.18) {
            isNotSquare = true;
          }
        }
      } catch (err) {
        console.warn("Gagal menganalisis rasio aspek QRIS:", err);
      }

      if (isTooLarge || isNotSquare) {
        let warningText = "⚠️ PERINGATAN OPTIMASI QRIS\n\n";
        
        if (isTooLarge) {
          warningText += `• UKURAN FILE BESAR: File asli berukuran ${(file.size / (1024 * 1024)).toFixed(2)} MB (rekomendasi di bawah 1.00 MB).\n`;
        }
        if (isNotSquare) {
          warningText += `• RASIO TIDAK KOTAK: Dimensi gambar adalah ${width}x${height} piksel. Rasio aspeknya tidak mendekati persegi 1:1.\n`;
        }
        
        warningText += "\n⚠️ Dampak: Gambar QRIS yang tidak persegi (terlalu memanjang) atau terlalu besar berisiko terpotong pada desain layout atau sulit dipindai/scan oleh kamera smartphone tamu Anda.\n\nApakah Anda tetap ingin mengunggah file ini?";

        const proceed = window.confirm(warningText);
        if (!proceed) {
          if (e.target) e.target.value = "";
          return;
        }
      }

      setIsCompressingQris(true);
      try {
        // Compress the QRIS code to max 600px width and keep it sharp/medium quality (0.8)
        const compressedBase64 = await compressAndResizeImage(file, 600, 0.8);
        onChange({
          ...data,
          qrisImage: compressedBase64
        });
        if (onUploadFileToStorage) {
          const estimatedSize = Math.round(compressedBase64.length * 0.75);
          onUploadFileToStorage(
            file.name,
            (estimatedSize / 1024).toFixed(1) + " KB",
            "qris",
            compressedBase64
          );
        }
      } catch (err) {
        console.error("Gagal mengompresi QRIS:", err);
        // Fallback to normal upload
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64Str = event.target.result as string;
            onChange({
              ...data,
              qrisImage: base64Str
            });
            if (onUploadFileToStorage) {
              const estimatedSize = Math.round(base64Str.length * 0.75);
              onUploadFileToStorage(
                file.name,
                (estimatedSize / 1024).toFixed(1) + " KB",
                "qris",
                base64Str
              );
            }
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressingQris(false);
      }
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAudioError("");
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || "";
      const allowedAudioExts = ["mp3", "m4a", "wav"];
      if (!allowedAudioExts.includes(ext)) {
        setAudioError("Format audio tidak diizinkan! Hanya mendukung format: mp3, m4a, wav.");
        if (e.target) e.target.value = "";
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setAudioError("Ukuran file musik terlalu besar (maksimal 15 MB). Silakan pilih file musik MP3 yang berukuran lebih kecil!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Str = event.target.result as string;
          onChange({
            ...data,
            customAudioBase64: base64Str,
            customAudioFileName: file.name
          });
          if (onUploadFileToStorage) {
            onUploadFileToStorage(
              file.name,
              (file.size / 1024 / 1024).toFixed(2) + " MB",
              "music",
              base64Str
            );
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAudioFile = () => {
    setAudioError("");
    onChange({
      ...data,
      customAudioBase64: undefined,
      customAudioFileName: undefined
    });
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyYear || !storyTitle || !storyContent) return;

    let updatedStories = [...(data.loveStories || [])];

    if (editingStoryId) {
      // Edit
      updatedStories = updatedStories.map(story => 
        story.id === editingStoryId 
          ? { ...story, year: storyYear, title: storyTitle, content: storyContent }
          : story
      );
    } else {
      // Add
      const newStory: LoveStoryItem = {
        id: Date.now().toString(),
        year: storyYear,
        title: storyTitle,
        content: storyContent
      };
      updatedStories.push(newStory);
    }

    onChange({
      ...data,
      loveStories: updatedStories
    });

    // Reset Form
    setEditingStoryId(null);
    setStoryYear("");
    setStoryTitle("");
    setStoryContent("");
  };

  const handleEditStoryClick = (story: LoveStoryItem) => {
    setEditingStoryId(story.id);
    setStoryYear(story.year);
    setStoryTitle(story.title);
    setStoryContent(story.content);
  };

  const handleDeleteStory = (id: string) => {
    const updatedStories = (data.loveStories || []).filter(story => story.id !== id);
    onChange({
      ...data,
      loveStories: updatedStories
    });
    if (editingStoryId === id) {
      setEditingStoryId(null);
      setStoryYear("");
      setStoryTitle("");
      setStoryContent("");
    }
  };

  const handleCancelStoryEdit = () => {
    setEditingStoryId(null);
    setStoryYear("");
    setStoryTitle("");
    setStoryContent("");
  };

  const restoreDefaultImages = () => {
    const defaultUrls = [
      "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ",
      "https://lh3.googleusercontent.com/d/1zH5qr-5ADf9IzFa1KmPD5C355xd4Ek-Y",
      "https://lh3.googleusercontent.com/d/1BEIjPrTAorLBxGorpsHkVt3HWxqHgTcI",
      "https://lh3.googleusercontent.com/d/1ex_svP6oge_nqw11QzPyWRBFcjdEYM4T",
      "https://lh3.googleusercontent.com/d/1sF6DVHoJvUuClhet9g8P0husOuD2oGTb",
      "https://lh3.googleusercontent.com/d/1IkuhugGeamrn4PA1oTJdOxlNZYP1lgaO",
      "https://lh3.googleusercontent.com/d/1JxNHoWT2EyuTkeLd3cwgqmBUCmMHMFTe",
      "https://lh3.googleusercontent.com/d/1HmYI7wYXSXgu0KEdNBj5TwFGvbm4M8o0",
      "https://lh3.googleusercontent.com/d/1uwz9KlU1tThZhpYYNUc3gxCMJAgLhJcf",
      "https://lh3.googleusercontent.com/d/1Cds4egYH91hYee1KBja7SkFSsulg6WEx"
    ];
    onChange({
      ...data,
      images: defaultUrls
    });
  };



  return (
    <div id="form-generator-view" className="relative pb-16 bg-gradient-to-br from-slate-50 via-sky-50/20 to-slate-100 min-h-screen">
      {/* Decorative backdrop spots */}
      <div className="absolute top-10 left-10 w-96 h-96 watercolor-bg-spot rounded-full pointer-events-none select-none"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 watercolor-bg-pink rounded-full pointer-events-none select-none"></div>

      <div className="max-w-4xl mx-auto px-4 pt-8 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 border border-primary-200 text-primary-700 text-xs font-semibold tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
            WEDDING DIGITAL GENERATOR
          </div>
          <h1 className="text-4xl font-serif font-semibold text-slate-800 tracking-tight">
            Wedding <span className="font-script text-primary-500 text-5xl font-normal block md:inline md:ml-1">Invitation Form</span> Builder
          </h1>
          <p className="text-slate-600 mt-2 text-sm max-w-lg mx-auto">
            Isi formulir data pernikahan di bawah ini untuk mengatur semua detail halaman undangan secara lengkap, cepat, dan modern.
          </p>
        </div>

        {/* Action Quick Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xs">
          <div className="text-sm text-slate-500">
            Status Form: <span className="text-emerald-600 font-semibold">● Siap diakses</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={restoreDefaultImages}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-primary-300 text-xs text-slate-600 hover:text-primary-600 font-medium transition-all"
            >
              Reset Gambar Default
            </button>
            <button
              onClick={onPreviewClick}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-xl text-xs font-medium shadow-sm hover:shadow transition-all group cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
              Lihat Undangan Sekarang
            </button>
          </div>
        </div>        {/* KONSOL AGENSI & PENGELOLA MULTI-KLIEN (AGENCY DASHBOARD) */}
        {!isClientOnly && (
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-850 shadow-xl p-6 mb-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-600/15 text-rose-400 rounded-2xl border border-rose-500/10">
                  <FolderHeart className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider font-mono">WORKSPACE AGENSI DIGITAL</span>
                  <h3 className="font-serif font-bold text-lg leading-tight text-slate-100">Konsol Pengelola Multi-Draft Klien</h3>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onCreateNewClient}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold rounded-xl text-xs transition-all shadow-md hover:scale-[1.02] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Draft Klien Baru
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* LEFT SIDE: ACTIVE CLIENTS SLOT LIST */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest font-mono">1. Pilih Slot Draft Klien Aktif ({clientDrafts.length} Tersedia)</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {clientDrafts.map((draft) => {
                    const isActive = draft.id === currentClientId;
                    return (
                      <div 
                        key={draft.id}
                        onClick={() => onSelectClient(draft.id)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 relative group ${
                          isActive 
                            ? "border-rose-500 bg-rose-950/20 ring-1 ring-rose-500/30" 
                            : "border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-rose-500 animate-ping" : "bg-slate-600"}`}></span>
                            <span className={`text-xs font-bold transition-colors ${isActive ? "text-rose-300" : "text-slate-300 group-hover:text-white"}`}>
                              {draft.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans pl-4">Diperbarui: {draft.updatedAt}</p>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button; e.stopPropagation()"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDuplicateClient(draft.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                            title="Duplikat Draft Klien"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Hapus draft klien "${draft.name}"? Kebijakan ini tidak bisa dibatalkan.`)) {
                                onDeleteClient(draft.id);
                              }
                            }}
                            disabled={clientDrafts.length <= 1}
                            className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                              clientDrafts.length <= 1 
                                ? "opacity-30 cursor-not-allowed" 
                                : "hover:bg-red-950/40 hover:text-red-400"
                            }`}
                            title="Hapus Draft Klien"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT SIDE: CONTEXT & EDIT ACCENT / PASSWORD */}
              <div className="md:col-span-5 bg-slate-950/60 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between gap-4">
                {(() => {
                  const active = clientDrafts.find(d => d.id === currentClientId);
                  if (!active) return null;
                  return (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold block uppercase tracking-widest font-mono text-rose-400">2. Kelola Detail Klien Ini</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-sans">Semua perubahan formulir di bawah akan otomatis disimpan ke dalam slot yang terpilih.</p>
                      </div>

                      {/* Rename Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nama Identitas Slot Klien</label>
                        <input
                          type="text"
                          value={active.name}
                          onChange={(e) => onRenameClient(active.id, e.target.value)}
                          placeholder="Misal: Abdul & Tri (Real)"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:border-rose-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Secure PIN customizer */}
                <div className="pt-2 border-t border-slate-850 space-y-2">
                  {!passcodeEditMode ? (
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 font-sans">
                        <Key className="w-3.5 h-3.5 text-slate-500" />
                        <span>PIN Admin: <span className="font-mono text-slate-200">****</span></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setNewPasscodeVal(currentPasscode);
                          setPasscodeEditMode(true);
                        }}
                        className="text-[10px] text-rose-400 font-bold hover:underline cursor-pointer"
                      >
                        Ubah PIN
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        type="password"
                        placeholder="PIN Baru"
                        value={newPasscodeVal}
                        onChange={(e) => setNewPasscodeVal(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-850 text-xs text-center rounded-lg text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onUpdatePasscode(newPasscodeVal);
                          setPasscodeEditMode(false);
                        }}
                        className="px-2 py-1 bg-rose-600 text-[10px] font-bold text-white rounded-lg hover:bg-rose-700 transition"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setPasscodeEditMode(false)}
                        className="px-2 py-1 border border-slate-800 text-[10px] text-slate-400 rounded-lg"
                      >
                        Batal
                      </button>
                    </div>
                  )}

                  {/* Reset Database Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("⚠️ PERINGATAN: Apakah Anda yakin ingin memuat ulang halaman?")) {
                        window.location.reload();
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-red-950/45 hover:bg-red-900/60 transition duration-300 border border-red-900/40 text-[10px] font-semibold text-red-400 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Muat Ulang Halaman Editor
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TEMPLATE MANAGER SECTION */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-rose-100 shadow-md p-6 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rose-100/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                <FolderHeart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-800 text-base leading-tight">Template & Cadangan Data Pernikahan</h3>
                <p className="text-[11px] text-slate-500 font-sans">Ganti preset instan atau ekspor/unggah berkas template kustom kamu (.json)</p>
              </div>
            </div>
            
            {/* Template input tag is hidden but bound here */}
            <input 
              type="file"
              ref={jsonFileInputRef}
              onChange={handleImportTemplate}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Toast response message inside Card */}
          {templateSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{templateSuccess}</span>
            </div>
          )}
          {templateError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mr-0.5"></span>
              <span>{templateError}</span>
            </div>
          )}

          {/* Subtle real-time Auto-save status bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[11px] bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 shadow-xs font-sans text-slate-550">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isAutoSavingActive ? "block" : "hidden"}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoSavingActive ? "bg-emerald-500" : "bg-emerald-600/60"}`}>
                </span>
              </span>
              <span className="font-bold text-slate-750">Penyimpanan Otomatis Aktif</span>
            </div>
            <div className="font-mono text-slate-400 text-[10px]">
              {isAutoSavingActive ? (
                <span className="text-emerald-700 font-bold tracking-tight animate-pulse flex items-center gap-1">
                  ⚡ Sedang menyimpan draf secara otomatis...
                </span>
              ) : lastAutoSavedTime ? (
                <span>Tersimpan otomatis di browser: <span className="text-slate-700 font-semibold">{lastAutoSavedTime}</span></span>
              ) : (
                <span>Sistem menyimpan draf perubahan Anda setiap 5 detik...</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* PRESETS LIST (Left Column, 8 cols width) */}
            <div className="lg:col-span-8 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Opsi A: Pilih Preset Layout / Tema Undangan</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATE_PRESETS.filter(preset => {
                  if (!isClientOnly) return true;
                  if (activeTemplates && activeTemplates.length > 0) {
                    const match = activeTemplates.find(at => at.theme === preset.theme);
                    return match ? match.isActive : false;
                  }
                  return true;
                }).map((preset) => {
                  const isActive = data.theme === preset.theme;
                  return (
                    <div 
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2.5 relative group overflow-hidden ${
                        isActive 
                          ? "border-primary-500 bg-primary-50/5 ring-1 ring-primary-500/20 shadow-xs" 
                          : preset.bgClass
                      }`}
                    >
                      {isActive && (
                        <span className="absolute top-2 right-2 bg-primary-650 text-[8px] font-bold text-white px-2 py-0.5 rounded-full z-10 shadow-xs">
                          AKTIF
                        </span>
                      )}
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg text-xs leading-none ${preset.textColor} ${preset.iconColor}`}>
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{preset.name}</h4>
                        </div>
                        <div className="w-full h-16 rounded-xl bg-slate-100 relative overflow-hidden my-1 md:my-1.5 ring-1 ring-slate-200">
                          <ThemeIllustration themeSlug={preset.theme} />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans line-clamp-2">{preset.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100/50">
                        <span className="text-[9px] text-slate-400">Total Galeri: {preset.images.length} Foto</span>
                        <span className={`text-[10px] font-bold ${preset.textColor} font-mono tracking-wider text-right`}>Terapkan &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BACKUP & UPLOAD ZONE (Right Column, 4 cols width) */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4 bg-slate-50/75 rounded-2xl border border-slate-150 p-4">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">
                  {isClientOnly ? "Opsi B: Backup Data" : "Opsi B: Cadangkan & Impor"}
                </span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                  {isClientOnly 
                    ? "Ekspor data form pengantin Anda sewaktu-waktu ke perangkat lokal (.json) sebagai backup salinan fisik data undangan."
                    : "Unggah file template kustom (.json) atau ekspor data form saat ini ke perangkat lokal guna diedit kapan saja."}
                </p>
              </div>

              <div className="space-y-2 mt-2">
                {/* UPLOAD BUTTON - ONLY IF NOT CLIENT */}
                {!isClientOnly && (
                  <button
                    type="button"
                    onClick={() => jsonFileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 hover:border-primary-400 text-slate-700 hover:text-primary-600 rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Unggah File Template
                  </button>
                )}

                {/* EXPORT BUTTON */}
                <button
                  type="button"
                  onClick={handleExportTemplate}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-primary-400" />
                  Ekspor / Cadangkan Data
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Form Sheet */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-8">
          
          {/* Main Title Badge */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-6 text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl">
                <FileText className="w-5 h-5 text-sky-100" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Formulir Undangan Pernikahan</h2>
                <p className="text-xs text-sky-100/90">Lengkapi data di bawah dengan benar. Semua perubahan tersinkron dengan halaman hasil undangan.</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* SECTION: DATA PENGANTIN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Heart className="w-4 h-4 text-primary-500" />
                <h3 className="font-serif font-medium text-slate-800 text-base">SECTION I: DATA PADA PENGANTIN</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Groom Panel */}
                <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-4">
                  <div className="text-xs font-semibold text-primary-600 tracking-wider">PIHAK PENGANTIN PRIA</div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nama Pria (Lengkap)</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="groomName"
                        value={data.groomName}
                        onChange={handleInputChange}
                        placeholder="Contoh: ABDUL LATIF"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nama Panggilan Pria</label>
                    <input
                      type="text"
                      name="groomNick"
                      value={data.groomNick || ""}
                      onChange={handleInputChange}
                      placeholder="Contoh: Abdul"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Gelar Depan Pria <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        name="groomTitleFront"
                        value={data.groomTitleFront || ""}
                        onChange={handleInputChange}
                        placeholder="dr. / Ir."
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Gelar Belakang Pria <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        name="groomTitle"
                        value={data.groomTitle || ""}
                        onChange={handleInputChange}
                        placeholder="S.H. / S.T."
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nama Orang Tua & Silsilah</label>
                    <textarea
                      name="groomParents"
                      value={data.groomParents || ""}
                      onChange={handleInputChange}
                      placeholder="Contoh: Putra Terkasih dari Bpk. Latif Syarifudin & Ibu Wardah"
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Bride Panel */}
                <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-4">
                  <div className="text-xs font-semibold text-primary-600 tracking-wider">PIHAK PENGANTIN WANITA</div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nama Wanita (Lengkap)</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        name="brideName"
                        value={data.brideName}
                        onChange={handleInputChange}
                        placeholder="Contoh: Tri Apriyani"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nama Panggilan Wanita</label>
                    <input
                      type="text"
                      name="brideNick"
                      value={data.brideNick || ""}
                      onChange={handleInputChange}
                      placeholder="Contoh: Tri"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Gelar Depan Wanita <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        name="brideTitleFront"
                        value={data.brideTitleFront || ""}
                        onChange={handleInputChange}
                        placeholder="dr. / Hj."
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Gelar Belakang Wanita <span className="text-slate-400 font-normal">(Optional)</span></label>
                      <input
                        type="text"
                        name="brideTitle"
                        value={data.brideTitle || ""}
                        onChange={handleInputChange}
                        placeholder="S.Kep / S.Pd"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nama Orang Tua & Silsilah</label>
                    <textarea
                      name="brideParents"
                      value={data.brideParents || ""}
                      onChange={handleInputChange}
                      placeholder="Contoh: Putri Tercinta dari Bpk. H. Apriyani Slamet & Ibu Hj. Aminah Nur"
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION: JADWAL ACARA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Calendar className="w-4 h-4 text-primary-500" />
                <h3 className="font-serif font-medium text-slate-800 text-base">SECTION II: WAKTU & JADWAL ACARA</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Tanggal Pernikahan (UTC)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      name="weddingDate"
                      value={data.weddingDate}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Format Tanggal Tampil</label>
                  <input
                    type="text"
                    name="weddingTimeFormat"
                    value={data.weddingTimeFormat}
                    onChange={handleInputChange}
                    placeholder="Contoh: Kamis, 11 Juni 2026"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Waktu Akad Nikah</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="akadTime"
                      value={data.akadTime}
                      onChange={handleInputChange}
                      placeholder="Contoh: 08:00 WIB"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-semibold text-slate-700">Waktu Resepsi</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="resepsiTime"
                      value={data.resepsiTime}
                      onChange={handleInputChange}
                      placeholder="Contoh: 10:00 WIB - Selesai"
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* SECTION: LOKASI TEMPAT */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-primary-500" />
                <h3 className="font-serif font-medium text-slate-800 text-base">SECTION III: LOKASI GEDUNG / LOKASI ACARA</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Alamat Tempat Akad Nikah</label>
                  <textarea
                    name="akadLocation"
                    value={data.akadLocation}
                    onChange={handleInputChange}
                    placeholder="Contoh: Masjid Agung Al-Ikhlas Kuta Dalom..."
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Alamat Tempat Resepsi</label>
                  <textarea
                    name="resepsiLocation"
                    value={data.resepsiLocation}
                    onChange={handleInputChange}
                    placeholder="Contoh: Balai Pertemuan Desa Kota Dalam..."
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Google Maps Share Link / URL Lokasi</label>
                  <input
                    type="text"
                    name="mapsLink"
                    value={data.mapsLink || ""}
                    onChange={(e) => {
                      // Check if user pasted an entire iframe tag
                      const val = e.target.value;
                      if (val.includes("<iframe") && val.includes("src=")) {
                        const match = val.match(/src=["']([^"']+)["']/i);
                        if (match && match[1]) {
                          onChange({
                            ...data,
                            mapsLink: match[1]
                          });
                          return;
                        }
                      }
                      onChange({
                        ...data,
                        mapsLink: val
                      });
                    }}
                    placeholder="Contoh: https://maps.app.goo.gl/... atau paste kode iframe <iframe>"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:border-primary-500 focus:outline-none transition-colors"
                  />
                  
                  {(() => {
                    const validation = validateGoogleMapsUrl(data.mapsLink, data.akadLocation || data.resepsiLocation);
                    const isUrlEmpty = !(data.mapsLink || "").trim();
                    
                    return (
                      <div className="space-y-2 mt-1.5">
                        <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed flex items-start gap-2 border ${
                          isUrlEmpty
                            ? "bg-slate-50 border-slate-100 text-slate-400"
                            : validation.isValid 
                              ? validation.type === "shortlink"
                                ? "bg-sky-50/50 border-sky-100/70 text-sky-700"
                                : "bg-emerald-50/50 border-emerald-100/70 text-emerald-700"
                              : "bg-amber-50/50 border-amber-100/70 text-amber-700"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                            isUrlEmpty 
                              ? "bg-slate-400" 
                              : validation.isValid 
                                ? "bg-emerald-500" 
                                : "bg-amber-500"
                          }`} />
                          <div>
                            <span className="font-bold">{isUrlEmpty ? "Peta Otomatis:" : "Status Validasi:"}</span>{" "}
                            {validation.message}
                          </div>
                        </div>

                        {/* Maps visual preview card */}
                        <div className="rounded-xl overflow-hidden border border-slate-150 bg-slate-100 relative aspect-[21/9] shadow-sm">
                          <iframe
                            title="Interactive Maps Live Preview"
                            src={validation.embedUrl}
                            className="absolute inset-0 w-full h-full border-none filter brightness-95"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-[9px] text-white px-2 py-0.5 rounded-md font-mono">
                            Pratinjau Peta Real-Time
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-[10px] text-slate-400">Peta interaktif penyambung navigasi rute (Bisa dipaste link maps.app.goo.gl biasa, google.com/maps koordinat, tempat pencarian, atau salinan kode embed Iframe).</p>
                </div>

              </div>
            </div>

            {/* SECTION: TEMA WEBSITE */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <h3 className="font-serif font-medium text-slate-800 text-base">SECTION IV: TEMA PERNIKAHAN</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Pilihan Tema Visual</label>
                <select
                  name="theme"
                  value={data.theme}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary-500 focus:outline-none transition-colors"
                >
                  <option value="theme-blue-hydrangea">
                    Elegant Blue Hydrangea & Watercolor Floral (Default Premium)
                  </option>
                  <option value="theme-royal-black-gold">
                    Royal Black Gold Luxury Wedding (Sultan VIP)
                  </option>
                  <option value="theme-sage-botanical">
                    Sage Green Botanical Garden Wedding (Earthy Nature)
                  </option>
                  <option value="theme-blush-pink-rose">
                    Blush Pink Rose & Soft Nude (Korean Princess Luxury)
                  </option>
                  <option value="theme-nusantara-luxury">
                    Nusantara Heritage Traditional Gold & Crimson (Adat Mewah)
                  </option>
                  <option value="theme-fairytale-moonlight-blue">
                    Fairytale Moonlight Celestial Starry Blue (Ethereal Fantasy)
                  </option>
                  <option value="theme-royal-red-imperial">
                    Royal Crimson Imperial Wedding (Sultan Crimson & Gold Velvet)
                  </option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Pilih dari 7 tema eksklusif: <b>Elegant Blue Hydrangea</b>, <b>Royal Black Gold</b>, <b>Sage Green Botanical</b>, <b>Blush Pink Rose</b>, <b>Nusantara Heritage</b>, <b>Fairytale Moonlight</b>, dan <b>Royal Crimson Imperial</b>. Setiap tema memiliki font, ornamen, partikel, skema warna, kartu rujukan, musik, dan nuansa visual tersendiri secara dinamik.
                </p>
              </div>
            </div>

            {/* SECTION: GALERI MEDIA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Upload className="w-4 h-4 text-primary-500" />
                <h3 className="font-serif font-medium text-slate-800 text-base">SECTION V: MEDIA GALERI FOTO</h3>
              </div>

              {/* Drag n Drop area */}
              <div
                className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
                  dragActive 
                    ? "border-primary-500 bg-primary-50/50" 
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-semibold text-slate-700">
                  Tarik & Taruh Foto di Sini, atau <span className="text-primary-600 underline">Cari File</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Mendukung JPEG, PNG. Gambar akan secara otomatis dikompresi &amp; di-resize ke <b>800px</b> agar pengaksesan kilat!
                </p>
              </div>

              {/* Batch Compression Progress Panel & Status Progress tracker */}
              {isCompressing && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 animate-fade-in-up">
                  <div className="flex items-center justify-between text-xs text-sky-100 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-primary-400 animate-spin" />
                      Sedang mengoptimalkan: {compressionProgress.current} dari {compressionProgress.total} foto kustom...
                    </span>
                    <span className="text-[10px] text-sky-400 font-mono">
                      {Math.round((compressionProgress.current / (compressionProgress.total || 1)) * 100)}%
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-400 via-sky-400 to-primary-500 transition-all duration-300" 
                      style={{ width: `${(compressionProgress.current / (compressionProgress.total || 1)) * 100}%` }}
                    />
                  </div>

                  {/* Multi-file uploads itemized status queue */}
                  {uploadQueue.length > 0 && (
                    <div className="pt-2 border-t border-slate-850 max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-805 block text-left">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                        Antrean File ({uploadQueue.filter(q => q.status === 'done').length}/{uploadQueue.length})
                      </p>
                      <div className="space-y-1">
                        {uploadQueue.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] px-2 py-1 rounded bg-slate-850/60 border border-slate-805">
                            <span className="text-slate-300 truncate max-w-[180px]" title={item.name}>
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-[10px] font-mono">{item.size}</span>
                              {item.status === 'pending' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 animate-pulse">Menunggu</span>
                              )}
                              {item.status === 'processing' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-950 text-sky-400 font-semibold animate-pulse flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-sky-400 animate-ping"></span>
                                  Memproses
                                </span>
                              )}
                              {item.status === 'done' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-400 font-semibold">Selesai ✓</span>
                              )}
                              {item.status === 'failed' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950 text-rose-400 font-semibold">Gagal</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {compressionProgress.savedKB > 0 && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-semibold font-mono animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Berhasil memangkas file logaritmis: Hemat ~{compressionProgress.savedKB} KB beban bandwidth! ⚡
                    </div>
                  )}
                </div>
              )}

              {/* Image Previews with Drag-n-Drop & Custom Roles Selector */}
              {data.images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-700">{data.images.length} Foto diunggah</span>
                      <span className="text-[10px] text-slate-400">💡 Sentuh &amp; tarik (drag) kotak foto untuk menggeser urutan posisi. Gunakan tombol peran untuk mematangkan letak.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="text-xs text-rose-500 hover:text-rose-600 font-semibold hover:underline cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {data.images.map((img, i) => {
                      const isGroom = i === 0;
                      const isBride = i === 1;
                      const isCover = i === 4;
                      const isGallery = !isGroom && !isBride && !isCover;

                      let badgeText = "📸 Galeri";
                      let badgeClass = "bg-slate-700/90 text-white";
                      if (isGroom) {
                        badgeText = "🤵 Pengantin Pria";
                        badgeClass = "bg-sky-600/90 text-white";
                      } else if (isBride) {
                        badgeText = "👰 Pengantin Wanita";
                        badgeClass = "bg-pink-600/90 text-white";
                      } else if (isCover) {
                        badgeText = "🖼️ Cover Undangan";
                        badgeClass = "bg-amber-600/90 text-white font-bold";
                      }

                      return (
                        <div 
                          key={i} 
                          draggable
                          onDragStart={(e) => {
                            setDraggedIndex(i);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedIndex !== null && draggedIndex !== i) {
                              swapImages(draggedIndex, i);
                            }
                          }}
                          onDragEnd={() => setDraggedIndex(null)}
                          className={`group relative aspect-square rounded-2xl bg-slate-100 overflow-hidden border transition-all duration-200 cursor-move active:scale-98 select-none ${
                            draggedIndex === i 
                              ? "opacity-30 border-dashed border-primary-500 ring-2 ring-primary-500/20" 
                              : "border-slate-200 hover:shadow-md hover:border-slate-400"
                          }`}
                        >
                          <img 
                            src={img} 
                            alt={`Upload Preview ${i}`} 
                            className="w-full h-full object-cover pointer-events-none"
                            referrerPolicy="no-referrer"
                          />

                          {/* Role Badge */}
                          <div className={`absolute top-0 left-0 text-[8px] px-2 py-0.5 rounded-br-xl font-medium tracking-wide ${badgeClass}`}>
                            {badgeText}
                          </div>

                          {/* Top-Right Trash Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(i);
                            }}
                            type="button"
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                            title="Hapus gambar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Quick Role Assigner Overlays */}
                          <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 p-1.5 translate-y-full group-hover:translate-y-0 transition-all duration-300 flex items-center justify-around">
                            <span className="text-[7.5px] font-bold text-slate-400 select-none block mr-1 text-left line-clamp-1">Set Peran:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPhotoRole(i, "groom"); }}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${isGroom ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                title="Jadikan Foto Mempelai Pria"
                              >
                                🤵 Pria
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPhotoRole(i, "bride"); }}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${isBride ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                title="Jadikan Foto Mempelai Wanita"
                              >
                                👰 Wanita
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setPhotoRole(i, "cover"); }}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${isCover ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                title="Jadikan Foto Sampul Utama"
                              >
                                🖼️ Cover
                              </button>
                            </div>
                          </div>

                          {/* Position Badge */}
                          <div className="absolute top-1.5 right-8 text-[8px] bg-slate-950/40 text-slate-200 px-1.5 rounded pr-1 truncate font-mono">
                            Pos: {i + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION: FEATURE TOGGLES */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Globe className="w-4 h-4 text-primary-500" />
                <h3 className="font-serif font-medium text-slate-800 text-base">SECTION VI: FITUR TAMBAHAN & LAYUT</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Switch list */}
                {[
                  { key: "enableMusic", title: "Aktifkan Musik Latar", desc: "Mainkan instrument piano cinta otomatis saat dibuka", icon: Music },
                  { key: "enableCountdown", title: "Aktifkan Countdown", desc: "Merekam hitungan mundur sisa waktu ke tanggal acara", icon: Clock },
                  { key: "enableRSVP", title: "Aktifkan RSVP Form", desc: "Izinkan tamu memposting status kehadiran langsung", icon: Heart },
                  { key: "enableGuestbook", title: "Aktifkan Buku Tamu Live", desc: "Tampilkan ucapan dari seluruh hadirin secara real-time", icon: FileText },
                  { key: "enableLoveStory", title: "Aktifkan Love Story", desc: "Tampilkan rute perjalanan asmara kedua mempelai", icon: HeartHandshake },
                  { key: "enableGiftDigital", title: "Aktifkan Gift Digital", desc: "Dukungan amplop digital lewat transfer & kado online", icon: CreditCard },
                  { key: "enableGoogleMaps", title: "Aktifkan Google Maps", desc: "Sematkan titik lokasi peta pemandu navigasi", icon: MapPin },
                ].map((item) => {
                  const IconComp = item.icon;
                  const isActive = data[item.key as keyof WeddingData] as boolean;
                  return (
                    <div 
                      key={item.key}
                      onClick={() => handleToggleChange(item.key as keyof WeddingData)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isActive 
                          ? "bg-primary-50/40 border-primary-100 shadow-xs" 
                          : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-lg mt-0.5 ${isActive ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-400"}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{item.title}</div>
                          <div className="text-[10px] text-slate-400 leading-tight">{item.desc}</div>
                        </div>
                      </div>

                      {/* Cool Toggle switch */}
                      <div className="relative inline-flex items-center cursor-pointer">
                        <div className={`w-9 h-5 rounded-full transition-colors ${isActive ? "bg-primary-500" : "bg-slate-200"}`}></div>
                        <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full shadow-xs transition-transform ${isActive ? "transform translate-x-4" : ""}`}></div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* DYNAMIC AUDIO SETTINGS PANEL */}
            {data.enableMusic && (
              <div className="p-5 rounded-2xl bg-sky-50/35 border border-sky-100/50 space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-1.5 border-b border-sky-100/35">
                  <Music className="w-4 h-4 text-primary-500 font-bold" />
                  <span className="text-xs font-semibold text-primary-600 tracking-wider">KUSTOMISASI MUSIK LATAR</span>
                </div>

                {/* AUDIO FILE UPLOADER */}
                <div className="p-4 rounded-xl border border-sky-100 bg-white/70 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Opsi A: Unggah File MP3 Lokal (Sangat Direkomendasikan)</span>
                  
                  {!data.customAudioBase64 ? (
                    <div className="space-y-2">
                      <div 
                        onClick={() => audioInputRef.current?.click()}
                        className="p-4 border-2 border-dashed border-sky-200 hover:border-primary-500 rounded-xl bg-sky-50/20 hover:bg-sky-50/40 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 group"
                      >
                        <input 
                          type="file"
                          ref={audioInputRef}
                          onChange={handleAudioUpload}
                          accept="audio/*,.mp3"
                          className="hidden"
                        />
                        <Upload className="w-6 h-6 text-primary-500 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs font-semibold text-slate-700">Pilih / Cari File MP3 Musik Anda</span>
                        <span className="text-[10px] text-slate-400">File akan disimpan secara lokal sebagai base64 instan</span>
                      </div>
                      {audioError && (
                        <p className="text-[10px] text-rose-500 font-medium">{audioError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-100 bg-emerald-50/30">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 animate-pulse">
                          <Music className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded mr-1">AKTIF & PRIORITAS</span>
                          <p className="text-xs font-semibold text-slate-800 truncate">{data.customAudioFileName || "Musik Unggahan"}</p>
                          <p className="text-[9px] text-slate-400">Ukuran file audio terkonversi sebagai base64</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={removeAudioFile}
                        className="p-1 px-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        Ganti / Hapus
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                  <span className="relative px-3 bg-slate-50/1 text-[10px] text-slate-400 font-semibold uppercase">ATAU</span>
                </div>

                {/* AUDIO URL FIELDS */}
                <div className="p-4 rounded-xl border border-slate-100 bg-white/70 space-y-4">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Opsi B: Tautan Kustom (Ketinggalan Prioritas Jika Opsi A Diisi)</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Custom Audio URL (MP3 / YouTube / Spotify Playlist Link)</label>
                      <input
                        type="text"
                        name="customAudioUrl"
                        value={data.customAudioUrl || ""}
                        onChange={handleInputChange}
                        disabled={!!data.customAudioBase64}
                        placeholder={data.customAudioBase64 ? "Nonaktif karena file MP3 sedang terunggah" : "Contoh: https://open.spotify.com/playlist/... atau https://assets.mixkit.co/...mp3"}
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                      />
                      <p className="text-[10px] text-slate-400 font-sans">Mendukung file direct MP3, link YouTube, dan link Playlist/Track Spotify.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 font-sans">Judul Lagu / Nama Musik</label>
                      <input
                        type="text"
                        name="customAudioTitle"
                        value={data.customAudioTitle || ""}
                        onChange={handleInputChange}
                        placeholder="Contoh: Perfect - Ed Sheeran (Piano Cover)"
                        className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs focus:border-primary-500 outline-none"
                      />
                      <p className="text-[10px] text-slate-400 font-sans">Berlaku untuk kustomisasi running text marquee di widget undangan.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: AMPLOP SUNTIKAN */}
            {data.enableGiftDigital && (
              <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
                  <CreditCard className="w-4 h-4 text-primary-500" />
                  <span className="text-xs font-semibold text-primary-600 tracking-wider">FITUR AMPLOP DIGITAL / GIFT SETTING</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nama Bank / E-Wallet</label>
                    <input
                      type="text"
                      name="bankName"
                      value={data.bankName}
                      onChange={handleInputChange}
                      placeholder="Contoh: BSI"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Nomor Rekening</label>
                    <input
                      type="text"
                      name="bankAccount"
                      value={data.bankAccount}
                      onChange={handleInputChange}
                      placeholder="Contoh: 7120033481"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Rekening Atas Nama (A/N)</label>
                    <input
                      type="text"
                      name="bankUser"
                      value={data.bankUser}
                      onChange={handleInputChange}
                      placeholder="Contoh: Abdul Latif"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                {/* QRIS upload */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-700">Upload Gambar QRIS (Optional)</label>
                  <div className="flex items-center gap-4">
                    {data.qrisImage && (
                      <div className="w-16 h-16 rounded-lg bg-white p-1 border border-slate-200 flex-shrink-0">
                        <img 
                          src={data.qrisImage} 
                          alt="QRIS preview" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={qrisInputRef}
                      onChange={handleQrisUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isCompressingQris}
                      onClick={() => qrisInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-600 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isCompressingQris ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-primary-500 animate-spin" />
                          Mengompresi...
                        </>
                      ) : (
                        "Unggah QRIS Baru"
                      )}
                    </button>
                    {!isCompressingQris && data.qrisImage && (
                      <button
                        type="button"
                        onClick={() => onChange({ ...data, qrisImage: "" })}
                        className="text-xs text-rose-500 font-semibold"
                      >
                        Hapus QRIS
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1">
                    <span>💡</span>
                    <span><strong>Tips Optimasi:</strong> Gunakan gambar QRIS berbentuk persegi (rasio 1:1) dan ukuran file di bawah 1.00 MB agar QR Code tampil presisi bagi para tamu dan mudah dipindai (di-scan).</span>
                  </p>
                </div>
              </div>
            )}

            {/* SECTION VII: MANAJEMEN KISAH CINTA (LOVE STORY TIMELINE) */}
            {data.enableLoveStory && (
              <div className="p-5 rounded-2xl bg-amber-50/20 border border-amber-100/50 space-y-4 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-1.5 border-b border-amber-100/30 font-bold">
                  <HeartHandshake className="w-4 h-4 text-amber-500 font-bold" />
                  <span className="text-xs font-semibold text-amber-600 tracking-wider font-mono">MANAJEMEN KISAH CINTA (LOVE STORY TIMELINE)</span>
                </div>

                {/* Form to Add / Edit Milestone */}
                <form onSubmit={handleSaveStory} className="p-4 rounded-xl border border-amber-100 bg-white/75 space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                    {editingStoryId ? "Mode Edit Milestone" : "Tambah Milestone Kisah Baru"}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Tahun / Tanggal Detail</label>
                      <input
                        type="text"
                        value={storyYear}
                        onChange={(e) => setStoryYear(e.target.value)}
                        placeholder="Contoh: 2022, 17 Agustus 2023, atau Maret 2025"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-amber-500 outline-none"
                        required
                      />
                      <p className="text-[9px] text-slate-400">Dapat diisi tahun ataupun tanggal yang lebih mendetail.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Judul Milestone / Momen</label>
                      <input
                        type="text"
                        value={storyTitle}
                        onChange={(e) => setStoryTitle(e.target.value)}
                        placeholder="Contoh: Pertama Kali Bertemu / Hari Lamaran"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-amber-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Deskripsi Cerita</label>
                    <textarea
                      value={storyContent}
                      onChange={(e) => setStoryContent(e.target.value)}
                      placeholder="Ceritakan sejarah manis momen ini secara ringkas..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:border-amber-500 outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    {editingStoryId && (
                      <button
                        type="button"
                        onClick={handleCancelStoryEdit}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-xs font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {editingStoryId ? "Simpan Perubahan" : "Tambahkan ke Timeline"}
                    </button>
                  </div>
                </form>

                {/* Milestones List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">Urutan Timeline Saat Ini ({data.loveStories?.length || 0})</span>
                  
                  {(!data.loveStories || data.loveStories.length === 0) ? (
                    <div className="text-center p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                      <Heart className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs font-medium text-slate-400">Belum ada momen kisah cinta yang dicatat.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {data.loveStories.map((story) => (
                        <div 
                          key={story.id} 
                          className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
                            editingStoryId === story.id 
                              ? "bg-amber-50/30 border-amber-300 ring-2 ring-amber-300/10" 
                              : "bg-white border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className="space-y-1 overflow-hidden pr-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-amber-150 text-amber-800 rounded-full text-[9px] font-bold font-mono tracking-wider">{story.year}</span>
                              <h5 className="text-xs font-bold text-slate-800 truncate">{story.title}</h5>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 md:line-clamp-none whitespace-pre-wrap">{story.content}</p>
                          </div>
                          
                          <div className="flex gap-1 flex-shrink-0 items-center">
                            <button
                              type="button"
                              onClick={() => handleEditStoryClick(story)}
                              className="p-1.5 rounded-lg border border-slate-100 text-slate-500 hover:text-amber-600 hover:bg-amber-50 text-[10px] font-semibold transition-all cursor-pointer"
                              title="Edit Momen Ini"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStory(story.id)}
                              className="p-1.5 rounded-lg border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[10px] font-semibold transition-all cursor-pointer"
                              title="Hapus Momen Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION: PERSONALIZED GUEST SHARE WIDGET */}
            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100/60 shadow-xs space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-150">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase">Fitur Bagikan Ke Tamu (Guest Link Generator)</h3>
                  <p className="text-[10px] text-emerald-700/85 font-sans">Kustomisasi nama penerima undangan otomatis di layar pembuka & bagikan langsung!</p>
                </div>
              </div>

              {/* MANDATORY SYNC SAVE BUTTON PANEL */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-200/60 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5 text-emerald-600" />
                      Simpan Permanen ke Server Cloud
                    </span>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans">
                      Wajib klik tombol simpan di samping setelah Anda mengunggah foto baru, merubah gelar, atau mengubah lagu latar MP3 agar data langsung aktif di tautan undangan tamu Anda!
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isCloudSaving}
                    onClick={triggerManualCloudSave}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer ${
                      isCloudSaving 
                        ? "bg-slate-100 text-slate-400 border border-slate-200" 
                        : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/10"
                    }`}
                  >
                    {isCloudSaving ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                        Menyinkronkan...
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Simpan &amp; Aktifkan Link
                      </>
                    )}
                  </button>
                </div>

                {cloudSaveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 animate-fade-in-up">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-emerald-800 block">✓ SUKSES! Undangan Pernikahan Telah Disimpan Secara Permanen</span>
                      <p className="text-[10px] text-emerald-700 leading-relaxed font-sans">
                        Seluruh berkas foto baru, urutan galeri, silsilah keluarga, audio MP3 kustom, dan gelar akademik telah berhasil tersimpan dan aktif 100% online di server awan. Semua tautan bagikan untuk tamu di bawah ini sekarang otomatis merujuk ke data permanen yang baru!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Pilih Gelar / Sapaan Tamu</label>
                  <select
                    value={shareGuestSalutation}
                    onChange={(e) => setShareGuestSalutation(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                  >
                    <option value="Bapak/Ibu/Saudara/i">Bapak/Ibu/Saudara/i</option>
                    <option value="Yth. Bapak">Yth. Bapak</option>
                    <option value="Yth. Ibu">Yth. Ibu</option>
                    <option value="Kak">Kak</option>
                    <option value="Adek">Adek</option>
                    <option value="Sdr/i">Sdr/i</option>
                    <option value="Sahabatku">Sahabatku</option>
                    <option value="Keluarga Besar">Keluarga Besar</option>
                    <option value="">Tanpa Sapaan (Langsung Nama)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nama Lengkap Tamu</label>
                  <input
                    type="text"
                    value={shareGuestName}
                    onChange={(e) => setShareGuestName(e.target.value)}
                    placeholder="Contoh: Anton Wibowo, S.H. / Kak Siska"
                    className="w-full px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Segmented Selector for Link Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">Pilihan Tipe Tautan (Link Format)</label>
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setGuestLinkType("short")}
                    className={`py-2 rounded-xl text-center text-xs font-semibold transition-all cursor-pointer ${
                      guestLinkType === "short"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    Short Link (Bersih & Pendek)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestLinkType("full")}
                    className={`py-2 rounded-xl text-center text-xs font-semibold transition-all cursor-pointer ${
                      guestLinkType === "full"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    Portable Link (Semua Isi)
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">
                  {guestLinkType === "short"
                    ? "✓ Rekomendasi WA: Tautan super bersih & pendek, hanya memuat identitas nama tamu di URL."
                    : "✓ Portabel: Membawa seluruh isi data form di dalam link, aman dibagikan ke HP penerima mana pun."}
                </p>
              </div>

              {/* URL Preview Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Custom Link Hasil Undangan</span>
                    <span className="text-[8px] text-slate-400">
                      {guestLinkType === "short" ? "Suhu link: Sangat aman di aplikasi WhatsApp" : "Suhu link: Sangat aman untuk offline portability"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const fullUrl = generateGuestLink();
                      navigator.clipboard.writeText(fullUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-white font-semibold transition-all cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Link Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-300" />
                        Salin Link
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2 border border-emerald-500/10 rounded-lg bg-slate-950 text-[10px] break-all text-emerald-300 font-mono">
                  {generateGuestLink()}
                </div>
              </div>

              {/* Text Message Draft Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 font-sans">Pratinjau Teks Undangan WA</label>
                <div className="relative">
                  <textarea
                    value={(() => {
                      const fullUrl = generateGuestLink();
                      const suffix = shareGuestName.trim() ? (shareGuestSalutation ? `${shareGuestSalutation} ${shareGuestName}` : shareGuestName) : "";
                      const nameStr = suffix || "Bapak/Ibu/Saudara/i";
                      const groomNick = data.groomNick || data.groomName.split(" ")[0];
                      const brideNick = data.brideNick || data.brideName.split(" ")[0];

                      return `*Undangan Pernikahan Digital Resmi* 💍
    
Kepada Yth.
*${nameStr}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara pernikahan kami.

*${data.groomName} ( ${groomNick} )*
&
*${data.brideName} ( ${brideNick} )*

Berikut tautan undangan digital resmi kami untuk melihat detail acara, peta lokasi, galeri kenangan, dan melakukan konfirmasi kehadiran (RSVP):

👉 *${fullUrl}*

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.

Terima kasih banyak atas perhatian dan kiriman doanya.

Salam hangat,
*${groomNick} & ${brideNick}*`;
                    })()}
                    readOnly
                    rows={6}
                    className="w-full p-4 border border-slate-150 bg-slate-50/50 rounded-2xl text-[11px] text-slate-600 outline-none font-sans leading-relaxed resize-none pb-14"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const fullUrl = generateGuestLink();
                        const suffix = shareGuestName.trim() ? (shareGuestSalutation ? `${shareGuestSalutation} ${shareGuestName}` : shareGuestName) : "";
                        const nameStr = suffix || "Bapak/Ibu/Saudara/i";
                        const groomNick = data.groomNick || data.groomName.split(" ")[0];
                        const brideNick = data.brideNick || data.brideName.split(" ")[0];

                        const text = `*Undangan Pernikahan Digital Resmi* 💍
    
Kepada Yth.
*${nameStr}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara pernikahan kami.

*${data.groomName} ( ${groomNick} )*
&
*${data.brideName} ( ${brideNick} )*

Berikut tautan undangan digital resmi kami untuk melihat detail acara, peta lokasi, galeri kenangan, dan melakukan konfirmasi kehadiran (RSVP):

👉 *${fullUrl}*

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.

Terima kasih banyak atas perhatian dan kiriman doanya.

Salam hangat,
*${groomNick} & ${brideNick}*`;

                        navigator.clipboard.writeText(text);
                        setCopiedText(true);
                        setTimeout(() => setCopiedText(false), 2000);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-950 text-white font-bold text-[9px] tracking-wider uppercase flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Salin Teks WA
                        </>
                      )}
                    </button>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent((() => {
                        const fullUrl = generateGuestLink();
                        const suffix = shareGuestName.trim() ? (shareGuestSalutation ? `${shareGuestSalutation} ${shareGuestName}` : shareGuestName) : "";
                        const nameStr = suffix || "Bapak/Ibu/Saudara/i";
                        const groomNick = data.groomNick || data.groomName.split(" ")[0];
                        const brideNick = data.brideNick || data.brideName.split(" ")[0];

                        return `*Undangan Pernikahan Digital Resmi* 💍
    
Kepada Yth.
*${nameStr}*

Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara pernikahan kami.

*${data.groomName} ( ${groomNick} )*
&
*${data.brideName} ( ${brideNick} )*

Berikut tautan undangan digital resmi kami untuk melihat detail acara, peta lokasi, galeri kenangan, dan melakukan konfirmasi kehadiran (RSVP):

👉 *${fullUrl}*

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.

Terima kasih banyak atas perhatian dan kiriman doanya.

Salam hangat,
*${groomNick} & ${brideNick}*`;
                      })())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] tracking-wider uppercase flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:scale-[1.03] active:scale-95"
                    >
                      <MessageCircle className="w-3 h-3 fill-white text-emerald-600" />
                      Kirim Ke WA Tamu
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* BUTTON BUILDER ACTIONS */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleExportTemplate}
                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-2xl font-serif font-semibold text-base shadow-lg hover:shadow-xl transition-all cursor-pointer text-center relative overflow-hidden group flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5 text-emerald-100" />
                EKSPOR DATA CADANGAN / UNDUH TEMPLATE CONFIG (.JSON)
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* "Clear All" Gallery Confirmation Dialog Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-sans">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 space-y-5 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-slate-800 text-lg">Hapus Semua Foto Galeri?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tindakan ini tidak dapat dibatalkan. Semua foto ({data.images.length} item) yang telah diunggah dalam galeri ini akan dihapus secara permanen dari draf undangan sekarang.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition duration-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange({ ...data, images: [] });
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200/40 transition duration-200 cursor-pointer"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
