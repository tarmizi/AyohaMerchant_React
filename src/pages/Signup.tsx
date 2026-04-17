import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import PasswordInput from "@/components/auth/PasswordInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
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

const Signup: React.FC = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    clearError(field);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.businessName.trim()) e.businessName = "Business name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required";
    else if (!/^[+]?[\d\s-]{7,15}$/.test(form.mobile.trim())) e.mobile = "Please enter a valid mobile number";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    else if (strength.score < 2) e.password = "Password is too weak";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!agreed) e.terms = "You must agree to the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await signup(form.email, form.password, form.name);
      setSuccess(true);
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/onboarding"), 2000);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong. Please try again.");
    }
  };

  if (success) {
    return (
      <AuthLayout title="Account created!" subtitle="Your merchant account is ready">
        <div className="text-center space-y-6 py-6">
          <div className="mx-auto w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-elevated">
            <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Welcome, {form.name}!</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
              We're setting up your merchant portal for{" "}
              <span className="font-medium text-foreground">{form.businessName}</span>.
              You'll be redirected to complete your setup shortly.
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Redirecting to setup...
          </div>
        </div>
      </AuthLayout>
    );
  }

  const isFormEmpty =
    !form.name.trim() &&
    !form.businessName.trim() &&
    !form.email.trim() &&
    !form.mobile.trim() &&
    !form.password &&
    !form.confirmPassword;

  return (
    <AuthLayout title="Create your account" subtitle="Register your business to start managing rewards, members, and campaigns">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full name" error={errors.name} htmlFor="name">
            <Input
              id="name"
              placeholder="John Doe"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={`h-11 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </FormField>

          <FormField label="Business / enterprise name" error={errors.businessName} htmlFor="businessName">
            <Input
              id="businessName"
              placeholder="Acme Co."
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              className={`h-11 ${errors.businessName ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email address" error={errors.email} htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="you@business.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={`h-11 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </FormField>

          <FormField label="Mobile number" error={errors.mobile} htmlFor="mobile">
            <Input
              id="mobile"
              type="tel"
              placeholder="+60 12 345 6789"
              autoComplete="tel"
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
              className={`h-11 ${errors.mobile ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </FormField>
        </div>

        {/* Password section */}
        <FormField label="Password" error={errors.password} htmlFor="password">
          <PasswordInput
            id="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            error={errors.password}
          />
          {/* Strength indicator */}
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
              <p className={`text-xs ${strength.score <= 1 ? "text-destructive" : strength.score <= 2 ? "text-orange-500" : "text-muted-foreground"}`}>
                {strength.label}
              </p>
            </div>
          )}
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword} htmlFor="confirmPassword">
          <PasswordInput
            id="confirmPassword"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
          />
        </FormField>

        {/* Terms */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <Checkbox
              checked={agreed}
              onCheckedChange={(c) => {
                setAgreed(c === true);
                if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
              }}
              className="mt-0.5"
            />
            <span className="text-sm text-muted-foreground leading-snug group-hover:text-foreground transition-colors">
              I agree to the{" "}
              <span className="text-primary hover:underline cursor-pointer font-medium">Terms of Service</span>{" "}
              and{" "}
              <span className="text-primary hover:underline cursor-pointer font-medium">Privacy Policy</span>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-destructive mt-1.5 ml-6">{errors.terms}</p>}
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-4">
          <Button
            type="submit"
            className="w-full h-12 font-semibold text-[15px] gradient-primary hover:opacity-90 transition-opacity"
            disabled={isLoading || isFormEmpty}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 font-medium text-[15px] border-border hover:bg-secondary gap-2"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: window.location.origin + "/signup" },
              });
              if (error) toast.error("Google sign-in failed. Please try again.");
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 font-medium text-[15px] border-border hover:bg-secondary gap-2"
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "apple",
                options: { redirectTo: window.location.origin + "/signup" },
              });
              if (error) toast.error("Apple sign-in failed. Please try again.");
            }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Sign up with Apple
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
