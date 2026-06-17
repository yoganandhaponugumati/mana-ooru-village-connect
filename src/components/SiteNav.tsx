import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

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
          <Link
            to="/post-work"
            className="hidden rounded-full bg-clay px-5 py-2 text-sm font-medium text-background transition hover:opacity-90 sm:inline-block"
          >
            + Post
          </Link>
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
            <Link
              to="/post-work"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-clay px-3 py-2.5 text-center text-sm font-semibold text-background"
            >
              + Post something
            </Link>
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