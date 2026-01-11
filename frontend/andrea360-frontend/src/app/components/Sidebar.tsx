import { NavLink, useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Dumbbell,
  Calendar,
  UserCircle,
  CreditCard,
  LayoutDashboard,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../api/AuthContext";
import { cn } from "./ui/utils";
import { useState } from "react";

type AppRole = "admin" | "employee" | "member";

function roleFromMe(
  userType?: string,
  authRole?: string | null
): AppRole | null {
  if (!userType) return null;
  if (userType === "MEMBER") return "member";
  if (authRole === "ADMIN") return "admin";
  return "employee";
}

export function Sidebar() {
  const { me, logout } = useAuth();
  const role = roleFromMe(me?.userType, me?.authRole);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // If not logged in, don’t render sidebar at all
  if (!role) return null;

  const adminMenuItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/locations", label: "Locations", icon: MapPin },
    { to: "/admin/employees", label: "Employees", icon: Users },
    { to: "/admin/services", label: "Services", icon: Dumbbell },
    { to: "/admin/appointments", label: "Appointments", icon: Calendar },
    { to: "/admin/members", label: "Members", icon: UserCircle },
    { to: "/admin/transactions", label: "Transactions", icon: CreditCard },
  ];

  const employeeMenuItems = [
    { to: "/employee", label: "Dashboard", icon: LayoutDashboard },
    { to: "/employee/appointments", label: "Appointments", icon: Calendar },
    { to: "/employee/members", label: "Members", icon: UserCircle },
    { to: "/employee/services", label: "Services", icon: Dumbbell },
    { to: "/employee/transactions", label: "Transactions", icon: CreditCard },
  ];

  const memberMenuItems = [
    { to: "/member", label: "Dashboard", icon: LayoutDashboard },
    { to: "/member/booking", label: "Book Appointment", icon: Calendar },
    { to: "/member/appointments", label: "My Appointments", icon: Calendar },
    { to: "/member/purchase", label: "Buy Services", icon: ShoppingCart },
    { to: "/member/profile", label: "My Profile", icon: UserCircle },
  ];

  const menuItems =
    role === "admin"
      ? adminMenuItems
      : role === "employee"
      ? employeeMenuItems
      : memberMenuItems;

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-blue-600">Andrea360</h1>
        <p className="text-sm text-slate-500 mt-1">
          {role === "admin"
            ? "Admin Panel"
            : role === "employee"
            ? "Employee Panel"
            : "Member Portal"}
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={
                    item.to === "/admin" ||
                    item.to === "/employee" ||
                    item.to === "/member"
                  }
                  className={({ isActive }) =>
                    cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors border-l-4",
                      isActive
                        ? "bg-blue-50 text-blue-600 border-blue-600"
                        : "text-slate-600 hover:bg-slate-50 border-transparent"
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200 relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCircle className="w-6 h-6 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-slate-900 truncate">
              {me?.userType === "MEMBER"
                ? "Member User"
                : me?.authRole === "ADMIN"
                ? "Admin User"
                : "Employee User"}
            </p>
            <p className="text-xs text-slate-500 truncate">{me?.email}</p>
          </div>
        </button>

        {menuOpen && (
          <div className="absolute bottom-16 left-4 right-4 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => {
                logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
