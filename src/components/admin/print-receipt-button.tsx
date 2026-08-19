"use client";

import React from "react";
import { Download, Loader2 } from "lucide-react";
import { downloadReceipt } from "./receipt-pdf";
import { getReceiptData } from "@/lib/actions/receipt";

export function PrintReceiptButton({ orderId }: { orderId: string }) {
  const [busy, setBusy] = React.useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const data = await getReceiptData(orderId);
      if (!data) {
        alert("Could not load receipt data for this order.");
        return;
      }
      const logoUrl = typeof window !== "undefined"
        ? `${window.location.origin}/logo-cropped.png`
        : undefined;
      await downloadReceipt({ ...data, logoUrl });
    } catch (err) {
      console.error(err);
      alert("Failed to generate receipt. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      title="Print / Download Receipt"
      className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors disabled:opacity-40"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
    </button>
  );
}
