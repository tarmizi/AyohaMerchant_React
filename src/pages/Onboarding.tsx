import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import FormField from "@/components/auth/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Building2,
  MapPin,
  Palette,
  Settings,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  ImageIcon,
  Link as LinkIcon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const STEPS = [
  { label: "Business", icon: Building2 },
  { label: "Location", icon: MapPin },
  { label: "Brand", icon: Palette },
  { label: "Preferences", icon: Settings },
  { label: "Complete", icon: CheckCircle2 },
];

interface OnboardingForm {
  // Step 1
  businessName: string;
  registrationNumber: string;
  category: string;
  contactNumber: string;
  businessEmail: string;
  // Step 2
  outletName: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  // Step 3
  logoFile: File | null;
  logoPreview: string;
  coverFile: File | null;
  coverPreview: string;
  description: string;
  socialWebsite: string;
  socialInstagram: string;
  socialFacebook: string;
  // Step 4
  currency: string;
  timezone: string;
  notifications: string;
  teamSize: string;
}

const initialForm: OnboardingForm = {
  businessName: "",
  registrationNumber: "",
  category: "",
  contactNumber: "",
  businessEmail: "",
  outletName: "",
  address: "",
  city: "",
  state: "",
  postcode: "",
  country: "",
  logoFile: null,
  logoPreview: "",
  coverFile: null,
  coverPreview: "",
  description: "",
  socialWebsite: "",
  socialInstagram: "",
  socialFacebook: "",
  currency: "",
  timezone: "",
  notifications: "",
  teamSize: "",
};

