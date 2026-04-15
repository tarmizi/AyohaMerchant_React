import React from "react";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, children, htmlFor }) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default FormField;
