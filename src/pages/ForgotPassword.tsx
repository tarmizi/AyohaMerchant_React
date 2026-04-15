import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Mail, ArrowRight, RefreshCw } from "lucide-react";

const ForgotPassword: React.FC = () => {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address"); return; }
    setError("");
    await forgotPassword(email);
    setSent(true);
  };

  const handleResend = async () => {
    await forgotPassword(email);
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle="We've sent a password reset link to your email">
        <div className="space-y-8 py-2">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-elevated">
              <Mail className="h-9 w-9 text-primary-foreground" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              If an account exists for{" "}
              <span className="font-semibold text-foreground">{email}</span>,
              you'll receive a password reset link shortly.
            </p>
            <p className="text-xs text-muted-foreground">
              Please check your spam folder if you don't see it within a few minutes.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link to="/login" className="block">
              <Button className="w-full h-12 font-semibold text-[15px] gradient-primary hover:opacity-90 transition-opacity">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Sign In
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full h-11 text-sm"
              onClick={handleResend}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Resend reset link
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your registered email address and we will send you a password reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Email address" error={error} htmlFor="reset-email">
          <Input
            id="reset-email"
            type="email"
            placeholder="you@business.com"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            className={`h-11 transition-colors ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
        </FormField>

        <div className="space-y-4">
          <Button
            type="submit"
            className="w-full h-12 font-semibold text-[15px] gradient-primary hover:opacity-90 transition-opacity"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <>
                Send Reset Link
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
