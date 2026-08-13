"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function MarkPaidButton({
  installmentId,
  orderId,
}: {
  installmentId: string;
  orderId: string;
}) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = React.useState(false);

  async function handleMark() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installmentId, orderId }),
      });
      const data = await res.json();

      if (data.success) {
        addToast({ title: "Marked as paid", description: "Installment has been marked as paid." });
        router.refresh();
      } else {
        addToast({ title: "Error", description: data.error || "Failed to mark as paid", variant: "destructive" });
      }
    } catch {
      addToast({ title: "Error", description: "Network error", variant: "destructive" });
    }
    setLoading(false);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleMark} disabled={loading} className="gap-1">
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      Mark Paid
    </Button>
  );
}
