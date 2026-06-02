import React, { useState, useEffect } from "react";
import { 
  ClientAccount, TemplatePreset, GlobalFeatureToggles, 
  ActivityLogEntry, StorageFile, WeddingData 
} from "../types";
import { 
  Users, FolderHeart, Sliders, ClipboardList, HardDrive, 
  BarChart3, Plus, Edit, Trash2, ShieldAlert, Check, X, 
  Lock, Unlock, Settings, Search, Share2, Eye, RefreshCw, 
  Power, Download, Sparkles, Filter, Trash, AlertTriangle, CheckCircle 
} from "lucide-react";
import { defaultWeddingData } from "../data";
import { generateSlug, getUniqueSlug } from "../utils";
import ThemeIllustration from "./ThemeIllustration";

interface SuperadminPanelProps {
  clients: ClientAccount[];
  templates: TemplatePreset[];
  featureToggles: GlobalFeatureToggles;
  logs: ActivityLogEntry[];
  storageFiles: StorageFile[];
  onUpdateClients: (updated: ClientAccount[]) => void;
  onUpdateTemplates: (updated: TemplatePreset[]) => void;
  onUpdateToggles: (updated: GlobalFeatureToggles) => void;
  onClearLogs: () => void;
  onDeleteStorageFile: (id: string) => void;
  onSelectClientForEdit: (clientId: string) => void;
  onPreviewClient?: (data: WeddingData) => void;
  currentUser: string;
  addLog: (userName: string, activity: string, status: "SUKSES" | "GAGAL" | "INFO", description: string) => void;
}

