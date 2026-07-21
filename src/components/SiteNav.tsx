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
  Home,
  Newspaper,
  ShoppingBag,
  Megaphone,
  AlertTriangle,
  Users,
  Wrench,
  Map,
  Bot,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useThemePreference } from "@/lib/local-actions";
import { useNotifications } from "@/lib/notifications";
import { timeAgo } from "@/lib/store";
import { languageOptions, useVillagePreferences, type Language } from "@/lib/village-preferences";
import { getRoleDisplayName } from "@/lib/supabase/auth";
import { InstallAppButton } from "@/components/InstallAppButton";

const navLinks = [
  { to: "/", key: "home", icon: Home, label: "Home" },
  { to: "/workers", key: "workers", icon: Users, label: "Workers" },
  { to: "/land", key: "land", icon: Map, label: "Land" },
  { to: "/marketplace", key: "marketplace", icon: ShoppingBag, label: "Market" },
  { to: "/services", key: "services", icon: Wrench, label: "Services" },
  { to: "/problems", key: "problems", icon: AlertTriangle, label: "Problems" },
  { to: "/announcements", key: "notices", icon: Megaphone, label: "Notices" },
  { to: "/timeline", key: "timeline", icon: Newspaper, label: "Timeline" },
  { to: "/ai-assistant", key: "ai", icon: Bot, label: "AI Help" },
] as const;

