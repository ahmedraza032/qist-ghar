"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { formatPKR, formatDate } from "@/lib/helpers/format";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#16a34a",
  },
  subheader: { fontSize: 12, color: "#666", marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    borderBottom: "1 solid #e5e5e5",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: { color: "#666" },
  value: { fontWeight: "bold" },
  scheduleRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottom: "1 solid #f0f0f0",
  },
  scheduleCol: { flex: 1 },
  paid: { color: "#16a34a", fontWeight: "bold" },
  pending: { color: "#f59e0b" },
  total: { borderTop: "2 solid #000", marginTop: 8, paddingTop: 8 },
});

export interface ReceiptData {
  orderId: string;
  productName: string;
  durationMonths: number;
  downPayment: number;
  monthlyAmount: number;
  totalAmount: number;
  paymentMethod: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  installments: { number: number; dueDate: string; amount: number; status: string }[];
}

export function ReceiptPDF({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>QistGhar Receipt</Text>
        <Text style={styles.subheader}>Order #{data.orderId.slice(0, 8)}</Text>

        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDate(data.date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Product</Text>
          <Text style={styles.value}>{data.productName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Plan</Text>
          <Text style={styles.value}>{data.durationMonths} months</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{data.paymentMethod}</Text>
        </View>

        <Text style={styles.sectionTitle}>Customer</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{data.customerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{data.customerPhone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{data.customerAddress || "—"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Down Payment</Text>
          <Text style={styles.value}>{formatPKR(data.downPayment)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Monthly Payment</Text>
          <Text style={styles.value}>{formatPKR(data.monthlyAmount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{data.durationMonths} months</Text>
        </View>
        <View style={[styles.row, styles.total]}>
          <Text style={{ fontWeight: "bold" }}>Total</Text>
          <Text style={{ fontWeight: "bold" }}>{formatPKR(data.totalAmount)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Installment Schedule</Text>
        <View style={[styles.scheduleRow, { borderBottom: "1 solid #ccc" }]}>
          <Text style={[styles.scheduleCol, { fontWeight: "bold" }]}>#</Text>
          <Text style={[styles.scheduleCol, { fontWeight: "bold" }]}>Due Date</Text>
          <Text style={[styles.scheduleCol, { fontWeight: "bold" }]}>Amount</Text>
          <Text style={[styles.scheduleCol, { fontWeight: "bold" }]}>Status</Text>
        </View>
        {data.installments.map((inst) => (
          <View key={inst.number} style={styles.scheduleRow}>
            <Text style={styles.scheduleCol}>{inst.number}</Text>
            <Text style={styles.scheduleCol}>{formatDate(inst.dueDate)}</Text>
            <Text style={styles.scheduleCol}>{formatPKR(inst.amount)}</Text>
            <Text style={[styles.scheduleCol, inst.status === "paid" ? styles.paid : styles.pending]}>
              {inst.status === "paid" ? "Paid" : "Pending"}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function downloadReceipt(data: ReceiptData) {
  const blob = await pdf(<ReceiptPDF data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `QistGhar-Receipt-${data.orderId.slice(0, 8)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
