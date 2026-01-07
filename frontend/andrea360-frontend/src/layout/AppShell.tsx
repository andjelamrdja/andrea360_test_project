import { Outlet } from "react-router-dom";
import { Sidebar } from "../app/components/Sidebar";

export function AppShell() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
