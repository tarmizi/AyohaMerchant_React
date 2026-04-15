import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import { useMembershipCard, useUpdateMembershipCard } from "@/hooks/useMembershipCards";

const EditMembershipCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: card, isLoading } = useMembershipCard(id);
  const updateMutation = useUpdateMembershipCard();

  const [form, setForm] = useState({
    card_name: "",
    card_description: "",
    card_type: "Standard",
    card_status: "Active" as "Active" | "Inactive",
    validity_start: "",
    validity_end: "",
    max_members: "",
    terms_conditions: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (card && !prefilled) {
      setForm({
        card_name: card.card_name,
        card_description: card.card_description || "",
        card_type: card.card_type || "Standard",
        card_status: card.card_status,
        validity_start: card.validity_start || "",
        validity_end: card.validity_end || "",
        max_members: card.max_members?.toString() || "",
        terms_conditions: card.terms_conditions || "",
      });
      setPrefilled(true);
    }
  }, [card, prefilled]);

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.card_name.trim()) errs.card_name = "Card name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !id) return;
    updateMutation.mutate(
      {
        id,
        card_name: form.card_name.trim(),
        card_description: form.card_description.trim() || null,
        card_status: form.card_status,
        card_type: form.card_type || null,
        validity_start: form.validity_start || null,
        validity_end: form.validity_end || null,
        max_members: form.max_members ? parseInt(form.max_members) : null,
        terms_conditions: form.terms_conditions.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Membership card updated successfully");
          navigate(`/cards/${id}`);
        },
        onError: () => toast.error("Failed to update membership card"),
      }
    );
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

  return (
    <AppShell>
      <PageHeader
        title={`Edit: ${card?.card_name || "Card"}`}
        breadcrumbs={[
          { label: "Card Management" },
          { label: "Card List", href: "/cards/settings" },
          { label: "Edit Card" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/cards/${id}`)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-3xl">
        {/* Card Information */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Card Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Card Name <span className="text-destructive">*</span></Label>
              <Input value={form.card_name} onChange={(e) => set("card_name", e.target.value)} />
              {errors.card_name && <p className="text-xs text-destructive">{errors.card_name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Card Type</Label>
              <Input value={form.card_type} onChange={(e) => set("card_type", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.card_status} onValueChange={(v) => set("card_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Max Members</Label>
              <Input type="number" value={form.max_members} onChange={(e) => set("max_members", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Validity */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Validity Period</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={form.validity_start} onChange={(e) => set("validity_start", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input type="date" value={form.validity_end} onChange={(e) => set("validity_end", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Description & Terms */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-foreground">Description & Terms</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.card_description} onChange={(e) => set("card_description", e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Terms & Conditions</Label>
              <Textarea value={form.terms_conditions} onChange={(e) => set("terms_conditions", e.target.value)} rows={4} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default EditMembershipCard;
