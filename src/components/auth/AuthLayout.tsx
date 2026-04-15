import React from "react";
import authIllustration from "@/assets/auth-illustration.jpg";
import { CreditCard, BarChart3, Users, Gift } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const features = [
  { icon: CreditCard, label: "Membership Cards" },
  { icon: Users, label: "Subscriber Management" },
  { icon: Gift, label: "Campaigns & Vouchers" },
  { icon: BarChart3, label: "Performance Analytics" },
];

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col relative overflow-hidden">
        {/* Background image + overlay */}
        <img
          src={authIllustration}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 gradient-primary opacity-80" />

        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-primary-foreground/5 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10 xl:p-12">
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary-foreground tracking-tight leading-none">
                  Ayoha Reward
                </h1>
                <p className="text-primary-foreground/60 text-[11px] font-medium tracking-wider uppercase mt-0.5">
                  Business Portal
                </p>
              </div>
            </div>
          </div>

          {/* Main copy */}
          <div className="space-y-8">
            <div>
              <h2 className="text-[28px] xl:text-[32px] font-bold text-primary-foreground leading-tight">
                Grow your business
                <br />
                with smart rewards
              </h2>
              <p className="text-primary-foreground/65 text-[15px] mt-4 leading-relaxed max-w-sm">
                Track members, manage campaigns, and drive repeat business — 
                everything you need in one powerful platform.
              </p>
            </div>

            {/* Feature pills */}
            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-primary-foreground/10"
                >
                  <Icon className="h-4 w-4 text-primary-foreground/80 flex-shrink-0" />
                  <span className="text-primary-foreground/90 text-[13px] font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-primary-foreground/40 text-xs">
            © {new Date().getFullYear()} Ayoha Reward. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary tracking-tight leading-none">
                Ayoha Reward
              </h1>
              <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase mt-0.5">
                Business Portal
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-foreground tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
