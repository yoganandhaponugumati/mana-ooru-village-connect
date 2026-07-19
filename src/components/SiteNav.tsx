import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Check,
  ChevronDown,
  Globe2,
  Leaf,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  X,
  Trash2,
  LayoutDashboard,
  Sun,
  Moon,
  CloudSun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useThemePreference } from "@/lib/local-actions";
import { useNotifications } from "@/lib/notifications";
import { timeAgo } from "@/lib/store";
import { languageOptions, useVillagePreferences, type Language } from "@/lib/village-preferences";
import { getRoleDisplayName } from "@/lib/supabase/auth";
import { InstallAppButton } from "@/components/InstallAppButton";
const links = [
  { to: "/", key: "home" },
  { to: "/timeline", key: "timeline" },
  { to: "/workers", key: "workers" },
  { to: "/land", key: "land" },
  { to: "/marketplace", key: "marketplace" },
  { to: "/services", key: "services" },
  { to: "/problems", key: "problems" },
  { to: "/announcements", key: "notices" },
  { to: "/weather", key: "weather" },
  { to: "/ai-assistant", key: "ai", wide: true },
] as const;

const headerLinks = [
  { to: "/", key: "home" },
  { to: "/timeline", key: "timeline" },
  { to: "/workers", key: "workers" },
  { to: "/land", key: "land" },
  { to: "/marketplace", key: "marketplace" },
  { to: "/services", key: "services" },
  { to: "/problems", key: "problems" },
  { to: "/announcements", key: "notices" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, signOut, profile: authProfile } = useAuth();
  const { language, setLanguage, t, profile, weather, hasProfile } = useVillagePreferences();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const { darkMode, setDarkMode } = useThemePreference();
  const location = useLocation();
  const navigate = useNavigate();
  const isHeroTop = location.pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".nav-menu-container")) {
        setUserMenuOpen(false);
        setLanguageOpen(false);
        setNotificationsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setLanguageOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const chooseLanguage = (next: Language) => {
    setLanguage(next);
    setLanguageOpen(false);
  };

  const chooseMobileLanguage = (next: Language) => {
    setLanguage(next);
    setLanguageOpen(false);
    setOpen(false);
  };

  const focusSearch = () => {
    if (location.pathname !== "/") {
      navigate({ to: "/" });
      window.setTimeout(() => document.getElementById("hero-search")?.focus(), 120);
      return;
    }
    document.getElementById("hero-search")?.focus();
  };

  const openNotifications = () => {
    setNotificationsOpen((value) => !value);
    setLanguageOpen(false);
  };

  const selectedVillage = user && hasProfile && profile.village ? profile.village : "";
  const weatherText = selectedVillage
    ? weather.live && weather.temp !== null
      ? `${weather.temp}°C`
      : "Live weather"
    : "Select village";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[9999] border-b transition-all duration-300 ${isHeroTop ? "border-white/15 bg-black/45 text-white shadow-lg" : "border-[#dfeae2]/80 bg-[#f7fbf2]/92 text-foreground shadow-[0_18px_54px_-40px_rgba(20,49,32,0.82)] backdrop-blur-2xl"}`}
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
        <Link to="/" className="group flex shrink-0 items-center gap-2 mr-6 lg:mr-8">
          <motion.div
            whileHover={{ rotate: -4, scale: 1.03 }}
            className="grid size-9 place-items-center rounded-[14px] bg-[var(--gradient-village)] text-white shadow-[var(--shadow-glow)] shrink-0"
          >
            <Leaf className="size-5" />
          </motion.div>
          <span
            className={`font-display text-xl font-bold tracking-tight shrink-0 ${isHeroTop ? "text-white" : "text-clay"}`}
          >
            ManaOoru
          </span>
        </Link>
        <div
          className={`hidden min-w-0 flex-1 items-center justify-center gap-0.5 text-xs font-bold xl:flex xl:gap-1.5 2xl:text-sm ${isHeroTop ? "text-white/90" : "text-muted-foreground"}`}
        >
          {headerLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className={`whitespace-nowrap rounded-xl px-2 py-1 transition-all ${isHeroTop ? "hover:bg-white/15 hover:text-white" : "hover:bg-primary/10 hover:text-primary"}`}
              activeProps={{
                className: isHeroTop
                  ? "text-white font-black bg-white/20 shadow-sm"
                  : "text-primary font-black bg-primary/12 shadow-sm",
              }}
            >
              {t[l.key]}
            </Link>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <div className="nav-menu-container relative block">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setLanguageOpen(false);
                  setNotificationsOpen(false);
                }}
                className={`flex h-10 items-center gap-2 rounded-full border px-3 text-xs font-semibold shadow-sm transition ${
                  isHeroTop
                    ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                    : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {authProfile?.photo_url ? (
                  <img
                    src={authProfile.photo_url}
                    alt=""
                    className="size-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="size-3" />
                  </div>
                )}
                <span className="max-w-[90px] truncate">
                  {authProfile?.full_name ||
                    authProfile?.username ||
                    (role ? getRoleDisplayName(role) : "") ||
                    "User"}
                </span>
                <ChevronDown
                  className="size-3 transition-transform duration-200"
                  style={{ transform: userMenuOpen ? "rotate(180deg)" : "none" }}
                />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 z-[99999] mt-2 w-52 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 text-sm !text-zinc-900 dark:!text-zinc-100 shadow-[0_24px_68px_-12px_rgba(0,0,0,0.75)] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/60 mb-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Village: {profile.village || "Not selected"}
                  </div>
                  {(role === "village_admin" || role === "super_admin") && (
                    <Link
                      to="/official"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200 transition hover:bg-primary/10 hover:text-primary dark:hover:text-emerald-400"
                    >
                      <ShieldCheck className="size-4 text-emerald-600" />{" "}
                      {t.officialWorkspace || "Official Workspace"}
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200 transition hover:bg-primary/10 hover:text-primary dark:hover:text-emerald-400"
                  >
                    <LayoutDashboard className="size-4 text-blue-600" />{" "}
                    {t.dashboard || "Dashboard"}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200 transition hover:bg-primary/10 hover:text-primary dark:hover:text-emerald-400"
                  >
                    <UserRound className="size-4 text-amber-600" />{" "}
                    {t.profileDetails || "Profile Details"}
                  </Link>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/60" />
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                  >
                    <LogOut className="size-4" /> {t.signOut || "Sign out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-primary to-teal-500 px-5 text-sm font-bold text-white shadow-[0_0_20px_rgba(34,197,94,0.5)] ring-2 ring-white/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(34,197,94,0.7)] hover:ring-white/60"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
              <UserRound className="relative z-10 size-4" />
              <span className="relative z-10">{t.signIn}</span>
            </Link>
          )}
          <Link
            to="/weather"
            className={`flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-bold shadow-sm transition ${
              isHeroTop
                ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
            }`}
            title="Live Village Weather"
          >
            <CloudSun className="size-4 text-amber-400" />
            <span>{weather.temp != null ? `${weather.temp}°C` : "31°C"}</span>
            <span className="hidden sm:inline text-[11px] opacity-80 max-w-[80px] truncate">
              {profile.village || "Hyderabad"}
            </span>
          </Link>

          {/* Dark Mode Sun/Moon Toggle Button */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`flex size-10 items-center justify-center rounded-full border shadow-sm transition ${
              isHeroTop
                ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
                : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
            }`}
            aria-label="Toggle Dark Mode"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
          </button>

          <InstallAppButton variant="pill" className="hidden sm:inline-flex" />
          <div className="nav-menu-container relative">
            <button
              onClick={() => setLanguageOpen((value) => !value)}
              className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-2.5 sm:px-3 text-xs font-semibold shadow-sm transition ${isHeroTop ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"}`}
              aria-label="Language selector"
              aria-expanded={languageOpen}
            >
              <Globe2 className="size-4 shrink-0" />
              <span className="inline font-bold">
                {languageOptions.find((item) => item.code === language)?.label}
              </span>
              <ChevronDown className="hidden size-3.5 sm:block shrink-0" />
            </button>
            {languageOpen && (
              <div className="absolute right-0 z-[99999] mt-2 w-40 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 text-sm !text-zinc-900 dark:!text-zinc-100 shadow-[0_24px_68px_-12px_rgba(0,0,0,0.75)] animate-in fade-in slide-in-from-top-2 duration-150">
                {languageOptions.map((item) => (
                  <button
                    key={item.code}
                    onClick={() => chooseLanguage(item.code)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold text-zinc-700 dark:text-zinc-200 transition hover:bg-primary/10 hover:text-primary dark:hover:text-emerald-400"
                  >
                    {item.label}
                    {item.code === language && <Check className="size-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={focusSearch}
            className={`hidden size-10 items-center justify-center rounded-full border shadow-sm transition lg:grid ${isHeroTop ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"}`}
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
          {user && (
            <div className="nav-menu-container relative hidden 2xl:block">
              <button
                type="button"
                onClick={openNotifications}
                className={`relative grid size-10 place-items-center rounded-full border shadow-sm transition ${isHeroTop ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"}`}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black leading-none text-white ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 z-[99999] mt-2 w-[360px] overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 !text-zinc-900 dark:!text-zinc-100 shadow-[0_24px_68px_-12px_rgba(0,0,0,0.75)] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/60 p-4">
                    <div>
                      <p className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {t.notifications || "Notifications"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {unreadCount > 0
                          ? `${unreadCount} unread village update${unreadCount === 1 ? "" : "s"}`
                          : "All caught up"}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllRead()}
                        className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary hover:text-primary-foreground"
                      >
                        {t.markRead || "Mark read"}
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => clearAll()}
                        className="rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 transition hover:border-destructive hover:text-destructive"
                      >
                        {t.clear || "Clear"}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {notificationsLoading ? (
                      <p className="p-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        Loading notifications...
                      </p>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                          <Bell className="size-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          No notifications yet
                        </p>
                        <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                          New posts, notices, problems, services, and market updates will appear
                          here after sign-in.
                        </p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`group flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-primary/8 ${
                            item.read_at ? "opacity-72" : "bg-primary/6"
                          }`}
                        >
                          <span
                            className={`mt-1 size-2.5 shrink-0 rounded-full ${
                              item.read_at ? "bg-border" : "bg-red-500"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              markRead(item.id);
                              if (item.action_url) window.location.assign(item.action_url);
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <span className="block truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {item.title}
                            </span>
                            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                              {item.body}
                            </span>
                            <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-primary/70">
                              {item.type.replaceAll("_", " ")} -{" "}
                              {timeAgo(new Date(item.created_at).getTime())}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteNotification(item.id)}
                            className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    to="/announcements"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-center justify-center border-t border-zinc-100 dark:border-zinc-800/60 px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary/8"
                  >
                    Open village notices
                  </Link>
                </div>
              )}
            </div>
          )}
          <button
            className={`grid size-10 place-items-center rounded-full border shadow-sm xl:hidden ${isHeroTop ? "border-white/25 bg-white/10 text-white" : "border-border bg-white text-foreground"}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60 bg-[#f7fbf2] dark:bg-zinc-950 text-foreground shadow-2xl xl:hidden max-h-[85vh] overflow-y-auto"
          >
            <motion.div
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.03 } },
                closed: {},
              }}
              className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6 space-y-4"
            >
              {/* Home & Quick Links Grid */}
              <div className="grid grid-cols-2 gap-2">
                {links.map((l) => (
                  <motion.div
                    key={l.to}
                    variants={{
                      closed: { opacity: 0, x: -8 },
                      open: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-xl border border-border/60 bg-white dark:bg-zinc-900 px-3 py-2.5 text-xs font-bold text-foreground shadow-sm transition hover:border-primary hover:text-primary active:scale-95"
                      activeProps={{
                        className: "bg-primary text-primary-foreground font-black shadow-md border-primary",
                      }}
                    >
                      {l.key === "home" && "🏠 "}
                      {l.key === "timeline" && "🌐 "}
                      {l.key === "workers" && "👷 "}
                      {l.key === "land" && "🌾 "}
                      {l.key === "marketplace" && "🛒 "}
                      {l.key === "services" && "🛠️ "}
                      {l.key === "problems" && "🚨 "}
                      {l.key === "notices" && "📢 "}
                      {l.key === "weather" && "☀️ "}
                      {l.key === "ai" && "🤖 "}
                      <span className="truncate">{t[l.key]}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Dark Mode Toggle Card in Drawer */}
              <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  {darkMode ? <Sun className="size-5 text-amber-400" /> : <Moon className="size-5 text-indigo-400" />}
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Dark Mode Interface</h4>
                    <p className="text-[10px] text-muted-foreground">Comfortable night viewing</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    darkMode ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      darkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Language Selection Card */}
              <div className="rounded-2xl border border-border/80 bg-white dark:bg-zinc-900 p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    <Globe2 className="size-3.5" /> Select Language / భాష
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Active: {language.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {languageOptions.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => chooseMobileLanguage(item.code)}
                      className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-xs font-bold transition active:scale-95 ${
                        item.code === language
                          ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30"
                          : "border-border/80 bg-muted/40 text-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* App Installation Option */}
              <InstallAppButton variant="drawer" />

              {/* User Account Section */}
              <div className="border-t border-border/60 pt-3">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
                      <UserRound className="size-3.5 text-primary" />
                      <span className="truncate">
                        Signed in as {authProfile?.full_name || user.email?.split("@")[0]}
                      </span>
                    </div>

                    {(role === "village_admin" || role === "super_admin") && (
                      <Link
                        to="/official"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700"
                      >
                        <ShieldCheck className="size-4" />
                        {t.officialWorkspace || "Official Workspace"}
                      </Link>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white dark:bg-zinc-900 px-3 py-2.5 text-xs font-bold text-clay shadow-sm"
                      >
                        <LayoutDashboard className="size-3.5 text-blue-600" />
                        {t.dashboard || "Dashboard"}
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white dark:bg-zinc-900 px-3 py-2.5 text-xs font-bold text-clay shadow-sm"
                      >
                        <UserRound className="size-3.5 text-amber-600" />
                        {t.profileDetails || "Profile"}
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 px-4 py-2.5 text-xs font-bold transition hover:bg-red-100"
                    >
                      <LogOut className="size-3.5" />
                      {t.signOut || "Sign Out"}
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-primary px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
                  >
                    <UserRound className="size-4" />
                    {t.signIn || "Sign In / Register"}
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/60 bg-white/45 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.75fr_0.75fr_0.75fr_0.75fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
              M
            </div>
            <span className="font-display text-lg font-semibold text-clay">ManaOoru</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            A trusted digital village platform for workers, land, services, markets, notices, and
            community support.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-clay">About & Legal</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/privacy" className="transition hover:text-primary">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition hover:text-primary">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link
                to="/delete-account"
                className="transition hover:text-primary font-medium text-red-600/90"
              >
                Delete Account
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-clay">Quick Links</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/workers" className="transition hover:text-primary">
                Find workers
              </Link>
            </li>
            <li>
              <Link to="/land" className="transition hover:text-primary">
                Lease land
              </Link>
            </li>
            <li>
              <Link to="/marketplace" className="transition hover:text-primary">
                Marketplace
              </Link>
            </li>
            <li>
              <Link to="/dealer-registration" className="transition hover:text-primary">
                Dealer Storefronts
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-clay">Emergency</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Ambulance: 108</li>
            <li>Police: 100</li>
            <li>Health Center</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-clay">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>privacy@manaooru.org</li>
            <li>hello@manaooru.org</li>
            <li>+91 98765 43210</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 bg-white/62">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} ManaOoru · Built for our villages.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/" className="transition hover:text-primary">
              Home
            </Link>
            <Link to="/announcements" className="transition hover:text-primary">
              Notices
            </Link>
            <Link to="/privacy" className="transition hover:text-primary">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-primary">
              Terms
            </Link>
            <Link to="/delete-account" className="transition hover:text-primary text-red-600/90">
              Data Wiping
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile Bottom Dock Bar */}
      <div className="fixed bottom-0 inset-x-0 z-[9995] xl:hidden border-t border-border/80 bg-white/95 dark:bg-zinc-950/95 px-2 py-1.5 backdrop-blur-xl shadow-2xl flex items-center justify-around text-foreground">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-muted-foreground transition hover:text-primary"
          activeProps={{ className: "text-primary font-black" }}
        >
          <span className="text-base">🏠</span>
          <span>Home</span>
        </Link>
        <Link
          to="/problems"
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-muted-foreground transition hover:text-primary"
          activeProps={{ className: "text-red-600 font-black" }}
        >
          <span className="text-base">🚨</span>
          <span>Problems</span>
        </Link>
        <Link
          to="/announcements"
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-muted-foreground transition hover:text-primary"
          activeProps={{ className: "text-primary font-black" }}
        >
          <span className="text-base">📢</span>
          <span>Notices</span>
        </Link>
        <Link
          to="/marketplace"
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-muted-foreground transition hover:text-primary"
          activeProps={{ className: "text-teal-600 font-black" }}
        >
          <span className="text-base">🛒</span>
          <span>Market</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-muted-foreground transition hover:text-primary"
        >
          <Menu className="size-4 text-primary" />
          <span>Menu</span>
        </button>
      </div>
    </footer>
  );
}
