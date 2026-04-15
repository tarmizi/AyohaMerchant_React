import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMerchantUser, useDeleteMerchantUser } from "@/hooks/useMerchantUsers";
import { format } from "date-fns";
import PermissionGate from "@/components/auth/PermissionGate";

const getInitials = (name: string) =>
  name.split(/[\s-]+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-muted text-muted-foreground border-border",
};

const DetailField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1.5 sm:gap-4 items-start py-3">
    <Label className="text-xs font-medium text-muted-foreground pt-2.5">{label}</Label>
    <div>{children}</div>
  </div>
);

const formatDate = (d: string | null) => {
  if (!d) return "—";
  try { return format(new Date(d), "yyyy-MM-dd HH:mm"); } catch { return d; }
};

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useMerchantUser(id);
  const deleteMutation = useDeleteMerchantUser();

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="User Details Info" breadcrumbs={[{ label: "My Account" }, { label: "User List", href: "/account/user-list" }, { label: "Loading..." }]} />
        <div className="p-6 max-w-3xl space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm font-medium text-foreground">User not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/account/user-list")}>Back to User List</Button>
        </div>
      </AppShell>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(user.id, {
      onSuccess: () => { toast.success("User deleted successfully"); navigate("/account/user-list"); },
      onError: () => toast.error("Failed to delete user"),
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="User Details Info"
        breadcrumbs={[{ label: "My Account" }, { label: "User List", href: "/account/user-list" }, { label: user.account_name }]}
        actions={
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" title="Close"
            onClick={() => navigate("/account/user-list")}>
            <X className="h-5 w-5" />
          </Button>
        }
      />

      <div className="p-6 max-w-3xl space-y-6">
        {/* User Profile */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">User Profile</h2>
          </div>
          <div className="px-5 py-4 divide-y divide-border/60">
            <DetailField label="Profile Image">
              <Avatar className="h-16 w-16">
                {user.profile_image_url ? <AvatarImage src={user.profile_image_url} alt={user.account_name} /> : null}
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg font-semibold">
                  {getInitials(user.account_name)}
                </AvatarFallback>
              </Avatar>
            </DetailField>
            <DetailField label="Account Name">
              <p className="text-sm text-foreground pt-2.5">{user.account_name}</p>
            </DetailField>
            <DetailField label="Email">
              <p className="text-sm text-foreground pt-2.5">{user.email}</p>
            </DetailField>
            <DetailField label="Phone Number">
              <p className="text-sm text-foreground pt-2.5">{user.phone_number}</p>
            </DetailField>
            <DetailField label="Register Date">
              <p className="text-sm text-muted-foreground pt-2.5">{formatDate(user.register_date)}</p>
            </DetailField>
            <DetailField label="User Type">
              <Badge variant="outline" className="mt-2">{user.user_type}</Badge>
            </DetailField>
            <DetailField label="User Status">
              <Badge variant="outline" className={`mt-2 ${STATUS_STYLES[user.user_status]}`}>{user.user_status}</Badge>
            </DetailField>
            <DetailField label="Last Login Date">
              <p className="text-sm text-muted-foreground pt-2.5">{formatDate(user.last_login_date)}</p>
            </DetailField>
          </div>
        </div>

        {/* Login */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Login</h2>
          </div>
          <div className="px-5 py-4 divide-y divide-border/60">
            <DetailField label="User Name">
              <p className="text-sm text-foreground pt-2.5">{user.username}</p>
            </DetailField>
            <DetailField label="Password">
              <p className="text-sm text-muted-foreground pt-2.5">••••••••</p>
            </DetailField>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pb-4">
          <PermissionGate permission="users:manage_roles">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive">
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{user.account_name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </PermissionGate>

          <PermissionGate permission="users:manage">
            <Button className="gap-2 px-6" onClick={() => navigate(`/account/user-list/${user.id}/edit`)}>
              Edit
            </Button>
          </PermissionGate>
        </div>
      </div>
    </AppShell>
  );
};

export default UserDetails;
