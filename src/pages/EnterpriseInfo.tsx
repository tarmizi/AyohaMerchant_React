import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Plus, Eye, Pencil, Trash2, Building2, MapPin, Phone, Mail,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PermissionGate from "@/components/auth/PermissionGate";

const getInitials = (name: string) =>
  name.split(/[\s-]+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);

const EnterpriseInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: enterprises = [], isLoading } = useQuery({
    queryKey: ["enterprises", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enterprises")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("enterprises").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enterprises"] });
      toast.success("Enterprise deleted successfully");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete enterprise"),
  });

  const filtered = enterprises.filter(
    (e) =>
      e.enterprise_name.toLowerCase().includes(search.toLowerCase()) ||
      (e.address ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <PageHeader
        title="Enterprise Info"
        description="Manage all enterprise branches under your merchant account"
        breadcrumbs={[{ label: "My Account" }, { label: "Enterprise Info" }]}
      />

      <div className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or address..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-card border-border" />
          </div>
          <PermissionGate permission="enterprise:manage">
            <Button className="gap-2 shrink-0" onClick={() => navigate("/account/enterprise-info/new")}>
              <Plus className="h-4 w-4" /> Add New Enterprise
            </Button>
          </PermissionGate>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-72" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground">No enterprises found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or add a new enterprise</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((enterprise) => (
                <div key={enterprise.id} className="flex items-start gap-4 p-5 hover:bg-muted/30 transition-colors">
                  <Avatar className="h-12 w-12 shrink-0 rounded-lg border border-border">
                    <AvatarFallback className="rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold">
                      {getInitials(enterprise.enterprise_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">{enterprise.enterprise_name}</h3>
                      <Badge variant={enterprise.branch_type === "Head Quarters" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {enterprise.branch_type ?? "Branch"}
                      </Badge>
                    </div>
                    {enterprise.address && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{enterprise.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {enterprise.office_phone && (
                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{enterprise.office_phone}</span>
                      )}
                      {enterprise.company_email && (
                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{enterprise.company_email}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="View" onClick={() => navigate(`/account/enterprise-info/${enterprise.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Edit" onClick={() => navigate(`/account/enterprise-info/${enterprise.id}/edit`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <PermissionGate permission="enterprise:delete">
                      <AlertDialog open={deleteId === enterprise.id} onOpenChange={(open) => setDeleteId(open ? enterprise.id : null)}>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Enterprise</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete "{enterprise.enterprise_name}"? This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(enterprise.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </PermissionGate>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">Record Found: <span className="font-semibold text-foreground">{filtered.length}</span></p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default EnterpriseInfo;
