import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./api/AuthContext";
import { LoginLanding } from "./app/pages/auth/LoginLanding";
import { EmployeeLogin } from "./app/pages/auth/EmployeeLogin";
import { MemberLogin } from "./app/pages/auth/MemberLogin";
import { AppShell } from "./layout/AppShell";
import { AdminDashboard } from "./app/components/dashboards/AdminDashboard";
import { EmployeeDashboard } from "./app/components/dashboards/EmployeeDashboard";
import { MemberDashboard } from "./app/components/dashboards/MemberDashboard";
import { LocationsManagement } from "./app/components/screens/admin/LocationsManagments";
import { EmployeesManagement } from "./app/components/screens/admin/EmployeesManagment";
import { FitnessServicesManagement } from "./app/components/screens/admin/FitnessServicesManagment";
import { SessionsManagement } from "./app/components/screens/admin/SessionsManagments";
import { MembersManagement } from "./app/components/screens/admin/MembersManagments";
import { TransactionsView } from "./app/components/screens/admin/TransactionsView";

function HomeRedirect() {
  const { me, isLoading } = useAuth();
  if (isLoading) return null;

  if (!me) return <Navigate to="/" replace />;

  if (me.userType === "MEMBER") return <Navigate to="/member" replace />;
  if (me.authRole === "ADMIN") return <Navigate to="/admin" replace />;
  return <Navigate to="/employee" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* auth */}
        <Route path="/" element={<LoginLanding />} />
        <Route path="/login/employee" element={<EmployeeLogin />} />
        <Route path="/login/member" element={<MemberLogin />} />
        <Route path="/home" element={<HomeRedirect />} />

        {/* app shell with sidebar */}
        <Route element={<AppShell />}>
          {/* dashboards */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/employee"
            element={<EmployeeDashboard locationId="1" />}
          />
          <Route path="/member" element={<MemberDashboard memberId="1" />} />

          {/* placeholders for the other screens you’ll add next */}
          <Route path="/admin/locations" element={<LocationsManagement />} />
          <Route path="/admin/employees" element={<EmployeesManagement />} />
          <Route
            path="/admin/services"
            element={<FitnessServicesManagement />}
          />
          <Route
            path="/admin/appointments"
            element={<SessionsManagement userRole={"admin"} />}
          />
          <Route
            path="/admin/members"
            element={<MembersManagement userRole="admin" />}
          />
          <Route
            path="/admin/transactions"
            element={<TransactionsView userRole="admin" />}
          />

          <Route
            path="/employee/appointments"
            element={<SessionsManagement userRole={"employee"} />}
          />
          <Route
            path="/employee/members"
            element={<MembersManagement userRole="employee" />}
          />
          <Route
            path="/employee/services"
            element={<FitnessServicesManagement />}
          />
          <Route
            path="/employee/transactions"
            element={<TransactionsView userRole="employee" />}
          />

          <Route
            path="/member/booking"
            element={<div className="p-8">Booking</div>}
          />
          <Route
            path="/member/appointments"
            element={<div className="p-8">My Appointments</div>}
          />
          <Route
            path="/member/purchase"
            element={<div className="p-8">Buy Services</div>}
          />
          <Route
            path="/member/profile"
            element={<div className="p-8">My Profile</div>}
          />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
