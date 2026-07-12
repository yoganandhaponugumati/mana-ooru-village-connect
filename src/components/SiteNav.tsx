import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useThemePreference } from "@/lib/local-actions";
import { useNotifications } from "@/lib/notifications";
import { timeAgo } from "@/lib/store";
import { languageOptions, useVillagePreferences, type Language } from "@/lib/village-preferences";

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

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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
  useThemePreference();
  const location = useLocation();
  const navigate = useNavigate();
  const isHeroTop = location.pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-2xl transition-all duration-300 ${isHeroTop ? "border-white/10 bg-black/12 text-white" : "border-white/80 bg-background/84 text-foreground shadow-[0_18px_54px_-40px_rgba(20,49,32,0.82)]"}`}
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-2">
          <motion.div
            whileHover={{ rotate: -4, scale: 1.03 }}
            className="grid size-9 place-items-center rounded-[14px] bg-[var(--gradient-village)] text-white shadow-[var(--shadow-glow)]"
          >
            <Leaf className="size-5" />
          </motion.div>
          <span
            className={`truncate font-display text-xl font-semibold tracking-tight ${isHeroTop ? "text-white" : "text-clay"}`}
          >
            ManaOoru
          </span>
        </Link>
        <div
          className={`hidden min-w-0 flex-1 items-center justify-center gap-1 text-xs font-semibold xl:flex 2xl:text-sm ${isHeroTop ? "text-white/88" : "text-muted-foreground"}`}
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-[14px] px-2.5 py-2 transition-all 2xl:px-3 ${"wide" in l ? "hidden 2xl:inline-flex" : ""} ${isHeroTop ? "hover:bg-white/10 hover:text-white" : "hover:-translate-y-0.5 hover:bg-primary/8 hover:text-primary"}`}
              activeProps={{
                className: isHeroTop
                  ? "text-white underline decoration-secondary decoration-2 underline-offset-8"
                  : "bg-white/72 text-primary font-semibold shadow-sm ring-1 ring-primary/10",
              }}
            >
              {t[l.key]}
            </Link>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              {(role === "village_admin" || role === "super_admin") && (
                <Link
                  to="/official"
                  className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-sm transition ${isHeroTop ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"}`}
                >
                  <ShieldCheck className="size-3.5" /> Official
                </Link>
              )}
              <Link
                to="/profile"
                className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-sm transition ${isHeroTop ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"}`}
              >
                {authProfile?.photo_url ? (
                  <img
                    src={authProfile.photo_url}
                    alt=""
                    className="size-4 rounded-full object-cover"
                  />
                ) : (
                  <UserRound className="size-3.5" />
                )}
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${isHeroTop ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"}`}
              >
                <LogOut className="size-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex h-10 items-center gap-2 rounded-[15px] bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-12px_rgba(34,197,94,0.9)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <UserRound className="size-4" />
              {t.signIn}
            </Link>
          )}
          <Link
            to="/weather"
            className={`hidden h-10 max-w-52 items-center gap-2 rounded-[15px] border px-3 text-xs font-semibold shadow-sm transition 2xl:inline-flex ${isHeroTop ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-white/80 bg-white/82 text-muted-foreground hover:-translate-y-0.5 hover:border-primary hover:text-primary"}`}
          >
            <span>{weatherText}</span>
            <span className={isHeroTop ? "text-white/70" : "text-muted-foreground"}>
              {selectedVillage || "Choose your village"}
            </span>
          </Link>
          <div className="relative">
            <button
              onClick={() => setLanguageOpen((value) => !value)}
              className={`inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full border px-0 text-xs font-semibold shadow-sm transition lg:w-auto lg:px-3 ${isHeroTop ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"}`}
              aria-label="Language selector"
              aria-expanded={languageOpen}
            >
              <Globe2 className="size-4" />
              <span className="hidden lg:inline">
                {languageOptions.find((item) => item.code === language)?.label}
              </span>
              <ChevronDown className="hidden size-3.5 lg:block" />
            </button>
            <AnimatePresence>
              {languageOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 z-[80] mt-2 w-40 overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-1 text-sm text-foreground shadow-[var(--shadow-lift)] backdrop-blur-xl"
                >
                  {languageOptions.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => chooseLanguage(item.code)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 font-semibold transition hover:bg-primary/10 hover:text-primary"
                    >
                      {item.label}
                      {item.code === language && <Check className="size-4 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={focusSearch}
            className={`hidden size-10 items-center justify-center rounded-full border shadow-sm transition lg:grid ${isHeroTop ? "border-white/25 bg-white/10 text-white hover:bg-white/20" : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"}`}
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>
          {user && (
            <div className="relative hidden 2xl:block">
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
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 z-[90] mt-2 w-[360px] overflow-hidden rounded-3xl border border-white/70 bg-white/96 text-foreground shadow-[var(--shadow-lift)] backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-border/70 p-4">
                      <div>
                        <p className="font-display text-lg font-semibold text-clay">
                          Notifications
                        </p>
                        <p className="text-xs text-muted-foreground">
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
                          Mark read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => clearAll()}
                          className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-destructive hover:text-destructive"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="max-h-[420px] overflow-y-auto p-2">
                      {notificationsLoading ? (
                        <p className="p-5 text-center text-sm text-muted-foreground">
                          Loading notifications...
                        </p>
                      ) : notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                            <Bell className="size-5" />
                          </div>
                          <p className="mt-3 text-sm font-semibold text-clay">
                            No notifications yet
                          </p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
                              <span className="block truncate text-sm font-bold text-clay">
                                {item.title}
                              </span>
                              <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
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
                      className="flex items-center justify-center border-t border-border/70 px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary/8"
                    >
                      Open village notices
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
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
            className="overflow-hidden border-t border-border/60 bg-background/92 shadow-[var(--shadow-soft)] backdrop-blur-2xl lg:hidden"
          >
            <motion.div
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.035 } },
                closed: {},
              }}
              className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6"
            >
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
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {t[l.key]}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 rounded-2xl border border-border/70 bg-white/70 p-2 shadow-sm">
                <div className="mb-2 flex items-center gap-2 px-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  <Globe2 className="size-3.5" />
                  Language
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {languageOptions.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => chooseMobileLanguage(item.code)}
                      className={`inline-flex h-10 items-center justify-center rounded-xl border px-2 text-xs font-bold transition ${
                        item.code === language
                          ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                          : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              {user ? (
                <>
                  {(role === "village_admin" || role === "super_admin") && (
                    <Link
                      to="/official"
                      onClick={() => setOpen(false)}
                      className="mt-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5 text-center text-sm font-semibold text-primary"
                    >
                      Official workspace
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="mt-2 rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="mt-2 rounded-xl border border-border px-3 py-2.5 text-center text-sm font-semibold text-foreground"
                  >
                    Sign out ({user.email?.split("@")[0]})
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  {t.signIn}
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
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
          <p className="text-sm font-semibold text-clay">About</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Community-led marketplace</li>
            <li>Village-first support</li>
            <li>Trusted local connections</li>
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
            <li>hello@manaooru.org</li>
            <li>+91 98765 43210</li>
            <li>Village support desk</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 bg-white/62">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} ManaOoru · Built for our villages.</p>
          <div className="flex gap-4">
            <Link to="/" className="transition hover:text-primary">
              Home
            </Link>
            <Link to="/announcements" className="transition hover:text-primary">
              Notices
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
