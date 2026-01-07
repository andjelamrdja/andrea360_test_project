import { useNavigate } from "react-router-dom";
import { Users, UserCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export function LoginLanding() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Andrea360</h1>
          <p className="text-slate-500 mt-2">Choose how you want to sign in</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => nav("/login/employee")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                Login as Employee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Admins & employees sign in here.
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => nav("/login/member")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserCircle className="w-6 h-6 text-purple-600" />
                Login as Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Members sign in to manage bookings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