// Bottom dock tabs — shown on mobile
const dockTabs = [
  { to: "/", key: "home", icon: Home, label: "Home", exact: true },
  { to: "/problems", key: "problems", icon: AlertTriangle, label: "Problems", exact: false },
  { to: "/announcements", key: "notices", icon: Megaphone, label: "Notices", exact: false },
  { to: "/marketplace", key: "marketplace", icon: ShoppingBag, label: "Market", exact: false },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, role, signOut, profile: authProfile } = useAuth();
  const { language, setLanguage, t, profile, weather } = useVillagePreferences();
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

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
        setOpen(false);
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

  const focusSearch = () => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate({ to: "/" });
      window.setTimeout(() => document.getElementById("hero-search")?.focus(), 120);
      return;
    }
    document.getElementById("hero-search")?.focus();
  };

  const openNotifications = () => {
    setNotificationsOpen((v) => !v);
    setLanguageOpen(false);
    setUserMenuOpen(false);
  };
  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-[9999] border-b border-[#dfeae2]/80 bg-[#f7fbf2]/95 text-foreground shadow-sm transition-all duration-300 backdrop-blur-2xl dark:bg-zinc-950/95 dark:border-zinc-800/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">

        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="grid size-8.5 place-items-center rounded-xl bg-white dark:bg-zinc-900 shadow-sm shrink-0 overflow-hidden border border-primary/25">
            <img src="/logo.png" alt="ManaOoru Emblem" className="size-full object-cover" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight shrink-0 text-clay dark:text-zinc-100">
            ManaOoru
          </span>
        </Link>

        {/* Desktop Nav Links — visible from lg (1024px) */}
        <div className="hidden lg:flex items-center gap-0.5 text-xs font-bold flex-1 justify-center text-muted-foreground dark:text-zinc-400">
          {navLinks.slice(0, 7).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="whitespace-nowrap rounded-lg px-2.5 py-1.5 transition-all hover:bg-primary/10 hover:text-primary dark:hover:text-emerald-400"
              activeProps={{
                className: "text-primary font-black bg-primary/10 dark:text-emerald-400",
              }}
            >
              {t[l.key] ?? l.label}
            </Link>
          ))}
        </div>

          {/* Right side icons */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

            {/* Weather pill — md+ */}
            <Link
              to="/weather"
              className="hidden md:inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-xs font-bold text-foreground shadow-sm transition shrink-0 hover:border-primary hover:text-primary dark:bg-zinc-900 dark:border-zinc-700"
              title="Live Village Weather"
            >
              <span>☀️</span>
              <span>{weather.temp != null ? `${weather.temp}°C` : "31°C"}</span>
              <span className="hidden xl:inline text-[10px] opacity-80 max-w-[70px] truncate">
                {profile.village || ""}
              </span>
            </Link>

            {/* Search — lg+ */}
            <button
              onClick={focusSearch}
              className="hidden lg:grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary hover:text-primary dark:bg-zinc-900"
              aria-label="Search"
            >
              <Search className="size-4" />
            </button>

            {/* Language selector */}
            <div className="nav-menu-container relative">
              <button
                onClick={() => { setLanguageOpen((v) => !v); setUserMenuOpen(false); setNotificationsOpen(false); }}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-full border border-border bg-card px-2 text-xs font-semibold text-foreground shadow-sm transition hover:border-primary hover:text-primary dark:bg-zinc-900"
                aria-label="Language"
              >
                <Globe2 className="size-3.5 shrink-0" />
                <span className="hidden sm:inline font-bold">
                  {languageOptions.find((i) => i.code === language)?.label}
                </span>
              </button>
              <AnimatePresence>
                {languageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 z-[99999] mt-2 w-36 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 shadow-xl"
                  >
                    {languageOptions.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => chooseLanguage(item.code)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 transition hover:bg-primary/10 hover:text-primary"
                      >
                        {item.label}
                        {item.code === language && <Check className="size-3.5 text-primary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications — only when signed in */}
            {user && (
              <div className="nav-menu-container relative">
                <button
                  type="button"
                  onClick={openNotifications}
                  className="relative grid size-8 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:border-primary hover:text-primary dark:bg-zinc-900"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 py-0.5 text-[9px] font-black leading-none text-white ring-2 ring-white dark:ring-zinc-950">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 z-[99999] mt-2 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 p-3">
                        <div>
                          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Notifications</p>
                          <p className="text-xs text-zinc-500">
                            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          {unreadCount > 0 && (
                            <button onClick={() => markAllRead()} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                              Mark read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button onClick={() => clearAll()} className="rounded-full border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs font-bold text-zinc-500 hover:text-destructive">
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[50vh] overflow-y-auto p-1.5">
                        {notificationsLoading ? (
                          <p className="p-4 text-center text-sm text-zinc-500">Loading…</p>
                        ) : notifications.length === 0 ? (
                          <div className="p-5 text-center">
                            <Bell className="mx-auto size-8 text-muted-foreground/40" />
                            <p className="mt-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((item) => (
                            <div
                              key={item.id}
                              className={`group flex gap-2.5 rounded-xl p-2.5 transition hover:bg-primary/5 ${item.read_at ? "opacity-60" : "bg-primary/5"}`}
                            >
                              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.read_at ? "bg-border" : "bg-red-500"}`} />
                              <button
                                type="button"
                                onClick={() => { markRead(item.id); if (item.action_url) window.location.assign(item.action_url); }}
                                className="min-w-0 flex-1 text-left"
                              >
                                <span className="block truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.title}</span>
                                <span className="mt-0.5 line-clamp-2 block text-xs text-zinc-500">{item.body}</span>
                                <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-primary/60">
                                  {timeAgo(new Date(item.created_at).getTime())}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteNotification(item.id)}
                                className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <Link
                        to="/announcements"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-center justify-center border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5"
                      >
                        View all notices
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User avatar / Sign in */}
            {user ? (
              <div className="nav-menu-container relative">
                <button
                  type="button"
                  onClick={() => { setUserMenuOpen((v) => !v); setLanguageOpen(false); setNotificationsOpen(false); }}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-white dark:bg-zinc-900 px-2 text-xs font-semibold text-foreground shadow-sm transition max-w-[120px] sm:max-w-[160px] hover:border-primary"
                >
                  {authProfile?.photo_url ? (
                    <img src={authProfile.photo_url} alt="" className="size-5 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="size-3" />
                    </div>
                  )}
                  <span className="truncate font-bold hidden sm:block">
                    {authProfile?.full_name?.split(" ")[0] || (role ? getRoleDisplayName(role) : "User")}
                  </span>
                  <ChevronDown className="size-3 shrink-0 hidden sm:block" style={{ transform: userMenuOpen ? "rotate(180deg)" : "none" }} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.14 }}
                      className="absolute right-0 z-[99999] mt-2 w-52 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 shadow-xl"
                    >
                      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {authProfile?.full_name || user.email?.split("@")[0]}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate">{user.email || user.phone}</p>
                        <span className="mt-1 inline-block rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          {getRoleDisplayName(role)}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-primary/10 hover:text-primary transition"
                      >
                        <UserRound className="size-3.5" /> Profile &amp; Role
                      </Link>
                      <InstallAppButton variant="menuItem" className="rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-primary/10 hover:text-primary transition" />
                      {(role === "village_admin" || role === "super_admin") && (
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-primary/10 hover:text-primary transition"
                        >
                          <LayoutDashboard className="size-3.5" /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); signOut(); }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition mt-1"
                      >
                        <LogOut className="size-3.5" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-bold text-primary shadow-sm transition hover:bg-primary hover:text-white dark:bg-primary/20 dark:text-emerald-300"
              >
                <span>Sign in</span>
              </Link>
            )}

            {/* Hamburger — hidden on lg+ */}
            <button
              className="grid size-8 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition lg:hidden dark:bg-zinc-900"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* ── Mobile / Tablet Drawer ─────────────────────────────── */}
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9990] bg-black/40 lg:hidden"
                onClick={() => setOpen(false)}
              />
              {/* Drawer panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                className="fixed right-0 top-0 z-[9998] flex h-full w-[min(300px,85vw)] flex-col bg-white dark:bg-zinc-950 shadow-2xl lg:hidden overflow-y-auto"
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between border-b border-border dark:border-zinc-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="grid size-7 place-items-center rounded-[10px] bg-[var(--gradient-village)] text-white">
                      <Leaf className="size-4" />
                    </div>
                    <span className="font-display font-bold text-clay dark:text-zinc-100">ManaOoru</span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Nav links */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                  {navLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: l.to === "/" }}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition hover:bg-primary/10 hover:text-primary dark:text-zinc-200"
                      activeProps={{ className: "bg-primary text-primary-foreground font-black" }}
                    >
                      <l.icon className="size-4 shrink-0" />
                      {t[l.key] ?? l.label}
                    </Link>
                  ))}
                </div>

                {/* Dark mode + Language */}
                <div className="border-t border-border dark:border-zinc-800 px-3 py-3 space-y-2">
                  {/* Dark mode */}
                  <div className="flex items-center justify-between rounded-xl border border-border dark:border-zinc-800 bg-muted/40 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {darkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-indigo-400" />}
                      <span className="text-xs font-bold text-foreground dark:text-zinc-200">
                        {darkMode ? "Light Mode" : "Dark Mode"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${darkMode ? "bg-primary" : "bg-muted"}`}
                    >
                      <span className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition ${darkMode ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>

                  {/* Language */}
                  <div className="rounded-xl border border-border dark:border-zinc-800 bg-muted/40 p-2.5">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Globe2 className="size-3.5" /> Language / భాష
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {languageOptions.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => { setLanguage(item.code); setOpen(false); }}
                          className={`rounded-lg border py-1.5 text-xs font-bold transition ${
                            item.code === language
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border dark:border-zinc-700 text-foreground dark:text-zinc-200 hover:border-primary"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <InstallAppButton variant="drawer" />
                </div>

                {/* User section */}
                <div className="border-t border-border dark:border-zinc-800 px-3 py-3">
                  {user ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                        <div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-foreground dark:text-zinc-100">
                            {authProfile?.full_name || user.email?.split("@")[0]}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">{profile.village || "No village"}</p>
                        </div>
                      </div>
                      {(role === "village_admin" || role === "super_admin") && (
                        <Link to="/official" onClick={() => setOpen(false)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">
                          <ShieldCheck className="size-4" /> Admin Portal
                        </Link>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Link to="/dashboard" onClick={() => setOpen(false)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-border dark:border-zinc-700 py-2 text-xs font-bold text-clay dark:text-zinc-200">
                          <LayoutDashboard className="size-3.5 text-blue-600" /> Dashboard
                        </Link>
                        <Link to="/profile" onClick={() => setOpen(false)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-border dark:border-zinc-700 py-2 text-xs font-bold text-clay dark:text-zinc-200">
                          <UserRound className="size-3.5 text-amber-600" /> Profile
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => { signOut(); setOpen(false); }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 px-4 py-2.5 text-xs font-bold text-red-700 dark:text-red-300"
                      >
                        <LogOut className="size-3.5" /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-primary px-4 py-3 text-sm font-bold text-white"
                    >
                      <UserRound className="size-4" /> {t.signIn || "Sign In / Register"}
                    </Link>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Mobile Bottom Dock ─────────────────────────────────────── */}
      {/* Safe, separate from footer, fixed at viewport bottom */}
      <div className="fixed bottom-0 inset-x-0 z-[9995] lg:hidden">
        <div className="border-t border-border/80 bg-white/97 dark:bg-zinc-950/97 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-around px-2 py-1.5 safe-area-pb">
            {dockTabs.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                activeOptions={{ exact: tab.exact }}
                className="flex flex-col items-center gap-0.5 min-w-0 flex-1 px-1 py-1 text-[10px] font-bold text-muted-foreground transition-colors"
                activeProps={{ className: "text-primary" }}
              >
                <tab.icon className="size-5" />
                <span className="truncate">{tab.label}</span>
              </Link>
            ))}
            {/* Menu button — opens drawer */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex flex-col items-center gap-0.5 min-w-0 flex-1 px-1 py-1 text-[10px] font-bold text-muted-foreground transition-colors hover:text-primary"
            >
              <Menu className="size-5" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-white/60 dark:bg-zinc-950/80 backdrop-blur-xl">
      {/* Footer content */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr_0.7fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full overflow-hidden border border-primary/30 shadow-sm shrink-0 bg-white">
              <img src="/logo.png" alt="ManaOoru Emblem" className="size-full object-cover" />
            </div>
            <span className="font-display text-base font-bold text-clay dark:text-zinc-100">ManaOoru</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            A trusted digital village platform for workers, land, services, markets, notices, and community support.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-clay dark:text-zinc-200">About &amp; Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-primary transition">Terms of Service</Link></li>
            <li><Link to="/delete-account" className="hover:text-red-600 transition font-medium text-red-600/80">Delete Account</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-clay dark:text-zinc-200">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/workers" className="hover:text-primary transition">Find workers</Link></li>
            <li><Link to="/land" className="hover:text-primary transition">Lease land</Link></li>
            <li><Link to="/marketplace" className="hover:text-primary transition">Marketplace</Link></li>
            <li><Link to="/dealer-registration" className="hover:text-primary transition">Dealer Storefronts</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-clay dark:text-zinc-200">Emergency</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Ambulance: 108</li>
            <li>Police: 100</li>
            <li>Health Center</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-clay dark:text-zinc-200">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>privacy@manaooru.org</li>
            <li>hello@manaooru.org</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} ManaOoru · Built for our villages.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/" className="hover:text-primary transition">Home</Link>
            <Link to="/announcements" className="hover:text-primary transition">Notices</Link>
            <Link to="/privacy" className="hover:text-primary transition">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition">Terms</Link>
          </div>
        </div>
      </div>
      {/* Bottom dock spacer on mobile — so content isn't hidden behind dock */}
      <div className="h-14 lg:hidden" aria-hidden="true" />
    </footer>
  );
}
