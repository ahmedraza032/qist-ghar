"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";
import { formatPKR, formatDate, formatReference } from "@/lib/helpers/format";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "2 solid #205EA3",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 110,
    height: 37,
    objectFit: "contain",
    marginRight: 10,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#205EA3" },
  subtitle: { fontSize: 11, color: "#666" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 6,
    color: "#205EA3",
    borderBottom: "1 solid #e5e5e5",
    paddingBottom: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  label: { color: "#666" },
  value: { fontWeight: "bold", textAlign: "right" },
  scheduleRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottom: "1 solid #f0f0f0",
  },
  col: { flex: 1 },
  colRight: { flex: 1, textAlign: "right" },
  colCenter: { flex: 1, textAlign: "center" },
  head: { fontWeight: "bold", color: "#333" },
  paid: { color: "#16a34a", fontWeight: "bold" },
  pending: { color: "#f59e0b" },
  total: {
    borderTop: "2 solid #000",
    marginTop: 10,
    paddingTop: 8,
  },
  totalText: { fontSize: 13, fontWeight: "bold" },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 9,
    color: "#999",
    borderTop: "1 solid #e5e5e5",
    paddingTop: 10,
  },
});

import type { ReceiptData } from "@/types/receipt";

export function ReceiptPDF({ data }: { data: ReceiptData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brand}>
            {data.logoUrl ? (
              <Image src={data.logoUrl} style={styles.logo} />
            ) : (
              <Text style={styles.title}>QistGhar</Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.title}>Receipt</Text>
            <Text style={styles.subtitle}>Order #{data.orderId.slice(0, 8)}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Order Date</Text>
          <Text style={styles.value}>{formatDate(data.date)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Product</Text>
          <Text style={styles.value}>{data.productName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>{data.quantity}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tenure</Text>
          <Text style={styles.value}>{data.durationMonths} months</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{data.paymentMethod}</Text>
        </View>
        {data.startDate || data.endDate ? (
          <View style={styles.row}>
            <Text style={styles.label}>Installment Period</Text>
            <Text style={styles.value}>
              {data.startDate ? formatDate(data.startDate) : "—"} → {data.endDate ? formatDate(data.endDate) : "—"}
            </Text>
          </View>
        ) : null}

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
          <Text style={styles.label}>Tenure</Text>
          <Text style={styles.value}>{data.durationMonths} months</Text>
        </View>
        <View style={[styles.row, styles.total]}>
          <Text style={styles.totalText}>Total Cost</Text>
          <Text style={styles.totalText}>{formatPKR(data.totalAmount)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment History</Text>
        {data.payments.length === 0 ? (
          <Text style={{ color: "#999" }}>No payments recorded yet.</Text>
        ) : (
          <View>
            <View style={[styles.scheduleRow, { borderBottom: "1 solid #ccc" }]}>
              <Text style={[styles.col, styles.head]}>Date</Text>
              <Text style={[styles.col, styles.head]}>Reference</Text>
              <Text style={[styles.col, styles.head]}>Method</Text>
              <Text style={[styles.colRight, styles.head]}>Amount</Text>
            </View>
            {data.payments.map((pmt, i) => (
              <View key={i} style={styles.scheduleRow}>
                <Text style={styles.col}>{formatDate(pmt.date)}</Text>
                <Text style={styles.col}>{formatReference(pmt.reference)}</Text>
                <Text style={styles.col}>{pmt.method}</Text>
                <Text style={styles.colRight}>{formatPKR(pmt.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Installment Schedule</Text>
        <View style={[styles.scheduleRow, { borderBottom: "1 solid #ccc" }]}>
          <Text style={[styles.col, styles.head]}>#</Text>
          <Text style={[styles.col, styles.head]}>Due Date</Text>
          <Text style={[styles.colRight, styles.head]}>Amount</Text>
          <Text style={[styles.colCenter, styles.head]}>Status</Text>
        </View>
        {data.installments.map((inst) => (
          <View key={inst.number} style={styles.scheduleRow}>
            <Text style={styles.col}>{inst.number}</Text>
            <Text style={styles.col}>{formatDate(inst.dueDate)}</Text>
            <Text style={styles.colRight}>{formatPKR(inst.amount)}</Text>
            <Text style={[styles.colCenter, inst.status === "paid" ? styles.paid : styles.pending]}>
              {inst.status === "paid" ? "Paid" : "Pending"}
            </Text>
          </View>
        ))}

        <Text style={styles.footer}>QistGhar — Buy Now, Pay in Easy Installments</Text>
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
