import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Upload, ImageIcon, Palette } from "lucide-react";
import type { StampCardDesign } from "./StampCardPreview";

interface Props {
  design: StampCardDesign;
  onChange: (updates: Partial<StampCardDesign>) => void;
  onUploadBackground: (file: File) => void;
  onUploadLogo: (file: File) => void;
  uploadingBg: boolean;
  uploadingLogo: boolean;
}

const Section: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const DesignSettingsPanel: React.FC<Props> = ({ design, onChange, onUploadBackground, onUploadLogo, uploadingBg, uploadingLogo }) => {
  const bgRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
      {/* A. Branding */}
      <Section title="Branding & Display" icon={<Palette className="h-4 w-4 text-primary" />}>
        <Field label="StampCard Name">
          <Input
            value={design.stampcard_title || ""}
            onChange={(e) => onChange({ stampcard_title: e.target.value })}
            placeholder="e.g. Coffee Lovers Card"
          />
        </Field>
        <Field label="Enterprise Name Display">
          <Input
            value={design.enterprise_name_display || ""}
            onChange={(e) => onChange({ enterprise_name_display: e.target.value })}
            placeholder="e.g. Ayoha Café"
          />
        </Field>
        <Field label="Campaign Name Display">
          <Input
            value={design.campaign_name_display || ""}
            onChange={(e) => onChange({ campaign_name_display: e.target.value })}
            placeholder="e.g. Holiday Stamps"
          />
        </Field>
        <Field label="Expiry Text Display">
          <Input
            value={design.expiry_text_display || ""}
            onChange={(e) => onChange({ expiry_text_display: e.target.value })}
            placeholder="e.g. Valid until 31 Dec 2026"
          />
        </Field>
        <Field label="Stamp Rule Note Text">
          <Textarea
            value={design.stamp_rule_note_text || ""}
            onChange={(e) => onChange({ stamp_rule_note_text: e.target.value })}
            placeholder="e.g. Collect 11 stamps and get a free coffee"
            rows={2}
            className="resize-y text-sm"
          />
        </Field>
      </Section>

      <Separator />

      {/* B. Visual */}
      <Section title="Visual Style" icon={<ImageIcon className="h-4 w-4 text-primary" />}>
        <Field label="Background Image">
          <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadBackground(e.target.files[0])} />
          <div className="flex items-center gap-2">
            {design.background_image_url ? (
              <img src={design.background_image_url} alt="Background" className="h-12 w-20 rounded-md object-cover border border-border" />
            ) : (
              <div className="h-12 w-20 rounded-md border border-dashed border-border flex items-center justify-center bg-muted/30">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => bgRef.current?.click()} disabled={uploadingBg}>
              <Upload className="h-3 w-3 mr-1" />
              {uploadingBg ? "Uploading..." : "Upload"}
            </Button>
            {design.background_image_url && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ background_image_url: "" })}>
                Remove
              </Button>
            )}
          </div>
        </Field>

        <Field label="Logo Image">
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadLogo(e.target.files[0])} />
          <div className="flex items-center gap-2">
            {design.logo_image_url ? (
              <img src={design.logo_image_url} alt="Logo" className="h-10 w-10 rounded-lg object-cover border border-border" />
            ) : (
              <div className="h-10 w-10 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/30">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => logoRef.current?.click()} disabled={uploadingLogo}>
              <Upload className="h-3 w-3 mr-1" />
              {uploadingLogo ? "Uploading..." : "Upload"}
            </Button>
            {design.logo_image_url && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ logo_image_url: "" })}>
                Remove
              </Button>
            )}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={design.primary_theme_color || "#7c3aed"}
                onChange={(e) => onChange({ primary_theme_color: e.target.value })}
                className="h-8 w-8 rounded-md border border-border cursor-pointer"
              />
              <Input
                value={design.primary_theme_color || "#7c3aed"}
                onChange={(e) => onChange({ primary_theme_color: e.target.value })}
                className="text-xs"
                placeholder="#7c3aed"
              />
            </div>
          </Field>
          <Field label="Secondary Color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={design.secondary_theme_color || "#db2777"}
                onChange={(e) => onChange({ secondary_theme_color: e.target.value })}
                className="h-8 w-8 rounded-md border border-border cursor-pointer"
              />
              <Input
                value={design.secondary_theme_color || "#db2777"}
                onChange={(e) => onChange({ secondary_theme_color: e.target.value })}
                className="text-xs"
                placeholder="#db2777"
              />
            </div>
          </Field>
        </div>
      </Section>

      <Separator />

      {/* C. Contact/Social */}
      <Section title="Contact & Social">
        <Field label="Contact Us Title">
          <Input
            value={design.contact_us_title || ""}
            onChange={(e) => onChange({ contact_us_title: e.target.value })}
            placeholder="Contact Us"
          />
        </Field>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Field label="Facebook URL">
              <Input
                value={design.facebook_url || ""}
                onChange={(e) => onChange({ facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </Field>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-2">
            <span className="text-xs text-muted-foreground">Show Facebook</span>
            <Switch checked={design.show_facebook} onCheckedChange={(v) => onChange({ show_facebook: v })} />
          </div>
        </div>
        <div className="space-y-2">
          <Field label="Instagram URL">
            <Input
              value={design.instagram_url || ""}
              onChange={(e) => onChange({ instagram_url: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-2">
            <span className="text-xs text-muted-foreground">Show Instagram</span>
            <Switch checked={design.show_instagram} onCheckedChange={(v) => onChange({ show_instagram: v })} />
          </div>
        </div>
        <div className="space-y-2">
          <Field label="WhatsApp URL">
            <Input
              value={design.whatsapp_url || ""}
              onChange={(e) => onChange({ whatsapp_url: e.target.value })}
              placeholder="https://wa.me/..."
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-2">
            <span className="text-xs text-muted-foreground">Show WhatsApp</span>
            <Switch checked={design.show_whatsapp} onCheckedChange={(v) => onChange({ show_whatsapp: v })} />
          </div>
        </div>
      </Section>

      <Separator />

      {/* D. Feature Visibility */}
      <Section title="Features & Labels">
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Enable NFC Display</p>
            <p className="text-xs text-muted-foreground">Show NFC icon on the card</p>
          </div>
          <Switch checked={design.is_nfc_enabled} onCheckedChange={(v) => onChange({ is_nfc_enabled: v })} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Enable QR Display</p>
            <p className="text-xs text-muted-foreground">Show QR code area on the card</p>
          </div>
          <Switch checked={design.is_qr_enabled} onCheckedChange={(v) => onChange({ is_qr_enabled: v })} />
        </div>
        <Field label="Reward Box Label">
          <Input
            value={design.reward_box_label || ""}
            onChange={(e) => onChange({ reward_box_label: e.target.value })}
            placeholder="Reward"
          />
        </Field>
        <Field label="QR Box Label">
          <Input
            value={design.qr_box_label || ""}
            onChange={(e) => onChange({ qr_box_label: e.target.value })}
            placeholder="QR Code"
          />
        </Field>
      </Section>

      <Separator />

      {/* E. Stamp Slots */}
      <Section title="Stamp Slots">
        <Field label="Total Stamp Slots (max 11)">
          <Input
            type="number"
            min={1}
            max={11}
            value={design.total_stamp_slots}
            onChange={(e) => {
              const v = Math.max(1, Math.min(11, Number(e.target.value) || 1));
              onChange({ total_stamp_slots: v });
            }}
            className="max-w-[120px]"
          />
        </Field>
      </Section>
    </div>
  );
};

export default DesignSettingsPanel;