export default function SuperadminPanel({
  clients,
  templates,
  featureToggles,
  logs,
  storageFiles,
  onUpdateClients,
  onUpdateTemplates,
  onUpdateToggles,
  onClearLogs,
  onDeleteStorageFile,
  onSelectClientForEdit,
  onPreviewClient,
  currentUser,
  addLog
}: SuperadminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"clients" | "templates" | "features" | "logs" | "storage" | "analytics">("clients");

  // Local premium toast notification state
  const [localToast, setLocalToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const triggerToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setLocalToast({ message, type });
    setTimeout(() => {
      setLocalToast(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  // Client Management States
  const [clientSearch, setClientSearch] = useState("");
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);

  // Client form fields
  const [clientFormName, setClientFormName] = useState("");
  const [clientFormUsername, setClientFormUsername] = useState("");
  const [clientFormEmail, setClientFormEmail] = useState("");
  const [clientFormPassword, setClientFormPassword] = useState("");
  const [clientFormStatus, setClientFormStatus] = useState<"active" | "suspended" | "inactive">("active");
  const [clientFormSlug, setClientFormSlug] = useState("");
  const [clientFormVisibility, setClientFormVisibility] = useState<"public" | "private" | "suspended">("public");
  const [clientFormKeepWeddingPublic, setClientFormKeepWeddingPublic] = useState(true);

  // Template Management States
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreset | null>(null);

  // Template form fields
  const [templateFormName, setTemplateFormName] = useState("");
  const [templateFormTheme, setTemplateFormTheme] = useState("");
  const [templateFormDesc, setTemplateFormDesc] = useState("");
  const [templateFormIsPremium, setTemplateFormIsPremium] = useState(false);

  // Log filter state
  const [logSearch, setLogSearch] = useState("");
  const [logFilterStatus, setLogFilterStatus] = useState<string>("ALL");

  // Filtered clients
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.username.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Storage Stats Calculator
  const totalStorageValue = storageFiles.reduce((acc, file) => {
    // Extract numbers from "1.2 MB" formatted string
    const match = file.fileSize.match(/^([0-9.]+)\s*(MB|KB)/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      return acc + (unit === "KB" ? val / 1024 : val);
    }
    return acc;
  }, 0);

  // Handle Create Client
  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormName || !clientFormUsername || !clientFormPassword) {
      triggerToast("Harap lengkapi semua field wajib!", "error");
      return;
    }

    const trimmedUsername = clientFormUsername.toLowerCase().trim();

    if (trimmedUsername.length === 0) {
      triggerToast("Username tidak valid!", "error");
      return;
    }

    if (clients.some(c => c.username.toLowerCase() === trimmedUsername)) {
      addLog(currentUser, "Create Client", "GAGAL", `Username "${clientFormUsername}" sudah digunakan.`);
      triggerToast("Username sudah terdaftar! Harap gunakan username lain.", "error");
      return;
    }

    if (clientFormPassword.length < 6) {
      triggerToast("Password minimal 6 karakter!", "error");
      return;
    }

    let rawSlug = clientFormSlug.trim();
    if (!rawSlug) {
      rawSlug = trimmedUsername;
    }
    const finalSlug = getUniqueSlug(rawSlug, clients);

    const newClient: ClientAccount = {
      id: "client-" + Date.now(),
      name: clientFormName,
      username: trimmedUsername,
      email: clientFormEmail || `${trimmedUsername}@mail.com`,
      password: clientFormPassword,
      status: clientFormStatus,
      slug: finalSlug,
      visibility: clientFormVisibility,
      keepWeddingPublic: clientFormKeepWeddingPublic,
      createdAt: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }),
      data: {
        ...defaultWeddingData,
        groomName: "",
        groomNick: "",
        groomParents: "",
        groomTitle: "",
        brideName: "",
        brideNick: "",
        brideParents: "",
        brideTitle: "",
        weddingDate: "",
        weddingTimeFormat: "",
        akadTime: "",
        resepsiTime: "",
        akadLocation: "",
        resepsiLocation: "",
        theme: "theme-blue-hydrangea",
        enableMusic: true,
        enableCountdown: true,
        enableRSVP: true,
        enableGuestbook: true,
        enableLoveStory: true,
        enableGiftDigital: true,
        enableGoogleMaps: true,
        bankName: "",
        bankAccount: "",
        bankUser: "",
        qrisImage: "",
        loveStories: [],
        images: []
      }
    };

    onUpdateClients([newClient, ...clients]);
    addLog(currentUser, "Create Client", "SUKSES", `Client "${clientFormName}" berhasil didaftarkan.`);
    
    // Reset Form
    setClientFormName("");
    setClientFormUsername("");
    setClientFormEmail("");
    setClientFormPassword("");
    setClientFormStatus("active");
    setClientFormSlug("");
    setClientFormVisibility("public");
    setClientFormKeepWeddingPublic(true);
    setShowAddClientModal(false);
  };

  // Handle Edit/Update Client
  const handleEditClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    const trimmedUsername = clientFormUsername.toLowerCase().trim();
    if (trimmedUsername.length === 0) {
      triggerToast("Username tidak valid!", "error");
      return;
    }

    if (clients.some(c => c.id !== selectedClient.id && c.username.toLowerCase() === trimmedUsername)) {
      triggerToast("Username sudah terdaftar! Harap gunakan username lain.", "error");
      return;
    }

    if (clientFormPassword && clientFormPassword.length < 6) {
      triggerToast("Password baru minimal 6 karakter!", "error");
      return;
    }

    let rawSlug = clientFormSlug.trim();
    if (!rawSlug) {
      rawSlug = generateSlug(selectedClient.data?.groomName || "ali", selectedClient.data?.brideName || "fatimah");
    }
    const finalSlug = getUniqueSlug(rawSlug, clients, selectedClient.id);

    const updated: ClientAccount[] = clients.map(c => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          name: clientFormName,
          username: trimmedUsername,
          email: clientFormEmail,
          password: clientFormPassword || c.password,
          status: clientFormStatus,
          slug: finalSlug,
          visibility: clientFormVisibility,
          keepWeddingPublic: clientFormKeepWeddingPublic
        };
      }
      return c;
    });

    onUpdateClients(updated);
    addLog(currentUser, "Edit Client", "SUKSES", `Detail client "${clientFormName}" (@${trimmedUsername}) berhasil dimodifikasi.`);
    setShowEditClientModal(false);
    setSelectedClient(null);
  };

  // Suspend/Unsuspend Client Toggle
  const handleToggleSuspendClient = (client: ClientAccount) => {
    const nextStatus: "active" | "inactive" | "suspended" = client.status === "suspended" ? "active" : "suspended";
    const updated: ClientAccount[] = clients.map(c => {
      if (c.id === client.id) {
        return { ...c, status: nextStatus };
      }
      return c;
    });
    onUpdateClients(updated);
    addLog(currentUser, nextStatus === "suspended" ? "Suspend Client" : "Unsuspend Client", "SUKSES", `Klien "${client.name}" diubah statusnya menjadi ${nextStatus}.`);
  };

  // Delete Client
  const handleDeleteClientClick = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin MENGHAPUS akun klien "${name}" beserta seluruh data undangannya secara permanen? Tindakan ini tidak bisa dibatalkan!`)) {
      const updated = clients.filter(c => c.id !== id);
      onUpdateClients(updated);
      addLog(currentUser, "Delete Client", "SUKSES", `Akun klien "${name}" telah dihapus secara permanen dari sistem.`);
    }
  };

  // Reset password helper
  const handleResetPassword = (client: ClientAccount) => {
    const newPass = prompt(`Masukkan password baru untuk klien "${client.name}":`, "klien123");
    if (newPass) {
      const updated = clients.map(c => {
        if (c.id === client.id) {
          return { ...c, password: newPass };
        }
        return c;
      });
      onUpdateClients(updated);
      addLog(currentUser, "Reset Password", "SUKSES", `Password untuk klien "${client.name}" di-reset secara manual.`);
      triggerToast("Password berhasil diubah!", "success");
    }
  };

  // Handle Template Create
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFormName || !templateFormTheme) {
      triggerToast("Field nama dan theme class wajib diisi!", "error");
      return;
    }

    const newTpl: TemplatePreset = {
      id: "template-" + Date.now(),
      name: templateFormName,
      theme: templateFormTheme,
      description: templateFormDesc || "Edisi template kustom desainer.",
      isPremium: templateFormIsPremium,
      isActive: true,
      accentClass: templateFormIsPremium ? "bg-gradient-to-r from-amber-500 to-yellow-600" : "bg-gradient-to-r from-slate-500 to-slate-700",
      bgClass: "border-slate-100 bg-slate-50/10 hover:border-slate-350",
      textColor: "text-slate-700",
      iconColor: "text-slate-600 bg-slate-100",
      images: [
        "https://lh3.googleusercontent.com/d/1eSAqduDmZGPOer-mTBhSDKwpePJjXegJ"
      ]
    };

    onUpdateTemplates([...templates, newTpl]);
    addLog(currentUser, "Create Template", "SUKSES", `Template "${templateFormName}" ditambahkan sebagai preset platform.`);
    
    setTemplateFormName("");
    setTemplateFormTheme("");
    setTemplateFormDesc("");
    setTemplateFormIsPremium(false);
    setShowAddClientModal(false);
    setShowAddTemplateModal(false);
  };

  // Handle Toggle Active/Inactive Template
  const handleToggleTemplateActive = (tpl: TemplatePreset) => {
    const updated = templates.map(t => {
      if (t.id === tpl.id) {
        return { ...t, isActive: !t.isActive };
      }
      return t;
    });
    onUpdateTemplates(updated);
    addLog(currentUser, "Toggle Template", "SUKSES", `Mengubah status aktif template "${tpl.name}" ke ${!tpl.isActive ? "Aktif" : "Non-aktif"}.`);
  };

  // Handle Toggle Premium/Free Template
  const handleToggleTemplatePremium = (tpl: TemplatePreset) => {
    const updated = templates.map(t => {
      if (t.id === tpl.id) {
        return { ...t, isPremium: !t.isPremium, accentClass: !t.isPremium ? "bg-gradient-to-r from-amber-500 to-yellow-600" : "bg-gradient-to-r from-slate-500 to-slate-700" };
      }
      return t;
    });
    onUpdateTemplates(updated);
    addLog(currentUser, "Toggle Premium Template", "SUKSES", `Mengubah tipe lisensi template "${tpl.name}" menjadi ${!tpl.isPremium ? "Premium" : "Free"}.`);
  };

  // Handle Delete Template
  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus preset template "${name}" dari sistem secara permanen?`)) {
      const updated = templates.filter(t => t.id !== id);
      onUpdateTemplates(updated);
      addLog(currentUser, "Delete Template", "SUKSES", `Preset template "${name}" dihapus permanen.`);
    }
  };

  // Toggle Global Feature Features
  const handleToggleFeature = (key: keyof GlobalFeatureToggles) => {
    const updated = {
      ...featureToggles,
      [key]: !featureToggles[key]
    };
    onUpdateToggles(updated);
    addLog(currentUser, "Feature Toggle Update", "INFO", `Merubah setelan fitur global [${key}] ke status: ${!featureToggles[key] ? "AKTIF" : "NONAKTIF"}.`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* HEADER SECTION METRICS */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sliders className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest bg-yellow-500 text-black rounded-full uppercase">SUPERUSER ACCOUNT</span>
                <span className="text-slate-450 text-[11px] font-mono">Platform Owner Console</span>
              </div>
              <h1 className="text-2xl sm:text-3.5xl font-serif font-black mt-2 tracking-tight">Superadmin Control Engine</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                Panel kendali utama di mana pemilik platform dapat memonitor seluruh aktivitas draf klien, mengonfigurasi lisensi premium template, men-toggle fitur instan global, serta melihat log performa sistem.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">STATUS SERVER</span>
                <span className="text-emerald-450 font-bold text-xs flex items-center justify-end gap-1 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-ping"></span>
                  SPA ONLINE (NETLIFY READY)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">TOTAL CLIENTS</span>
              <span className="text-2xl font-bold text-white font-mono mt-0.5 block">{clients.length}</span>
              <span className="text-[10px] text-emerald-400 mt-1 block">✔ Terdaftar &amp; Terkelola</span>
            </div>
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">ACTIVE TEMPLATES</span>
              <span className="text-2xl font-bold text-white font-mono mt-0.5 block">
                {templates.filter(t => t.isActive).length}/{templates.length}
              </span>
              <span className="text-[10px] text-amber-400 mt-1 block">
                ⭐ {templates.filter(t => t.isActive && t.isPremium).length} Edisi Premium
              </span>
            </div>
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">GLOBAL STORAGE</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold text-white font-mono">{totalStorageValue.toFixed(1)}</span>
                <span className="text-xs text-slate-400 font-mono">MB / 500 MB</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                <div 
                  className="bg-yellow-500 h-1 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, (totalStorageValue / 500) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">SYSTEM LOGS</span>
              <span className="text-2xl font-bold text-white font-mono mt-0.5 block">{logs.length}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Aktivitas terekam aman</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION (Superadmin Features List) */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-sm p-1.5 flex flex-wrap gap-1 font-sans">
        <button
          onClick={() => setActiveSubTab("clients")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "clients" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Users className="w-4 h-4" />
          A. Client Management
        </button>
        <button
          onClick={() => setActiveSubTab("templates")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "templates" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <FolderHeart className="w-4 h-4" />
          B. Template Management
        </button>
        <button
          onClick={() => setActiveSubTab("features")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "features" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sliders className="w-4 h-4" />
          C. Global Toggle System
        </button>
        <button
          onClick={() => setActiveSubTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "logs" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          D. Activity Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveSubTab("storage")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "storage" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          E. Storage Manager
        </button>
        <button
          onClick={() => setActiveSubTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "analytics" ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          F. Share &amp; Analytics
        </button>
      </div>

      {/* PANEL CONTENT INTERFACES */}

      {/* A. CLIENTS MANAGEMENT PANEL */}
      {activeSubTab === "clients" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-800">A. Client Accounts Management</h2>
              <p className="text-xs text-slate-500">Buat draf akun, aktifkan/suspend kredensial klien, serta kelola detail template bawaannya langsung.</p>
            </div>
            
            <button
              onClick={() => {
                setClientFormName("");
                setClientFormUsername("");
                setClientFormEmail("");
                setClientFormPassword("");
                setClientFormStatus("active");
                setShowAddClientModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 transition-all font-bold text-xs text-black rounded-xl cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Mendaftarkan Klien Baru
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari nama klien, username, atau alamat email..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-250 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:ring-1 focus:ring-slate-800 transition"
            />
          </div>

          {/* Table list */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 tracking-wider uppercase font-mono">
                  <th className="p-4">NAMA KLIEN &amp; EMAIL</th>
                  <th className="p-4">CREDENTIALS</th>
                  <th className="p-4">TANGGAL DAFTAR</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-center">FASILITAS/WEDDING</th>
                  <th className="p-4 text-right">AKSI DAN KONTROL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      Tidak ada akun klien yang cocok dengan pencarian Anda.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{client.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{client.email}</div>
                        {client.slug && (
                          <div className="mt-1 flex items-center">
                            <span 
                              onClick={() => {
                                const url = `${window.location.origin}/wedding/${client.slug}`;
                                navigator.clipboard.writeText(url);
                                triggerToast("✓ Link permanen berhasil disalin!", "success");
                              }}
                              className="text-[10px] text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-mono cursor-pointer transition flex items-center gap-1 inline-block"
                              title="Salin Link Permanen"
                            >
                              <span>🔗</span>
                              <span>/wedding/{client.slug}</span>
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-mono text-[10px] space-y-0.5">
                        <div className="text-slate-600">User: <span className="text-slate-900 font-semibold">{client.username}</span></div>
                        <div className="text-slate-400 flex items-center gap-1">
                          Pass: <span className="font-semibold text-slate-850">●●●●●</span> 
                          <button 
                            onClick={() => handleResetPassword(client)}
                            className="text-xs text-slate-500 hover:text-rose-500 hover:underline inline ml-1 cursor-pointer"
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-500">
                        {client.createdAt}
                      </td>
                      <td className="p-4 space-y-1">
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            client.status === "active" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-250" 
                              : client.status === "suspended" 
                              ? "bg-rose-50 text-rose-700 border border-rose-250" 
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {client.status === "active" ? "Aktif" : client.status === "suspended" ? "DITANGGUHKAN" : "NONAKTIF"}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                          <span>Akses:</span>
                          <span className={`font-bold uppercase ${client.visibility === "private" ? "text-indigo-600" : client.visibility === "suspended" ? "text-red-500" : "text-emerald-600"}`}>
                            {client.visibility || "public"}
                          </span>
                        </div>
                        {client.keepWeddingPublic && (
                          <div className="text-[8px] bg-blue-50 text-blue-800 border border-blue-100 rounded px-1 py-0.5 font-sans scale-95 origin-left inline-block">
                            📱 Tetap Online saat Suspended
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex flex-col gap-1 items-center justify-center">
                          <button
                            onClick={() => onSelectClientForEdit(client.id)}
                            className="w-[124px] px-2 py-1 bg-slate-100 hover:bg-slate-900 hover:text-white transition rounded-lg text-[9px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
                            title="Buka form editor untuk mengubah draf undangan ini"
                          >
                            <Edit className="w-2.5 h-2.5" />
                            Kelola Draf (Edit)
                          </button>
                          
                          <button
                            onClick={() => onPreviewClient?.(client.data)}
                            className="w-[124px] px-2 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 transition rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            title="Buka simulasi preview rancangan undangan"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            Preview (Lihat)
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setClientFormName(client.name);
                            setClientFormEmail(client.email);
                            setClientFormUsername(client.username);
                            setClientFormPassword("");
                            setClientFormStatus(client.status);
                            setClientFormSlug(client.slug || "");
                            setClientFormVisibility(client.visibility || "public");
                            setClientFormKeepWeddingPublic(client.keepWeddingPublic !== undefined ? client.keepWeddingPublic : true);
                            setShowEditClientModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg inline-block transition cursor-pointer"
                          title="Edit Detil Akun"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSuspendClient(client)}
                          className={`p-1.5 rounded-lg inline-block transition cursor-pointer ${
                            client.status === "suspended" 
                              ? "text-emerald-600 hover:bg-emerald-50" 
                              : "text-amber-600 hover:bg-amber-50"
                          }`}
                          title={client.status === "suspended" ? "Unsuspend Klien" : "Suspend Klien"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClientClick(client.id, client.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg inline-block transition cursor-pointer"
                          title="Hapus Klien Permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* B. TEMPLATES MANAGEMENT PANEL */}
      {activeSubTab === "templates" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-800">B. Preset Templates Management</h2>
              <p className="text-xs text-slate-500">Tambah modifikasi template bawaan, toggle status ketersediaan template, serta atur lisensi Premium vs Free secara instan.</p>
            </div>
            
            <button
              onClick={() => {
                setTemplateFormName("");
                setTemplateFormTheme("");
                setTemplateFormDesc("");
                setTemplateFormIsPremium(false);
                setShowAddTemplateModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white transition-all font-bold text-xs rounded-xl cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              Menambahkan Preset Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            {templates.map((tpl) => (
              <div 
                key={tpl.id} 
                className={`rounded-2xl border p-5 space-y-4 relative flex flex-col justify-between ${
                  tpl.isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"
                }`}
              >
                {/* Upper card info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${
                      tpl.isPremium ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {tpl.isPremium ? "PREMIUM ARCH" : "FREE STANDARD"}
                    </span>

                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                      tpl.isActive ? "bg-emerald-500" : "bg-slate-400"
                    }`} title={tpl.isActive ? "Aktif" : "Nonaktif"} />
                  </div>

                  <h3 className="font-serif font-bold text-slate-800 text-sm leading-tight">{tpl.name}</h3>
                  <code className="text-[10px] text-rose-500 font-mono block">Class: {tpl.theme}</code>
                  <div className="w-full aspect-[4/3] rounded-xl bg-slate-50 border border-slate-100 overflow-hidden relative">
                    <ThemeIllustration themeSlug={tpl.theme} />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{tpl.description}</p>
                </div>

                {/* Footer action buttons */}
                <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between font-sans">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleTemplateActive(tpl)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        tpl.isActive 
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700" 
                          : "bg-emerald-500 hover:bg-emerald-600 text-white"
                      }`}
                    >
                      {tpl.isActive ? "Non-Aktifkan" : "Aktifkan"}
                    </button>
                    <button
                      onClick={() => handleToggleTemplatePremium(tpl)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                        tpl.isPremium 
                          ? "border-amber-250 bg-amber-50 text-amber-800" 
                          : "border-slate-200 hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      {tpl.isPremium ? "Set Gratis" : "Set Premium"}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Hapus Preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. GLOBAL FEATURE TOGGLES PANEL */}
      {activeSubTab === "features" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-800">C. Central Feature Toggle System</h2>
            <p className="text-xs text-slate-500">Kendali global untuk menghidupkan atau mematikan modul-modul undangan tertentu bagi seluruh klien di platform.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
            {Object.keys(featureToggles).map((fKeyString) => {
              const fKey = fKeyString as keyof GlobalFeatureToggles;
              const titleNormal = fKey.replace(/([A-Z])/g, " $1");
              const isEnabled = featureToggles[fKey];
              return (
                <div 
                  key={fKey} 
                  className={`border rounded-2xl p-4 flex items-center justify-between transition-all duration-300 ${
                    isEnabled ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50/50 border-slate-150 opacity-70"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 font-serif capitalize">
                      {titleNormal}
                    </span>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {isEnabled ? "Aktif untuk semua klien" : "Dinonaktifkan oleh administrator"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFeature(fKey)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-yellow-500" : "bg-slate-250"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* D. LOG SYSTEM PANEL */}
      {activeSubTab === "logs" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-slate-800">D. Activity Logging System</h2>
              <p className="text-xs text-slate-500">Mengaudit aktivitas draf klien, manipulasi draf wedding, kegagalan login, serta ekspor file kustom lainnya.</p>
            </div>

            <button
              onClick={() => {
                if (confirm("Apakah Anda yakin ingin menghapus seluruh jejak riwayat log platform?")) {
                  onClearLogs();
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 transition font-bold text-xs rounded-xl cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Bersihkan Seluruh Jejak Log
            </button>
          </div>

          {/* Table search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Cari kata kunci aktivitas..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wide">Filter Status:</span>
              <select
                value={logFilterStatus}
                onChange={(e) => setLogFilterStatus(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
              >
                <option value="ALL">Semua Jenis Log</option>
                <option value="SUKSES">Hanya SUKSES</option>
                <option value="GAGAL">Hanya GAGAL</option>
                <option value="INFO">Hanya INFO</option>
              </select>
            </div>
          </div>

          {/* Render table logs */}
          <div className="overflow-x-auto border border-slate-105 rounded-xl">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[9px] text-slate-500 tracking-wider font-mono">
                  <th className="p-3">WAKTU (ZULU-LOC)</th>
                  <th className="p-3">LOGGED USER</th>
                  <th className="p-3">KATEGORI EVENT</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">DESKRIPSI AKTIVITAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px] font-mono">
                {logs
                  .filter(l => {
                    const matchSearch = l.activity.toLowerCase().includes(logSearch.toLowerCase()) || 
                                        l.description.toLowerCase().includes(logSearch.toLowerCase());
                    const matchStatus = logFilterStatus === "ALL" || l.status === logFilterStatus;
                    return matchSearch && matchStatus;
                  })
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-400">{log.timestamp}</td>
                      <td className="p-3 text-slate-700 font-bold">{log.userName}</td>
                      <td className="p-3 font-sans font-semibold text-slate-800">{log.activity}</td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          log.status === "SUKSES" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : log.status === "GAGAL" 
                            ? "bg-rose-50 text-rose-700" 
                            : "bg-blue-50 text-blue-700"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-sans leading-relaxed">{log.description}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* E. STORAGE MANAGEMENT PANEL */}
      {activeSubTab === "storage" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-800">E. Storage & Media Management</h2>
            <p className="text-xs text-slate-500">Memonitor total okupasi media lokal, kompresi berkas unggahan, serta audit foto galeri pengantin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            
            {/* Storage visual progress bar */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">VIRTUAL STORAGE RATIO</span>
              <div className="font-serif text-slate-850">
                <span className="text-2xl font-black">{totalStorageValue.toFixed(2)}</span>
                <span className="text-xs text-slate-500 ml-1">MB terpakai dari 500 MB</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-slate-900 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (totalStorageValue / 500) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">Sistem me-load audio, foto, dan QRIS dalam bentuk string bas64 terkompresi secara ringan sehingga loading tetap responsif &amp; ringan.</p>
            </div>

            {/* Storage optimizer metadata card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">IMAGE COMPRESSION OPTIMIZER</span>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 leading-none">Auto Compression: AKTIF</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">Setiap draf foto atau thumbnail yang diunggah oleh klien divalidasi dan di-compress hingga berukuran maksimal &lt; 250kb demi kestabilan.</p>
              <div className="pt-2">
                <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold">SMART OPTIMIZED</span>
              </div>
            </div>

            {/* Live active stats */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">MEDIA MONITORING STATS</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-450 text-[10px] block">TOTAL AUDIO:</span>
                  <span className="font-bold text-slate-800">{storageFiles.filter(f => f.fileType === "music").length} File</span>
                </div>
                <div>
                  <span className="text-slate-450 text-[10px] block">FOTO GALERI:</span>
                  <span className="font-bold text-slate-800">{storageFiles.filter(f => f.fileType === "photo").length} Berkas</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Media diurus otomatis, admin bisa bersih-bersih jika kuota penuh.</p>
            </div>

          </div>

          {/* Files List Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest font-mono">Daftar Berkas Unggahan Sistem</h3>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9px] text-slate-500 tracking-wider font-mono">
                    <th className="p-3">DESKRIPSI BERKAS</th>
                    <th className="p-3">KATEGORI NYATA</th>
                    <th className="p-3">UKURAN SEBENARNYA</th>
                    <th className="p-3">TANGGAL UNGGAH</th>
                    <th className="p-3 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {storageFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{file.fileName}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] uppercase font-mono font-bold">
                          {file.fileType}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{file.fileSize}</td>
                      <td className="p-3 font-mono text-slate-450">{file.uploadDate}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus berkas "${file.fileName}" dari penyimpanan permanen?`)) {
                              onDeleteStorageFile(file.id);
                              addLog(currentUser, "Storage File Trash", "SUKSES", `Menghapus file cache "${file.fileName}" (${file.fileSize}) dari database.`);
                            }
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Hapus Media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* F. ANALYTICS & STATS PANEL */}
      {activeSubTab === "analytics" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-800">F. Live Share &amp; Platform Visitor Analytics</h2>
            <p className="text-xs text-slate-500">Melihat statistik komprehensif kehadiran RSVP tamu, klik sebaran, perangkat pembaca undangan, serta rekapitulasi data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            
            {/* Analytics left col */}
            <div className="space-y-4">
              <div className="border border-slate-100 rounded-2xl p-5 space-y-4 bg-slate-50/40">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Visitor Metrics Overview</span>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Total Share Undangan</span>
                      <span className="font-bold">1,482 Clicks</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-slate-900 h-1.5 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Total Tamu Mengisi RSVP</span>
                      <span className="font-bold">428 Responses</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: "52%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-700 mb-1">
                      <span>Total Active Invitations</span>
                      <span className="font-bold">{clients.filter(c => c.status === "active").length} Aktif</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Devices overview chart (Hgh Fidelity Flex progress indicators) */}
            <div className="border border-slate-105 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Device Access Distribution</span>
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span className="font-semibold text-slate-800">Mobile Smartphone (iOS/Android)</span>
                    <span className="font-mono text-slate-500">88% (1.3K hits)</span>
                  </div>
                  <div className="w-full bg-slate-105 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span className="font-semibold text-slate-800">Tablet / Pad</span>
                    <span className="font-mono text-slate-500">7% (110 hits)</span>
                  </div>
                  <div className="w-full bg-slate-105 rounded-full h-2">
                    <div className="bg-slate-400 h-2 rounded-full" style={{ width: "7%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span className="font-semibold text-slate-800">Desktop / Laptop PCs</span>
                    <span className="font-mono text-slate-500">5% (72 hits)</span>
                  </div>
                  <div className="w-full bg-slate-105 rounded-full h-2">
                    <div className="bg-slate-305 h-2 rounded-full" style={{ width: "5%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* MAINTENANCE MANUAL HARD DATA RESET & CLEANUP */}
            <div className="border border-red-200 rounded-3xl p-6 bg-red-50/20 col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-650 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-sm text-red-950">EVOVA Pusaka Data Reset &amp; Pembersihan Agensi (Production Ready)</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Menghapus seluruh akun klien, draf pernikahan, live RSVP, doa restu ucapan, galeri media, dan metadata dummy secara rekursif dari Cloud Firestore &amp; LocalStorage agar platform benar-benar kosong, bersih, dan siap pakai.
                  </p>
                </div>
              </div>
              
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("PENTING: Apakah Anda benar-benar yakin ingin melakukan RESET DATA GLOBAL? Tindakan ini akan menghapus semua klien di database Cloud Firestore, semua RSVP & doa restu secara permanen. Akun Superadmin akan tetap dipertahankan.")) {
                      const confirmationValue = prompt("Untuk mengonfirmasi hard reset, ketik 'RESET-EVOVA' di bawah:");
                      if (confirmationValue === "RESET-EVOVA" || confirmationValue === "'RESET-EVOVA'") {
                         onUpdateClients([]);
                         onClearLogs();
                         triggerToast("System Reset Berhasil! Sistem EVOVA sekarang benar-benar bersih & siap production.", "success");
                      } else {
                         triggerToast("Konfirmasi batal. Teks konfirmasi salah.", "error");
                      }
                    }
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-850 text-white rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <Trash className="w-4 h-4" />
                  <span>Pembersihan Agensi &amp; Reset Firestore</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========== MODALS ========== */}

      {/* 1. ADD CLIENT MODAL */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-md space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-slate-800 text-lg">Mendaftarkan Akun Klien Baru</h3>
              <button 
                onClick={() => setShowAddClientModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateClientSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Nama Klien Utama</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Ali &amp; Fatimah Wedding"
                  value={clientFormName}
                  onChange={(e) => setClientFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Alamat Email Klien</label>
                <input 
                  type="email" 
                  placeholder="klien@gmail.com"
                  value={clientFormEmail}
                  onChange={(e) => setClientFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Username Login</label>
                  <input 
                    type="text" 
                    required
                    placeholder="alifatimah"
                    value={clientFormUsername}
                    onChange={(e) => setClientFormUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Password Utama</label>
                  <input 
                    type="password" 
                    required
                    placeholder="Minimal 6 karakter"
                    value={clientFormPassword}
                    onChange={(e) => setClientFormPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Wedding Slug (Link Permanen)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: ali-fatimah (Biarkan kosong untuk auto-generate)"
                  value={clientFormSlug}
                  onChange={(e) => setClientFormSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Visibilitas Undangan</label>
                  <select
                    value={clientFormVisibility}
                    onChange={(e) => setClientFormVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none"
                  >
                    <option value="public">🌍 Public (Akses Umum)</option>
                    <option value="private">🔒 Private (Hanya Owner/Draf)</option>
                    <option value="suspended">🚫 Suspended (Ditangguhkan)</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end pb-1 text-[10px] text-slate-500 font-semibold">
                  <label className="font-bold text-slate-600 block text-xs mb-1.5">Akses Saat Suspended</label>
                  <label className="relative inline-flex items-center cursor-pointer gap-2 select-none">
                    <input 
                      type="checkbox" 
                      checked={clientFormKeepWeddingPublic} 
                      onChange={(e) => setClientFormKeepWeddingPublic(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                    />
                    <span>Tetap aktif di publik</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Status Akun Klien</label>
                <select
                  value={clientFormStatus}
                  onChange={(e) => setClientFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none"
                >
                  <option value="active">Active (Langsung Online)</option>
                  <option value="inactive">Inactive (Hanya Draft Internal)</option>
                  <option value="suspended">Suspended (Ditangguhkan Sementara)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-yellow-500 hover:bg-yellow-650 text-black font-black rounded-xl text-xs transition-all cursor-pointer shadow-sm"
                >
                  Daftarkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT CLIENT MODAL */}
      {showEditClientModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-sm space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-slate-800 text-lg">Modifikasi Detail Klien</h3>
              <button 
                onClick={() => setShowEditClientModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEditClientSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Nama Klien</label>
                <input 
                  type="text" 
                  required
                  value={clientFormName}
                  onChange={(e) => setClientFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Email</label>
                <input 
                  type="email" 
                  required
                  value={clientFormEmail}
                  onChange={(e) => setClientFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Username Login</label>
                <input 
                  type="text" 
                  required
                  value={clientFormUsername}
                  onChange={(e) => setClientFormUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Password Baru (Biarkan kosong jika tetap)</label>
                <input 
                  type="password" 
                  placeholder="Ketik password baru jika ingin diubah"
                  value={clientFormPassword}
                  onChange={(e) => setClientFormPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Wedding Slug (Link Permanen)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: ali-fatimah (Biarkan kosong untuk auto-generate)"
                  value={clientFormSlug}
                  onChange={(e) => setClientFormSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">Visibilitas Undangan</label>
                  <select
                    value={clientFormVisibility}
                    onChange={(e) => setClientFormVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none"
                  >
                    <option value="public">🌍 Public (Akses Umum)</option>
                    <option value="private">🔒 Private (Hanya Owner)</option>
                    <option value="suspended">🚫 Suspended (Ditangguhkan)</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end pb-1 text-[10px] text-slate-500 font-semibold">
                  <label className="font-bold text-slate-600 block text-xs mb-1.5">Akses Saat Suspended</label>
                  <label className="relative inline-flex items-center cursor-pointer gap-2 select-none">
                    <input 
                      type="checkbox" 
                      checked={clientFormKeepWeddingPublic} 
                      onChange={(e) => setClientFormKeepWeddingPublic(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                    />
                    <span>Tetap aktif di publik</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Status Klien</label>
                <select
                  value={clientFormStatus}
                  onChange={(e) => setClientFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none"
                >
                  <option value="active">Active (Online)</option>
                  <option value="inactive">Inactive (Hanya Draft)</option>
                  <option value="suspended">Suspended (Ditangguhkan)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditClientModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 text-white hover:bg-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD TEMPLATE MODAL */}
      {showAddTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-sm space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-black text-slate-800 text-lg">Tambah Preset Template</h3>
              <button 
                onClick={() => setShowAddTemplateModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Nama Preset Template</label>
                <input 
                  type="text" 
                  required
                  placeholder="Misal: Royal Crimson Imperial"
                  value={templateFormName}
                  onChange={(e) => setTemplateFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Theme Class Identifier (e.g. theme-...)</label>
                <input 
                  type="text" 
                  required
                  placeholder="theme-royal-red-imperial"
                  value={templateFormTheme}
                  onChange={(e) => setTemplateFormTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">Penjelasan &amp; Informasi Singkat</label>
                <textarea 
                  placeholder="Keterangan estetika keindahan template kustom"
                  value={templateFormDesc}
                  onChange={(e) => setTemplateFormDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="tplIsPremium"
                  checked={templateFormIsPremium}
                  onChange={(e) => setTemplateFormIsPremium(e.target.checked)}
                  className="rounded text-yellow-500 font-bold focus:ring-yellow-500"
                />
                <label htmlFor="tplIsPremium" className="font-bold text-slate-700 leading-none select-none">Atur Sebagai Template Premium / Berbayar</label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTemplateModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Buat Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern, high-contrast, non-blocking toast overlay */}
      {localToast && (
        <div 
          className="fixed bottom-6 right-6 z-[9999] p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold max-w-sm transition-all duration-300 animate-slide-up"
          style={{
            contentVisibility: "auto",
            backgroundColor: localToast.type === "success" ? "#ecfdf5" : localToast.type === "error" ? "#fef2f2" : "#eff6ff",
            borderColor: localToast.type === "success" ? "#10b981" : localToast.type === "error" ? "#ef4444" : "#3b82f6",
            color: localToast.type === "success" ? "#065f46" : localToast.type === "error" ? "#991b1b" : "#1e40af"
          }}
        >
          <span>{localToast.type === "success" ? "✅" : localToast.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="flex-1 leading-relaxed">{localToast.message}</span>
          <button 
            type="button"
            onClick={() => setLocalToast(null)} 
            className="font-bold hover:scale-105 active:scale-95 transition cursor-pointer ml-1 p-0.5"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
}
