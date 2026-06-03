import { WeddingData, LoveStoryItem } from "./types";

// Helper to convert Google Drive viewing link to a high-quality direct asset embed link
export const parseDriveUrl = (url: string): string => {
  if (!url) return "";
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
};

// Default Google Drive photo URLs provided in the requirements - CLEARED & EMPTY
export const rawDriveUrls: string[] = [];

// Programmatic, elegant luxury neutral SVG illustration fallback to avoid using couple photographs
export const defaultImages: string[] = [
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1200' viewBox='0 0 800 1200'><defs><linearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23fbf9f6'/><stop offset='100%25' stop-color='%23ebdcc7' stop-opacity='0.6'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23bg)'/><g fill='none' stroke='%23caa456' stroke-opacity='0.25' stroke-width='1.5'><circle cx='400' cy='600' r='160'/><circle cx='400' cy='600' r='154' stroke-dasharray='10 5'/><path d='M450,560 C490,510 560,540 540,590 C510,640 450,670 450,670 C450,670 390,640 360,590 C340,540 410,510 450,560 Z' stroke-width='2' stroke-opacity='0.4'/></g><path d='M0,0 L800,0 L800,1200 L0,1200 Z' fill='none' stroke='%23caa456' stroke-width='4' stroke-opacity='0.3'/><rect x='15' y='15' width='770' height='1170' fill='none' stroke='%23caa456' stroke-width='1' stroke-opacity='0.2'/></svg>"
];

export const defaultLoveStories: LoveStoryItem[] = [
  {
    id: "1",
    year: "2022",
    title: "Awal Berkenalan",
    content: "Takdir mempertemukan kami di sebuah forum diskusi akademis. Pertemuan singkat yang bersahaja namun berbekas mendalam, mengawali obrolan demi obrolan yang sarat akan kesamaan visi hidup."
  },
  {
    id: "2",
    year: "2024",
    title: "Memadukan Komitmen",
    content: "Melewati dua tahun penuh cerita bersama dalam karir dan perjuangan masing-masing. Di tahun ini, dengan restu kedua orang tua, kami bertekad memantapkan hati melangkah ke jenjang yang lebih serius."
  },
  {
    id: "3",
    year: "2026",
    title: "Menuju Mahligai Pernikahan",
    content: "Tiba saatnya mengabadikan cinta dalam ikatan suci pernikahan. Menyatukan dua keluarga besar dalam satu bait doa, sejalan merajut masa depan di bawah ridha Allah SWT."
  }
];

export const defaultWeddingData: WeddingData = {
  groomName: "",
  groomNick: "",
  groomTitle: "",
  groomTitleFront: "",
  groomTitleBack: "",
  groomParents: "",
  
  brideName: "",
  brideNick: "",
  brideTitle: "",
  brideTitleFront: "",
  brideTitleBack: "",
  brideParents: "",
  
  weddingDate: "2026-12-31",
  weddingTimeFormat: "Kamis, 31 Desember 2026",
  akadTime: "08:00 WIB",
  resepsiTime: "10:00 WIB",
  
  akadLocation: "",
  resepsiLocation: "",
  
  theme: "theme-blue-hydrangea",
  images: [],
  
  enableMusic: true,
  enableCountdown: true,
  enableRSVP: true,
  enableGuestbook: true,
  enableLoveStory: true,
  enableGiftDigital: true,
  enableGoogleMaps: true,
  mapsLink: "",
  
  bankName: "",
  bankAccount: "",
  bankUser: "",
  qrisImage: "",
  
  loveStories: []
};
