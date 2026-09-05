import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const cleanText = (value, fallback = "-") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 30,
    paddingVertical: 30,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#1f2937",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  table: {
    width: "100%",
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: "#9ca3af",
    borderStyle: "solid",
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    backgroundColor: "#f3f4f6",
  },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#9ca3af",
    borderStyle: "solid",
    paddingHorizontal: 4,
    paddingVertical: 5,
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
  emptyState: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    borderStyle: "solid",
    padding: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 30,
    right: 30,
    bottom: 18,
    fontSize: 7,
    color: "#6b7280",
    textAlign: "right",
  },
});

const UNIT_WIDTH = 150;
const SIGNATURE_WIDTH = 100;
const NAME_WIDTH = 90;
const MIN_ITEM_WIDTH = 46;
const CONTENT_WIDTH = 782;

const getItemWidth = (itemCount) => {
  const trailingWidth = NAME_WIDTH + SIGNATURE_WIDTH;
  const available = CONTENT_WIDTH - UNIT_WIDTH - trailingWidth;

  if (itemCount <= 0) {
    return MIN_ITEM_WIDTH;
  }

  return Math.max(MIN_ITEM_WIDTH, Math.floor(available / itemCount));
};

const BapRekapDocument = ({
  title = "Daftar Permintaan ATK",
  periodeLabel = "",
  itemNames = [],
  unitRows = [],
}) => {
  const itemWidth = getItemWidth(itemNames.length);
  const hasData = unitRows.length > 0 && itemNames.length > 0;

  return (
    <Document
      title={title}
      subject="Rekap BAP pengajuan ATK"
      author="UNIKOM Perlengkapan"
      keywords="perlengkapan UNIKOM ATK BAP"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
        <Text style={styles.subtitle}>{cleanText(periodeLabel, " ")}</Text>

        {hasData ? (
          <View style={styles.table}>
            <View style={styles.row} fixed>
              <View
                style={[styles.cell, styles.headerCell, { width: UNIT_WIDTH }]}
              >
                <Text style={styles.headerText}>Jurusan / Bagian</Text>
              </View>
              {itemNames.map((name) => (
                <View
                  key={name}
                  style={[styles.cell, styles.headerCell, { width: itemWidth }]}
                >
                  <Text style={styles.headerText}>{name}</Text>
                </View>
              ))}
              <View
                style={[styles.cell, styles.headerCell, { width: NAME_WIDTH }]}
              >
                <Text style={styles.headerText}>Nama</Text>
              </View>
              <View
                style={[
                  styles.cell,
                  styles.headerCell,
                  { width: SIGNATURE_WIDTH },
                ]}
              >
                <Text style={styles.headerText}>Tanda Tangan</Text>
              </View>
            </View>

            {unitRows.map((unitRow) => (
              <View key={unitRow.unit} style={styles.row} wrap={false}>
                <View style={[styles.cell, { width: UNIT_WIDTH }]}>
                  <Text>{cleanText(unitRow.unit)}</Text>
                </View>
                {itemNames.map((name) => {
                  const value = unitRow.quantities?.[name];

                  return (
                    <View
                      key={name}
                      style={[styles.cell, { width: itemWidth }]}
                    >
                      <Text style={styles.centerText}>
                        {value ? value : "-"}
                      </Text>
                    </View>
                  );
                })}
                <View style={[styles.cell, { width: NAME_WIDTH }]}>
                  <Text> </Text>
                </View>
                <View style={[styles.cell, { width: SIGNATURE_WIDTH }]}>
                  <Text> </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyState}>
            Tidak ada barang yang disetujui untuk dicetak.
          </Text>
        )}

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

export default BapRekapDocument;
