import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Wrench,
  Users,
  Boxes,
  ClipboardList,
  AlertOctagon,
  PlusCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_BY_ROLE = {
  ADMIN: [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/clients", label: "Clients", icon: Building2 },
    { to: "/app/sites", label: "Sites", icon: MapPin },
    { to: "/app/assets", label: "Assets", icon: Wrench },
    { to: "/app/technicians", label: "Technicians", icon: Users },
    { to: "/app/parts", label: "Inventory", icon: Boxes },
    { to: "/app/work-orders", label: "Work Orders", icon: ClipboardList },
    { to: "/app/overdue", label: "Overdue", icon: AlertOctagon },
  ],
  DISPATCHER: [
    { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/clients", label: "Clients", icon: Building2 },
    { to: "/app/sites", label: "Sites", icon: MapPin },
    { to: "/app/assets", label: "Assets", icon: Wrench },
    { to: "/app/technicians", label: "Technicians", icon: Users },
    { to: "/app/parts", label: "Inventory", icon: Boxes },
    { to: "/app/work-orders", label: "Work Orders", icon: ClipboardList },
    { to: "/app/overdue", label: "Overdue", icon: AlertOctagon },
  ],
  TECHNICIAN: [
    { to: "/app/work-orders", label: "My Work Orders", icon: ClipboardList },
    { to: "/app/technicians", label: "Availability", icon: Users },
  ],
  CLIENT: [
    { to: "/app/work-orders", label: "My Work Orders", icon: ClipboardList },
    { to: "/app/work-orders/new", label: "Create Request", icon: PlusCircle },
  ],
};

export default function Layout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const items = NAV_BY_ROLE[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = (
    <>
      <div className="px-5 py-4 border-b border-slate-800">
        <p className="text-white font-semibold tracking-tight">Keystone</p>
        <p className="text-xs text-slate-400">Field Service Management</p>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/app/work-orders"}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-brand-500 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-slate-800">
        <p className="px-2 text-xs text-slate-400 mb-2 truncate">
          {user?.name || user?.email} · {role}
        </p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col bg-slate-900 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 flex flex-col bg-slate-900">
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30">
          <button onClick={() => setDrawerOpen(true)} className="text-slate-600">
            <Menu size={22} />
          </button>
          <p className="font-semibold text-slate-800">Keystone</p>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
