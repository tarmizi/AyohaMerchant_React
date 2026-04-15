import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Eye, Pencil, Trash2, Users } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useMerchantUsers, useDeleteMerchantUser } from "@/hooks/useMerchantUsers";
import PermissionGate from "@/components/auth/PermissionGate";

type UserType = "Administrator" | "Owner" | "Staff";

const USER_TYPE_STYLES: Record<UserType, string> = {
  Owner: "bg-primary/10 text-primary border-primary/20",
  Administrator: "bg-accent/10 text-accent border-accent/20",
  Staff: "bg-secondary text-secondary-foreground border-border",
};

const getInitials = (name: string) =>
  name.split(/[\s-]+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const UserList: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const { data: users = [], isLoading } = useMerchantUsers();
  const deleteMutation = useDeleteMerchantUser();

  const filtered = users.filter((u) =>
    u.account_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success("User deleted successfully");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete user"),
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="User List"
        description="Manage internal portal users under your business account"
        breadcrumbs={[{ label: "My Account" }, { label: "User List" }]}
      />

      <div className="p-6 space-y-4">
        {/* Search + Add */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-card border-border"
            />
          </div>
          <PermissionGate permission="users:manage">
            <Button className="gap-2 shrink-0" onClick={() => navigate("/account/user-list/new")}>
              <Plus className="h-4 w-4" /> Add New User
            </Button>
          </PermissionGate>
        </div>

        {/* User list card */}
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? "Try adjusting your search" : "Add a new user to get started"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/account/user-list/${user.id}`)}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    {user.profile_image_url ? (
                      <AvatarImage src={user.profile_image_url} alt={user.account_name} />
                    ) : null}
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                      {getInitials(user.account_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user.account_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[11px] px-2 py-0.5 shrink-0 ${USER_TYPE_STYLES[user.user_type]}`}
                  >
                    {user.user_type}
                  </Badge>

                  <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="View"
                      onClick={() => navigate(`/account/user-list/${user.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <PermissionGate permission="users:manage">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Edit"
                        onClick={() => navigate(`/account/user-list/${user.id}/edit`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                    <PermissionGate permission="users:manage_roles">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Delete"
                        onClick={() => { setDeleteId(user.id); setDeleteName(user.account_name); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer with record count */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Record Found: <span className="font-semibold text-foreground">{filtered.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
};

export default UserList;
