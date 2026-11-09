import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Package,
  Play,
  Receipt,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { format } from "date-fns";
import { MetaHead } from "../../components/seo/MetaHead";
import { useConversations } from "../../hooks/useApi";
import { useAuthStore } from "../../stores/auth.store";
import { useUIStore } from "../../stores/ui.store";

const NAV = [
  { to: "/admin/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/market-quotes", label: "Market quotes", icon: Receipt },
  { to: "/admin/projects", label: "Projects", icon: FolderOpen },
  { to: "/admin/quotations", label: "Quotations", icon: FileText },
  { to: "/admin/blogs", label: "Blogs", icon: FileText },
  { to: "/admin/chat", label: "Inbox", icon: MessageCircle, badge: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/videos", label: "Videos", icon: Play },
  { to: "/admin/contacts", label: "Messages", icon: Mail },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const routerState = useRouterState();
  const path = routerState.location.pathname;

  const { data: convData } = useConversations();
  const totalUnread = ((convData as any[]) || []).reduce(
    (s: number, c: any) => s + (c.unreadByAdmin || 0),
    0,
  );
  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  useEffect(() => {
    if (user && user.role !== "admin") navigate({ to: "/" });
  }, [user]);
  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  if (!user || user.role !== "admin") {
    return (
      <>
        <MetaHead
          title="Admin Access | MATERPOOLS AND CONTRUCTION"
          description="Private dashboard area for managing projects, blog posts, messages, and company content."
          noindex
        />
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--color-bg)",
          }}
        >
          <p style={{ color: "var(--color-text-secondary)" }}>Access denied.</p>
        </div>
      </>
    );
  }

  const isActive = (to: string, exact = false) => {
    if (exact || to === "/admin/")
      return path === "/admin" || path === "/admin/";
    return path.startsWith(to);
  };

  const sidebarW = sidebarCollapsed ? 68 : 240;

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div
        style={{
          padding: "1rem 1rem",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: collapsed ? 0 : "0.75rem",
          justifyContent: collapsed ? "center" : "flex-start",
          height: "64px",
        }}
      >
        <div
          style={{
            width: "2rem",
            height: "2rem",
            background: "var(--color-primary-900)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <GraduationCap
            style={{ width: "1rem", height: "1rem", color: "#fff" }}
          />
        </div>
        {!collapsed && (
          <div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: "1rem",
                color: "var(--color-primary-900)",
                margin: 0,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              Master
              <span style={{ color: "var(--color-secondary-500)" }}>Pools</span>
            </p>
            <p
              style={{
                fontSize: "0.5rem",
                color: "var(--color-gray-400)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginTop: "0.0625rem",
              }}
            >
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "0.625rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.125rem",
          overflowY: "auto",
        }}
      >
        {NAV.map(({ to, label, icon: Icon, exact, badge }) => {
          const active = isActive(to, exact);
          return (
            <Link
              key={to}
              to={to as any}
              className={active ? "nav-item-active" : "nav-item"}
              style={{
                justifyContent: collapsed ? "center" : "flex-start",
                padding: collapsed ? "0.5625rem 0.625rem" : "0.5625rem 0.75rem",
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Icon
                  style={{
                    width: "1rem",
                    height: "1rem",
                    color: active
                      ? "var(--color-primary-900)"
                      : "var(--color-gray-400)",
                  }}
                />
                {badge && totalUnread > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-0.3rem",
                      right: "-0.3rem",
                      width: "0.875rem",
                      height: "0.875rem",
                      borderRadius: "50%",
                      background: "#EF4444",
                      color: "#fff",
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </div>
              {!collapsed && (
                <>
                  <span style={{ flex: 1, fontSize: "0.875rem" }}>{label}</span>
                  {active && (
                    <ChevronRight
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        color: "var(--color-primary-400)",
                      }}
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse */}
      <div
        style={{
          padding: "0.625rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <button
          onClick={toggleSidebar}
          className="nav-item"
          style={{
            width: "100%",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "0.5625rem 0.625rem" : "0.5625rem 0.75rem",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {!collapsed && (
            <span
              style={{ fontSize: "0.8125rem", color: "var(--color-gray-500)" }}
            >
              Collapse
            </span>
          )}
          {collapsed ? (
            <ChevronRight
              style={{
                width: "1rem",
                height: "1rem",
                color: "var(--color-gray-400)",
              }}
            />
          ) : (
            <ChevronLeft
              style={{
                width: "1rem",
                height: "1rem",
                color: "var(--color-gray-400)",
              }}
            />
          )}
        </button>
      </div>

      {/* User */}
      <div
        style={{
          padding: "0.625rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {!collapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "10px",
              background: "var(--color-gray-50)",
              marginBottom: "0.375rem",
            }}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "7px",
                background: "var(--color-primary-900)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.75rem",
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  margin: 0,
                }}
              >
                {user?.name}
              </p>
              <p
                style={{
                  fontSize: "0.625rem",
                  color: "var(--color-text-tertiary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  margin: 0,
                }}
              >
                {user?.email}
              </p>
            </div>
          </div>
        )}
        <Link
          to="/"
          className="nav-item"
          style={{
            fontSize: "0.8125rem",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0.5625rem 0.625rem" : "0.4375rem 0.75rem",
          }}
        >
          {collapsed ? (
            <Activity style={{ width: "1rem", height: "1rem" }} />
          ) : (
            <>
              <Activity style={{ width: "0.875rem", height: "0.875rem" }} />
              View Site
            </>
          )}
        </Link>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : "0.5rem",
            padding: collapsed ? "0.5625rem 0.625rem" : "0.4375rem 0.75rem",
            borderRadius: "10px",
            fontSize: "0.8125rem",
            color: "#DC2626",
            background: "none",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.07)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut
            style={{
              width: collapsed ? "1rem" : "0.875rem",
              height: collapsed ? "1rem" : "0.875rem",
              flexShrink: 0,
            }}
          />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--color-bg)",
      }}
    >
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        style={{
          flexShrink: 0,
          background: "#fff",
          borderRight: "1px solid var(--color-border)",
          overflow: "hidden",
        }}
        className="hidden lg:flex flex-col"
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 40,
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 380, damping: 35 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
                width: 240,
                background: "#fff",
                borderRight: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
              }}
              className="lg:hidden"
            >
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid var(--color-border)",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            position: "sticky",
            top: 0,
            zIndex: 30,
            height: "64px",
            boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="flex lg:hidden"
            aria-label="Open admin navigation"
            style={{
              padding: "0.5rem",
              borderRadius: "8px",
              background: "var(--color-gray-100)",
              border: "1px solid var(--color-border)",
              cursor: "pointer",
              color: "var(--color-gray-600)",
            }}
          >
            <Menu style={{ width: "1.125rem", height: "1.125rem" }} />
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.875rem",
            }}
          >
            <span style={{ color: "var(--color-text-tertiary)" }}>Admin</span>
            <ChevronRight
              style={{
                width: "0.875rem",
                height: "0.875rem",
                color: "var(--color-gray-300)",
              }}
            />
            <span style={{ fontWeight: 600, color: "var(--color-text)" }}>
              {NAV.find((n) => isActive(n.to, n.exact))?.label || "Dashboard"}
            </span>
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-tertiary)",
                fontFamily: "var(--font-mono)",
              }}
              className="hidden md:block"
            >
              {format(new Date(), "HH:mm · MMM d")}
            </span>
            {totalUnread > 0 && (
              <Link
                to="/admin/chat"
                style={{
                  position: "relative",
                  padding: "0.4375rem",
                  borderRadius: "8px",
                  color: "var(--color-gray-500)",
                  textDecoration: "none",
                  background: "transparent",
                }}
              >
                <Bell style={{ width: "1rem", height: "1rem" }} />
                <span className="notif-dot">{totalUnread}</span>
              </Link>
            )}
            <div
              style={{
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.3125rem 0.625rem",
                borderRadius: "6px",
                background: "var(--color-accent-50)",
                border: "1px solid var(--color-accent-100)",
              }}
              className="hidden md:flex"
            >
              <span className="status-online" />
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "var(--color-accent-600)",
                }}
              >
                Online
              </span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
