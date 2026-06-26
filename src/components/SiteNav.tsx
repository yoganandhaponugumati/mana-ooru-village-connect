import { Link } from "@tanstack/react-router";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/workers", label: "Workers" },
  { to: "/post-work", label: "Post Work" },
  { to: "/land", label: "Land" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/services", label: "Services" },
  { to: "/announcements", label: "Notices" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg font-semibold italic shadow-sm">M</div>
          <span className="font-display text-xl font-semibold tracking-tight text-clay">ManaOoru</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                <UserIcon className="size-3.5" /> {user.email?.split("@")[0]}
              </span>
              <button onClick={() => signOut()} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary">
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="hidden rounded-full bg-clay px-5 py-2 text-sm font-medium text-background transition hover:opacity-90 sm:inline-block">
              Sign in
            </Link>
          )}
          <button
            className="grid size-10 place-items-center rounded-full border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button onClick={() => { signOut(); setOpen(false); }} className="mt-2 rounded-lg border border-border px-3 py-2.5 text-center text-sm font-semibold text-foreground">
                Sign out ({user.email?.split("@")[0]})
              </button>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="mt-2 rounded-lg bg-clay px-3 py-2.5 text-center text-sm font-semibold text-background">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground font-display italic">M</div>
          <span className="font-display text-lg font-semibold text-clay">ManaOoru</span>
        </div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          © {new Date().getFullYear()} ManaOoru · Built for our villages.
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/announcements" className="hover:text-primary">Notices</Link>
        </div>
      </div>
    </footer>
  );
}