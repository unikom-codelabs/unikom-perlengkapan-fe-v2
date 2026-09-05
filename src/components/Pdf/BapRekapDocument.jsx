import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const cleanText = (value, fallback = "-") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 30,
    paddingVertical: 34,
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#111827",
  },
  titleLine: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    textAlign: "center",
  },
  titleGap: {
    marginBottom: 18,
  },
  table: {
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: "#9ca3af",
    borderStyle: "solid",
  },
  row: {
    flexDirection: "row",
  },
  column: {
    flexDirection: "column",
  },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#9ca3af",
    borderStyle: "solid",
    paddingHorizontal: 5,
    paddingVertical: 5,
    justifyContent: "center",
  },
  headerText: {
    fontFamily: "Helvetica-Bold",
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
});

const UNIT_WIDTH = 120;
const NAME_WIDTH = 70;
const SIGNATURE_WIDTH = 85;
const MIN_ITEM_WIDTH = 44;
const HEADER_BAND_HEIGHT = 22;
const PORTRAIT_CONTENT = 535;
const LANDSCAPE_CONTENT = 782;

const getLayout = (itemCount) => {
  const fixedWidth = UNIT_WIDTH + NAME_WIDTH + SIGNATURE_WIDTH;
  const safeCount = Math.max(1, itemCount);
  const portraitItemWidth = (PORTRAIT_CONTENT - fixedWidth) / safeCount;

  if (portraitItemWidth >= MIN_ITEM_WIDTH) {
    return {
      orientation: "portrait",
      itemWidth: Math.floor(portraitItemWidth),
    };
  }

  return {
    orientation: "landscape",
    itemWidth: Math.max(
      MIN_ITEM_WIDTH,
      Math.floor((LANDSCAPE_CONTENT - fixedWidth) / safeCount),
    ),
  };
};

const BapRekapDocument = ({
  titleLine1 = "Daftar Permintaan ATK",
  titleLine2 = "",
  itemNames = [],
  unitRows = [],
}) => {
  const { orientation, itemWidth } = getLayout(itemNames.length);
  const itemsWidth = itemWidth * Math.max(1, itemNames.length);
  const headerHeight = HEADER_BAND_HEIGHT * 2;
  const hasData = unitRows.length > 0 && itemNames.length > 0;

  return (
    <Document
      title={titleLine1}
      subject="Rekap pengajuan ATK"
      author="UNIKOM Perlengkapan"
      keywords="perlengkapan UNIKOM ATK BAP"
    >
      <Page size="A4" orientation={orientation} style={styles.page}>
        <Text style={styles.titleLine}>{titleLine1.toUpperCase()}</Text>
        <Text style={[styles.titleLine, styles.titleGap]}>
          {titleLine2.toUpperCase()}
        </Text>

        {hasData ? (
          <View style={styles.table}>
            <View style={styles.row} fixed>
              <View
                style={[
                  styles.cell,
                  { width: UNIT_WIDTH, height: headerHeight },
                ]}
              >
                <Text style={styles.headerText}>Jurusan</Text>
              </View>

              <View style={styles.column}>
                <View
                  style={[
                    styles.cell,
                    { width: itemsWidth, height: HEADER_BAND_HEIGHT },
                  ]}
                >
                  <Text style={styles.headerText}>Nama Barang</Text>
                </View>
                <View style={styles.row}>
                  {itemNames.map((name) => (
                    <View
                      key={name}
                      style={[
                        styles.cell,
                        { width: itemWidth, height: HEADER_BAND_HEIGHT },
                      ]}
                    >
                      <Text style={styles.headerText}>{name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View
                style={[
                  styles.cell,
                  { width: NAME_WIDTH, height: headerHeight },
                ]}
              >
                <Text style={styles.headerText}>Nama</Text>
              </View>
              <View
                style={[
                  styles.cell,
                  { width: SIGNATURE_WIDTH, height: headerHeight },
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
                    <View key={name} style={[styles.cell, { width: itemWidth }]}>
                      <Text style={styles.centerText}>{value || "-"}</Text>
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
          <Text style={styles.emptyState}>Data tidak ditemukan.</Text>
        )}
      </Page>
    </Document>
  );
};

export default BapRekapDocument;
