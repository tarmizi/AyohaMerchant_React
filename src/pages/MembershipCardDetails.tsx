import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, CreditCard, ArrowLeft } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useMembershipCard, useDeleteMembershipCard } from "@/hooks/useMembershipCards";
import PermissionGate from "@/components/auth/PermissionGate";

const Field: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="text-sm text-foreground">{value || "—"}</p>
  </div>
);

const MembershipCardDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: card, isLoading } = useMembershipCard(id);
  const deleteMutation = useDeleteMembershipCard();
  const [showDelete, setShowDelete] = React.useState(false);

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Membership card deleted");
        navigate("/cards/settings");
      },
      onError: () => toast.error("Failed to delete"),
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!card) {
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">
          <p>Card not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/cards/settings")}>
            Back to Card List
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={card.card_name}
        breadcrumbs={[
          { label: "Card Management" },
          { label: "Card List", href: "/cards/settings" },
          { label: card.card_name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/cards/settings")}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
            <PermissionGate permission="cards:edit">
              <Button variant="outline" size="sm" onClick={() => navigate(`/cards/${id}/edit`)}>
                <Pencil className="h-4 w-4 mr-1.5" /> Edit
              </Button>
            </PermissionGate>
            <PermissionGate permission="cards:delete">
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setShowDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1.5" /> Delete
              </Button>
            </PermissionGate>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Card Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Card Information</h2>
              <p className="text-xs text-muted-foreground">General details about this membership card</p>
            </div>
            <Badge
              variant="outline"
              className={
                card.card_status === "Active"
                  ? "ml-auto bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "ml-auto bg-muted text-muted-foreground border-border"
              }
            >
              {card.card_status}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            <Field label="Card Name" value={card.card_name} />
            <Field label="Card Type" value={card.card_type} />
            <Field label="Status" value={card.card_status} />
            <Field label="Max Members" value={card.max_members} />
            <Field label="Validity Start" value={card.validity_start ? new Date(card.validity_start).toLocaleDateString() : null} />
            <Field label="Validity End" value={card.validity_end ? new Date(card.validity_end).toLocaleDateString() : null} />
          </div>
        </div>

        {/* Description & Terms */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Description & Terms</h2>
          <div className="grid grid-cols-1 gap-y-4">
            <Field label="Description" value={card.card_description} />
            <Field label="Terms & Conditions" value={card.terms_conditions} />
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Record Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Created At" value={new Date(card.created_at).toLocaleString()} />
            <Field label="Last Updated" value={new Date(card.updated_at).toLocaleString()} />
          </div>
        </div>
      </div>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Membership Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{card.card_name}"? All linked loyalty programs will lose their parent card.
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

export default MembershipCardDetails;
