import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../api/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export function EmployeeLogin() {
  const nav = useNavigate();
  const { loginBasic } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const me = await loginBasic(email, password);

      // Guard: user picked Employee login but credentials belong to a member.
      if (me.userType === "MEMBER") {
        setError(
          "These credentials belong to a MEMBER account. Please use Member Login."
        );
        return;
      }

      if (me.authRole === "ADMIN") nav("/admin");
      else nav("/employee");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Employee Login
          </CardTitle>
          <p className="text-slate-500 text-sm mt-1">
            Admins & employees sign in here
          </p>
        </CardHeader>

        <CardContent className="pb-6">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="text-left">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="text-left">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 text-left">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-slate-900 text-white py-2 font-medium hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => nav("/")}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
