import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Upload, X, Save, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
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

const STATES = ["Johor","Kedah","Kelantan","Melaka","Negeri Sembilan","Pahang","Perak","Perlis","Pulau Pinang","Sabah","Sarawak","Selangor","Terengganu","WP Kuala Lumpur","WP Putrajaya","WP Labuan"];

const EditEnterprise: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: enterprise, isLoading: fetching } = useQuery({
    queryKey: ["enterprise", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("enterprises").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const [logo, setLogo] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", tagline: "", state: "", city: "", postcode: "", street: "",
    businessRegNo: "", officePhone: "", email: "", description: "",
    branchType: "", businessMode: "", bankName: "", bankAccountType: "",
    bankAccountName: "", bankAccountNo: "", facebook: "", instagram: "",
    coordinate: "", ownerName: "", whatsappNo: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (enterprise) {
      setForm({
        name: enterprise.enterprise_name ?? "",
        tagline: enterprise.tagline ?? "",
        state: enterprise.state ?? "",
        city: enterprise.city ?? "",
        postcode: enterprise.postcode ?? "",
        street: enterprise.street_detail ?? "",
        businessRegNo: enterprise.business_reg_no ?? "",
        officePhone: enterprise.office_phone ?? "",
        email: enterprise.company_email ?? "",
        description: enterprise.description ?? "",
        branchType: enterprise.branch_type ?? "",
        businessMode: enterprise.business_mode ?? "",
        bankName: enterprise.bank_name ?? "",
        bankAccountType: enterprise.bank_account_type ?? "",
        bankAccountName: enterprise.bank_account_name ?? "",
        bankAccountNo: enterprise.bank_account_no ?? "",
        facebook: enterprise.facebook ?? "",
        instagram: enterprise.instagram ?? "",
        coordinate: enterprise.coordinate ?? "",
        ownerName: enterprise.pic_name ?? "",
        whatsappNo: enterprise.whatsapp_no ?? "",
      });
      setLogo(enterprise.logo_url);
    }
  }, [enterprise]);

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

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("enterprises").update({
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
      }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprises"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise", id] });
      toast.success("Enterprise updated successfully");
      navigate(`/account/enterprise-info/${id}`);
    },
    onError: () => toast.error("Failed to update enterprise"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("enterprises").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprises"] });
      toast.success("Enterprise deleted successfully");
      navigate("/account/enterprise-info");
    },
    onError: () => toast.error("Failed to delete enterprise"),
  });

  const handleSave = () => {
    if (!validate()) { toast.error("Please fill in all required fields"); return; }
    updateMutation.mutate();
  };

  const inputClass = "h-10 bg-background border-border";

  if (fetching) {
    return (
      <AppShell>
        <PageHeader title="Edit Enterprise" breadcrumbs={[{ label: "My Account" }, { label: "Enterprise Info", href: "/account/enterprise-info" }, { label: "Edit Enterprise" }]} />
        <div className="p-6 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!enterprise) {
    return (
      <AppShell>
        <PageHeader title="Edit Enterprise" breadcrumbs={[{ label: "My Account" }, { label: "Enterprise Info", href: "/account/enterprise-info" }, { label: "Not Found" }]} />
        <div className="p-6 text-center py-20">
          <p className="text-muted-foreground">Enterprise not found.</p>
          <Button className="mt-4" onClick={() => navigate("/account/enterprise-info")}>Back to List</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Edit Enterprise"
        breadcrumbs={[{ label: "My Account" }, { label: "Enterprise Info", href: "/account/enterprise-info" }, { label: "Edit Enterprise" }]}
        actions={<Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8"><X className="h-4 w-4" /></Button>}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT */}
          <FormSection title="Enterprise Information">
            <div className="flex items-start gap-4">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="relative h-28 w-28 rounded-xl border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors overflow-hidden group shrink-0">
                {logo ? <img src={logo} alt="Logo" className="absolute inset-0 w-full h-full object-cover rounded-xl" /> : <><ImageIcon className="h-6 w-6 text-muted-foreground/50" /><span className="text-[10px] text-muted-foreground/60">Change Logo</span></>}
                <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Upload className="h-3 w-3" /></div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <div className="text-xs text-muted-foreground pt-2 space-y-1">
                <p className="font-medium text-foreground">Enterprise Logo</p>
                <p>JPG, PNG or SVG. Max 2MB.</p>
                {logo && <button type="button" onClick={() => setLogo(null)} className="text-destructive hover:underline text-[11px]">Remove logo</button>}
              </div>
            </div>

            <Field label="Enterprise Name" required error={errors.name}><Input className={inputClass} value={form.name} onChange={set("name")} /></Field>
            <Field label="Enterprise TagLine / Slogan"><Input className={inputClass} value={form.tagline} onChange={set("tagline")} /></Field>

            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground"><span className="text-destructive mr-0.5">*</span>Address</Label>
              <div className="grid grid-cols-3 gap-3">
                <Field label="State">
                  <Select value={form.state} onValueChange={setSelect("state")}>
                    <SelectTrigger className={inputClass}><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="City"><Input className={inputClass} value={form.city} onChange={set("city")} /></Field>
                <Field label="Postcode"><Input className={inputClass} value={form.postcode} onChange={set("postcode")} /></Field>
              </div>
            </div>

            <Field label="Jalan / Lot / Unit Etc"><Textarea className="bg-background border-border min-h-[72px]" value={form.street} onChange={set("street")} /></Field>
            <Field label="Business Registration No."><Input className={inputClass} value={form.businessRegNo} onChange={set("businessRegNo")} /></Field>
            <Field label="Office Phone No"><Input className={inputClass} value={form.officePhone} onChange={set("officePhone")} /></Field>
            <Field label="Company Email / PIC Email" required error={errors.email}><Input className={inputClass} type="email" value={form.email} onChange={set("email")} /></Field>
            <Field label="Enterprise / Business Description"><Textarea className="bg-background border-border min-h-[72px]" value={form.description} onChange={set("description")} /></Field>

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

          {/* RIGHT */}
          <div className="space-y-6">
            <FormSection title="Bank Account Info">
              <Field label="Bank Name"><Input className={inputClass} value={form.bankName} onChange={set("bankName")} /></Field>
              <Field label="Bank Account Type">
                <Select value={form.bankAccountType} onValueChange={setSelect("bankAccountType")}>
                  <SelectTrigger className={inputClass}><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent><SelectItem value="Savings">Savings</SelectItem><SelectItem value="Current">Current</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Bank Account Name"><Input className={inputClass} value={form.bankAccountName} onChange={set("bankAccountName")} /></Field>
              <Field label="Bank Account No"><Input className={inputClass} value={form.bankAccountNo} onChange={set("bankAccountNo")} /></Field>
            </FormSection>

            <FormSection title="Social Media Link">
              <Field label="Facebook" hint="Enter your Facebook page URL"><Input className={inputClass} value={form.facebook} onChange={set("facebook")} /></Field>
              <Field label="Instagram" hint="Enter your Instagram profile URL"><Input className={inputClass} value={form.instagram} onChange={set("instagram")} /></Field>
              <Field label="Coordinate" hint="Latitude, Longitude (e.g. 2.912862, 101.683981)"><Input className={inputClass} value={form.coordinate} onChange={set("coordinate")} /></Field>
            </FormSection>

            <FormSection title="PIC / Owner Contact Info">
              <Field label="Owner / PIC Name" required error={errors.ownerName}><Input className={inputClass} value={form.ownerName} onChange={set("ownerName")} /></Field>
              <Field label="WhatsApp No" required error={errors.whatsappNo}><Input className={inputClass} value={form.whatsappNo} onChange={set("whatsappNo")} /></Field>
            </FormSection>

            <FormSection title="Ayoha Merchant Account Info">
              <Field label="Register Date"><Input className={`${inputClass} bg-muted/50`} value={enterprise.register_date ? new Date(enterprise.register_date).toLocaleString() : ""} readOnly /></Field>
              <Field label="Versions"><Input className={`${inputClass} bg-muted/50`} value={enterprise.version ?? "1.0"} readOnly /></Field>
            </FormSection>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" /> Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Enterprise</AlertDialogTitle>
                <AlertDialogDescription>Are you sure you want to delete <strong>{form.name}</strong>? This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSave} className="gap-2" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default EditEnterprise;
