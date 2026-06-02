import React, { useState, useEffect } from "react";
import FormGenerator from "./FormGenerator";
import { WeddingData, ClientAccount, TemplatePreset, GuestWish } from "../types";
import { 
  ShieldAlert, LogIn, Lock, LogOut, FileText, CheckCircle, 
  MessageSquare, Trash2, Eye, HelpCircle, Heart, User, Clipboard, Check,
  Cloud, Users, Share2, Search, ArrowRight, Sparkles, Database, RefreshCw
} from "lucide-react";
import { safeLocalStorage } from "../utils";
import { 
  db, initAuth, googleSignIn, googleLogout, getAccessToken, 
  handleFirestoreError, OperationType 
} from "../firebase";
import { 
  collection, doc, deleteDoc, getDocs, setDoc, query, orderBy, onSnapshot 
} from "firebase/firestore";
import { 
  exportRSVPsToGoogleSheets, backupWeddingToGoogleDrive, 
  fetchGoogleContacts, ImportableContact 
} from "../google-api";
import { defaultWeddingData } from "../data";

interface ClientAdminPanelProps {
  clientAccounts: ClientAccount[];
  activeTemplates: TemplatePreset[];
  onUploadFileToStorage: (name: string, size: string, fileType: string, url: string) => void;
  onPreviewClick: (data: WeddingData) => void;
  onClientDataChange: (clientId: string, newData: WeddingData) => void;
  loggedClient: ClientAccount;
  onLogout: () => void;
}

