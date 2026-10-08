import { describe, expect, it } from "vitest";
import { findDuplicateInvoices } from "./invoice-duplicates";
import type { Expense } from "./fleet-data";

const saved: Expense = { id: "E1", month: "2026-08", date: "2026-08-12", entityId: "OF", type: "carburant", amount: 142.5, supplier: "DKV", invoiceNumber: "F-001" };
const base = { supplier: "dkv", invoiceNumber: "F001", date: "2026-08-12", amount: 142.5 };

describe("doublons factures", () => {
  it("détecte fournisseur + n° + date + montant identiques", () => {
    expect(findDuplicateInvoices([saved], base)).toHaveLength(1);
  });
  it("ignore un n° de facture différent", () => {
    expect(findDuplicateInvoices([saved], { ...base, invoiceNumber: "F002" })).toHaveLength(0);
  });
  it("ignore une date différente", () => {
    expect(findDuplicateInvoices([saved], { ...base, date: "2026-08-13" })).toHaveLength(0);
  });
  it("ignore un montant différent", () => {
    expect(findDuplicateInvoices([saved], { ...base, amount: 142.51 })).toHaveLength(0);
  });
  it("sans n° de facture, compare fournisseur + date + montant", () => {
    expect(findDuplicateInvoices([saved], { ...base, invoiceNumber: "" })).toHaveLength(1);
  });
});
