import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const formatCurrency = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "Rp -";
  }

  return `Rp ${new Intl.NumberFormat("id-ID").format(numericValue)}`;
};

const formatDate = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(safeDate);
};

const cleanText = (value, fallback = "-") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const normalizeItems = (items = []) =>
  items.map((item, index) => {
    const hargaValue = Number(item?.harga);
    const jumlahValue = Number(item?.jumlah);
    const subtotalValue = Number(item?.sub_total ?? item?.subtotal);
    const safeHarga = Number.isFinite(hargaValue) ? hargaValue : 0;
    const safeJumlah = Number.isFinite(jumlahValue) ? jumlahValue : 0;

    return {
      id: item?.id ?? `${item?.nama ?? "barang"}-${index}`,
      nama: cleanText(item?.nama),
      unit: cleanText(item?.unit ?? item?.satuan),
      hargaValue: safeHarga,
      jumlah: safeJumlah,
      subtotalValue: Number.isFinite(subtotalValue)
        ? subtotalValue
        : safeHarga * safeJumlah,
    };
  });

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 34,
    paddingVertical: 32,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1f2937",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    borderBottomStyle: "solid",
    paddingBottom: 14,
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 8,
    color: "#4773da",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: "#111827",
  },
  generatedDate: {
    marginTop: 6,
    color: "#6b7280",
  },
  summary: {
    flexDirection: "row",
    marginBottom: 16,
  },
  summaryBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    padding: 10,
    marginRight: 8,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    fontSize: 10,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#111827",
    marginBottom: 8,
  },
  table: {
    width: "100%",
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "solid",
  },
  row: {
    flexDirection: "row",
    minHeight: 28,
  },
  headerCell: {
    backgroundColor: "#eef2ff",
  },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "solid",
    paddingHorizontal: 5,
    paddingVertical: 6,
    justifyContent: "center",
  },
  headerText: {
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "center",
  },
  centerText: {
    textAlign: "center",
  },
  rightText: {
    textAlign: "right",
  },
  emptyState: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "solid",
    padding: 14,
    color: "#6b7280",
  },
  footer: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 22,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 6,
    fontSize: 8,
    color: "#6b7280",
    textAlign: "right",
  },
});

const VendorAtkTable = ({ rows = [] }) => {
  const widths = [28, 180, 56, 62, 90, 90];

  if (rows.length === 0) {
    return (
      <Text style={styles.emptyState}>Tidak ada barang untuk vendor ini.</Text>
    );
  }

  return (
    <View style={styles.table}>
      <View style={styles.row} fixed>
        {["No", "Nama Barang", "Unit", "Jumlah", "Harga", "Subtotal"].map(
          (label, index) => (
            <View
              key={label}
              style={[styles.cell, styles.headerCell, { width: widths[index] }]}
            >
              <Text style={styles.headerText}>{label}</Text>
            </View>
          ),
        )}
      </View>
      {rows.map((row, index) => (
        <View key={row.id} style={styles.row} wrap={false}>
          <View style={[styles.cell, { width: widths[0] }]}>
            <Text style={styles.centerText}>{index + 1}</Text>
          </View>
          <View style={[styles.cell, { width: widths[1] }]}>
            <Text>{row.nama}</Text>
          </View>
          <View style={[styles.cell, { width: widths[2] }]}>
            <Text style={styles.centerText}>{row.unit}</Text>
          </View>
          <View style={[styles.cell, { width: widths[3] }]}>
            <Text style={styles.centerText}>{row.jumlah}</Text>
          </View>
          <View style={[styles.cell, { width: widths[4] }]}>
            <Text style={styles.rightText}>
              {formatCurrency(row.hargaValue)}
            </Text>
          </View>
          <View style={[styles.cell, { width: widths[5] }]}>
            <Text style={styles.rightText}>
              {formatCurrency(row.subtotalValue)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const VendorAtkDocument = ({ vendor = {}, generatedAt = new Date() }) => {
  const rows = normalizeItems(
    Array.isArray(vendor?.barang) ? vendor.barang : [],
  );
  const totalHarga = rows.reduce((total, row) => total + row.subtotalValue, 0);

  return (
    <Document
      title={`Daftar ATK dan Vendor - ${cleanText(vendor?.nama)}`}
      subject="Daftar ATK berdasarkan vendor"
      author="UNIKOM Perlengkapan"
      keywords="perlengkapan UNIKOM ATK vendor"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>UNIKOM Perlengkapan</Text>
          <Text style={styles.title}>List Barang</Text>
          <Text style={styles.generatedDate}>
            Dicetak pada {formatDate(generatedAt)}
          </Text>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Vendor</Text>
            <Text style={styles.summaryValue}>{cleanText(vendor?.nama)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Kontak</Text>
            <Text style={styles.summaryValue}>{cleanText(vendor?.kontak)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Jumlah Barang</Text>
            <Text style={styles.summaryValue}>{rows.length} item</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Harga</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalHarga)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Rincian Barang</Text>
        <VendorAtkTable rows={rows} />

        <Text
          fixed
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Halaman ${pageNumber} dari ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
};

export default VendorAtkDocument;
