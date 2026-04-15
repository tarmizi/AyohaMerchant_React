import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Stamp, Star, Percent, Trophy, Ticket, CalendarCheck, Tag, Users,
  ShieldAlert, ArrowLeft, Save, Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantQuota } from "@/hooks/useMerchantQuota";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LoyaltyProgramModuleType } from "@/hooks/useLoyaltyPrograms";

const PROGRAM_TYPES: { key: LoyaltyProgramModuleType; label: string; icon: React.ElementType; color: string; bg: string; desc: string }[] = [
  { key: "stamp",    label: "Loyalty Stamp",        icon: Stamp,         color: "text-rose-600",    bg: "bg-rose-50 border-rose-200",    desc: "Stamp-based reward cards for repeat purchases" },
  { key: "point",    label: "Loyalty Point",        icon: Star,          color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",  desc: "Point accumulation and redemption system" },
  { key: "discount", label: "Membership Discount",  icon: Percent,       color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", desc: "Exclusive discounts for card members" },
  { key: "voucher",  label: "Membership Voucher",   icon: Ticket,        color: "text-blue-600",    bg: "bg-blue-50 border-blue-200",    desc: "Digital vouchers and gift certificates" },
  { key: "contest",  label: "Membership Contest",   icon: Trophy,        color: "text-purple-600",  bg: "bg-purple-50 border-purple-200", desc: "Contests and prize draws for members" },
  { key: "event",    label: "Membership Event",     icon: CalendarCheck, color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-200", desc: "Exclusive events and experiences" },
  { key: "coupon",   label: "Membership Coupon",    icon: Tag,           color: "text-orange-600",  bg: "bg-orange-50 border-orange-200", desc: "Promotional coupons and offers" },
  { key: "referral", label: "Membership Referral",  icon: Users,         color: "text-teal-600",    bg: "bg-teal-50 border-teal-200",    desc: "Refer-a-friend reward programs" },
];

const TABLE_MAP: Record<LoyaltyProgramModuleType, string> = {
  stamp: "loyalty_program_stamp",
  point: "loyalty_program_point",
  discount: "loyalty_program_discount",
  voucher: "loyalty_program_voucher",
  contest: "loyalty_program_contest",
  event: "loyalty_program_event",
  coupon: "loyalty_program_coupon",
  referral: "loyalty_program_referral",
};

const CreateLoyaltyProgram: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const quota = useMerchantQuota();
  const qc = useQueryClient();

  const [step, setStep] = useState<"select" | "form">("select");
  const [selectedType, setSelectedType] = useState<LoyaltyProgramModuleType | null>(null);
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const quotaExceeded = !quota.isLoading && !quota.can_create_program;
  const selectedMeta = PROGRAM_TYPES.find((t) => t.key === selectedType);

  const handleSelectType = (type: LoyaltyProgramModuleType) => {
    if (quotaExceeded) return;
    // Stamp type has its own dedicated form
    if (type === "stamp") {
      navigate("/campaigns/stamp-loyalty/new");
      return;
    }
    setSelectedType(type);
    setStep("form");
    setProgramName("");
    setProgramDescription("");
    setErrors({});
  };

  const handleSave = async () => {
    if (!user || !selectedType) return;

    // Validate
    const errs: Record<string, string> = {};
    if (!programName.trim()) errs.program_name = "Program name is required";
    if (programName.length > 150) errs.program_name = "Name must be less than 150 characters";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Re-check quota
    if (quotaExceeded) {
      toast.error("Your current plan allows only 1 Loyalty Program. Please upgrade or contact admin to add more.");
      return;
    }

    setSaving(true);
    try {
      const table = TABLE_MAP[selectedType];
      const payload = {
        merchant_account_id: user.id,
        program_name: programName.trim(),
        program_description: programDescription.trim() || null,
        program_status: "Active",
      };

      const { error } = await supabase.from(table as any).insert(payload as any);
      if (error) throw error;

      // The DB trigger auto-syncs to loyalty_program_master
      qc.invalidateQueries({ queryKey: ["loyalty-programs-master"] });
      qc.invalidateQueries({ queryKey: ["merchant_quota"] });
      toast.success(`${selectedMeta?.label} program created successfully`);
      navigate("/campaigns/loyalty-programs");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create loyalty program");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Create Loyalty Program"
        description={step === "select" ? "Choose a loyalty program type to get started" : `Set up your ${selectedMeta?.label} program`}
        breadcrumbs={[
          { label: "Campaign Setting" },
          { label: "Loyalty Programs", href: "/campaigns/loyalty-programs" },
          { label: "Create New" },
        ]}
      />

      <div className="p-6 space-y-5 max-w-4xl">
        {/* Quota Warning */}
        {quotaExceeded && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Your current plan allows only {quota.max_loyalty_programs} Loyalty Program.
              You are currently using {quota.current_loyalty_programs} of {quota.max_loyalty_programs} allowed program(s).
              Please upgrade or contact admin to add more.
            </AlertDescription>
          </Alert>
        )}

        {step === "select" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PROGRAM_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    disabled={quotaExceeded}
                    onClick={() => handleSelectType(t.key)}
                    className={`text-left border rounded-xl p-4 transition-all hover:shadow-md hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed ${t.bg}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${t.color}`} />
                      <span className="text-sm font-semibold text-foreground">{t.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </div>
          </>
        )}

        {step === "form" && selectedMeta && (
          <>
            <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="gap-2 -mt-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Change Program Type
            </Button>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b border-border">
                <div className={`h-9 w-9 rounded-lg border flex items-center justify-center ${selectedMeta.bg}`}>
                  <selectedMeta.icon className={`h-4.5 w-4.5 ${selectedMeta.color}`} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{selectedMeta.label} Program</h2>
                  <p className="text-xs text-muted-foreground">Fill in the details below</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Program Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder={`e.g. My ${selectedMeta.label}`}
                    value={programName}
                    onChange={(e) => { setProgramName(e.target.value); setErrors((p) => ({ ...p, program_name: "" })); }}
                    maxLength={150}
                  />
                  {errors.program_name && <p className="text-xs text-destructive">{errors.program_name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Program Description</Label>
                  <Textarea
                    placeholder="Describe how this program works..."
                    value={programDescription}
                    onChange={(e) => setProgramDescription(e.target.value)}
                    rows={3}
                    className="resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("select")}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || quotaExceeded} className="gap-2 min-w-[140px]">
                {saving ? "Saving..." : <><Save className="h-4 w-4" /> Create Program</>}
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};

export default CreateLoyaltyProgram;
