import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  title: { fontSize: 18, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#666", marginBottom: 16 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 4 },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", paddingBottom: 4, marginBottom: 4, fontWeight: 700 },
  date: { width: "15%" },
  category: { width: "25%" },
  description: { width: "40%" },
  amount: { width: "20%", textAlign: "right" },
  total: { marginTop: 12, textAlign: "right", fontSize: 12, fontWeight: 700 },
});

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function ExpensesPdfDocument({
  rows,
  userEmail,
}: {
  rows: {
    expense_date: string;
    amount: number;
    description: string | null;
    category: { name: string } | null;
  }[];
  userEmail: string;
}) {
  const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Informe de gastos</Text>
        <Text style={styles.subtitle}>
          {userEmail} · generado el {new Date().toLocaleDateString("es-ES")}
        </Text>

        <View style={styles.headerRow}>
          <Text style={styles.date}>Fecha</Text>
          <Text style={styles.category}>Categoría</Text>
          <Text style={styles.description}>Descripción</Text>
          <Text style={styles.amount}>Importe</Text>
        </View>

        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.date}>{row.expense_date}</Text>
            <Text style={styles.category}>{row.category?.name ?? "-"}</Text>
            <Text style={styles.description}>{row.description ?? "-"}</Text>
            <Text style={styles.amount}>{currency.format(row.amount)}</Text>
          </View>
        ))}

        <Text style={styles.total}>Total: {currency.format(total)}</Text>
      </Page>
    </Document>
  );
}
