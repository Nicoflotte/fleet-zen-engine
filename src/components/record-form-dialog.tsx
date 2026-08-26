import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RecordField = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  full?: boolean;
};

export type RecordValues = Record<string, string>;

export function RecordFormDialog({
  triggerLabel,
  title,
  description,
  fields,
  submitLabel = "Enregistrer",
  onSubmit,
  trigger,
}: {
  triggerLabel: string;
  title: string;
  description: string;
  fields: RecordField[];
  submitLabel?: string;
  onSubmit: (values: RecordValues) => void;
  trigger?: ReactNode;
}) {
  const initial = () =>
    fields.reduce<RecordValues>((acc, field) => {
      acc[field.key] = field.defaultValue ?? (field.type === "select" ? (field.options?.[0]?.value ?? "") : "");
      return acc;
    }, {});

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<RecordValues>(initial);

  const submit = () => {
    const missing = fields.filter((field) => field.required && !String(values[field.key] ?? "").trim());
    if (missing.length > 0) {
      toast.error(`Champ obligatoire : ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    onSubmit(values);
    setOpen(false);
    setValues(initial());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setValues(initial());
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus /> {triggerLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className={`space-y-1.5 ${field.full ? "sm:col-span-2" : ""}`}>
              <Label htmlFor={`rf-${field.key}`}>{field.label}</Label>
              {field.type === "select" ? (
                <Select
                  value={values[field.key] ?? ""}
                  onValueChange={(value) => setValues((prev) => ({ ...prev, [field.key]: value }))}
                >
                  <SelectTrigger id={`rf-${field.key}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={`rf-${field.key}`}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, [field.key]: event.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={submit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
