import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload, X, Save, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

/* ---- Helpers ---- */
interface FormSectionProps { title: string; children: React.ReactNode; }
const FormSection: React.FC<FormSectionProps> = ({ title, children }) => (
  <div className="bg-card border border-border rounded-xl p-6 space-y-5">
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    {children}
  </div>
);

interface FieldProps { label: string; required?: boolean; hint?: string; children: React.ReactNode; error?: string; }
const Field: React.FC<FieldProps> = ({ label, required, hint, children, error }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">
      {required && <span className="text-destructive mr-0.5">*</span>}{label}
    </Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

/* ---- Page ---- */
const AddEnterprise: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logo, setLogo] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", tagline: "", state: "", city: "", postcode: "", street: "",
    businessRegNo: "", officePhone: "", email: "", description: "",
    branchType: "", businessMode: "", bankName: "", bankAccountType: "",
    bankAccountName: "", bankAccountNo: "", facebook: "", instagram: "",
    coordinate: "", ownerName: "", whatsappNo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const setSelect = (key: string) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Enterprise name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.branchType) errs.branchType = "Branch type is required";
    if (!form.businessMode) errs.businessMode = "Business mode is required";
    if (!form.ownerName.trim()) errs.ownerName = "Owner / PIC name is required";
    if (!form.whatsappNo.trim()) errs.whatsappNo = "WhatsApp number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("enterprises").insert({
        user_id: user.id,
        enterprise_name: form.name,
        tagline: form.tagline || null,
        state: form.state || null,
        city: form.city || null,
        postcode: form.postcode || null,
        street_detail: form.street || null,
        business_reg_no: form.businessRegNo || null,
        office_phone: form.officePhone || null,
        company_email: form.email || null,
        description: form.description || null,
        branch_type: form.branchType || null,
        business_mode: form.businessMode || null,
        bank_name: form.bankName || null,
        bank_account_type: form.bankAccountType || null,
        bank_account_name: form.bankAccountName || null,
        bank_account_no: form.bankAccountNo || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        coordinate: form.coordinate || null,
        pic_name: form.ownerName || null,
        whatsapp_no: form.whatsappNo || null,
        logo_url: logo || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprises"] });
      toast.success("Enterprise created successfully");
      navigate("/account/enterprise-info");
    },
    onError: () => toast.error("Failed to create enterprise. Please try again."),
  });

  const handleSave = () => {
    if (!validate()) { toast.error("Please fill in all required fields"); return; }
    createMutation.mutate();
  };

  const inputClass = "h-10 bg-background border-border";

  return (
    <AppShell>
      <PageHeader
        title="Add New Enterprise"
        breadcrumbs={[
          { label: "My Account" },
          { label: "Enterprise Info", href: "/account/enterprise-info" },
          { label: "Add New Enterprise" },
        ]}
        actions={<Button variant="ghost" size="icon" onClick={() => navigate("/account/enterprise-info")} className="h-8 w-8"><X className="h-4 w-4" /></Button>}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <FormSection title="Enterprise Information">
            <div className="flex items-start gap-4">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="relative h-28 w-28 rounded-xl border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors overflow-hidden group shrink-0">
                {logo ? <img src={logo} alt="Logo" className="absolute inset-0 w-full h-full object-cover rounded-xl" /> : <><ImageIcon className="h-6 w-6 text-muted-foreground/50" /><span className="text-[10px] text-muted-foreground/60">Upload Logo</span></>}
                <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="h-3 w-3" /></div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <div className="text-xs text-muted-foreground pt-2 space-y-1">
                <p className="font-medium text-foreground">Enterprise Logo</p>
                <p>JPG, PNG or SVG. Max 2MB.</p>
              </div>
            </div>

            <Field label="Enterprise Name" required error={errors.name}>
              <Input className={inputClass} placeholder="e.g. Kopi Surat Cinta - Putrajaya" value={form.name} onChange={set("name")} />
            </Field>
            <Field label="Enterprise TagLine / Slogan">
              <Input className={inputClass} placeholder="e.g. makan kenangan lalu" value={form.tagline} onChange={set("tagline")} />
            </Field>

            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive mr-0.5">*</span>Address</Label>
              <div className="grid grid-cols-3 gap-3">
                <Field label="State">
                  <Select value={form.state} onValueChange={setSelect("state")}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {["Johor","Kedah","Kelantan","Melaka","Negeri Sembilan","Pahang","Perak","Perlis","Pulau Pinang","Sabah","Sarawak","Selangor","Terengganu","WP Kuala Lumpur","WP Putrajaya","WP Labuan"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="City"><Input className={inputClass} placeholder="City" value={form.city} onChange={set("city")} /></Field>
                <Field label="Postcode"><Input className={inputClass} placeholder="e.g. 62648" value={form.postcode} onChange={set("postcode")} /></Field>
              </div>
            </div>

            <Field label="Jalan / Lot / Unit Etc"><Textarea className="bg-background border-border min-h-[72px]" placeholder="e.g. lot 3830, 1st floor" value={form.street} onChange={set("street")} /></Field>
            <Field label="Business Registration No."><Input className={inputClass} placeholder="e.g. ABCDF-38744" value={form.businessRegNo} onChange={set("businessRegNo")} /></Field>
            <Field label="Office Phone No"><Input className={inputClass} placeholder="e.g. 0102173036" value={form.officePhone} onChange={set("officePhone")} /></Field>
            <Field label="Company Email / PIC Email" required error={errors.email}><Input className={inputClass} type="email" placeholder="e.g. admin@kopisuratcinta.com" value={form.email} onChange={set("email")} /></Field>
            <Field label="Enterprise / Business Description"><Textarea className="bg-background border-border min-h-[72px]" placeholder="Brief description" value={form.description} onChange={set("description")} /></Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Enterprise Branch Type" required error={errors.branchType}>
                <Select value={form.branchType} onValueChange={setSelect("branchType")}>
                  <SelectTrigger className={inputClass}><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Head Quarters">Head Quarters</SelectItem>
                    <SelectItem value="Branch">Branch</SelectItem>
                    <SelectItem value="Outlet">Outlet</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Business Mode" required error={errors.businessMode}>
                <Select value={form.businessMode} onValueChange={setSelect("businessMode")}>
                  <SelectTrigger className={inputClass}><SelectValue placeholder="Select mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="In Premise">In Premise</SelectItem>
                    <SelectItem value="Online & In Premise">Online & In Premise</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </FormSection>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <FormSection title="Bank Account Info">
              <Field label="Bank Name"><Input className={inputClass} placeholder="e.g. Maybank" value={form.bankName} onChange={set("bankName")} /></Field>
              <Field label="Bank Account Type">
                <Select value={form.bankAccountType} onValueChange={setSelect("bankAccountType")}>
                  <SelectTrigger className={inputClass}><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent><SelectItem value="Savings">Savings</SelectItem><SelectItem value="Current">Current</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Bank Account Name"><Input className={inputClass} placeholder="Account holder name" value={form.bankAccountName} onChange={set("bankAccountName")} /></Field>
              <Field label="Bank Account No"><Input className={inputClass} placeholder="Account number" value={form.bankAccountNo} onChange={set("bankAccountNo")} /></Field>
            </FormSection>

            <FormSection title="Social Media Link">
              <Field label="Facebook" hint="Enter your Facebook page URL"><Input className={inputClass} placeholder="https://facebook.com/yourpage" value={form.facebook} onChange={set("facebook")} /></Field>
              <Field label="Instagram" hint="Enter your Instagram profile URL"><Input className={inputClass} placeholder="https://instagram.com/yourprofile" value={form.instagram} onChange={set("instagram")} /></Field>
              <Field label="Coordinate" hint="Latitude, Longitude (e.g. 2.912862, 101.683981)"><Input className={inputClass} placeholder="e.g. 2.912862, 101.683981" value={form.coordinate} onChange={set("coordinate")} /></Field>
            </FormSection>

            <FormSection title="PIC / Owner Contact Info">
              <Field label="Owner / PIC Name" required error={errors.ownerName}><Input className={inputClass} placeholder="e.g. Ahmad" value={form.ownerName} onChange={set("ownerName")} /></Field>
              <Field label="WhatsApp No" required error={errors.whatsappNo}><Input className={inputClass} placeholder="e.g. 0102173036" value={form.whatsappNo} onChange={set("whatsappNo")} /></Field>
            </FormSection>

            <FormSection title="Ayoha Merchant Account Info">
              <Field label="Register Date"><Input className={`${inputClass} bg-muted/50`} value={new Date().toLocaleString()} readOnly /></Field>
              <Field label="Versions"><Input className={`${inputClass} bg-muted/50`} value="1.0" readOnly /></Field>
            </FormSection>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate("/account/enterprise-info")}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Create Enterprise
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default AddEnterprise;
