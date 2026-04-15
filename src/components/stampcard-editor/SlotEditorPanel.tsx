import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ImageIcon, X, Gift, Hash } from "lucide-react";
import type { SlotConfig } from "./StampCardPreview";

interface Props {
  slot: SlotConfig | null;
  onUpdate: (slot: SlotConfig) => void;
  onUploadPerk: (slotNo: number, file: File) => void;
  uploadingPerk: boolean;
  onClose: () => void;
}

const SlotEditorPanel: React.FC<Props> = ({ slot, onUpdate, onUploadPerk, uploadingPerk, onClose }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  if (!slot) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Click a slot on the preview to edit it
      </div>
    );
  }

  const update = (partial: Partial<SlotConfig>) => onUpdate({ ...slot, ...partial });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          {slot.slot_type === "perk" ? (
            <Gift className="h-4 w-4 text-accent" />
          ) : (
            <Hash className="h-4 w-4 text-primary" />
          )}
          Slot #{slot.slot_no}
        </h3>
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Slot Type</Label>
        <Select value={slot.slot_type} onValueChange={(v) => update({ slot_type: v as "sequence" | "perk" })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sequence">Sequence Number</SelectItem>
            <SelectItem value="perk">Perk / Reward</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Slot Label</Label>
        <Input
          value={slot.slot_label || ""}
          onChange={(e) => update({ slot_label: e.target.value })}
          placeholder={slot.slot_type === "perk" ? "e.g. Free Drink" : `${slot.slot_no}`}
        />
      </div>

      {slot.slot_type === "perk" && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Perk Image</Label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadPerk(slot.slot_no, e.target.files[0])} />
            <div className="flex items-center gap-2">
              {slot.perk_image_url ? (
                <img src={slot.perk_image_url} alt="Perk" className="h-12 w-12 rounded-lg object-cover border border-border" />
              ) : (
                <div className="h-12 w-12 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/30">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploadingPerk}>
                <Upload className="h-3 w-3 mr-1" />
                {uploadingPerk ? "Uploading..." : "Upload"}
              </Button>
              {slot.perk_image_url && (
                <Button type="button" variant="ghost" size="sm" onClick={() => update({ perk_image_url: "" })}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Perk Title</Label>
            <Input
              value={slot.perk_title || ""}
              onChange={(e) => update({ perk_title: e.target.value })}
              placeholder="e.g. Free Coffee"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Reward Value Text</Label>
            <Input
              value={slot.reward_value_text || ""}
              onChange={(e) => update({ reward_value_text: e.target.value })}
              placeholder="e.g. Worth RM10"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SlotEditorPanel;
