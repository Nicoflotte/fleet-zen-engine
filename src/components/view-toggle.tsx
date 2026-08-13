import { LayoutGrid, Rows3 } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ViewMode = "table" | "cards";

export function ViewToggle({
  value,
  onChange,
  label = "Affichage",
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  label?: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1"
      role="group"
      aria-label={label}
    >
      <Button
        type="button"
        size="sm"
        variant={value === "table" ? "default" : "ghost"}
        className="h-8 gap-1.5 px-2.5"
        aria-pressed={value === "table"}
        onClick={() => onChange("table")}
      >
        <Rows3 className="size-4" /> Tableau
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "cards" ? "default" : "ghost"}
        className="h-8 gap-1.5 px-2.5"
        aria-pressed={value === "cards"}
        onClick={() => onChange("cards")}
      >
        <LayoutGrid className="size-4" /> Cartes
      </Button>
    </div>
  );
}
