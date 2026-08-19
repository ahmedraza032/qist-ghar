"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/helpers/format";
import { motion, AnimatePresence } from "motion/react";

function OrderRow({ order, index }: { order: any; index: number }) {
  const [prevStatus, setPrevStatus] = useState(order.status);
  const [pulse, setPulse] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (order.status !== prevStatus) {
      setPrevStatus(order.status);
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [order.status, prevStatus]);

  return (
    <motion.tr
      initial={{ backgroundColor: "#F1F7E9" }}
      animate={{ backgroundColor: "transparent" }}
      transition={{ duration: 1.2, ease: "linear" }}
      className="group relative border-b border-border transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#F0F2F5] [&>td:first-child]:relative [&>td:first-child]:before:content-[''] [&>td:first-child]:before:absolute [&>td:first-child]:before:inset-y-0 [&>td:first-child]:before:left-0 [&>td:first-child]:before:w-[3px] [&>td:first-child]:before:bg-[#205EA3] [&>td:first-child]:before:opacity-0 [&>td:first-child]:before:transition-opacity [&>td:first-child]:before:duration-200 hover:[&>td:first-child]:before:opacity-100"
    >
      <td className="py-2 pl-4 text-xs font-mono text-muted-foreground w-12">
        {index}
      </td>
      <td className="py-2">
        <Link 
          href={`/admin/orders/${order.id}`} 
          className="font-mono text-xs hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] focus-visible:ring-offset-2 rounded-sm"
        >
          #{order.id.slice(0, 8)}
        </Link>
      </td>
      <td className="py-2 text-xs font-medium">
        <Link
          href={`/admin/customers/${order.customer_id}`}
          className="hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#205EA3] focus-visible:ring-offset-2 rounded-sm"
          title="View customer ledger"
        >
          {order.customer?.full_name || "Customer"}
        </Link>
      </td>
      <td className="py-2 text-xs truncate max-w-[150px]">
        {order.product?.name || "—"}
      </td>
      <td className="py-2 text-right text-xs font-medium">
        {formatPKR(order.total_amount)}
      </td>
      <td className="py-2 pr-4 text-right">
        <div className="relative inline-flex items-center justify-end">
          <AnimatePresence mode="wait">
            <motion.div
              key={order.status}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <Badge
                variant={
                  order.status === "active" || order.status === "completed"
                    ? "success"
                    : order.status === "pending"
                    ? "default"
                    : "warning"
                }
              >
                {order.status}
              </Badge>
            </motion.div>
          </AnimatePresence>

          {/* Status change pulse ring */}
          {pulse && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute inset-0 rounded-full border-[1.5px] border-[#4A7A1E] pointer-events-none"
            />
          )}
        </div>
      </td>
    </motion.tr>
  );
}

export function RecentOrdersTable({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 pl-4 font-medium w-12">#</th>
            <th className="text-left py-2 font-medium">Order</th>
            <th className="text-left py-2 font-medium">Customer</th>
            <th className="text-left py-2 font-medium">Product</th>
            <th className="text-right py-2 font-medium">Amount</th>
            <th className="text-right py-2 pr-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {orders.map((order, idx) => (
              <OrderRow key={order.id} order={order} index={idx} />
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