const Onboarding: React.FC = () => {
  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OnboardingForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = useCallback(
    (field: keyof OnboardingForm, value: string) => {
      setForm((f) => ({ ...f, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    },
    [errors]
  );

  const handleFileUpload = (field: "logoFile" | "coverFile", previewField: "logoPreview" | "coverPreview") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setForm((f) => ({ ...f, [field]: file, [previewField]: url }));
      }
    };
    input.click();
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.businessName.trim()) e.businessName = "Business name is required";
      if (!form.category) e.category = "Select a business category";
      if (!form.contactNumber.trim()) e.contactNumber = "Contact number is required";
      if (!form.businessEmail.trim()) e.businessEmail = "Business email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail))
        e.businessEmail = "Please enter a valid email";
    }
    if (step === 1) {
      if (!form.outletName.trim()) e.outletName = "Outlet name is required";
      if (!form.address.trim()) e.address = "Address is required";
      if (!form.city.trim()) e.city = "City is required";
      if (!form.state.trim()) e.state = "State is required";
      if (!form.postcode.trim()) e.postcode = "Postcode is required";
      if (!form.country) e.country = "Select a country";
    }
    // Steps 2 and 3 are mostly optional
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep()) return;
    setErrors({});
    setStep((s) => s + 1);
  };

  const back = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    completeOnboarding();
    toast.success("Your merchant account is all set!");
    setLoading(false);
    navigate("/dashboard");
  };

  const totalSteps = STEPS.length;
  const isLastFormStep = step === totalSteps - 2; // Step 4 (Preferences)
  const isComplete = step === totalSteps - 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">A</span>
            </div>
            <div>
              <p className="text-sm font-bold text-primary leading-none">Ayoha Reward</p>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Business Portal
              </p>
            </div>
          </div>
          {!isComplete && (
            <span className="text-xs text-muted-foreground">
              Step {step + 1} of {totalSteps - 1}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Step indicator */}
        {!isComplete && (
          <div className="mb-8">
            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-6">
              {STEPS.slice(0, -1).map((s, i) => (
                <div key={s.label} className="flex-1 flex items-center gap-1">
                  <div className="flex-1 relative">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full gradient-primary transition-all duration-500 ease-out ${
                          i < step ? "w-full" : i === step ? "w-1/2" : "w-0"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step labels */}
            <div className="flex justify-between">
              {STEPS.slice(0, -1).map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className={`flex items-center gap-1.5 transition-colors ${
                      i <= step ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-elevated border border-border overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* ===== STEP 1: Business Information ===== */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hi {user?.name ?? "there"}, let's set up your business profile.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Enterprise / business name" error={errors.businessName} htmlFor="biz-name">
                      <Input
                        id="biz-name"
                        placeholder="e.g. Urban Coffee Co."
                        value={form.businessName}
                        onChange={(e) => update("businessName", e.target.value)}
                        className={`h-11 ${errors.businessName ? "border-destructive" : ""}`}
                      />
                    </FormField>

                    <FormField label="Registration number" htmlFor="reg-no">
                      <Input
                        id="reg-no"
                        placeholder="e.g. 202301012345"
                        value={form.registrationNumber}
                        onChange={(e) => update("registrationNumber", e.target.value)}
                        className="h-11"
                      />
                    </FormField>
                  </div>

                  <FormField label="Business category" error={errors.category}>
                    <Select value={form.category} onValueChange={(v) => update("category", v)}>
                      <SelectTrigger className={`h-11 ${errors.category ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fnb">Food & Beverage</SelectItem>
                        <SelectItem value="retail">Retail & Shopping</SelectItem>
                        <SelectItem value="beauty">Beauty & Wellness</SelectItem>
                        <SelectItem value="fitness">Fitness & Sports</SelectItem>
                        <SelectItem value="health">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="services">Professional Services</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Contact number" error={errors.contactNumber} htmlFor="contact-no">
                      <Input
                        id="contact-no"
                        type="tel"
                        placeholder="+60 12 345 6789"
                        value={form.contactNumber}
                        onChange={(e) => update("contactNumber", e.target.value)}
                        className={`h-11 ${errors.contactNumber ? "border-destructive" : ""}`}
                      />
                    </FormField>

                    <FormField label="Business email" error={errors.businessEmail} htmlFor="biz-email">
                      <Input
                        id="biz-email"
                        type="email"
                        placeholder="info@business.com"
                        value={form.businessEmail}
                        onChange={(e) => update("businessEmail", e.target.value)}
                        className={`h-11 ${errors.businessEmail ? "border-destructive" : ""}`}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 2: Outlet / Location ===== */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Outlet / Location</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add your primary outlet or branch location.
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField label="Outlet name" error={errors.outletName} htmlFor="outlet-name">
                    <Input
                      id="outlet-name"
                      placeholder="e.g. Main Branch"
                      value={form.outletName}
                      onChange={(e) => update("outletName", e.target.value)}
                      className={`h-11 ${errors.outletName ? "border-destructive" : ""}`}
                    />
                  </FormField>

                  <FormField label="Address" error={errors.address} htmlFor="address">
                    <Textarea
                      id="address"
                      placeholder="Full street address"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      rows={2}
                      className={errors.address ? "border-destructive" : ""}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="City" error={errors.city} htmlFor="city">
                      <Input
                        id="city"
                        placeholder="e.g. Kuala Lumpur"
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        className={`h-11 ${errors.city ? "border-destructive" : ""}`}
                      />
                    </FormField>
                    <FormField label="State" error={errors.state} htmlFor="state">
                      <Input
                        id="state"
                        placeholder="e.g. Selangor"
                        value={form.state}
                        onChange={(e) => update("state", e.target.value)}
                        className={`h-11 ${errors.state ? "border-destructive" : ""}`}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Postcode" error={errors.postcode} htmlFor="postcode">
                      <Input
                        id="postcode"
                        placeholder="e.g. 50000"
                        value={form.postcode}
                        onChange={(e) => update("postcode", e.target.value)}
                        className={`h-11 ${errors.postcode ? "border-destructive" : ""}`}
                      />
                    </FormField>
                    <FormField label="Country" error={errors.country}>
                      <Select value={form.country} onValueChange={(v) => update("country", v)}>
                        <SelectTrigger className={`h-11 ${errors.country ? "border-destructive" : ""}`}>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MY">Malaysia</SelectItem>
                          <SelectItem value="SG">Singapore</SelectItem>
                          <SelectItem value="ID">Indonesia</SelectItem>
                          <SelectItem value="TH">Thailand</SelectItem>
                          <SelectItem value="PH">Philippines</SelectItem>
                          <SelectItem value="VN">Vietnam</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 3: Brand Profile ===== */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Palette className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Brand Profile</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customise how your business appears to members.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Logo & Cover uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Business logo</label>
                      <button
                        type="button"
                        onClick={() => handleFileUpload("logoFile", "logoPreview")}
                        className="w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-secondary/50 transition-all flex flex-col items-center justify-center gap-2 group"
                      >
                        {form.logoPreview ? (
                          <img
                            src={form.logoPreview}
                            alt="Logo preview"
                            className="h-16 w-16 object-contain rounded-lg"
                          />
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-xs text-muted-foreground">Upload logo</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Cover image</label>
                      <button
                        type="button"
                        onClick={() => handleFileUpload("coverFile", "coverPreview")}
                        className="w-full h-28 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-secondary/50 transition-all flex flex-col items-center justify-center gap-2 group overflow-hidden"
                      >
                        {form.coverPreview ? (
                          <img
                            src={form.coverPreview}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-xs text-muted-foreground">Upload cover</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <FormField label="Business description" htmlFor="biz-desc">
                    <Textarea
                      id="biz-desc"
                      placeholder="Tell your members what your business is about..."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      rows={3}
                    />
                  </FormField>

                  {/* Social links */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Social links</span>
                      <span className="text-xs text-muted-foreground">(optional)</span>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Website URL"
                        value={form.socialWebsite}
                        onChange={(e) => update("socialWebsite", e.target.value)}
                        className="h-10"
                      />
                      <Input
                        placeholder="Instagram handle"
                        value={form.socialInstagram}
                        onChange={(e) => update("socialInstagram", e.target.value)}
                        className="h-10"
                      />
                      <Input
                        placeholder="Facebook page URL"
                        value={form.socialFacebook}
                        onChange={(e) => update("socialFacebook", e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 4: Portal Preferences ===== */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Portal Preferences</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure your portal settings. You can change these anytime.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Preferred currency">
                      <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                          <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                          <SelectItem value="THB">THB - Thai Baht</SelectItem>
                          <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Timezone">
                      <Select value={form.timezone} onValueChange={(v) => update("timezone", v)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala Lumpur (GMT+8)</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                          <SelectItem value="Asia/Jakarta">Asia/Jakarta (GMT+7)</SelectItem>
                          <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                          <SelectItem value="Asia/Manila">Asia/Manila (GMT+8)</SelectItem>
                          <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <FormField label="Notification preference">
                    <Select value={form.notifications} onValueChange={(v) => update("notifications", v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select notification preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All notifications</SelectItem>
                        <SelectItem value="important">Important only</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Team size (optional)" htmlFor="team-size">
                    <Input
                      id="team-size"
                      type="number"
                      min="1"
                      placeholder="e.g. 5"
                      value={form.teamSize}
                      onChange={(e) => update("teamSize", e.target.value)}
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      How many staff members will use the portal?
                    </p>
                  </FormField>
                </div>
              </div>
            )}

            {/* ===== STEP 5: Completion ===== */}
            {isComplete && (
              <div className="text-center space-y-8 py-6">
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center shadow-elevated relative">
                    <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
                    <Sparkles className="h-5 w-5 text-accent absolute -top-1 -right-1" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">You're all set!</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm mx-auto">
                    Your business{" "}
                    <span className="font-semibold text-foreground">{form.businessName}</span> has
                    been set up successfully. Start managing your membership cards, campaigns, and
                    rewards.
                  </p>
                </div>

                {/* Summary pills */}
                <div className="flex flex-wrap justify-center gap-2">
                  {form.outletName && (
                    <span className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full px-3 py-1.5">
                      <MapPin className="h-3 w-3" /> {form.outletName}
                    </span>
                  )}
                  {form.category && (
                    <span className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full px-3 py-1.5">
                      <Building2 className="h-3 w-3" /> {form.category}
                    </span>
                  )}
                  {form.currency && (
                    <span className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full px-3 py-1.5">
                      {form.currency}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions bar */}
          <div className="px-6 sm:px-8 py-5 border-t border-border bg-muted/20 flex items-center gap-3">
            {step > 0 && !isComplete && (
              <Button variant="outline" onClick={back} className="h-11 px-5">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            {!isComplete ? (
              <Button
                onClick={next}
                className="h-11 px-6 font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                {isLastFormStep ? "Complete Setup" : "Save & Continue"}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={loading}
                className="h-11 px-8 font-semibold gradient-primary hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Skip for now */}
        {!isComplete && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            You can complete this later.{" "}
            <button
              onClick={handleFinish}
              className="text-primary hover:underline font-medium"
            >
              Skip for now
            </button>
          </p>
        )}
      </main>
    </div>
  );
};

export default Onboarding;
