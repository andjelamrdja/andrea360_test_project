import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

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
import { FitnessServicesManagement } from "./app/components/screens/employee-admin/FitnessServicesManagment";
import { SessionsManagement } from "./app/components/screens/employee-admin/SessionsManagments";
import { MembersManagement } from "./app/components/screens/employee-admin/MembersManagments";
import { TransactionsView } from "./app/components/screens/employee-admin/TransactionsView";
import { MemberBooking } from "./app/components/screens/member/MemberBooking";
import { PurchaseServices } from "./app/components/screens/member/PurchaseServices";
import { MyAppointments } from "./app/components/screens/member/MyAppointments";
import { MyProfile } from "./app/components/screens/member/MyProfile";
import { PaymentSuccess } from "./app/components/screens/member/PaymentSuccess";
import { RequireAuth } from "./app/guards/RequireAuth";

function HomeRedirect() {
  const { me, isLoading } = useAuth();
  if (isLoading) return null;

  if (!me) return <Navigate to="/" replace />;

  if (me.userType === "MEMBER") return <Navigate to="/member" replace />;
  if (me.authRole === "ADMIN") return <Navigate to="/admin" replace />;
  return <Navigate to="/employee" replace />;
}

export default function App() {
  const { me } = useAuth();

  return (
    // <BrowserRouter>
    <Routes>
      {/* auth */}
      <Route path="/" element={<LoginLanding />} />
      <Route path="/login/employee" element={<EmployeeLogin />} />
      <Route path="/login/member" element={<MemberLogin />} />

      <Route path="/home" element={<HomeRedirect />} />

      {/* app shell with sidebar */}
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          {/* dashboards */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/employee"
            element={
              me ? (
                <EmployeeDashboard locationId={me.locationId ?? undefined} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/member"
            element={
              <MemberDashboard memberId={(me?.memberId ?? 0).toString()} />
            }
          />

          {/* placeholders for the other screens you’ll add next */}
          <Route path="/admin/locations" element={<LocationsManagement />} />
          <Route path="/admin/employees" element={<EmployeesManagement />} />
          <Route
            path="/admin/services"
            element={<FitnessServicesManagement userRole="admin" />}
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
            element={
              me?.authRole === "EMPLOYEE" ? (
                <SessionsManagement
                  userRole="employee"
                  locationId={me.locationId ?? undefined}
                  employeeId={me.employeeId ?? undefined}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/employee/members"
            element={<MembersManagement userRole="employee" />}
          />
          <Route
            path="/employee/services"
            element={
              me?.authRole === "EMPLOYEE" ? (
                <FitnessServicesManagement
                  userRole="employee"
                  locationId={me.locationId ?? undefined}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/employee/transactions"
            element={<TransactionsView userRole="employee" />}
          />

          <Route path="/member/booking" element={<MemberBooking />} />
          <Route path="/member/appointments" element={<MyAppointments />} />
          <Route
            path="/member/purchase"
            element={<PurchaseServices memberId={me?.memberId ?? 0} />}
          />
          <Route path="/member/profile" element={<MyProfile />} />
          <Route path="/payments/success" element={<PaymentSuccess />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
    // </BrowserRouter>
  );
}
