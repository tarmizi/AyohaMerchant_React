import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarIcon, Save, Stamp } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useMerchantQuota } from "@/hooks/useMerchantQuota";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

/* ── Schema ── */

const stampFormSchema = z
  .object({
    campaign_name: z
      .string()
      .trim()
      .min(1, "Campaign name is required")
      .max(150, "Campaign name must be less than 150 characters"),
    card_type: z.string().min(1, "Card type is required"),
    stamp_rule_amount: z
      .number({ invalid_type_error: "Enter a valid number" })
      .int("Must be a whole number")
      .min(1, "Minimum 1 stamp"),
    stamp_rule_description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .or(z.literal("")),
    popup_stamp_rule: z.boolean(),
    require_dates: z.boolean(),
    campaign_start_date: z.date().optional(),
    campaign_end_date: z.date().optional(),
  })
  .refine(
    (d) => {
      if (d.require_dates) {
        return !!d.campaign_start_date && !!d.campaign_end_date;
      }
      return true;
    },
    {
      message: "Start date and end date are required when campaign dates are enabled",
      path: ["campaign_end_date"],
    }
  )
  .refine(
    (d) => {
      if (d.require_dates && d.campaign_start_date && d.campaign_end_date) {
        return d.campaign_end_date > d.campaign_start_date;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["campaign_end_date"],
    }
  );

type StampFormValues = z.infer<typeof stampFormSchema>;

const CARD_TYPES = [
  "Stamp Card",
  "Digital Stamp Card",
  "Premium Stamp Card",
];

function generateCode() {
  return `STP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

const StampCardSetting: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isEdit = !!id;
  const quota = useMerchantQuota();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [campaignCode, setCampaignCode] = useState(generateCode);

  const form = useForm<StampFormValues>({
    resolver: zodResolver(stampFormSchema),
    defaultValues: {
      campaign_name: "",
      card_type: "Stamp Card",
      stamp_rule_amount: 10,
      stamp_rule_description: "",
      popup_stamp_rule: false,
      require_dates: false,
      campaign_start_date: undefined,
      campaign_end_date: undefined,
    },
  });

  const requireDates = form.watch("require_dates");

  // Load existing record when editing
  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from("loyalty_program_stamp")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast.error("Failed to load stamp campaign");
        navigate("/campaigns/stamp-loyalty");
        return;
      }
      const row = data as any;
      setCampaignCode(row.stamp_campaign_code ?? generateCode());
      form.reset({
        campaign_name: row.program_name ?? "",
        card_type: row.stamp_card_type ?? "Stamp Card",
        stamp_rule_amount: row.stamp_rule_amount ?? 10,
        stamp_rule_description: row.stamp_rule_descriptions ?? "",
        popup_stamp_rule: row.is_popup_stamp_rule ?? false,
        require_dates: row.is_campaign_date_required ?? false,
        campaign_start_date: row.campaign_start_date ? new Date(row.campaign_start_date) : undefined,
        campaign_end_date: row.campaign_end_date ? new Date(row.campaign_end_date) : undefined,
      });
      setLoading(false);
    })();
  }, [isEdit, id]);

  const onSubmit = async (values: StampFormValues) => {
    if (!user) return;
    if (!isEdit && !quota.can_create_program) {
      toast.error("Your current plan allows only 1 Loyalty Program. Please upgrade or contact admin to add more.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        merchant_account_id: user.id,
        program_name: values.campaign_name,
        program_description: values.stamp_rule_description || null,
        program_status: "Active",
        stamp_campaign_code: campaignCode,
        stamp_card_type: values.card_type,
        stamp_rule_amount: values.stamp_rule_amount,
        stamp_rule_descriptions: values.stamp_rule_description || null,
        is_popup_stamp_rule: values.popup_stamp_rule,
        is_campaign_date_required: values.require_dates,
        campaign_start_date: values.require_dates && values.campaign_start_date
          ? format(values.campaign_start_date, "yyyy-MM-dd") : null,
        campaign_end_date: values.require_dates && values.campaign_end_date
          ? format(values.campaign_end_date, "yyyy-MM-dd") : null,
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from("loyalty_program_stamp")
          .update(payload as any)
          .eq("id", id);
        if (error) throw error;
        toast.success("Stamp campaign updated successfully");
      } else {
        const { error } = await supabase
          .from("loyalty_program_stamp")
          .insert(payload as any);
        if (error) throw error;
        toast.success("Stamp campaign created successfully");
      }
      qc.invalidateQueries({ queryKey: ["loyalty-programs", "stamp"] });
      qc.invalidateQueries({ queryKey: ["loyalty-programs-master"] });
      qc.invalidateQueries({ queryKey: ["merchant_quota"] });
      navigate("/campaigns/stamp-loyalty");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save stamp campaign");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Stamp Card Setting"
        description={isEdit ? "Edit your stamp loyalty campaign" : "Create a new stamp loyalty campaign"}
        breadcrumbs={[
          { label: "Campaign Setting" },
          { label: "Stamp Loyalty", href: "/campaigns/stamp-loyalty" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      />

      {!isEdit && !quota.isLoading && !quota.can_create_program && (
        <div className="px-6 pt-4">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              Your current plan allows only {quota.max_loyalty_programs} Loyalty Program.
              You are currently using {quota.current_loyalty_programs} of {quota.max_loyalty_programs} allowed program(s).
              Please upgrade or contact admin to add more.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
            {/* Section header */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-muted/40 border-b border-border">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Stamp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Card Setting Info</h2>
                  <p className="text-xs text-muted-foreground">Configure your stamp loyalty campaign details</p>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Campaign Code (read-only) */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Card Campaign Code</label>
                  <Input value={campaignCode} readOnly className="bg-muted/50 max-w-xs" />
                  <p className="text-xs text-muted-foreground">Auto-generated campaign code</p>
                </div>

                {/* 1. Campaign Name */}
                <FormField
                  control={form.control}
                  name="campaign_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stamp Card Campaign Name <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Coffee Lovers Stamp Card" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2. Card Types */}
                <FormField
                  control={form.control}
                  name="card_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Types <span className="text-destructive">*</span></FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select card type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CARD_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. Stamp Rule Amount */}
                <FormField
                  control={form.control}
                  name="stamp_rule_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stamp Rule Amount <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="e.g. 10"
                          className="max-w-[180px]"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : "")}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Number of stamps required to complete the card</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. Stamp Rule Descriptions */}
                <FormField
                  control={form.control}
                  name="stamp_rule_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stamp Rule Descriptions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the rules for earning stamps..."
                          rows={3}
                          className="resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Divider */}
                <div className="border-t border-border" />

                {/* 5. Pop Up Stamp Rule */}
                <FormField
                  control={form.control}
                  name="popup_stamp_rule"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">Pop Up Stamp Rule?</FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Show stamp rule information as a popup to customers
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* 6. Campaign Date Requirement Toggle */}
                <FormField
                  control={form.control}
                  name="require_dates"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          Is This Campaign Required Start Date and End Date?
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Enable to set campaign validity period
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* 7 & 8. Campaign Start / End Dates */}
                <div className={cn(
                  "grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity",
                  !requireDates && "opacity-50 pointer-events-none"
                )}>
                  {/* Start Date */}
                  <FormField
                    control={form.control}
                    name="campaign_start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Campaign Start Date {requireDates && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* End Date */}
                  <FormField
                    control={form.control}
                    name="campaign_end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Campaign End Date {requireDates && <span className="text-destructive">*</span>}
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="gap-2 min-w-[140px]">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AppShell>
  );
};

export default StampCardSetting;
