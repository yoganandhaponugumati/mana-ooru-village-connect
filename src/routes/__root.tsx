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
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
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
      { property: "og:title", content: "GramMitra - Smart Village Ecosystem" },
      { property: "og:description", content: "Everything your village needs. All in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@GramMitra" },
      { name: "twitter:title", content: "GramMitra" },
      { name: "twitter:description", content: "Everything your village needs. All in one place." },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6443d029-9210-477c-9cbc-a6f036717993",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/6443d029-9210-477c-9cbc-a6f036717993",
      },
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
        href: "/site-icon.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/logo.png",
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
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800&display=swap" />
      </head>
      <body className="overflow-x-hidden w-full antialiased bg-[#F9FAFB] dark:bg-zinc-950">
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

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
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
