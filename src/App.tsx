import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import FormGenerator from "./components/FormGenerator";
import WeddingInvitation from "./components/WeddingInvitation";
import SuperadminPanel from "./components/SuperadminPanel";
import ClientAdminPanel from "./components/ClientAdminPanel";
import ThemeIllustration from "./components/ThemeIllustration";
import { defaultWeddingData, defaultLoveStories } from "./data";
import { 
  WeddingData, ClientAccount, TemplatePreset, 
  GlobalFeatureToggles, ActivityLogEntry, StorageFile 
} from "./types";
import { 
  Heart, Sparkles, SlidersHorizontal, Eye, EyeOff, Lock, Mail, User,
  Unlock, Key, Settings, Trash2, Plus, Copy, Check, 
  FolderHeart, ShieldCheck, Moon, Sun, ArrowRight, LogIn, Users, BarChart3, HardDrive, ClipboardList, X,
  ShieldAlert, Clipboard, CheckCircle, XCircle, Info
} from "lucide-react";
import { decodeWeddingData, encodeWeddingData, safeLocalStorage, generateSlug, getUniqueSlug } from "./utils";
import { db, auth, handleFirestoreError, OperationType, googleSignIn } from "./firebase";
import { 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  getDoc,
  query
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";


export default function App() {
  // Current active viewport tab
  const [activeTab, setActiveTab] = useState<"landing" | "superadmin" | "client-admin" | "wedding-preview">(() => {
    try {
      const cached = safeLocalStorage.getItem("marriage_active_tab");
      if (cached === "client-admin" || cached === "superadmin" || cached === "wedding-preview" || cached === "landing") {
        return cached as any;
      }
    } catch {}
    return "landing";
  });

  useEffect(() => {
    try {
      safeLocalStorage.setItem("marriage_active_tab", activeTab);
    } catch {}
  }, [activeTab]);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRole, setLoginRole] = useState<"client" | "superadmin">("client");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Firebase Auth states & sign up flow fields
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const cached = safeLocalStorage.getItem("marriage_current_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [userProfile, setUserProfile] = useState<any>(() => {
    try {
      const cached = safeLocalStorage.getItem("marriage_user_profile");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState<"client" | "superadmin">("client");
  
  // App-wide state lists with safe local storage persistence
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [templates, setTemplates] = useState<TemplatePreset[]>([]);
  const [featureToggles, setFeatureToggles] = useState<GlobalFeatureToggles>({
    rsvp: true,
    guestbook: true,
    gallery: true,
    music: true,
    countdown: true,
    loveStory: true,
    giftDigital: true,
    googleMaps: true,
    animationPremium: true,
    exportJson: true,
    uploadVideo: true,
    floatingMusic: true,
    watermark: false,
    analytics: true
  });
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);

  // Selected client ID / preview payload for general review
  const [selectedPreviewClientId, setSelectedPreviewClientId] = useState<string>("");
  const [directGuestData, setDirectGuestData] = useState<WeddingData | null>(null);
  
  // Security locks states
  const [isSuperadminUnlocked, setIsSuperadminUnlocked] = useState(() => {
    try {
      return safeLocalStorage.getItem("marriage_is_superadmin_unlocked") === "true";
    } catch {
      return false;
    }
  });
  const [saUsernameInput, setSaUsernameInput] = useState("");
  const [saPasswordInput, setSaPasswordInput] = useState("");
  const [saLoginError, setSaLoginError] = useState("");
  
  // Immersive full-screen preview toggle
  const [isGuestView, setIsGuestView] = useState(false);
  const [previewDataOverride, setPreviewDataOverride] = useState<WeddingData | null>(null);

  // Active Client Login State
  const [loggedClient, setLoggedClient] = useState<ClientAccount | null>(() => {
    try {
      const cached = safeLocalStorage.getItem("marriage_logged_client");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [isClientsLoading, setIsClientsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDomainError, setIsDomainError] = useState(false);
  const [copiedDomainText, setCopiedDomainText] = useState<string | null>(null);

  // Dynamic system toast notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const translateAuthError = (code: string, defaultMsg: string): string => {
    const cleanCode = code?.replace("auth/", "") || "";
    switch (cleanCode) {
      case "invalid-email":
        return "Format email tidak valid. Pastikan penulisan email sudah benar (contoh: nama@email.com).";
      case "user-not-found":
        return "Akun email ini tidak ditemukan. Silakan periksa kembali atau daftarkan akun baru.";
      case "wrong-password":
        return "Kata sandi yang Anda masukkan salah. Silakan coba kembali.";
      case "email-already-in-use":
        return "Alamat email ini sudah terdaftar. Silakan gunakan email lain atau langsung hubungi admin.";
      case "weak-password":
        return "Kata sandi terlalu pendek/lemah. Sandi harus minimal memiliki panjang 6 karakter.";
      case "popup-closed-by-user":
        return "Otentikasi dibatalkan karena jendela login Google ditutup.";
      case "cancelled-popup-request":
        return "Verifikasi Google dibatalkan karena ada popup masuk baru yang dibuka.";
      case "unauthorized-domain":
        return "Domain situs ini belum diizinkan di Google/Firebase Console Authorized Domains.";
      case "too-many-requests":
        return "Terlalu banyak percobaan masuk yang salah. Akun diblokir sementara demi keamanan. Silakan coba sesaat lagi.";
      case "network-request-failed":
        return "Koneksi jaringan terganggu. Silakan periksa jaringan internet Anda dan coba lagi.";
      default:
        return defaultMsg || "Sistem mengalami kegagalan proses otentikasi.";
    }
  };

  // Activity Log Writer
  const addLog = (userName: string, activity: string, status: "SUKSES" | "GAGAL" | "INFO", description: string) => {
    const timestampStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " UTC";

    const newLog: ActivityLogEntry = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      timestamp: timestampStr,
      userName,
      activity,
      status,
      description
    };

    setDoc(doc(db, "logs", newLog.id), newLog).catch((err) => {
      console.error("Gagal menulis log ke Firestore:", err);
      try {
        handleFirestoreError(err, OperationType.WRITE, `logs/${newLog.id}`);
      } catch (e) {
        // Suppress re-throw to avoid unhandled rejection crash, but logging gets fired inside handleFirestoreError.
      }
    });
  };

  // Default Template presets list - empty images to enforce neutral illustrative thumbnails
  const defaultTemplatesList: TemplatePreset[] = [
    {
      id: "tpl-blue-hydrangea",
      name: "Elegant Blue Hydrangea watercolor Blue Rose",
      theme: "theme-blue-hydrangea",
      description: "Elegant Luxury, Soft Romantic, Cold Luxury, Watercolor Floral Aesthetic, Calm Blue Atmosphere",
      isPremium: false,
      isActive: true,
      accentClass: "bg-blue-400",
      bgClass: "border-sky-100 bg-sky-50/10",
      textColor: "text-slate-700",
      iconColor: "text-sky-600 bg-sky-100",
      images: []
    },
    {
      id: "tpl-royal-black-gold",
      name: "Royal Black & Gold Luxury Velvet",
      theme: "theme-royal-black-gold",
      description: "Royal Luxury, Elegant Black Tie, Premium Gold, Dark Luxury, Dramatic Luxury & Premium Glamour",
      isPremium: true,
      isActive: true,
      accentClass: "bg-amber-500",
      bgClass: "border-amber-250 bg-stone-900/10",
      textColor: "text-stone-700",
      iconColor: "text-amber-600 bg-amber-50",
      images: []
    },
    {
      id: "tpl-sage-botanical",
      name: "Sage Green Botanical Garden Dream",
      theme: "theme-sage-botanical",
      description: "Botanical Garden, Natural Elegant, Earth Tone Luxury, Fresh Romantic, Calm Nature & Organic Premium",
      isPremium: false,
      isActive: true,
      accentClass: "bg-emerald-500",
      bgClass: "border-emerald-100 bg-emerald-50/10",
      textColor: "text-emerald-700",
      iconColor: "text-[#6E8B74] bg-emerald-50",
      images: []
    },
    {
      id: "tpl-blush-pink-rose",
      name: "Blush Pink Rose & Soft Peony Nude",
      theme: "theme-blush-pink-rose",
      description: "Feminine Luxury, Romantic Soft Pink, Elegant Nude Aesthetic, Korean Luxury Wedding, Soft Pastel Glamour",
      isPremium: true,
      isActive: true,
      accentClass: "bg-rose-450",
      bgClass: "border-pink-100 bg-pink-50/10",
      textColor: "text-rose-700",
      iconColor: "text-pink-600 bg-pink-50",
      images: []
    },
    {
      id: "tpl-nusantara-luxury",
      name: "Nusantara Heritage Teak Wood & Gold",
      theme: "theme-nusantara-luxury",
      description: "Premium Indonesian Javanese Culture, Luxurious Warm Wood Brown, Elegant Traditions & Gold Lace Accent",
      isPremium: true,
      isActive: true,
      accentClass: "bg-yellow-600",
      bgClass: "border-amber-800 bg-amber-50/15",
      textColor: "text-amber-900",
      iconColor: "text-amber-700 bg-yellow-50",
      images: []
    },
    {
      id: "tpl-fairytale-moonlight",
      name: "Moonlight Blue Fairytale Crystal",
      theme: "theme-fairytale-moonlight-blue",
      description: "Dreamy Moonlight Garden, Magical Blue & Lavender Rose Glow, Cinderella Luxury Crystal Glassmorphic",
      isPremium: true,
      isActive: true,
      accentClass: "bg-indigo-400",
      bgClass: "border-indigo-150 bg-indigo-50/10",
      textColor: "text-indigo-750",
      iconColor: "text-indigo-600 bg-indigo-50",
      images: []
    },
    {
      id: "tpl-royal-red",
      name: "Royal Crimson Imperial Red Velvet",
      theme: "theme-royal-red-imperial",
      description: "Royal Palace Wedding, Imperial Crimson Velvet & Majestic Gold, Sultry Red Elegance, High-Class Cinematic Ballroom",
      isPremium: true,
      isActive: true,
      accentClass: "bg-rose-700",
      bgClass: "border-red-200 bg-rose-50/10",
      textColor: "text-rose-950",
      iconColor: "text-rose-600 bg-rose-50",
      images: []
    }
  ];

  // Default Clients accounts list - 100% EMPTY on setup
  const defaultClientsList: ClientAccount[] = [];

  // Helper file seeding list - 100% EMPTY on setup
  const defaultStorageFiles: StorageFile[] = [];

  // 1. Initial quick Guest View detection to prevent landing page flashing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const matchSlug = path.match(/^\/(wedding|invitation)\/([a-zA-Z0-9_-]+)/);
      const params = new URLSearchParams(window.location.search);
      if (matchSlug || params.get("client") || params.get("p")) {
        setIsGuestView(true);
      }
    }
  }, []);

  // 2. A. Firebase Auth status listener (Runs once on mount)
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (fbUser) => {
      setAuthLoading(true);
      try {
        if (fbUser) {
          setCurrentUser(fbUser);
          safeLocalStorage.setItem("marriage_current_user", JSON.stringify({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL
          }));

          const userDocRef = doc(db, "users", fbUser.uid);
          
          await new Promise((resolve) => setTimeout(resolve, 200));
          
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (err) {
            try {
              await new Promise((resolve) => setTimeout(resolve, 500));
              userDoc = await getDoc(userDocRef);
            } catch (retryErr) {
              handleFirestoreError(retryErr, OperationType.GET, `users/${fbUser.uid}`);
              return;
            }
          }
          
          let profile = userDoc.exists() ? userDoc.data() : null;
          const isEvovaAdmin = (fbUser.email && fbUser.email.toLowerCase() === "evova.official@gmail.com") || fbUser.uid === "tNuowZSiQmTqyG97DX5EywyWFYi1";

          if (isEvovaAdmin) {
            if (!profile || profile.role !== "superadmin") {
              const adminProfile = {
                uid: fbUser.uid,
                name: fbUser.displayName || "Evova Official",
                email: fbUser.email,
                role: "superadmin"
              };
              try {
                await setDoc(userDocRef, adminProfile);
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
                return;
              }
              profile = adminProfile;
            }
          } else if (!profile) {
            const defaultName = fbUser.displayName || fbUser.email?.split("@")[0] || "User Klien";
            const newProfile = {
              uid: fbUser.uid,
              name: defaultName,
              email: fbUser.email || "",
              role: "client",
              clientId: fbUser.uid
            };
            try {
              await setDoc(userDocRef, newProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
              return;
            }
            profile = newProfile;
          }

          setUserProfile(profile);
          safeLocalStorage.setItem("marriage_user_profile", JSON.stringify(profile));
          
          if (profile && profile.role === "superadmin") {
            setIsSuperadminUnlocked(true);
            safeLocalStorage.setItem("marriage_is_superadmin_unlocked", "true");
            setActiveTab("superadmin");
            safeLocalStorage.setItem("marriage_active_tab", "superadmin");
            setShowLoginModal(false);
          } else if (profile && profile.role === "client") {
            setIsSuperadminUnlocked(false);
            safeLocalStorage.setItem("marriage_is_superadmin_unlocked", "false");
            const targetClientId = profile.clientId || fbUser.uid;
            const clientDocRef = doc(db, "clients", targetClientId);
            let clientDoc;
            try {
              clientDoc = await getDoc(clientDocRef);
            } catch (err) {
              handleFirestoreError(err, OperationType.GET, `clients/${targetClientId}`);
              return;
            }
            if (clientDoc.exists()) {
              const clientDataFetched = clientDoc.data() as ClientAccount;
              if (!clientDataFetched.data) {
                clientDataFetched.data = { ...defaultWeddingData };
              }
              setLoggedClient(clientDataFetched);
              safeLocalStorage.setItem("marriage_logged_client", JSON.stringify(clientDataFetched));
              setActiveTab("client-admin");
              safeLocalStorage.setItem("marriage_active_tab", "client-admin");
              setShowLoginModal(false);
            } else {
              const cleanName = profile.name || "Klien Pernikahan";
              const newClientRecord: ClientAccount = {
                id: targetClientId,
                name: cleanName,
                username: (fbUser.email || "").split("@")[0] || "klien",
                email: fbUser.email || "",
                status: "active",
                slug: generateSlug(cleanName, "undangan"),
                visibility: "public",
                keepWeddingPublic: true,
                createdAt: new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                }),
                data: {
                  ...defaultWeddingData,
                  groomName: cleanName.split("&")[0]?.trim() || "Mempelai Pria",
                  brideName: cleanName.split("&")[1]?.trim() || "Mempelai Wanita"
                }
              };
              try {
                await setDoc(clientDocRef, newClientRecord);
              } catch (err) {
                handleFirestoreError(err, OperationType.WRITE, `clients/${targetClientId}`);
                return;
              }
              setLoggedClient(newClientRecord);
              safeLocalStorage.setItem("marriage_logged_client", JSON.stringify(newClientRecord));
              setActiveTab("client-admin");
              safeLocalStorage.setItem("marriage_active_tab", "client-admin");
              setShowLoginModal(false);
            }
          }
        } else {
          setCurrentUser(null);
          setUserProfile(null);
          setIsSuperadminUnlocked(false);
          setLoggedClient(null);
          safeLocalStorage.removeItem("marriage_current_user");
          safeLocalStorage.removeItem("marriage_user_profile");
          safeLocalStorage.removeItem("marriage_is_superadmin_unlocked");
          safeLocalStorage.removeItem("marriage_logged_client");
          safeLocalStorage.removeItem("marriage_active_tab");
        }
      } catch (err) {
        console.error("Gagal memuat profil auth:", err);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. B. Real-time synchronization for Clients list
  const isCurrentUserSuperadmin = !!((currentUser?.email && currentUser.email.toLowerCase() === "evova.official@gmail.com") || (userProfile?.role === "superadmin") || isSuperadminUnlocked);

  useEffect(() => {
    const unsubscribeClients = onSnapshot(collection(db, "clients"), (snap) => {
      const list: ClientAccount[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as ClientAccount);
      });
      setClients(list);
      setIsClientsLoading(false);
      if (list.length > 0) {
        setSelectedPreviewClientId(prev => prev || list[0].id);
      }
    }, (err) => {
      console.warn("Gagal sinkronisasi klien secara real-time:", err.message);
      setIsClientsLoading(false);
    });
    return () => unsubscribeClients();
  }, []);

  // 2. C. Real-time synchronization for Layout Templates
  useEffect(() => {
    const unsubscribeTemplates = onSnapshot(collection(db, "templates"), (snap) => {
      const list: TemplatePreset[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as TemplatePreset);
      });
      if (list.length > 0) {
        setTemplates(list);
      } else {
        setTemplates(defaultTemplatesList);
        if (isCurrentUserSuperadmin) {
          defaultTemplatesList.forEach(tpl => {
            setDoc(doc(db, "templates", tpl.id), tpl).catch(console.error);
          });
        }
      }
    }, (err) => {
      console.warn("Sinkroniasi template ditangguhkan:", err.message);
    });
    return () => unsubscribeTemplates();
  }, [isCurrentUserSuperadmin]);

  // 2. D. Real-time synchronization for Global settings / toggles
  useEffect(() => {
    const unsubscribeSettings = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        setFeatureToggles(snap.data() as GlobalFeatureToggles);
      } else {
        setTemplates(defaultTemplatesList); // Fallback locally
        if (isCurrentUserSuperadmin) {
          setDoc(doc(db, "settings", "global"), {
            rsvp: true,
            guestbook: true,
            gallery: true,
            music: true,
            countdown: true,
            loveStory: true,
            giftDigital: true,
            googleMaps: true,
            animationPremium: true,
            exportJson: true,
            uploadVideo: true,
            floatingMusic: true,
            watermark: false,
            analytics: true
          }).catch(console.error);
        }
      }
    }, (err) => {
      console.warn("Sinkroniasi settings ditangguhkan:", err.message);
    });
    return () => unsubscribeSettings();
  }, [isCurrentUserSuperadmin]);

  // 2. E. Real-time synchronization for Logs collection
  useEffect(() => {
    if (!isCurrentUserSuperadmin) return;

    const unsubscribeLogs = onSnapshot(collection(db, "logs"), (snap) => {
      const list: ActivityLogEntry[] = [];
      snap.forEach((docSnap) => {
        docSnap.exists() && list.push(docSnap.data() as ActivityLogEntry);
      });
      list.sort((a, b) => b.id.localeCompare(a.id));
      setLogs(list);
    }, (err) => {
      console.warn("Gagal sinkronisasi log secara real-time:", err.message);
    });
    return () => unsubscribeLogs();
  }, [isCurrentUserSuperadmin]);

  // 2. F. Real-time synchronization for Storage Files metadata
  const currentUserId = currentUser?.uid || "";
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribeStorage = onSnapshot(collection(db, "storage"), (snap) => {
      const list: StorageFile[] = [];
      snap.forEach((docSnap) => {
        docSnap.exists() && list.push(docSnap.data() as StorageFile);
      });
      setStorageFiles(list);
    }, (err) => {
      console.warn("Gagal sinkronisasi storage secara real-time:", err.message);
    });
    return () => unsubscribeStorage();
  }, [currentUserId]);

  // 3. Dynamic guest/admin router that resolves slugs/parameters when clients are loaded
  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = window.location.pathname;
    const matchSlug = path.match(/^\/(wedding|invitation)\/([a-zA-Z0-9_-]+)/);
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("client");

    const enc = params.get("p");
    if (enc) {
      const decoded = decodeWeddingData(enc);
      if (decoded) {
        setDirectGuestData(decoded);
        setIsGuestView(true);
        return;
      }
    }

    if (matchSlug) {
      setIsGuestView(true);
      const foundSlug = matchSlug[2].toLowerCase();
      const foundClient = clients.find(c => c.slug?.toLowerCase() === foundSlug);
      if (foundClient) {
        setDirectGuestData(foundClient.data);
      } else if (!isClientsLoading && clients.length > 0) {
        // Safe redirection to avoid infinite rendering loop if slug is not found
        setDirectGuestData(null);
        setIsGuestView(false);
        setActiveTab("landing");
        window.history.pushState({}, "", "/");
      }
    } else if (idParam) {
      setIsGuestView(true);
      const foundClient = clients.find(c => c.id === idParam);
      if (foundClient) {
        setDirectGuestData(foundClient.data);
      } else if (!isClientsLoading && clients.length > 0) {
        // Safe redirection to avoid rendering loop with wrong client ID params
        setDirectGuestData(null);
        setIsGuestView(false);
        setActiveTab("landing");
        window.history.pushState({}, "", "/");
      }
    } else if (params.get("to")) {
      // Automatic fallback for legacy guest links that don't have client/slug parameters specified (e.g. copied old root link)
      setIsGuestView(true);
      if (!isClientsLoading && clients.length > 0) {
        // Fallback to presenting the first active wedding client's details
        setDirectGuestData(clients[0].data);
      }
    } else {
      if (path === "/superadmin") {
        if (userProfile?.role === "superadmin" || isSuperadminUnlocked) {
          if (activeTab !== "client-admin" && activeTab !== "wedding-preview") {
            setActiveTab("superadmin");
          }
        } else {
          setActiveTab("landing");
          setLoginRole("superadmin");
          setShowLoginModal(true);
        }
      } else if (path === "/client-admin") {
        if (userProfile?.role === "client" || loggedClient) {
          if (activeTab !== "client-admin" && activeTab !== "wedding-preview") {
            setActiveTab("client-admin");
          }
        } else {
          setActiveTab("landing");
          setLoginRole("client");
          setShowLoginModal(true);
        }
      } else {
        if (activeTab === "wedding-preview") return; // Keep active preview
        
        // Prevent logged-in users from being kicked back to landing due to empty/root browser path
        if (userProfile?.role === "superadmin" || isSuperadminUnlocked) {
          if (activeTab !== "superadmin" && activeTab !== "client-admin" && activeTab !== "wedding-preview") {
            setActiveTab("superadmin");
          }
        } else if (userProfile?.role === "client" || loggedClient) {
          if (activeTab !== "client-admin" && activeTab !== "wedding-preview") {
            setActiveTab("client-admin");
          }
        } else {
          if (activeTab !== "landing") setActiveTab("landing");
        }
      }
    }
  }, [clients, isClientsLoading, userProfile, isGuestView, isSuperadminUnlocked, loggedClient, activeTab]);

  // Sync client account edits to Firestore
  const handleUpdateClientsList = async (updated: ClientAccount[]) => {
    // Detect deleted clients
    const deletedClients = clients.filter(c => !updated.some(u => u.id === c.id));

    setClients(updated);

    // Save each client to Firestore collection
    for (const client of updated) {
      try {
        await setDoc(doc(db, "clients", client.id), client);
      } catch (err) {
        console.error(`Gagal menyimpan akun klien ${client.id} ke cloud:`, err);
      }
    }

    // Process deletions (clean up Firestore and Client sessions)
    for (const delC of deletedClients) {
      try {
        // Delete client document from Firestore
        await deleteDoc(doc(db, "clients", delC.id));

        // Delete wishes subcollection
        const wishesRef = collection(db, "clients", delC.id, "wishes");
        const listSnaps = await getDocs(wishesRef);
        for (const snap of listSnaps.docs) {
          await deleteDoc(doc(db, "clients", delC.id, "wishes", snap.id));
        }

        // If the deleted client is currently logged in, clear session
        if (loggedClient && loggedClient.id === delC.id) {
          setLoggedClient(null);
          setActiveTab("landing");
          if (typeof window !== "undefined") {
            window.history.pushState({}, "", "/");
          }
        }
      } catch (err) {
        console.error(`Gagal membersihkan data klien ${delC.id} di cloud:`, err);
      }
    }
  };

  const handleUpdateTemplatesList = async (updated: TemplatePreset[]) => {
    setTemplates(updated);
    for (const t of updated) {
      try {
        await setDoc(doc(db, "templates", t.id), t);
      } catch (err) {
        console.error("Gagal menyinkronkan template ke Firestore:", err);
      }
    }
  };

  const handleUpdateFeatureToggles = async (updated: GlobalFeatureToggles) => {
    setFeatureToggles(updated);
    try {
      await setDoc(doc(db, "settings", "global"), updated);
    } catch (err) {
      console.error("Gagal menyinkronkan feature toggles ke Firestore:", err);
    }
  };

  const handleClearLogsList = async () => {
    setLogs([]);
    try {
      const q = query(collection(db, "logs"));
      const snapshot = await getDocs(q);
      for (const snap of snapshot.docs) {
        await deleteDoc(doc(db, "logs", snap.id));
      }
    } catch (err) {
      console.error("Gagal membersihkan log di Firestore:", err);
    }
    addLog("SUPERADMIN", "Hapus Seluruh Log", "SUKSES", "Riwayat audit log berhasil dikosongkan.");
  };

  const handleDeleteStorageFileId = async (id: string) => {
    const updated = storageFiles.filter(f => f.id !== id);
    setStorageFiles(updated);
    try {
      await deleteDoc(doc(db, "storage", id));
    } catch (err) {
      console.error("Gagal menghapus berkas di Firestore:", err);
    }
  };

  // Log in as Superadmin with custom credentials
  const handleUnlockSuperadmin = () => {
    setSaLoginError("");
    if (!saUsernameInput.trim() || !saPasswordInput) {
      setSaLoginError("Username dan password wajib diisi!");
      return;
    }

    if (saUsernameInput.trim() === "superadmin" && saPasswordInput === "superadmin123") {
      setIsSuperadminUnlocked(true);
      sessionStorage.setItem("wedding_superadmin_logged_in", "true");
      localStorage.setItem("wedding_superadmin_logged_in", "true");
      setSaLoginError("");
      addLog("SUPERADMIN", "Login Admin", "SUKSES", "Superadmin berhasil masuk ke Control Engine.");
    } else {
      addLog("UNKNOWN", "Gagal Login Admin", "GAGAL", `Mencoba login superadmin dengan username "${saUsernameInput}".`);
      setSaLoginError("Username atau password salah.");
    }
  };

  const handleLockSuperadmin = () => {
    setIsSuperadminUnlocked(false);
    sessionStorage.removeItem("wedding_superadmin_logged_in");
    localStorage.removeItem("wedding_superadmin_logged_in");
    setSaUsernameInput("");
    setSaPasswordInput("");
    setSaLoginError("");
    addLog("SUPERADMIN", "Logout Admin", "INFO", "Pemilik mendeaktivasi kredensial panel Superadmin.");
    setActiveTab("landing");
    signOut(auth).catch(console.error);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/");
    }
  };

  // Proxy to manage uploaded files
  const handleUploadFile = async (name: string, size: string, fileType: string, url: string) => {
    const freshFile: StorageFile = {
      id: "media-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      fileName: name,
      fileSize: size,
      uploadDate: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short"
      }),
      fileType: fileType as any,
      url: url
    };
    const updated = [freshFile, ...storageFiles];
    setStorageFiles(updated);
    try {
      await setDoc(doc(db, "storage", freshFile.id), freshFile);
    } catch (err) {
      console.error("Gagal menyimpan file ke Firestore:", err);
    }

    addLog(
      loggedClient ? `CLIENT: ${loggedClient.name}` : "SUPERADMIN",
      "Upload File",
      "SUKSES",
      `Berhasil mengunggah berkas ${fileType} "${name}" berukuran ${size}.`
    );
  };

  // Client wedding data changed via Client Admin form editing
  const handleClientDataChange = async (clientId: string, updatedWeddingData: WeddingData) => {
    const nextClients = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          data: updatedWeddingData
        };
      }
      return c;
    });
    setClients(nextClients);

    // Also update logged client session if this is the currently active client session
    if (loggedClient && loggedClient.id === clientId) {
      setLoggedClient(prev => prev ? { ...prev, data: updatedWeddingData } : null);
    }

    addLog(`CLIENT: ${clients.find(c => c.id === clientId)?.name || "N/A"}`, "Edit Wedding", "SUKSES", "Mengupdate data undangan nikah.");

    // Update single client doc in Firestore
    const matchedClient = nextClients.find(c => c.id === clientId);
    if (matchedClient) {
      try {
        await setDoc(doc(db, "clients", clientId), matchedClient);
      } catch (err) {
        console.error("Gagal menyinkronkan data edit klien ke Firestore:", err);
      }
    }
  };

  // Clean login helper inside Client section
  const handleClientLoginAction = (clientAcc: ClientAccount) => {
    setLoggedClient(clientAcc);
    sessionStorage.setItem("wedding_client_session_id", clientAcc.id);
    localStorage.setItem("wedding_client_session_id", clientAcc.id);
    addLog(`CLIENT: ${clientAcc.name}`, "Login Client", "SUKSES", `Pengantin ${clientAcc.name} sukses masuk panel editor.`);
  };

  const handleClientLogoutAction = () => {
    if (loggedClient) {
      addLog(`CLIENT: ${loggedClient.name}`, "Logout Client", "INFO", `Klien ${loggedClient.name} keluar sesi.`);
      setLoggedClient(null);
      sessionStorage.removeItem("wedding_client_session_id");
      localStorage.removeItem("wedding_client_session_id");
      
      const isSuper = (userProfile?.role === "superadmin" || isSuperadminUnlocked);
      if (isSuper) {
        setActiveTab("superadmin");
      } else {
        setActiveTab("landing");
        signOut(auth).catch(console.error);
        if (typeof window !== "undefined") {
          window.history.pushState({}, "", "/");
        }
      }
    }
  };

  // Live trigger to preview any selected wedding
  const handlePreviewDirectClick = (data: WeddingData) => {
    setPreviewDataOverride(data);
    setActiveTab("wedding-preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Active wedding data selection based on parameters
  const getActiveWeddingData = (): WeddingData => {
    if (directGuestData) return directGuestData;
    if (previewDataOverride) return previewDataOverride;
    
    // Fallback to active preview selection dropdown
    const matched = clients.find(c => c.id === selectedPreviewClientId);
    if (matched) return matched.data || defaultWeddingData;

    return defaultWeddingData;
  };

  // Global auth credentials checking loader to prevent content flash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 border border-rose-150 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-sm animate-bounce">
            <Heart className="w-6 h-6 fill-rose-300 stroke-rose-600" />
          </div>
          <h2 className="font-serif font-black text-rose-800 tracking-wide uppercase text-sm animate-pulse">Menghubungkan Sesi Editor...</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Memuat Kredensial Keamanan</p>
        </div>
      </div>
    );
  }

  // Render pristine, standalone iframe Guest invitation page
  if (isGuestView) {
    if (isClientsLoading && !directGuestData) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 border border-rose-150 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-sm animate-bounce">
              <Heart className="w-6 h-6 fill-rose-300 stroke-rose-600" />
            </div>
            <h2 className="font-serif font-black text-rose-800 tracking-wide uppercase text-sm animate-pulse">Menghubungkan ke Janji Suci...</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Memuat-Undangan-Digital-Premium</p>
          </div>
        </div>
      );
    }

    const finalData = getActiveWeddingData();
    const params = new URLSearchParams(window.location.search);
    const clientIdParam = params.get("client");
    
    let matchedClient = null;
    if (typeof window !== "undefined") {
      const matchSlug = window.location.pathname.match(/^\/(wedding|invitation)\/([a-zA-Z0-9_-]+)/);
      if (matchSlug) {
        const foundSlug = matchSlug[2].toLowerCase();
        matchedClient = clients.find(c => c.slug?.toLowerCase() === foundSlug);
      }
    }
    if (!matchedClient && clientIdParam) {
      matchedClient = clients.find(c => c.id === clientIdParam);
    }
    if (!matchedClient) {
      matchedClient = clients.find(c => c.data === finalData);
    }
    if (!matchedClient) {
      const gName = finalData.groomName;
      const matches = clients.filter(c => c.data.groomName === gName);
      matchedClient = matches.find(c => c.status === "active") || matches[0];
    }
    
    if (matchedClient && matchedClient.status === "suspended") {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md bg-slate-950 border border-red-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">⚠️</div>
            <h1 className="font-serif font-bold text-xl text-red-400">Undangan Ditangguhkan</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maaf, tautan undangan pernikahan ini sedang ditangguhkan atau dibekukan sementara oleh administrator agensi digital (Superadmin). Silakan hubungi pemilik undangan.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full relative">
        <WeddingInvitation 
          data={finalData}
          globalToggles={featureToggles}
          clientId={matchedClient?.id}
        />
      </div>
    );
  }

  // Helper to resolve premium categories for templates
  const getTemplateCategory = (themeSlug: string) => {
    switch (themeSlug) {
      case "theme-blue-hydrangea": return "Watercolor Floral";
      case "theme-royal-black-gold": return "Modern Dark Velvet";
      case "theme-sage-botanical": return "Botanical Garden";
      case "theme-blush-pink-rose": return "Korean Luxury";
      case "theme-nusantara-luxury": return "Classic Nusantara";
      case "theme-fairytale-moonlight-blue": return "Dreamy Fairytale";
      case "theme-royal-red-imperial": return "Imperial Crimson";
      default: return "Modern Elegant";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-rose-100 selection:text-rose-900 font-sans">
      
      {/* ==================================================== */}
      {/* GUEST LANDING VIEW */}
      {/* ==================================================== */}
      {activeTab === "landing" && (
        <div className="min-h-screen flex flex-col bg-slate-50">
          
          {/* HEADER */}
          <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              
              {/* BRANDING */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center shadow-md transform hover:rotate-12 transition duration-300">
                  <Heart className="w-5 h-5 text-white fill-rose-350" />
                </div>
                <div>
                  <span className="font-serif font-black text-slate-900 text-base tracking-wide block uppercase">EVOVA</span>
                  <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase font-bold">Wedding Digital</p>
                </div>
              </div>

              {/* Tagline */}
              <div className="hidden md:block">
                <span className="text-xs text-slate-450 font-serif italic">
                  Create Elegant Wedding Invitations
                </span>
              </div>

              {/* Action Login */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginError("");
                    setLoginUsername("");
                    setLoginPassword("");
                    setShowLoginModal(true);
                  }}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 active:bg-black text-white rounded-xl text-xs font-bold tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>LOGIN</span>
                </button>
              </div>

            </div>
          </header>

          {/* HERO BANNER SECTION */}
          <section className="text-center py-20 px-6 bg-gradient-to-b from-white to-slate-50 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-rose-700 text-[10px] font-bold tracking-widest uppercase mb-1">
              <Sparkles className="w-3 h-3 text-rose-500 animate-spin" style={{ animationDuration: '4s' }} />
              Digital Wedding Invitation Platform
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-805 tracking-tight leading-none">
              EVOVA Wedding Digital
            </h2>
            <p className="text-xs md:text-sm text-slate-550 max-w-xl mx-auto leading-relaxed">
              Platform undangan pernikahan digital premium dengan estitika paling eksklusif, visual yang mewah, serta performa maksimal siap pakai.
            </p>
          </section>

          {/* TEMPLATE SHOWCASE */}
          <main className="flex-grow max-w-7xl mx-auto w-full px-6 pb-24">
            <div className="space-y-8">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest">Premium Templates</h3>
                  <p className="text-xs text-slate-400 mt-1">Seluruh desain terbagi dalam kategori kreasi visual berkelas.</p>
                </div>
                <span className="text-xs text-slate-400 font-mono mt-1 md:mt-0 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                  {templates.filter(t => t.isActive).length} Tema Aktif
                </span>
              </div>

              {/* Grid: Mobile 1 | Tablet 2 | Desktop 3-4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {templates.filter(t => t.isActive).map((preset) => {
                  const category = getTemplateCategory(preset.theme);
                  return (
                    <div 
                      key={preset.id} 
                      className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full"
                    >
                      {/* Image Thumbnail */}
                      <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden shrink-0">
                        <ThemeIllustration themeSlug={preset.theme} />
                        {preset.isPremium && (
                          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-xl bg-amber-500/90 text-white font-mono text-[8px] font-bold tracking-widest shadow-sm">
                            PREMIUM
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block">
                            {category}
                          </span>
                          <h4 className="font-serif font-black text-slate-800 text-sm tracking-tight leading-snug group-hover:text-rose-650 transition duration-200">
                            {preset.name}
                          </h4>
                        </div>
                        
                        <p className="text-[11px] text-slate-450 leading-relaxed font-normal flex-grow line-clamp-3">
                          {preset.description}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </main>

          {/* FOOTER */}
          <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-center text-xs">
            <div className="max-w-7xl mx-auto px-6">
              <p className="font-bold text-slate-300 tracking-wide text-xs">© 2026 EVOVA WEDDING DIGITAL.</p>
            </div>
          </footer>

        </div>
      )}

      {/* ==================================================== */}
      {/* 1. SUPERADMIN PANEL */}
      {/* ==================================================== */}
      {activeTab === "superadmin" && isSuperadminUnlocked && (
        <div className="relative font-sans">
          
          {/* Header Bar */}
          <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-200 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-rose-650 flex items-center justify-center font-serif text-sm font-bold text-white">E</div>
              <span className="font-bold tracking-wider uppercase">EVOVA SUPERADMIN PORTAL</span>
            </div>
            <button
              onClick={handleLockSuperadmin}
              className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold inline-flex items-center gap-1.5 transition cursor-pointer font-sans"
            >
              <Lock className="w-3 h-3" />
              Keluar Sesi Admin
            </button>
          </div>

          <SuperadminPanel 
            clients={clients}
            templates={templates}
            featureToggles={featureToggles}
            logs={logs}
            storageFiles={storageFiles}
            onUpdateClients={handleUpdateClientsList}
            onUpdateTemplates={handleUpdateTemplatesList}
            onUpdateToggles={handleUpdateFeatureToggles}
            onClearLogs={handleClearLogsList}
            onDeleteStorageFile={handleDeleteStorageFileId}
            onSelectClientForEdit={(clientId) => {
              const c = clients.find(cl => cl.id === clientId);
              if (c) {
                setLoggedClient(c);
                setActiveTab("client-admin");
                addLog("ADMIN-SUPER", "Impersonasi Klien", "SUKSES", `Superadmin masuk ke panel editing draf klien ${c.name}.`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            onPreviewClient={handlePreviewDirectClick}
            currentUser="ADMIN-SUPER"
            addLog={addLog}
          />
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. CLIENT ADMIN PANEL */}
      {/* ==================================================== */}
      {activeTab === "client-admin" && loggedClient && (
        <div>
          
          {/* Header Bar */}
          <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-200 shadow-xl">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="font-serif font-black tracking-wide text-rose-200 uppercase">EVOVA CLIENT PORTAL</span>
              <span className="text-slate-500 hidden sm:inline">| Sesi Pengantin: {loggedClient.name}</span>
            </div>
            <button
              onClick={handleClientLogoutAction}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 hover:text-white rounded-lg text-[10px] font-bold text-slate-300 transition inline-flex items-center gap-1.5 cursor-pointer font-sans"
            >
              Keluar Sesi Editor
            </button>
          </div>

          <div className="bg-slate-50 min-h-screen">
            <ClientAdminPanel 
              clientAccounts={clients}
              activeTemplates={templates}
              onUploadFileToStorage={handleUploadFile}
              onPreviewClick={handlePreviewDirectClick}
              onClientDataChange={handleClientDataChange}
              loggedClient={loggedClient}
              onLogout={handleClientLogoutAction}
            />
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. WEDDING PREVIEWER BAR (FOR CLIENT EDITOR REVIEWS) */}
      {/* ==================================================== */}
      {activeTab === "wedding-preview" && (
        <div className="w-full bg-slate-100 min-h-screen pb-16">
          <div className="bg-white border-b border-slate-200 px-4 py-4 font-sans">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-sm text-slate-700">Previewer Simulator Mode</h4>
                <p className="text-[10px] text-slate-400">Menyajikan output draf aslinya.</p>
              </div>
              <button
                onClick={() => {
                  setPreviewDataOverride(null);
                  if (loggedClient) {
                    setActiveTab("client-admin");
                  } else if (isSuperadminUnlocked) {
                    setActiveTab("superadmin");
                  } else {
                    setActiveTab("landing");
                  }
                }}
                className="px-3 py-1.5 bg-slate-900 text-white hover:bg-black rounded-lg text-[10px] font-bold cursor-pointer"
              >
                Kembali ke Editor
              </button>
            </div>
          </div>

          <div className="w-full relative min-h-[calc(100vh-65px)] bg-white">
            <WeddingInvitation 
              data={getActiveWeddingData()}
              globalToggles={featureToggles}
              clientId={loggedClient?.id || selectedPreviewClientId}
            />
          </div>
        </div>
      )}
           {/* ==================================================== */}
      {/* UNIFIED LOGIN MODAL - COMPLETELY OVERHAULED */}
      {/* ==================================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm font-sans transition-all duration-300">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[2rem] border border-slate-100 shadow-[0_25px_60px_-15px_rgba(244,63,94,0.15)] relative overflow-hidden animate-scale-up">
            
            {/* Top Premium Color Stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 absolute top-0 left-0" />

            {/* Glowing background blob */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-400/5 rounded-full blur-3xl pointer-events-none" />

            {/* Close Circle Button */}
            <button
              onClick={() => {
                setShowLoginModal(false);
                setIsRegisterMode(false);
                setShowResetForm(false);
                setLoginError("");
                setResetSuccessMessage("");
                setShowPassword(false);
              }}
              className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-100 text-slate-400 hover:text-slate-800 rounded-full transition shadow-xs cursor-pointer z-10"
              title="Tutup dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body with padding */}
            <div className="p-6 sm:p-9 space-y-6">
              
              {/* Header Title with Custom Icon Accent */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-rose-500/5 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-xs relative">
                  <Heart className="w-5 h-5 animate-pulse" />
                  <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1 animate-spin-slow" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {showResetForm ? "Atur Ulang Sandi" : isRegisterMode ? "Daftar Akun Mitra" : "Masuk Portal Undangan"}
                </h2>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {showResetForm 
                    ? "Tautan pemulihan khusus akan dikirim ke Gmail Anda secara realtime."
                    : isRegisterMode 
                      ? "Mulai membuat undangan digital mewah, modern, dan penuh interaksi sekarang." 
                      : "Akses dashboard editor klien atau panel superadmin melalui akun Anda."}
                </p>
              </div>

              {/* REGISTER VS SIGN IN SLIDER TABS */}
              {!showResetForm && (
                <div className="p-1 bg-slate-100 rounded-2xl border border-slate-200/50 flex relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setLoginError("");
                      setResetSuccessMessage("");
                      setShowPassword(false);
                    }}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                      !isRegisterMode
                        ? "bg-white text-rose-600 shadow-sm border border-slate-200/20"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Masuk Sesi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setLoginError("");
                      setResetSuccessMessage("");
                      setShowPassword(false);
                    }}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                      isRegisterMode
                        ? "bg-white text-rose-600 shadow-sm border border-slate-200/20"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Daftar Baru
                  </button>
                </div>
              )}

              {/* ACTION FEEDBACK ALERT */}
              {loginError && (
                <div className="space-y-2">
                  <div className="text-[10px] text-rose-600 font-medium text-center bg-rose-50 border border-rose-100 p-2.5 rounded-xl flex items-center justify-center gap-1.5 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{loginError}</span>
                  </div>

                  {isDomainError && (
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] text-slate-600 space-y-2.5 font-sans select-none text-left">
                      <div className="flex items-center gap-1.5 text-rose-600 font-bold border-b border-slate-100 pb-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Panduan Otorisasi Domain</span>
                      </div>
                      <p className="leading-relaxed text-[9.5px]">
                        Supaya Google Auth berfungsi di domain <strong>evova-wedding</strong> &amp; testing server, pastikan Anda telah memasukkan daftar domain berikut ke <strong>Authentication › Settings › Authorized Domains</strong> di Firebase Console Anda:
                      </p>
                      
                      <div className="space-y-1.5 text-[9px] font-mono">
                        {/* Current dynamic active domain */}
                        {typeof window !== "undefined" && window.location.hostname && (
                          <div className="bg-indigo-50/50 border border-indigo-100 p-1.5 rounded-lg space-y-1">
                            <span className="text-[7.5px] text-indigo-700 font-sans font-bold uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                              Domain Aktif Saat Ini:
                            </span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate max-w-[170px] select-all text-slate-700 font-bold font-mono">{window.location.hostname}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(window.location.hostname);
                                  setCopiedDomainText(window.location.hostname);
                                  setTimeout(() => setCopiedDomainText(null), 2000);
                                }}
                                className="p-1 hover:bg-white rounded border border-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
                                title="Salin Domain"
                              >
                                {copiedDomainText === window.location.hostname ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* evova-wedding web app */}
                        <div className="bg-white border border-slate-150 p-1.5 rounded-lg space-y-1">
                          <span className="text-[7.5px] text-slate-450 font-sans font-bold uppercase tracking-wider">Domain Production (Firebase Hosting):</span>
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate max-w-[170px] select-all text-slate-700 font-semibold">evova-wedding.web.app</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText("evova-wedding.web.app");
                                setCopiedDomainText("evova-wedding.web.app");
                                setTimeout(() => setCopiedDomainText(null), 2000);
                              }}
                              className="p-1 hover:bg-slate-50 border border-slate-150 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
                              title="Salin Domain"
                            >
                              {copiedDomainText === "evova-wedding.web.app" ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* evova-wedding firebaseapp */}
                        <div className="bg-white border border-slate-150 p-1.5 rounded-lg space-y-1">
                          <span className="text-[7.5px] text-slate-450 font-sans font-bold uppercase tracking-wider">Domain Auth Default:</span>
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate max-w-[170px] select-all text-slate-700 font-semibold">evova-wedding.firebaseapp.com</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText("evova-wedding.firebaseapp.com");
                                setCopiedDomainText("evova-wedding.firebaseapp.com");
                                setTimeout(() => setCopiedDomainText(null), 2000);
                              }}
                              className="p-1 hover:bg-slate-50 border border-slate-150 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
                              title="Salin Domain"
                            >
                              {copiedDomainText === "evova-wedding.firebaseapp.com" ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Dev Sandbox Domain */}
                        <div className="bg-white border border-slate-150 p-1.5 rounded-lg space-y-1">
                          <span className="text-[7.5px] text-slate-450 font-sans font-bold uppercase tracking-wider">Testing Cloud Run Dev URL:</span>
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate max-w-[170px] text-slate-700 font-normal">ais-dev-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app</span>
                            <button
                              type="button"
                              onClick={() => {
                                const text = "ais-dev-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app";
                                navigator.clipboard.writeText(text);
                                setCopiedDomainText(text);
                                setTimeout(() => setCopiedDomainText(null), 2000);
                              }}
                              className="p-1 hover:bg-slate-50 border border-slate-150 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
                              title="Salin Domain"
                            >
                              {copiedDomainText === "ais-dev-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app" ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Preview Sandbox Domain */}
                        <div className="bg-white border border-slate-150 p-1.5 rounded-lg space-y-1">
                          <span className="text-[7.5px] text-slate-450 font-sans font-bold uppercase tracking-wider">Testing Cloud Run Pre URL:</span>
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate max-w-[170px] text-slate-700 font-normal">ais-pre-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app</span>
                            <button
                              type="button"
                              onClick={() => {
                                const text = "ais-pre-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app";
                                navigator.clipboard.writeText(text);
                                setCopiedDomainText(text);
                                setTimeout(() => setCopiedDomainText(null), 2000);
                              }}
                              className="p-1 hover:bg-slate-50 border border-slate-150 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
                              title="Salin Domain"
                            >
                              {copiedDomainText === "ais-pre-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app" ? <Check className="w-3 h-3 text-emerald-600" /> : <Clipboard className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1.5">
                        <a
                          href="https://console.firebase.google.com/project/evova-wedding/authentication/settings"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1 py-1.5 bg-rose-50 border border-rose-100/45 hover:bg-rose-100 hover:text-rose-800 text-rose-600 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Buka Setelan Firebase ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {resetSuccessMessage && (
                <div className="text-[10px] text-emerald-600 font-semibold text-center bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>{resetSuccessMessage}</span>
                </div>
              )}

              {/* 1. PASSWORD RESET INTERFACE */}
              {showResetForm && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoginError("");
                    setResetSuccessMessage("");

                    if (!resetEmail.trim()) {
                      const errText = "Email wajib diisi!";
                      setLoginError(errText);
                      showToast(errText, "error");
                      return;
                    }

                    try {
                      await sendPasswordResetEmail(auth, resetEmail.trim());
                      setResetSuccessMessage(`Tautan pemulihan berhasil dikirim ke ${resetEmail.trim()}. Silakan cek Gmail Anda.`);
                      showToast(`Tautan atur ulang kata sandi telah terkirim ke alamat email Anda.`, "success");
                      setResetEmail("");
                    } catch (err: any) {
                      console.error("Gagal mengirim email reset:", err);
                      const friendlyErr = translateAuthError(err.code, "Email tidak terdaftar atau format penulisan salah.");
                      setLoginError(friendlyErr);
                      showToast(friendlyErr, "error");
                    }
                  }}
                  className="space-y-4 animate-fade-in"
                >
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-widest pl-1 text-[8px]">Email Address Anda</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="Masukkan email terdaftar..."
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl outline-none text-xs transition duration-200"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-bold rounded-xl shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-98 transition duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Kirim Tautan Atur Ulang Sandi</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetForm(false);
                        setLoginError("");
                        setResetSuccessMessage("");
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-rose-600 transition underline cursor-pointer"
                    >
                      Kembali Ke Menu Masuk
                    </button>
                  </div>
                </form>
              )}

              {/* 2. SIGN IN INTERFACE */}
              {!isRegisterMode && !showResetForm && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Google Authenticator - Super Premium Button */}
                  <button
                    type="button"
                    onClick={async () => {
                      setLoginError("");
                      setResetSuccessMessage("");
                      try {
                        const res = await googleSignIn();
                        addLog(res.user.email || "GOOGLE", "Login Google", "SUKSES", `Pengguna berhasil login menggunakan Google Auth.`);
                        showToast(`Masuk dengan akun Google berhasil! Selamat datang.`, "success");
                        setShowLoginModal(false);
                        setIsDomainError(false);
                      } catch (err: any) {
                        console.error("Kesalahan Google Auth:", err);
                        const errMsg = err?.message || String(err);
                        const friendlyErr = translateAuthError(err?.code, "Gagal masuk dengan Google: " + errMsg);
                        
                        if (err?.code === "auth/unauthorized-domain" || errMsg.includes("unauthorized-domain")) {
                          setIsDomainError(true);
                          setLoginError("Domain ini belum diotorisasi di Konsol Firebase Anda.");
                        } else {
                          setIsDomainError(false);
                          setLoginError(friendlyErr);
                        }
                        showToast(friendlyErr, "error");
                      }
                    }}
                    className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-all duration-200 text-xs flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
                  >
                    {/* Inline Google Icon Asset */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.45 1.74 14.9 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.78 2.93c.89-2.67 3.39-4.61 6.98-4.61z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.45h6.45c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.86c2.16-1.99 3.41-4.92 3.41-8.54z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.02 10.65c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.24 7.32c-.8 1.6-1.24 3.41-1.24 5.3s.44 3.7 1.24 5.3l3.78-2.95z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.86c-1.02.68-2.33 1.09-3.96 1.09-3.59 0-6.09-1.94-6.98-4.61L1.54 16.58C3.5 20.57 7.54 23 12 23z"
                      />
                    </svg>
                    <span>Masuk dengan Google</span>
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink mx-3 text-slate-400 font-extrabold tracking-widest text-[8px] uppercase">atau dengan email</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>

                  {/* Standard Identity Form */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setLoginError("");
                      setResetSuccessMessage("");

                      if (!loginUsername.trim() || !loginPassword) {
                        const errText = "Email dan password wajib diisi!";
                        setLoginError(errText);
                        showToast(errText, "error");
                        return;
                      }

                      try {
                        await signInWithEmailAndPassword(auth, loginUsername.trim(), loginPassword);
                        addLog(loginUsername.trim(), "Login User", "SUKSES", `Pengguna dengan email ${loginUsername.trim()} berhasil masuk.`);
                        showToast("Sesi Anda berhasil dimulai! Selamat datang kembali.", "success");
                        setShowLoginModal(false);
                      } catch (err: any) {
                        console.error("Gagal login:", err);
                        const friendlyErr = translateAuthError(err.code, "Email atau kata sandi Anda salah atau tidak terdaftar.");
                        setLoginError(friendlyErr);
                        showToast(friendlyErr, "error");
                        addLog(loginUsername.trim(), "Gagal Login", "GAGAL", err.message || "Email atau password salah.");
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="font-extrabold text-slate-500 uppercase tracking-widest pl-1 text-[8px]">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="nama@email.com"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl outline-none text-xs transition duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between pl-1">
                        <label className="font-extrabold text-slate-500 uppercase tracking-widest text-[8px]">Sandi Akun</label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowResetForm(true);
                            setLoginError("");
                            setResetSuccessMessage("");
                          }}
                          className="text-[9px] font-bold text-rose-500 hover:text-rose-700 transition cursor-pointer"
                        >
                          Lupa Sandi?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Masukkan sandi..."
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl outline-none text-xs transition duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-bold rounded-xl shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-98 transition duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Masuk Sesi Editor</span>
                    </button>
                  </form>
                </div>
              )}

              {/* 3. SIGN UP INTERFACE */}
              {isRegisterMode && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLoginError("");

                    if (!registerName.trim() || !registerEmail.trim() || !registerPassword) {
                      const errText = "Semua kolom registrasi wajib diisi!";
                      setLoginError(errText);
                      showToast(errText, "error");
                      return;
                    }

                    if (registerPassword.length < 6) {
                      const errText = "Sandi harus minimal terdiri dari 6 karakter!";
                      setLoginError(errText);
                      showToast(errText, "error");
                      return;
                    }

                    try {
                      const res = await createUserWithEmailAndPassword(auth, registerEmail.trim(), registerPassword);
                      const uid = res.user.uid;

                      const isEvovaAdmin = registerEmail.trim().toLowerCase() === "evova.official@gmail.com";
                      const resolvedRole = isEvovaAdmin ? "superadmin" : registerRole;

                      // Write profile doc and link as superadmin or client
                      const profile = {
                        uid,
                        name: registerName,
                        email: registerEmail.trim(),
                        role: resolvedRole,
                        clientId: resolvedRole === "client" ? uid : ""
                      };
                      await setDoc(doc(db, "users", uid), profile);

                      // Seed starting client metadata in Firestore clients subcollections straight away
                      if (registerRole === "client") {
                        const newClientRecord: ClientAccount = {
                          id: uid,
                          name: registerName,
                          username: registerEmail.trim().split("@")[0],
                          email: registerEmail.trim(),
                          password: registerPassword,
                          status: "active",
                          slug: getUniqueSlug(generateSlug(registerName, "undangan"), clients),
                          visibility: "public",
                          keepWeddingPublic: true,
                          createdAt: new Date().toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }),
                          data: {
                            ...defaultWeddingData,
                            groomName: registerName.split("&")[0]?.trim() || "Mempelai Pria",
                            brideName: registerName.split("&")[1]?.trim() || "Mempelai Wanita"
                          }
                        };
                        await setDoc(doc(db, "clients", uid), newClientRecord);
                      }

                      addLog(registerEmail.trim(), "Registrasi Akun Baru", "SUKSES", `Berhasil mendaftarkan akun ${registerRole} bernama ${registerName}.`);
                      showToast(`Registrasi sukses! Selamat bergabung di EVOVA, ${registerName}.`, "success");
                      setIsRegisterMode(false);
                      setShowLoginModal(false);
                      setLoginError("");
                      
                      // Reset fields
                      setRegisterName("");
                      setRegisterEmail("");
                      setRegisterPassword("");
                      setShowPassword(false);
                    } catch (err: any) {
                      console.error("Gagal melakukan registrasi:", err);
                      const friendlyErr = translateAuthError(err.code, "Registrasi gagal dibatalkan. Kemungkinan email telah digunakan.");
                      setLoginError(friendlyErr);
                      showToast(friendlyErr, "error");
                      addLog(registerEmail.trim(), "Gagal Registrasi", "GAGAL", err.message || "Gagal membuat akun.");
                    }
                  }}
                  className="space-y-4 animate-fade-in"
                >
                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-widest pl-1 text-[8px]">Nama Lengkap</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Mempelai Pria & Wanita (cth: Latif & Tri)"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl outline-none text-xs transition duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-widest pl-1 text-[8px]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="nama@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl outline-none text-xs transition duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-extrabold text-slate-500 uppercase tracking-widest pl-1 text-[8px]">Sandi Baru</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Minimal terdiri dari 6 karakter"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 rounded-xl outline-none text-xs transition duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500 uppercase tracking-widest pl-1 text-[8px]">Peran Pengguna (Role)</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setRegisterRole("client")}
                        className={`py-2 border rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                          registerRole === "client"
                            ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        Klien Pengantin
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterRole("superadmin")}
                        className={`py-2 border rounded-xl text-[10px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                          registerRole === "superadmin"
                            ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Superadmin
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-bold rounded-xl shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-98 transition duration-200 text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Daftar Akun Baru</span>
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Floating System Toast Alerts */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3.5 max-w-sm w-full font-sans pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-4 rounded-2xl shadow-xl border flex gap-3 items-start pointer-events-auto backdrop-blur-md relative overflow-hidden transition-all duration-200 ${
                toast.type === "success"
                  ? "bg-emerald-50/95 border-emerald-100 text-emerald-800"
                  : toast.type === "error"
                  ? "bg-rose-50/95 border-rose-100 text-rose-800"
                  : "bg-slate-900/95 border-slate-800 text-white"
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                toast.type === "success" ? "bg-emerald-500" : toast.type === "error" ? "bg-rose-500" : "bg-indigo-500"
              }`} />

              <div className="pt-0.5">
                {toast.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : toast.type === "error" ? (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                )}
              </div>

              <div className="flex-1 space-y-0.5">
                <h5 className="text-[9px] font-extrabold uppercase tracking-widest opacity-80 leading-tight">
                  {toast.type === "success" ? "Sukses" : toast.type === "error" ? "Kesalahan" : "Informasi"}
                </h5>
                <p className="text-xs leading-relaxed font-medium">{toast.message}</p>
              </div>

              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-lg hover:bg-slate-200/20"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
