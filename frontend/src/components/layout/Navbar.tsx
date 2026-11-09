import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { COMPANY } from "../../data/company";
import { SERVICE_GROUPS } from "../../data/services";
import { useConversations } from "../../hooks/useApi";
import { useAuthStore } from "../../stores/auth.store";
import { useUIStore } from "../../stores/ui.store";
import NotificationCenter from "../shared/NotificationCenter";
import BasketLink from "../market/BasketLink";

const NAV = [
  { to: "/" as const, label: "Home" },
  { to: "/services" as const, label: "Services" },
  { to: "/projects" as const, label: "Projects" },
  { to: "/market" as const, label: "Shop" },
  { to: "/latest" as const, label: "Latest", secondary: true },
  { to: "/about" as const, label: "About", secondary: true },
  { to: "/contact" as const, label: "Contact" },
];

/** Shared styling for a top-level navigation item. */
const navLinkClass = (active: boolean, secondary?: boolean) =>
  `inline-flex shrink-0 items-center gap-1 whitespace-nowrap border-b-2 bg-transparent px-1.5 py-5 text-[13.5px] transition-colors ${
    secondary ? "hidden 2xl:inline-flex" : ""
  } ${
    active
      ? "border-sky-600 font-semibold text-ink-900"
      : "border-transparent font-medium text-ink-600 hover:text-ink-900"
  }`;

