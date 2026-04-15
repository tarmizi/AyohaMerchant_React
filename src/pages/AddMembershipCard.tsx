import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X, CreditCard, ImageIcon } from "lucide-react";
import { useCreateMembershipCard, uploadCardImage } from "@/hooks/useMembershipCards";
import { useMerchantQuota } from "@/hooks/useMerchantQuota";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

const LEVELS = ["Bronze", "Silver", "Gold", "Platinum", "Elite"];
const CYCLES = ["Monthly", "Quarterly", "Yearly", "One-Time"];

const AddMembershipCard: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateMembershipCard();
  const quota = useMerchantQuota();
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    card_name: "",
    card_level: "",
    fee_payment_cycle: "",
  });
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleImageSelect = (side: "front" | "back", file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setFrontFile(file);
      setFrontPreview(url);
    } else {
      setBackFile(file);
      setBackPreview(url);
    }
  };

  const clearImage = (side: "front" | "back") => {
    if (side === "front") {
      setFrontFile(null);
      setFrontPreview(null);
      if (frontInputRef.current) frontInputRef.current.value = "";
    } else {
      setBackFile(null);
      setBackPreview(null);
      if (backInputRef.current) backInputRef.current.value = "";
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.card_name.trim()) errs.card_name = "Membership Card Name is required";
    if (!form.card_level) errs.card_level = "Membership Card Level is required";
    if (!form.fee_payment_cycle) errs.fee_payment_cycle = "Fee Payment Cycle is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!quota.can_create_card) {
      toast.error("Your current plan allows only 1 Membership Card. Please upgrade or contact admin to add more.");
      return;
    }
    if (!validate()) return;
    setSaving(true);
    try {
      const tempId = crypto.randomUUID();
      let frontUrl: string | null = null;
      let backUrl: string | null = null;

      if (frontFile) frontUrl = await uploadCardImage(frontFile, tempId);
      if (backFile) backUrl = await uploadCardImage(backFile, tempId);

      createMutation.mutate(
        {
          card_name: form.card_name.trim(),
          card_level: form.card_level,
          fee_payment_cycle: form.fee_payment_cycle,
          card_description: null,
          card_image_url: null,
          card_image_front_url: frontUrl,
          card_image_back_url: backUrl,
          card_status: "Active",
          card_type: null,
          validity_start: null,
          validity_end: null,
          max_members: null,
          terms_conditions: null,
        },
        {
          onSuccess: () => {
            toast.success("Membership card created successfully");
            navigate("/cards/settings");
          },
          onError: () => {
            toast.error("Failed to create membership card");
            setSaving(false);
          },
        }
      );
    } catch {
      toast.error("Failed to upload images");
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Create New Membership Card"
        breadcrumbs={[
          { label: "Card Management" },
          { label: "Card List", href: "/cards/settings" },
          { label: "Create New Card" },
        ]}
      />

      {!quota.isLoading && !quota.can_create_card && (
        <div className="px-6 pt-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
              Your current plan allows only {quota.max_membership_cards} Membership Card.
              You are currently using {quota.current_membership_cards} of {quota.max_membership_cards} allowed card(s).
              Please upgrade or contact admin to add more.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="p-6 space-y-6 max-w-3xl">
        {/* Card Details */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center">
              <CreditCard className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Card Details</h2>
              <p className="text-xs text-muted-foreground">Basic information for the membership card</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Card Name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Membership Card Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.card_name}
                onChange={(e) => set("card_name", e.target.value)}
                placeholder="e.g. Ayoha Gold Card"
                className="h-10"
              />
              {errors.card_name && <p className="text-xs text-destructive">{errors.card_name}</p>}
            </div>

            {/* Level & Cycle in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Membership Card Level <span className="text-destructive">*</span>
                </Label>
                <Select value={form.card_level} onValueChange={(v) => set("card_level", v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.card_level && <p className="text-xs text-destructive">{errors.card_level}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Fee Payment Cycle <span className="text-destructive">*</span>
                </Label>
                <Select value={form.fee_payment_cycle} onValueChange={(v) => set("fee_payment_cycle", v)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {CYCLES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fee_payment_cycle && <p className="text-xs text-destructive">{errors.fee_payment_cycle}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Card Background Images */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center">
              <ImageIcon className="h-4.5 w-4.5 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Card Background Images</h2>
              <p className="text-xs text-muted-foreground">Upload front and back card visuals · Image limit &lt; 2MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Front */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Front View</Label>
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect("front", e.target.files?.[0] || null)}
              />
              {frontPreview ? (
                <div className="relative group rounded-xl border border-border overflow-hidden bg-muted aspect-[1.6/1]">
                  <img src={frontPreview} alt="Front preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary" size="sm"
                      onClick={() => frontInputRef.current?.click()}
                    >
                      Change
                    </Button>
                    <Button
                      variant="secondary" size="icon" className="h-8 w-8"
                      onClick={() => clearImage("front")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => frontInputRef.current?.click()}
                  className="w-full aspect-[1.6/1] rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <Upload className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Upload Front Image</span>
                  <span className="text-[11px] text-muted-foreground/70">PNG, JPG up to 2MB</span>
                </button>
              )}
            </div>

            {/* Back */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Back View</Label>
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect("back", e.target.files?.[0] || null)}
              />
              {backPreview ? (
                <div className="relative group rounded-xl border border-border overflow-hidden bg-muted aspect-[1.6/1]">
                  <img src={backPreview} alt="Back preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary" size="sm"
                      onClick={() => backInputRef.current?.click()}
                    >
                      Change
                    </Button>
                    <Button
                      variant="secondary" size="icon" className="h-8 w-8"
                      onClick={() => clearImage("back")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => backInputRef.current?.click()}
                  className="w-full aspect-[1.6/1] rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <Upload className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Upload Back Image</span>
                  <span className="text-[11px] text-muted-foreground/70">PNG, JPG up to 2MB</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end gap-3 pt-2 pb-4">
          <Button variant="outline" onClick={() => navigate("/cards/settings")}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || createMutation.isPending} className="min-w-[120px]">
            {saving ? "Saving..." : "Save Card"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default AddMembershipCard;
