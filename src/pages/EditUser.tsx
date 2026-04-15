import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Camera, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useMerchantUser, useUpdateMerchantUser, useDeleteMerchantUser, uploadMerchantAvatar } from "@/hooks/useMerchantUsers";
import { useAuth } from "@/contexts/AuthContext";

type UserType = "Administrator" | "Owner" | "Staff";
type UserStatus = "Active" | "Inactive";

interface FormData {
  name: string;
  email: string;
  phone: string;
  userType: UserType;
  status: UserStatus;
  userName: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  userName?: string;
  password?: string;
}

const DetailField: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode }> = ({
  label, required, error, children,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1.5 sm:gap-4 items-start py-3">
    <Label className="text-xs font-medium text-muted-foreground pt-2.5">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    <div className="space-y-1">
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  </div>
);

const getInitials = (name: string) =>
  name.split(/[\s-]+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { data: userData, isLoading } = useMerchantUser(id);
  const updateMutation = useUpdateMerchantUser();
  const deleteMutation = useDeleteMerchantUser();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", userType: "Staff", status: "Active", userName: "", password: "",
  });
  const [initialized, setInitialized] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (userData && !initialized) {
      setForm({
        name: userData.account_name,
        email: userData.email,
        phone: userData.phone_number,
        userType: userData.user_type,
        status: userData.user_status,
        userName: userData.username,
        password: "",
      });
      setInitialized(true);
    }
  }, [userData, initialized]);

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Edit User" breadcrumbs={[{ label: "My Account" }, { label: "User List", href: "/account/user-list" }, { label: "Loading..." }]} />
        <div className="p-6 max-w-3xl space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!userData) {
    return (
      <AppShell>
        <PageHeader title="Edit User" breadcrumbs={[{ label: "My Account" }, { label: "User List", href: "/account/user-list" }, { label: "Edit User" }]} />
        <div className="p-6 text-center text-muted-foreground">User not found.</div>
      </AppShell>
    );
  }

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Account name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.userName.trim()) e.userName = "User name is required";
    if (form.password && form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      let profileImageUrl: string | undefined;
      if (avatarFile && authUser) {
        profileImageUrl = await uploadMerchantAvatar(avatarFile, authUser.id);
      }
      await updateMutation.mutateAsync({
        id: userData.id,
        account_name: form.name,
        email: form.email,
        phone_number: form.phone,
        user_type: form.userType,
        user_status: form.status,
        username: form.userName,
        ...(form.password ? { password: form.password } : {}),
        ...(profileImageUrl ? { profile_image_url: profileImageUrl } : {}),
      });
      toast.success("User updated successfully");
      navigate(`/account/user-list/${userData.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(userData.id, {
      onSuccess: () => { toast.success("User deleted successfully"); navigate("/account/user-list"); },
      onError: () => toast.error("Failed to delete user"),
    });
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try { return new Date(d).toISOString().slice(0, 10); } catch { return d; }
  };

  return (
    <AppShell>
      <PageHeader
        title="Edit User"
        breadcrumbs={[
          { label: "My Account" },
          { label: "User List", href: "/account/user-list" },
          { label: userData.account_name, href: `/account/user-list/${id}` },
          { label: "Edit" },
        ]}
      />

      <div className="p-6 max-w-3xl space-y-6">
        {/* User Profile */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">User Profile</h2>
          </div>
          <div className="px-5 py-4 divide-y divide-border/60">
            <DetailField label="Profile Image">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-16 w-16">
                    {(avatarPreview || userData.profile_image_url) && (
                      <AvatarImage src={avatarPreview || userData.profile_image_url!} alt={form.name} />
                    )}
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-semibold">
                      {getInitials(form.name)}
                    </AvatarFallback>
                  </Avatar>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  <button type="button" className="absolute inset-0 flex items-center justify-center bg-foreground/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Change photo"
                    onClick={() => fileInputRef.current?.click()}>
                    <Camera className="h-5 w-5 text-background" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Click to change profile photo</p>
              </div>
            </DetailField>

            <DetailField label="Account Name" required error={errors.name}>
              <Input placeholder="Enter full name" value={form.name} onChange={(e) => update("name", e.target.value)}
                className={`h-10 bg-background border-border ${errors.name ? "border-destructive" : ""}`} />
            </DetailField>

            <DetailField label="Email" required error={errors.email}>
              <Input type="email" placeholder="user@example.com" value={form.email} onChange={(e) => update("email", e.target.value)}
                className={`h-10 bg-background border-border ${errors.email ? "border-destructive" : ""}`} />
            </DetailField>

            <DetailField label="Phone Number" required error={errors.phone}>
              <Input placeholder="+60 12-345 6789" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                className={`h-10 bg-background border-border ${errors.phone ? "border-destructive" : ""}`} />
            </DetailField>

            <DetailField label="Register Date">
              <Input value={formatDate(userData.register_date)} readOnly className="h-10 bg-muted border-border text-muted-foreground cursor-default" />
            </DetailField>

            <DetailField label="User Type" required>
              <Select value={form.userType} onValueChange={(v) => update("userType", v as UserType)}>
                <SelectTrigger className="h-10 bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </DetailField>

            <DetailField label="User Status">
              <Select value={form.status} onValueChange={(v) => update("status", v as UserStatus)}>
                <SelectTrigger className="h-10 bg-background border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </DetailField>

            <DetailField label="Last Login Date">
              <Input value={formatDate(userData.last_login_date)} readOnly className="h-10 bg-muted border-border text-muted-foreground cursor-default" />
            </DetailField>
          </div>
        </div>

        {/* Login */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Login</h2>
          </div>
          <div className="px-5 py-4 divide-y divide-border/60">
            <DetailField label="User Name" required error={errors.userName}>
              <Input placeholder="Enter username" value={form.userName} onChange={(e) => update("userName", e.target.value)}
                className={`h-10 bg-background border-border ${errors.userName ? "border-destructive" : ""}`} />
            </DetailField>

            <DetailField label="Password" error={errors.password}>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Leave blank to keep current password" value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className={`h-10 bg-background border-border pr-10 ${errors.password ? "border-destructive" : ""}`} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((p) => !p)} title={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </DetailField>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <Button variant="outline" onClick={() => navigate(`/account/user-list/${id}`)}>Cancel</Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-1.5"><Trash2 className="h-4 w-4" /> Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <strong>{form.name}</strong>? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button className="px-6" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
};

export default EditUser;
