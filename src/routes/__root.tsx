import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useBrowserPushNotifications } from "@/lib/push-notifications";
import { supabase } from "@/integrations/supabase/client";
import { AppSplashScreen } from "@/components/AppSplashScreen";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });

    // Auto-reload on stale chunk error (happens after new Vercel deployment while user is on site)
    const isChunkError =
      error?.message?.includes("dynamically imported module") ||
      error?.message?.includes("Importing a module script failed") ||
      error?.message?.includes("Failed to fetch");

    if (isChunkError) {
      const lastReload = sessionStorage.getItem("last_chunk_reload");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("last_chunk_reload", String(now));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        {error?.message && (
          <p className="mt-3 text-xs font-mono text-red-600 dark:text-red-400 max-w-sm mx-auto bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900/50 break-words">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Refresh Page
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GramMitra - Smart Village Ecosystem" },
      {
        name: "description",
        content:
          "A trusted digital village platform for workers, land, marketplace, services, notices, weather, and AI support.",
      },
      { name: "author", content: "GramMitra" },
      { property: "og:title", content: "GramMitra — Smart Village Ecosystem" },
      { property: "og:description", content: "India's most complete digital village platform. Village Stories, Problem Reporting, Zero-Brokerage Marketplace, AI Assistant, and Panchayat Notices — all free." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://grammitra-app.vercel.app/" },
      { property: "og:image", content: "https://grammitra-app.vercel.app/village-life-bg.jpg" },
      { property: "og:site_name", content: "GramMitra" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@GramMitra" },
      { name: "twitter:title", content: "GramMitra — Smart Village Ecosystem" },
      { name: "twitter:description", content: "India's most complete digital village platform. Free for every villager." },
      { name: "twitter:image", content: "https://grammitra-app.vercel.app/village-life-bg.jpg" },
      // PWA & Android
      { name: "application-name", content: "GramMitra" },
      { name: "theme-color", content: "#0E2317" },
      { name: "mobile-web-app-capable", content: "yes" },
      // Apple PWA
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "GramMitra" },
    ],
    links: [
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/site-icon.svg",
      },
      {
        rel: "apple-touch-icon",
        href: "/pwa-192x192.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "192x192",
        href: "/pwa-192x192.png",
      },
      {
        rel: "icon",
        type: "image/webp",
        href: "/logo.webp",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Preconnect to critical third-party origins
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://images.pexels.com" },
      { rel: "dns-prefetch", href: "https://storage.googleapis.com" },
      // Preload the LCP hero image so the browser discovers it ASAP
      {
        rel: "preload",
        as: "image",
        href: "/village-life-bg.webp",
        type: "image/webp",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "GramMitra",
    "alternateName": "Mana Ooru Village Connect",
    "url": "https://grammitra-app.vercel.app/",
    "description": "A trusted digital village platform for workers, land, marketplace, services, notices, weather, and civic problem reporting.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://grammitra-app.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800&display=swap" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="overflow-x-hidden w-full antialiased bg-[#F9FAFB] dark:bg-zinc-950">
        <AppSplashScreen />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ProfileCompletionGate() {
  const { user, needsProfileCompletion, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !user || !needsProfileCompletion) return;
    if (location.pathname === "/complete-profile" || location.pathname === "/auth") return;
    navigate({ to: "/complete-profile", replace: true });
  }, [loading, user, needsProfileCompletion, location.pathname, navigate]);

  return null;
}

function BrowserPushGate() {
  useBrowserPushNotifications();
  return null;
}

function GlobalErrorListener() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const logErrorToDB = (
      message: string,
      source?: string,
      lineno?: number,
      colno?: number,
      errorObj?: any,
    ) => {
      // Non-blocking async error log
      void (async () => {
        try {
          await (supabase as any).from("error_logs").insert({
            message,
            source,
            lineno,
            colno,
            error_stack: errorObj?.stack || String(errorObj),
            user_agent: navigator.userAgent,
            url: window.location.href,
          });
        } catch {
          // Ignore failure
        }
      })();
    };

    const handleGlobalError = (event: ErrorEvent) => {
      logErrorToDB(event.message, event.filename, event.lineno, event.colno, event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logErrorToDB(String(event.reason), "PromiseRejection", 0, 0, event.reason);
    };

    const handlePreloadError = () => {
      const lastReload = sessionStorage.getItem("last_chunk_reload");
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("last_chunk_reload", String(now));
        window.location.reload();
      }
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("vite:preloadError", handlePreloadError);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("vite:preloadError", handlePreloadError);
    };
  }, []);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <GlobalErrorListener />
        <ProfileCompletionGate />
        <BrowserPushGate />
        <Outlet />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
