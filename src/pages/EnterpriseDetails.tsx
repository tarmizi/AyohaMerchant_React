import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Trash2, Pencil, Info, Upload } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import PermissionGate from "@/components/auth/PermissionGate";

interface FieldRowProps { label: string; value: string; required?: boolean; multiline?: boolean; hint?: string; }
const FieldRow: React.FC<FieldRowProps> = ({ label, value, required, multiline, hint }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        {required && <span className="text-destructive">*</span>}{label}
      </span>
      {hint && <span title={hint}><Info className="h-3.5 w-3.5 text-primary/60 cursor-help" /></span>}
    </div>
    <p className={`text-sm text-foreground ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>
      {value || <span className="text-muted-foreground/50 italic">—</span>}
    </p>
    <Separator className="mt-2" />
  </div>
);

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-base font-semibold text-foreground mb-4">{children}</h3>
);

const getInitials = (name: string) =>
  name.split(/[\s-]+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const EnterpriseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: enterprise, isLoading } = useQuery({
    queryKey: ["enterprise", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("enterprises").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
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

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Enterprise Details Info" breadcrumbs={[{ label: "My Account" }, { label: "Enterprise Info", href: "/account/enterprise-info" }, { label: "Enterprise Details" }]} />
        <div className="p-6 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!enterprise) {
    return (
      <AppShell>
        <PageHeader title="Enterprise Details Info" breadcrumbs={[{ label: "My Account" }, { label: "Enterprise Info", href: "/account/enterprise-info" }, { label: "Not Found" }]} />
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
        title="Enterprise Details Info"
        breadcrumbs={[{ label: "My Account" }, { label: "Enterprise Info", href: "/account/enterprise-info" }, { label: "Enterprise Details" }]}
        actions={<Button variant="ghost" size="icon" onClick={() => navigate("/account/enterprise-info")} className="h-8 w-8"><X className="h-4 w-4" /></Button>}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <SectionHeading>Enterprise Information</SectionHeading>
            <div className="flex items-start gap-4 mb-2">
              <div className="relative group">
                <Avatar className="h-28 w-28 rounded-xl border-2 border-dashed border-border">
                  {enterprise.logo_url ? (
                    <img src={enterprise.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <AvatarFallback className="rounded-xl bg-secondary text-secondary-foreground text-2xl font-bold">
                      {getInitials(enterprise.enterprise_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>

            <FieldRow label="Enterprise Name" value={enterprise.enterprise_name} required />
            <FieldRow label="Enterprise TagLine / Slogan" value={enterprise.tagline ?? ""} />

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span>Address</span>
              <div className="grid grid-cols-3 gap-4 mt-1">
                <div><span className="text-[11px] text-muted-foreground">State</span><p className="text-sm text-foreground truncate">{enterprise.state || "—"}</p></div>
                <div><span className="text-[11px] text-muted-foreground">City</span><p className="text-sm text-foreground truncate">{enterprise.city || "—"}</p></div>
                <div><span className="text-[11px] text-muted-foreground">Postcode</span><p className="text-sm text-foreground">{enterprise.postcode || "—"}</p></div>
              </div>
              <Separator className="mt-2" />
            </div>

            <FieldRow label="Jalan / Lot / Unit Etc" value={enterprise.street_detail ?? ""} multiline />
            <FieldRow label="Business Registration No." value={enterprise.business_reg_no ?? ""} />
            <FieldRow label="Office Phone No" value={enterprise.office_phone ?? ""} />
            <FieldRow label="Company Email / PIC Email" value={enterprise.company_email ?? ""} required />
            <FieldRow label="Enterprise / Business Description" value={enterprise.description ?? ""} multiline />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span>Enterprise Branch Type</span>
                <div className="flex items-center gap-2"><Badge variant="default" className="text-xs">{enterprise.branch_type ?? "—"}</Badge></div>
                <Separator className="mt-2" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground"><span className="text-destructive">*</span>Business Mode</span>
                <div className="flex items-center gap-2"><Badge variant="secondary" className="text-xs">{enterprise.business_mode ?? "—"}</Badge></div>
                <Separator className="mt-2" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <SectionHeading>Bank Account Info</SectionHeading>
              <FieldRow label="Bank Name" value={enterprise.bank_name ?? ""} />
              <FieldRow label="Bank Account Type" value={enterprise.bank_account_type ?? ""} />
              <FieldRow label="Bank Account Name" value={enterprise.bank_account_name ?? ""} />
              <FieldRow label="Bank Account No" value={enterprise.bank_account_no ?? ""} />
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <SectionHeading>Social Media Link</SectionHeading>
              <FieldRow label="Facebook" value={enterprise.facebook ?? ""} hint="Facebook page URL" />
              <FieldRow label="Instagram" value={enterprise.instagram ?? ""} hint="Instagram profile URL" />
              <FieldRow label="Coordinate" value={enterprise.coordinate ?? ""} hint="Latitude, Longitude for map display" />
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <SectionHeading>PIC / Owner Contact Info</SectionHeading>
              <FieldRow label="Owner / PIC Name" value={enterprise.pic_name ?? ""} required />
              <FieldRow label="WhatsApp No" value={enterprise.whatsapp_no ?? ""} required />
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <SectionHeading>Ayoha Merchant Account Info (Read Only)</SectionHeading>
              <FieldRow label="Register Date" value={enterprise.register_date ? new Date(enterprise.register_date).toLocaleString() : ""} />
              <FieldRow label="Versions" value={enterprise.version ?? ""} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <PermissionGate permission="enterprise:delete">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /> Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Enterprise</AlertDialogTitle>
                  <AlertDialogDescription>Are you sure you want to delete "{enterprise.enterprise_name}"? This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </PermissionGate>

          <PermissionGate permission="enterprise:manage">
            <Button onClick={() => navigate(`/account/enterprise-info/${id}/edit`)} className="gap-2">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </PermissionGate>
        </div>
      </div>
    </AppShell>
  );
};

export default EnterpriseDetails;