export default function Navbar() {
  const [userMenu, setUserMenu] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, user, logout } = useAuthStore();
  const { mobileMenuOpen, setMobileMenuOpen, setChatOpen } = useUIStore();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const path = location.pathname;

  const { data: convData } = useConversations(isAuthenticated && user?.role !== "admin");

  const totalUnread =
    isAuthenticated && user?.role !== "admin"
      ? ((convData as any[]) || []).reduce(
          (sum: number, c: any) => sum + (c.unreadByUser || 0),
          0,
        )
      : 0;

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenu(false);
    setServicesOpen(false);
  }, [path]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 60);
  }, [searchOpen]);

  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    setMobileMenuOpen(false);
    navigate({ to: "/" });
  };

  const submitSearch = () => {
    const term = searchQ.trim();
    if (!term) return;
    setSearchOpen(false);
    if (path.startsWith("/market")) {
      navigate({ to: "/market", search: { search: term } });
    } else {
      navigate({ to: "/projects", search: { search: term } as never });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-200 bg-white">
      <div className="container-xl flex h-16 items-center gap-4 xl:gap-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap"
          aria-label="MasterPools home"
        >
          <img
            src="/images/logo.jpeg"
            alt=""
            width={36}
            height={30}
            loading="eager"
            decoding="async"
            className="h-9 w-auto shrink-0 rounded-[5px] object-contain"
          />
          <span className="flex shrink-0 flex-col leading-none">
            <span className="font-display text-[17px] font-extrabold tracking-[-0.015em] text-ink-900">
              MASTERPOOLS
            </span>
            <span className="mt-1 hidden whitespace-nowrap text-[8px] uppercase tracking-[0.1em] text-ink-500 sm:block">
              Pool construction &amp; equipment
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="hidden min-w-0 items-center gap-0.5 lg:flex"
        >
          {/* The wordmark is the link home, so "Home" is omitted on desktop. */}
          {NAV.filter(({ to }) => to !== "/").map(({ to, label, secondary }) =>
            to === "/services" ? (
              <div
                key={to}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setServicesOpen((open) => !open)}
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                  className={navLinkClass(isActive(to), secondary)}
                >
                  {label}
                  <ChevronDown
                    size={13}
                    strokeWidth={2.2}
                    aria-hidden="true"
                    className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      role="menu"
                      aria-label="Services"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.13 }}
                      className="absolute left-0 top-full z-50 w-[330px] rounded-xl border border-ink-200 bg-white p-1.5 shadow-lg"
                    >
                      {SERVICE_GROUPS.map((group) => (
                        <Link
                          key={group.slug}
                          to="/services"
                          hash={group.slug}
                          role="menuitem"
                          className="block rounded-lg px-3 py-2 hover:bg-ink-50"
                        >
                          <span className="block text-[13.5px] font-semibold text-ink-900">
                            {group.name}
                          </span>
                          <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-500">
                            {group.services
                              .map((service) => service.name)
                              .join(", ")}
                          </span>
                        </Link>
                      ))}
                      <div className="divider-line my-1.5" />
                      <Link
                        to="/services"
                        role="menuitem"
                        className="block rounded-lg px-3 py-2 text-[13px] font-semibold text-sky-700 hover:bg-sky-50"
                      >
                        All services
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={to}
                to={to}
                className={navLinkClass(isActive(to), secondary)}
                aria-current={isActive(to) ? "page" : undefined}
              >
                {label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-1.5 lg:flex">
          <AnimatePresence initial={false}>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 230, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input
                  ref={searchRef}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onBlur={() => setSearchOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                    if (e.key === "Escape") setSearchOpen(false);
                  }}
                  type="search"
                  placeholder={path.startsWith("/market") ? "Search equipment…" : "Search projects…"}
                  aria-label="Search"
                  className="h-9 w-full rounded-lg border border-ink-200 bg-ink-50 px-3 text-[13px] outline-none focus:border-sky-500 focus:bg-white"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
            className="grid h-10 w-10 place-items-center rounded-lg text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <Search size={17} strokeWidth={1.8} />
          </button>

          <BasketLink />

          {isAuthenticated && <NotificationCenter />}

          {isAuthenticated && user?.role !== "admin" && (
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              aria-label="Open support chat"
              className="relative grid h-10 w-10 place-items-center rounded-lg text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900"
            >
              <MessageCircle size={17} strokeWidth={1.8} />
              {totalUnread > 0 && <span className="notif-dot">{totalUnread}</span>}
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenu((v) => !v)}
                aria-expanded={userMenu}
                aria-haspopup="menu"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-200 bg-white px-2.5 text-[13px] font-semibold text-ink-700 hover:bg-ink-50"
              >
                <span className="grid h-6 w-6 place-items-center rounded-md bg-sky-600 text-[11px] font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
                <span className="max-w-[72px] truncate">{user?.name?.split(" ")[0]}</span>
                <ChevronDown
                  size={14}
                  className={`text-ink-400 transition-transform ${userMenu ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.13 }}
                    className="absolute right-0 top-[52px] w-60 rounded-xl border border-ink-200 bg-white p-1.5 shadow-lg"
                  >
                    <div className="px-2.5 py-2">
                      <p className="text-[11.5px] text-ink-400">Signed in as</p>
                      <p className="truncate text-[13.5px] font-semibold text-ink-900">
                        {user?.email}
                      </p>
                      {user?.role === "admin" && (
                        <span className="badge badge-blue mt-1.5">
                          <Shield size={10} /> Admin
                        </span>
                      )}
                    </div>
                    <div className="divider-line my-1.5" />
                    <Link
                      to={user?.role === "admin" ? "/admin" : "/dashboard"}
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                    >
                      <LayoutDashboard size={15} />
                      {user?.role === "admin" ? "Admin panel" : "Dashboard"}
                    </Link>
                    <Link
                      to="/market/quote"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                    >
                      <FileText size={15} />
                      Quote basket
                    </Link>
                    <Link
                      to="/quotation"
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                    >
                      <FileText size={15} />
                      Construction quotation
                    </Link>
                    <div className="divider-line my-1.5" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="whitespace-nowrap rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900"
            >
              Sign in
            </Link>
          )}

          <Link
            to="/quotation"
            className="btn btn-primary btn-md shrink-0 whitespace-nowrap"
          >
            Request a quotation
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-ink-200 text-ink-700 lg:hidden"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-ink-200 bg-white lg:hidden"
          >
            <div className="container-xl flex flex-col gap-1 py-3">
              {NAV.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-lg px-3 py-2.5 text-[14px] ${
                    isActive(to)
                      ? "bg-sky-50 font-semibold text-sky-800"
                      : "font-medium text-ink-600"
                  }`}
                >
                  {label}
                </Link>
              ))}

              <div className="mt-1 flex items-center justify-between rounded-lg border border-ink-200 px-3 py-2">
                <span className="text-[13.5px] font-medium text-ink-600">Quote basket</span>
                <BasketLink compact />
              </div>

              <div className="mt-1 grid grid-cols-2 gap-2">
                <a
                  href={COMPANY.phoneHref}
                  className="flex items-center justify-center gap-2 rounded-lg border border-ink-200 px-3 py-2.5 text-[13px] font-medium text-ink-700"
                >
                  <Phone size={14} className="text-sky-600" aria-hidden="true" />
                  Call
                </a>
                <a
                  href={COMPANY.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-ink-200 px-3 py-2.5 text-[13px] font-medium text-ink-700"
                >
                  <MessageCircle size={14} className="text-sky-600" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>

              <div className="mt-2 flex flex-col gap-2 border-t border-ink-200 pt-3">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={user?.role === "admin" ? "/admin" : "/dashboard"}
                      className="btn btn-secondary btn-md w-full"
                    >
                      {user?.role === "admin" ? "Admin panel" : "Dashboard"}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-danger btn-md w-full"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-secondary btn-md w-full">
                      Sign in
                    </Link>
                    <Link to="/quotation" className="btn btn-primary btn-md w-full">
                      Request a quotation
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
