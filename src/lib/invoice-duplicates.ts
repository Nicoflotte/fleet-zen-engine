import type { Expense } from "@/lib/fleet-data";

export type InvoiceCandidate = { supplier: string; invoiceNumber: string; date: string; amount: number };

const norm = (s: string | undefined) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Dépenses déjà enregistrées qui ressemblent à la facture : même fournisseur, même date, même montant TTC
 * (au centime), et même n° de facture quand les deux en ont un. */
export function findDuplicateInvoices(expenses: Expense[], c: InvoiceCandidate): Expense[] {
  const sup = norm(c.supplier);
  const num = norm(c.invoiceNumber);
  if (!sup || !c.date || !Number.isFinite(c.amount) || c.amount <= 0) return [];
  return expenses.filter((e) => {
    if (norm(e.supplier) !== sup) return false;
    if (e.date !== c.date) return false;
    if (Math.round(e.amount * 100) !== Math.round(c.amount * 100)) return false;
    const other = norm(e.invoiceNumber);
    if (num && other && num !== other) return false;
    return true;
  });
}
