import { Link, Outlet, createRootRoute, useRouterState } from "@tanstack/react-router";

import SkipLink from "../components/a11y/SkipLink";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import ChatWidget from "../components/ui/ChatWidget";
import { useAuthStore } from "../stores/auth.store";

const isDev = Boolean(
  (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
);

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootError,
  notFoundComponent: RootNotFound,
});

function RootLayout() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const { location } = useRouterState();
  // The admin panel ships its own shell, so the public chrome is suppressed there.
  const isAdminArea = location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-clip bg-white">
      <SkipLink />
      {!isAdminArea && <Navbar />}
      <main id="main-content" style={{ flex: 1, paddingTop: isAdminArea ? 0 : 64 }}>
        <Outlet />
      </main>
      {!isAdminArea && <Footer />}
      {isAuthenticated && !isAdmin && !isAdminArea && <ChatWidget />}
    </div>
  );
}

/**
 * Without this, a throw anywhere in the route tree leaves an empty document —
 * a blank white page with no explanation. Render a recoverable message instead.
 */
function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-md flex min-h-[72vh] flex-col items-start justify-center py-20">
      <h1 className="font-display text-[26px] font-bold tracking-[-0.028em] text-ink-900">
        This page could not be displayed
      </h1>
      <p className="mt-2 max-w-[460px] text-[14.5px] leading-relaxed text-ink-600">
        Something failed while rendering this page. The rest of the site still
        works.
      </p>

      {isDev && (
        <pre className="mt-4 max-h-40 w-full overflow-auto rounded-lg border border-ink-200 bg-surface p-3 text-[12px] text-ink-700">
          {error?.message}
        </pre>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary btn-md">
          Try again
        </button>
        <a href="/" className="btn btn-secondary btn-md">
          Back to home
        </a>
      </div>
    </div>
  );
}

function RootNotFound() {
  return (
    <div className="container-md flex min-h-[72vh] flex-col items-start justify-center py-20">
      <h1 className="font-display text-[26px] font-bold tracking-[-0.028em] text-ink-900">
        That page does not exist
      </h1>
      <p className="mt-2 max-w-[460px] text-[14.5px] leading-relaxed text-ink-600">
        The address may have changed. The services, projects and equipment
        catalogue are all still available.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link to="/" className="btn btn-primary btn-md">
          Back to home
        </Link>
        <Link to="/services" className="btn btn-secondary btn-md">
          Services
        </Link>
        <Link to="/projects" className="btn btn-secondary btn-md">
          Projects
        </Link>
      </div>
    </div>
  );
}
