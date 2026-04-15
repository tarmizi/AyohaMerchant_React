import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import PasswordInput from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-orange-400" };
  if (score <= 3) return { score: 3, label: "Good", color: "bg-yellow-400" };
  if (score <= 4) return { score: 4, label: "Strong", color: "bg-emerald-400" };
  return { score: 5, label: "Very strong", color: "bg-emerald-500" };
};

const ResetPassword: React.FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const isFormValid =
    form.password.length >= 8 &&
    form.confirm.length > 0 &&
    form.password === form.confirm &&
    strength.score >= 2;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (strength.score < 2) e.password = "Password is too weak";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await resetPassword(form.password);
    toast.success("Password updated successfully!");
    setDone(true);
    setTimeout(() => navigate("/login"), 3000);
  };

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="Your new password has been saved securely">
        <div className="space-y-8 py-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-elevated">
              <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">You're all set!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/login" className="block">
              <Button className="w-full h-12 font-semibold text-[15px] gradient-primary hover:opacity-90 transition-opacity">
                Go to Sign In
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Auto-redirecting in a few seconds...
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password to keep your merchant account secure."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Security hint */}
        <div className="flex items-start gap-3 bg-secondary/60 rounded-xl p-4 border border-border">
          <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols for a strong password.
          </p>
        </div>

        <FormField label="New password" error={errors.password} htmlFor="new-pw">
          <PasswordInput
            id="new-pw"
            placeholder="Enter new password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => {
              setForm((f) => ({ ...f, password: e.target.value }));
              clearError("password");
            }}
            error={errors.password}
          />
          {form.password && (
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= strength.score ? strength.color : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p
                className={`text-xs ${
                  strength.score <= 1
                    ? "text-destructive"
                    : strength.score <= 2
                    ? "text-orange-500"
                    : "text-muted-foreground"
                }`}
              >
                {strength.label}
              </p>
            </div>
          )}
        </FormField>

        <FormField label="Confirm new password" error={errors.confirm} htmlFor="confirm-pw">
          <PasswordInput
            id="confirm-pw"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => {
              setForm((f) => ({ ...f, confirm: e.target.value }));
              clearError("confirm");
            }}
            error={errors.confirm}
          />
          {form.confirm && form.password && form.confirm === form.password && (
            <p className="text-xs text-emerald-500 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Passwords match
            </p>
          )}
        </FormField>

        <div className="pt-1">
          <Button
            type="submit"
            className="w-full h-12 font-semibold text-[15px] gradient-primary hover:opacity-90 transition-opacity"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                Save New Password
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