export default function ClientAdminPanel({
  clientAccounts,
  activeTemplates,
  onUploadFileToStorage,
  onPreviewClick,
  onClientDataChange,
  loggedClient,
  onLogout
}: ClientAdminPanelProps) {
  const activeClient = loggedClient;
  const clientData = activeClient?.data || defaultWeddingData;
  
  // Moderate wishes states
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Google Workspace Integration status
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const [googleSuccessAlert, setGoogleSuccessAlert] = useState<string | null>(null);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState<boolean>(false);
  const [copiedDomainText, setCopiedDomainText] = useState<string | null>(null);
  const [sheetLink, setSheetLink] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState<string | null>(null);

  // Google Contacts states
  const [contacts, setContacts] = useState<ImportableContact[]>([]);
  const [searchContactQuery, setSearchContactQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<ImportableContact[]>([]);
  const [showContactsModal, setShowContactsModal] = useState(false);

  // Load wishes when client changes - sync with Firestore dynamic collection in real-time
  useEffect(() => {
    if (!activeClient?.id) return;
    
    const wishesRef = collection(db, "clients", activeClient.id, "wishes");
    const q = query(wishesRef, orderBy("createdAt", "desc"));
    
    const unsubscribeWishes = onSnapshot(q, (snapshot) => {
      const cloudWishes: GuestWish[] = [];
      snapshot.forEach((snap) => {
        cloudWishes.push(snap.data() as GuestWish);
      });
      setWishes(cloudWishes);
    }, (err) => {
      console.error("Gagal mendownload data wishes dari cloud Firestore secara real-time:", err);
    });

    // Check existing google token cache on mount
    const unsubscribe = initAuth((user, token) => {
      setGoogleUser(user);
      setGoogleToken(token);
    }, () => {
      setGoogleUser(null);
      setGoogleToken(null);
    });

    return () => {
      unsubscribeWishes();
      unsubscribe();
    };
  }, [activeClient]);

  const handleLogout = () => {
    onLogout();
  };

  const handleDataChange = (updatedData: WeddingData) => {
    onClientDataChange(activeClient.id, updatedData);
  };

  const handleDeleteWish = async (wishId: string) => {
    if (!activeClient) return;
    if (confirm("Apakah Anda yakin ingin menghapus doa/ucapan rsvp tamu ini?")) {
      const updatedWishes = wishes.filter(w => w.id !== wishId);
      setWishes(updatedWishes);

      // Synchronously delete from Firestore
      try {
        const wishDocRef = doc(db, "clients", activeClient.id, "wishes", wishId);
        await deleteDoc(wishDocRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `clients/${activeClient.id}/wishes/${wishId}`);
      }
    }
  };

  const getShareUrl = () => {
    if (!activeClient) return "";
    return activeClient.slug 
      ? `${window.location.origin}/wedding/${activeClient.slug}` 
      : `${window.location.origin}?client=${activeClient.id}`;
  };

  const getShareText = () => {
    if (!activeClient) return "";
    const groomNick = clientData?.groomNick || activeClient.name;
    const brideNick = clientData?.brideNick || "Pasangan";
    return `Mohon doa restu di pernikahan suci kami: ${groomNick} & ${brideNick}. Selengkapnya di undangan digital premium kami: ${getShareUrl()}`;
  };

  const copyInvitationLink = () => {
    const shareUrl = getShareUrl();
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText())}`, "_blank");
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareText())}`, "_blank");
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`, "_blank");
  };

  const openWebsite = () => {
    window.open(getShareUrl(), "_blank");
  };

  // Google Workspace Integration actions
  const handleGoogleConnect = async () => {
    try {
      setIsWorkspaceLoading(true);
      setGoogleSuccessAlert(null);
      setWorkspaceError(null);
      setIsDomainError(false);
      const res = await googleSignIn();
      setGoogleUser(res.user);
      setGoogleToken(res.accessToken);
    } catch (err: any) {
      console.error("Gagal menghubungkan Google:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (err.code === "auth/unauthorized-domain" || errMsg.includes("unauthorized-domain")) {
        setIsDomainError(true);
        setWorkspaceError("Domain ini belum diotorisasi di Konsol Firebase Anda.");
      } else {
        setWorkspaceError("Gagal menghubungkan dengan Google: " + errMsg);
      }
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      setIsWorkspaceLoading(true);
      await googleLogout();
      setGoogleUser(null);
      setGoogleToken(null);
      setSheetLink(null);
      setDriveLink(null);
      setGoogleSuccessAlert(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  const handleSheetsExport = async () => {
    if (!googleToken) return;
    try {
      setIsWorkspaceLoading(true);
      setGoogleSuccessAlert(null);
      const res = await exportRSVPsToGoogleSheets(
        googleToken,
        clientData?.groomName || "Pengantin Pria",
        clientData?.brideName || "Pasangan",
        wishes
      );
      setSheetLink(res.spreadsheetUrl);
      setGoogleSuccessAlert("Ekspor berhasil! File spreadsheet telah sukses dibuat di Google Sheets Anda.");
    } catch (err) {
      alert("Gagal mengekspor data: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  const handleDriveBackup = async () => {
    if (!googleToken) return;
    try {
      setIsWorkspaceLoading(true);
      setGoogleSuccessAlert(null);
      const res = await backupWeddingToGoogleDrive(
        googleToken,
        clientData?.groomName || "Pengantin Pria",
        clientData
      );
      setDriveLink(res.webViewLink);
      setGoogleSuccessAlert("Pencadangan berhasil! Draf mentah JSON aman tersimpan di Google Drive Anda.");
    } catch (err) {
      alert("Gagal melakukan pencadangan: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  const handleOpenContacts = async () => {
    if (!googleToken) return;
    try {
      setIsWorkspaceLoading(true);
      const fetched = await fetchGoogleContacts(googleToken);
      setContacts(fetched);
      setSelectedContacts([]);
      setSearchContactQuery("");
      setShowContactsModal(true);
    } catch (err) {
      alert("Gagal mengambil Kontak: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsWorkspaceLoading(false);
    }
  };

  const handleImportContactsSubmit = async () => {
    if (selectedContacts.length === 0) {
      setShowContactsModal(false);
      return;
    }

    const newWishes: GuestWish[] = selectedContacts.map((contact, index) => ({
      id: "w_c_" + Date.now() + "_" + index,
      name: contact.name,
      wish: `Halo ${clientData?.groomNick || "Pengantin"} & ${clientData?.brideNick || "Pengantin"}! Selamat menempuh hidup baru ya. Semoga bahagia selalu. (Kontak Google)`,
      attendance: "Hadir",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " ")
    }));

    const updatedWishes = [...newWishes, ...wishes];
    setWishes(updatedWishes);

    // Save to Firestore too!
    for (const nw of newWishes) {
      try {
        const wishDocRef = doc(db, "clients", activeClient.id, "wishes", nw.id);
        await setDoc(wishDocRef, nw);
      } catch (err) {
        console.error("Gagal menyimpan rsvp kontak ke firestore:", err);
      }
    }

    setShowContactsModal(false);
    alert(`Sukses mengimpor ${selectedContacts.length} tamu dari Google Kontak!`);
  };


  const exportToCSV = () => {
    if (!activeClient || wishes.length === 0) {
      alert("Tidak ada data ucapan tamu atau RSVP yang dapat diekspor.");
      return;
    }

    // Format for CSV headers
    const headers = ["ID", "Nama Tamu", "Kehadiran", "Ucapan / Doa Restu", "Waktu Kirim"];
    
    const rows = wishes.map((wish, idx) => {
      const wishId = wish.id || `w_${idx}`;
      const name = wish.name || "";
      const attendance = wish.attendance || "Ragu";
      const commentString = wish.comment || wish.wish || "";
      const escapedComment = commentString.replace(/"/g, '""'); // escape double quotes for CSV format
      const timestamp = wish.timestamp || wish.createdAt || "";
      return [wishId, name, attendance, escapedComment, timestamp];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const groomNick = clientData?.groomNick || clientData?.groomName || "wedding";
    link.href = url;
    link.download = `daftar_tamu_rsvp_${groomNick.toLowerCase().replace(/\s+/g, "_")}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  // Render Suspended Account state
  if (activeClient.status === "suspended") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 font-sans">
        <div className="w-full max-w-md bg-white border border-red-200/50 shadow-xl rounded-3xl p-8 text-center space-y-4">
          <div className="mx-auto inline-flex p-4 bg-red-50 text-red-650 rounded-full">
            <ShieldAlert className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-lg font-serif font-bold text-red-800">Akun Anda Ditangguhkan</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Maaf, status akun klien <strong>{activeClient.name}</strong> sedang dibekukan / dinonaktifkan sementara oleh Superadmin platform. 
          </p>
          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 text-left space-y-1 border border-slate-100">
            <p><strong>ID Klien:</strong> {activeClient.username}</p>
            <p><strong>Alasan:</strong> Penyelesaian administrasi lisensi paket template.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-950 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            Keluar Kembali
          </button>
        </div>
      </div>
    );
  }

  // Render normal Active Client Panel
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 font-sans">
      
      {/* Upper welcoming bar */}
      <div className="bg-white border border-slate-150/60 shadow-sm rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold rounded-full border border-rose-100">
              {activeClient.packageId === "premium-unlimited" ? "👑 PREMIUM UNLIMITED" : "🌟 FREE STANDARD"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider font-mono">Draf Aktif</span>
          </div>
          <h1 className="text-xl font-serif font-bold text-slate-800 leading-tight">
            Dashboard Pengantin: {activeClient.name}
          </h1>
          <p className="text-xs text-slate-500 font-sans">
            Konfigurasi tersimpan secara live di slot privat Anda. Hasil undian akan terupdate instan!
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Preview Button */}
          <button
            onClick={() => onPreviewClick(clientData)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-700 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview Iframe
          </button>

          {/* Open Website */}
          <button
            onClick={openWebsite}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            Buka Website
          </button>

          {/* Copy Share Link */}
          <button
            onClick={copyInvitationLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />}
            {copiedLink ? "Link Tersalin!" : "Salin Link"}
          </button>

          {/* Share WhatsApp */}
          <button
            onClick={shareToWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-700 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            <span className="text-xs">💬</span>
            WhatsApp
          </button>

          {/* Share Telegram */}
          <button
            onClick={shareToTelegram}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-150 text-sky-700 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            <span className="text-xs">✈️</span>
            Telegram
          </button>

          {/* Share Facebook */}
          <button
            onClick={shareToFacebook}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-150 text-blue-700 rounded-xl text-xs font-semibold cursor-pointer transition"
          >
            <span className="text-xs">🦕</span>
            Facebook
          </button>

          {/* Exit / Log out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold cursor-pointer transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Panel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side (8 units width): Edit wedding details Form */}
        <div className="lg:col-span-8">
          <FormGenerator 
            data={clientData}
            onChange={handleDataChange}
            onPreviewClick={() => onPreviewClick(clientData)}
            isClientOnly={true}
            activeTemplates={activeTemplates}
            onUploadFileToStorage={onUploadFileToStorage}
          />
        </div>

        {/* Right Side (4 units width): Moderate claims & logs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* moderate actual wishes section */}
          <div className="bg-white border border-slate-150 rounded-3xl shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">Moderasi Ucapan &amp; RSVP</h3>
                  <p className="text-[10px] text-slate-500">Kelola dan ekspor data ucapan tamu.</p>
                </div>
              </div>
            </div>

            {wishes.length > 0 && (
              <button
                onClick={exportToCSV}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <FileText className="w-4 h-4" />
                Ekspor Daftar Tamu (CSV)
              </button>
            )}

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {wishes.length === 0 ? (
                <div className="py-6 text-center text-slate-350 space-y-1">
                  <MessageSquare className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-[10px]">Belum ada ucapan duka/doa dari tamu undangan.</p>
                </div>
              ) : (
                wishes.map((wish) => {
                  const attNormalized = (wish.attendance || "").toLowerCase().replace(/[^a-z]/g, "");
                  const isHadir = attNormalized === "hadir";
                  const isTidakHadir = attNormalized === "tidakhadir" || attNormalized === "tidakhadir";
                  
                  return (
                    <div key={wish.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800">{wish.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            isHadir 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                              : isTidakHadir 
                              ? "bg-rose-50 text-rose-600 border border-rose-100" 
                              : "bg-slate-100 text-slate-600 border border-slate-150"
                          }`}>
                            {isHadir ? "Hadir" : isTidakHadir ? "Tidak Hadir" : wish.attendance || "Ragu"}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-sans text-[11px] font-light">"{wish.comment || wish.wish}"</p>
                        <span className="text-[9px] text-slate-450 block font-mono">{wish.timestamp || wish.createdAt}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteWish(wish.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* GOOGLE WORKSPACE INTEGRATION CARD */}
          {/* ========================================== */}
          <div className="bg-white border border-slate-150 rounded-3xl shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 font-sans">Google Workspace Suite</h3>
                  <p className="text-[10px] text-slate-500 font-sans">Hubungkan Sheets, Drive, &amp; Kontak.</p>
                </div>
              </div>
              {googleUser && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Tersambung dengan Google"></span>
              )}
            </div>

            {isWorkspaceLoading ? (
              <div className="py-4 text-center space-y-2">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[10px] text-slate-400 font-mono">Memproses permintaan API...</p>
              </div>
            ) : !googleToken ? (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                  Sambungkan akun Google Anda untuk mengaktifkan sinkronisasi otomatis ke Google Drive, ekspor RSVP langsung ke Google Sheets, dan impor daftar tamu dari Google Kontak.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleConnect}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer hover:scale-[1.01]"
                >
                  <LogIn className="w-4 h-4" />
                  Hubungkan Google Account
                </button>

                {/* Domain Whitelist Alert / Helper */}
                {workspaceError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] text-rose-900 space-y-3">
                    <div className="flex gap-2 items-start">
                      <ShieldAlert className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[11px] text-rose-800">Gagal Menghubungkan Google</p>
                        <p className="text-[10px] text-rose-700 mt-0.5 font-sans leading-normal">{workspaceError}</p>
                      </div>
                    </div>

                    {isDomainError && (
                      <div className="bg-white border border-rose-100 rounded-xl p-3 space-y-2.5 font-sans">
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          Supaya fitur Google Auth &amp; Workspace berfungsi dengan lancar di domain <strong>evova-studio</strong> maupun di testing server, pastikan Anda telah memasukkan daftar domain berikut ke bagian <strong>Authorized Domains (Domain Resmi)</strong> di Firebase Console Anda:
                        </p>
                        
                        <div className="space-y-2 font-mono text-[9px]">
                          {/* Active / Current Domain */}
                          {typeof window !== "undefined" && window.location.hostname && (
                            <div className="bg-indigo-50/50 border border-indigo-100 p-2 rounded-lg space-y-1">
                              <span className="text-[8px] text-indigo-700 font-sans font-bold flex items-center gap-1 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                                Domain Aktif Saat Ini:
                              </span>
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate text-slate-700 select-all font-semibold font-mono">{window.location.hostname}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(window.location.hostname);
                                    setCopiedDomainText(window.location.hostname);
                                    setTimeout(() => setCopiedDomainText(null), 2000);
                                  }}
                                  className="shrink-0 p-1 bg-white hover:bg-slate-100 text-slate-600 rounded border border-slate-200 transition cursor-pointer"
                                  title="Salin Domain Aktif"
                                >
                                  {copiedDomainText === window.location.hostname ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Clipboard className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Evova Studio Web App Domain */}
                          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg space-y-1">
                            <span className="text-[8px] text-slate-500 font-sans font-bold uppercase tracking-wider">Domain Production (Firebase Hosting):</span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate text-slate-700 select-all font-semibold font-mono">evova-studio.web.app</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText("evova-studio.web.app");
                                  setCopiedDomainText("evova-studio.web.app");
                                  setTimeout(() => setCopiedDomainText(null), 2000);
                                }}
                                className="shrink-0 p-1 bg-white hover:bg-slate-100 text-slate-600 rounded border border-slate-200 transition cursor-pointer"
                                title="Salin Domain"
                              >
                                {copiedDomainText === "evova-studio.web.app" ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Clipboard className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Evova Studio Firebaseapp Auth Domain */}
                          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg space-y-1">
                            <span className="text-[8px] text-slate-500 font-sans font-bold uppercase tracking-wider">Domain Auth Default:</span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate text-slate-700 select-all font-semibold font-mono">evova-studio.firebaseapp.com</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText("evova-studio.firebaseapp.com");
                                  setCopiedDomainText("evova-studio.firebaseapp.com");
                                  setTimeout(() => setCopiedDomainText(null), 2000);
                                }}
                                className="shrink-0 p-1 bg-white hover:bg-slate-100 text-slate-600 rounded border border-slate-200 transition cursor-pointer"
                                title="Salin Domain"
                              >
                                {copiedDomainText === "evova-studio.firebaseapp.com" ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Clipboard className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Development Sandboxes / Container URLs (fallback fallback) */}
                          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg space-y-1">
                            <span className="text-[8px] text-slate-500 font-sans font-bold uppercase tracking-wider font-sans">Testing Cloud Run Dev URL:</span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate text-slate-700 font-mono">ais-dev-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const text = "ais-dev-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app";
                                  navigator.clipboard.writeText(text);
                                  setCopiedDomainText(text);
                                  setTimeout(() => setCopiedDomainText(null), 2000);
                                }}
                                className="shrink-0 p-1 bg-white hover:bg-slate-100 text-slate-600 rounded border border-slate-200 transition cursor-pointer"
                                title="Salin Domain"
                              >
                                {copiedDomainText === "ais-dev-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app" ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Clipboard className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg space-y-1">
                            <span className="text-[8px] text-slate-500 font-sans font-bold uppercase tracking-wider font-sans">Testing Cloud Run Pre URL:</span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="truncate text-slate-700 font-mono">ais-pre-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const text = "ais-pre-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app";
                                  navigator.clipboard.writeText(text);
                                  setCopiedDomainText(text);
                                  setTimeout(() => setCopiedDomainText(null), 2000);
                                }}
                                className="shrink-0 p-1 bg-white hover:bg-slate-100 text-slate-600 rounded border border-slate-200 transition cursor-pointer"
                                title="Salin Domain"
                              >
                                {copiedDomainText === "ais-pre-qdjcuoqbw2fiwn7lv7jnmh-585558544711.asia-southeast1.run.app" ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Clipboard className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="pt-1">
                          <a
                            href="https://console.firebase.google.com/project/evova-studio/authentication/settings"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/60 text-indigo-700 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all"
                          >
                            Buka Firebase Console ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Connected Account Display */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-450 font-mono tracking-wider uppercase font-bold">AKUN TERHUBUNG</p>
                    <p className="text-[11px] font-bold text-slate-700 truncate">{googleUser?.email || "Google Active Session"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleDisconnect}
                    className="p-1.5 text-slate-450 hover:text-rose-600 transition cursor-pointer"
                    title="Putuskan Hubungan"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Integration Tool buttons */}
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Google Sheets */}
                  <button
                    type="button"
                    onClick={handleSheetsExport}
                    className="flex items-center justify-between gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-2xl transition text-left cursor-pointer group w-full"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-750 block">Ekspor ke Google Sheets</span>
                        <p className="text-[9px] text-slate-450 leading-none">Buat lembar draf RSVP live</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-405 group-hover:translate-x-0.5 transition" />
                  </button>

                  {/* Google Drive */}
                  <button
                    type="button"
                    onClick={handleDriveBackup}
                    className="flex items-center justify-between gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-2xl transition text-left cursor-pointer group w-full"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-750 block">Cadangkan Draf ke Drive</span>
                        <p className="text-[9px] text-slate-450 leading-none">Simpan file backup JSON aman</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-405 group-hover:translate-x-0.5 transition" />
                  </button>

                  {/* Google Contacts */}
                  <button
                    type="button"
                    onClick={handleOpenContacts}
                    className="flex items-center justify-between gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-2xl transition text-left cursor-pointer group w-full"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-750 block">Impor Tamu dari Kontak</span>
                        <p className="text-[9px] text-slate-450 leading-none">Masukkan tamu dari Google Contacts</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-405 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>

                {/* API Logs & Alerts */}
                {googleSuccessAlert && (
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-[10px] text-indigo-950 font-medium space-y-1 text-center">
                    <p className="flex items-center justify-center gap-1 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Proses Berhasil!
                    </p>
                    <p className="text-[10px] text-slate-600 font-light leading-relaxed font-sans">{googleSuccessAlert}</p>
                    
                    {sheetLink && (
                      <a
                        href={sheetLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1 font-bold text-emerald-650 hover:underline hover:scale-[1.01] transition text-center justify-center"
                      >
                        Buka Google Sheets ↗
                      </a>
                    )}

                    {driveLink && (
                      <a
                        href={driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1 font-bold text-blue-650 hover:underline hover:scale-[1.01] transition text-center justify-center"
                      >
                        Lihat Berkas Google Drive ↗
                      </a>
                    )}
                  </div>
                )}

                {workspaceError && !isDomainError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] text-rose-750 font-semibold text-center animate-pulse">
                    {workspaceError}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Client Info Box */}
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-350" />
              <h3 className="text-xs font-bold text-slate-150">Pusat Bantuan &amp; Panduan</h3>
            </div>
            
            <div className="space-y-3 text-[11px] leading-relaxed text-slate-400 font-sans">
              <p>
                Silakan isi data formulir di sebelah kiri. Setelah selesai mengedit, unduh konfigurasi <strong>Ekspor Data</strong> (.json) sebagai backup cadangan fisik Anda.
              </p>
              <p>
                Foto di atas dikompresi otomatis (max width 800px) menggunakan algoritma internal kami sebelum disimpan secara efisien dalam database cloud draf pribadi Anda.
              </p>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[10px] space-y-1">
                <p className="text-rose-450 font-bold">💡 TIPS LAGU KUSTOM</p>
                <p>Gunakan format musik berekstensi MP3 dengan ukuran di bawah 3.5 MB untuk performance loading terbaik bagi tamu Anda.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* GOOGLE CONTACTS IMPORT MODAL */}
      {/* ========================================== */}
      {showContactsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col overflow-hidden relative animate-scale-up">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest pl-0.5 font-mono">Integrasi Google Contacts</span>
                <h3 className="text-base font-serif font-black text-slate-800">Pilih Kontak Untuk Diimpor</h3>
                <p className="text-[10.5px] text-slate-500">Hubungkan tamu dari daftar kontak personal Anda ke draf tamu.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowContactsModal(false)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
              <div className="relative flex-grow">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kontak berdasarkan nama..."
                  value={searchContactQuery}
                  onChange={(e) => setSearchContactQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-350/70 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-700"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                {contacts.length} Kontak Tersedia
              </span>
            </div>

            {/* Contacts Table / Checklist */}
            <div className="flex-grow overflow-y-auto p-4 space-y-2 max-h-[40vh]">
              {contacts.filter(c => c.name.toLowerCase().includes(searchContactQuery.toLowerCase())).length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Users className="w-10 h-10 stroke-1 mx-auto" />
                  <p className="text-xs">Tidak ada kontak yang cocok.</p>
                </div>
              ) : (
                contacts
                  .filter(c => c.name.toLowerCase().includes(searchContactQuery.toLowerCase()))
                  .map((contact, idx) => {
                    const isChecked = selectedContacts.some(c => c.name === contact.name);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedContacts(selectedContacts.filter(c => c.name !== contact.name));
                          } else {
                            setSelectedContacts([...selectedContacts, contact]);
                          }
                        }}
                        className={`p-3.5 border rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                          isChecked
                            ? "bg-indigo-50/60 border-indigo-205 text-indigo-900 border-indigo-300"
                            : "bg-white hover:bg-slate-50 border-slate-150 text-slate-700"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{contact.name}</p>
                          <p className="text-[10px] text-slate-450 truncate">{contact.email || "Tanpa Email"} {contact.phone && `• ${contact.phone}`}</p>
                        </div>
                        
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-slate-300"
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Submit Import Action */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/55 flex items-center justify-between gap-4">
              <span className="text-[11px] text-slate-500 font-medium">
                {selectedContacts.length} kontak terpilih
              </span>
              <button
                type="button"
                onClick={handleImportContactsSubmit}
                disabled={selectedContacts.length === 0}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer select-none transition"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Impor {selectedContacts.length} Tamu ke Undangan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
