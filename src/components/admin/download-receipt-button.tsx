"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadReceipt, type ReceiptData } from "@/components/admin/receipt-pdf";

export function DownloadReceiptButton({ data }: { data: ReceiptData }) {
  const [busy, setBusy] = React.useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      await downloadReceipt(data);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={busy} className="gap-2">
      <Download className="h-4 w-4" />
      {busy ? "Preparing..." : "Print / Download Receipt"}
    </Button>
  );
}
