export interface WeddingData {
  groomName: string;
  groomNick?: string;
  groomParents?: string;
  groomTitle?: string;
  groomTitleFront?: string;
  groomTitleBack?: string;
  
  brideName: string;
  brideNick?: string;
  brideParents?: string;
  brideTitle?: string;
  brideTitleFront?: string;
  brideTitleBack?: string;
  
  weddingDate: string; // e.g. "2026-06-11"
  weddingTimeFormat: string; // e.g. "Kamis, 11 Juni 2026"
  akadTime: string; // e.g. "08:00 WIB"
  resepsiTime: string; // e.g. "10:00 WIB"
  
  akadLocation: string;
  resepsiLocation: string;
  
  theme: string;
  images: string[]; // URL atau data base64
  
  enableMusic: boolean;
  customAudioUrl?: string;
  customAudioTitle?: string;
  customAudioBase64?: string;
  customAudioFileName?: string;
  enableCountdown: boolean;
  enableRSVP: boolean;
  enableGuestbook: boolean;
  enableLoveStory: boolean;
  enableGiftDigital: boolean;
  enableGoogleMaps: boolean;
  mapsLink?: string;
  
  bankName: string;
  bankAccount: string;
  bankUser: string;
  qrisImage: string; // base64 atau URL
  
  loveStories: LoveStoryItem[];
}

export interface LoveStoryItem {
  id: string;
  year: string;
  title: string;
  content: string;
}

export interface GuestWish {
  id: string;
  name: string;
  wish: string;
  attendance: "Hadir" | "Tidak Hadir" | "Ragu-ragu";
  createdAt: string;
}

// 1. CLIENT ACCOUNT MODEL
export interface ClientAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  status: "active" | "suspended" | "inactive";
  packageId?: string;
  createdAt: string;
  data: WeddingData;
  slug: string;
  visibility: "public" | "private" | "suspended";
  keepWeddingPublic: boolean;
}

// 2. TEMPLATE MODEL
export interface TemplatePreset {
  id: string;
  name: string;
  theme: string;
  description: string;
  isPremium: boolean;
  isActive: boolean;
  accentClass: string;
  bgClass: string;
  textColor: string;
  iconColor: string;
  images: string[];
}

// 3. GLOBAL FEATURE TOGGLES
export interface GlobalFeatureToggles {
  rsvp: boolean;
  guestbook: boolean;
  gallery: boolean;
  music: boolean;
  countdown: boolean;
  loveStory: boolean;
  giftDigital: boolean;
  googleMaps: boolean;
  animationPremium: boolean;
  exportJson: boolean;
  uploadVideo: boolean;
  floatingMusic: boolean;
  watermark: boolean;
  analytics: boolean;
}

// 4. ACTIVITY LOG
export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  activity: string;
  status: "SUKSES" | "GAGAL" | "INFO";
  description: string;
}

// 5. STORAGE FILE
export interface StorageFile {
  id: string;
  fileName: string;
  fileSize: string; // e.g. "1.2 MB"
  uploadDate: string;
  fileType: "photo" | "music" | "qris" | "thumbnail";
  url: string; // Base64 or mock URL
}

// Legacy compat matching ClientDraft
export interface ClientDraft {
  id: string;
  name: string;
  updatedAt: string;
  data: WeddingData;
}
