import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const FIRST_PARTY = {
  name: "Yayah Sutisnawati, S.E., M.M",
  role: "Kepala bagian perlengkapan",
  signatureRole: "Direktur",
  nip: "41270201012",
};

const KNOWN_BY = [
  {
    title: "Wakil Rektor Bidang Akademik dan Kemahasiswaan",
    name: "Prof. Dr. Hj. Umi Narimawati, Dra., SE., M.Si.",
    nip: "41273402015",
  },
];

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatKategori = (value) => {
  const map = {
    tahunan: "ATK Tahunan",
    ujian: "ATK Ujian",
    kelas: "ATK Kelas",
    habis_pakai: "Habis Pakai",
    tidak_habis_pakai: "Tidak Habis Pakai",
  };

  return map[value] ?? value ?? "-";
};

const toDate = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatBapDate = (value) => {
  const date = toDate(value);
  return `${date.getDate()}-${MONTH_SHORT[date.getMonth()]}-${date.getFullYear()}`;
};

const formatLetterDate = (value) => {
  const date = toDate(value);
  return `${date.getDate()} ${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
};

const formatNumber = (value) =>
  Number.isFinite(Number(value)) ? String(Number(value)) : String(value ?? "-");

const getApprovedQuantity = (row = {}) => {
  const approved = Number(row.jumlahDisetujui);

  if (Number.isFinite(approved) && approved > 0) {
    return approved;
  }

  return Number(row.jumlah) || 0;
};

const cleanText = (value, fallback = "-") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const formatDocumentCase = (value) => {
  const lowerCaseWords = new Set(["dan", "di", "ke", "dari", "untuk"]);

  return String(value ?? "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && lowerCaseWords.has(word)) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const normalizeForCompare = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const buildReceiptRoleText = (role, unitLabel) => {
  const cleanRole = cleanText(role, "");
  const cleanUnit = cleanText(unitLabel, "");

  if (!cleanRole) {
    return formatDocumentCase(cleanUnit);
  }

  if (!cleanUnit || normalizeForCompare(cleanRole).includes(normalizeForCompare(cleanUnit))) {
    return cleanRole;
  }

  const formattedUnit = formatDocumentCase(cleanUnit);
  const shouldUseFacultyPrefix =
    normalizeForCompare(cleanRole) === "dekan" &&
    !normalizeForCompare(cleanUnit).startsWith("fakultas");
  const unitPrefix = shouldUseFacultyPrefix ? "Fakultas " : "";

  return `${cleanRole} ${unitPrefix}${formattedUnit}`.trim();
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 129,
    paddingHorizontal: 34,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: "#000000",
  },
  pageTwo: {
    paddingTop: 133,
    paddingHorizontal: 34,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: "#000000",
  },
  pageThree: {
    paddingTop: 137,
    paddingHorizontal: 34,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 7.5,
    color: "#000000",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 23,
  },
  line: {
    flexDirection: "row",
    minHeight: 12,
    alignItems: "flex-start",
  },
  label: {
    width: 106,
  },
  value: {
    flex: 1,
  },
  paragraph: {
    marginTop: 7.5,
    marginBottom: 14,
  },
  partyBlock: {
    marginTop: 7.5,
  },
  table: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderColor: "#dddddd",
    borderLeftWidth: 0.75,
    borderTopWidth: 0.75,
  },
  receiptFormTable: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderColor: "#dddddd",
    borderLeftWidth: 0.75,
  },
  receiptTable: {
    display: "flex",
    width: "100%",
    borderStyle: "solid",
    borderColor: "#dddddd",
    borderLeftWidth: 0.75,
    borderTopWidth: 0.75,
  },
  tableHeader: {
    flexDirection: "row",
    minHeight: 28,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 26,
  },
  tableCell: {
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderStyle: "solid",
    borderColor: "#dddddd",
    paddingHorizontal: 4,
    paddingVertical: 7,
    justifyContent: "center",
  },
  receiptCell: {
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderStyle: "solid",
    borderColor: "#dddddd",
    paddingHorizontal: 4,
    paddingVertical: 7,
    justifyContent: "center",
    borderTopWidth: 0,
  },
  receiptHeaderCell: {
    borderTopWidth: 0.75,
  },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  centerText: {
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginTop: 32,
    marginBottom: 12,
  },
  receivedText: {
    marginTop: 16,
  },
  topNote: {
    marginBottom: 16,
  },
  dateLine: {
    marginBottom: 24,
  },
  signatures: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  signatureColumn: {
    width: 220,
    alignItems: "center",
  },
  signatureRole: {
    marginTop: 13,
  },
  signatureName: {
    fontFamily: "Helvetica-Bold",
    marginTop: 64,
    borderBottomWidth: 0.375,
    borderBottomColor: "#000000",
    borderBottomStyle: "solid",
    paddingBottom: 1,
  },
  signatureNip: {
    marginTop: 5,
  },
  knownTitle: {
    textAlign: "center",
    marginTop: 18,
    marginBottom: 13,
  },
  tembusan: {
    marginTop: 34,
  },
  formProgram: {
    flexDirection: "row",
    marginBottom: 6,
    fontSize: 9,
  },
  formProgramLabel: {
    width: 96,
  },
  formProgramColon: {
    width: 8,
  },
  formProgramValue: {
    flex: 1,
  },
});

const BapTable = ({ rows = [] }) => {
  const displayRows = rows.length > 0 ? rows : [{ id: "empty-row" }];
  const widths = [51, 274, 51, 51, 102];

  return (
    <View style={styles.receiptTable}>
      <View style={styles.tableHeader}>
        {["No", "Nama Barang", "Jumlah", "Satuan", "Keterangan"].map(
          (label, index) => (
            <View
              key={label}
              style={[styles.tableCell, { width: widths[index] }]}
            >
              <Text style={styles.tableHeaderText}>{label}</Text>
            </View>
          ),
        )}
      </View>
      {displayRows.map((row, index) => (
        <View
          key={row.id ?? `${row.namaBarang}-${index}`}
          style={styles.tableRow}
        >
          <View style={[styles.tableCell, { width: widths[0] }]}>
            <Text style={styles.centerText}>
              {row.namaBarang ? index + 1 : ""}
            </Text>
          </View>
          <View style={[styles.tableCell, { width: widths[1] }]}>
            <Text>{row.namaBarang ?? ""}</Text>
          </View>
          <View style={[styles.tableCell, { width: widths[2] }]}>
            <Text style={styles.centerText}>
              {row.namaBarang ? formatNumber(getApprovedQuantity(row)) : ""}
            </Text>
          </View>
          <View style={[styles.tableCell, { width: widths[3] }]}>
            <Text style={styles.centerText}>{row.satuan ?? ""}</Text>
          </View>
          <View style={[styles.tableCell, { width: widths[4] }]}>
            <Text>{row.namaBarang ? formatKategori(row.kategori) : ""}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const ReceiptTable = ({ rows = [], generatedDate }) => {
  const displayRows = rows.length > 0 ? rows : [{ id: "empty-receipt-row" }];
  const widths = [30, 86, 210, 86, 48, 48];

  return (
    <View style={styles.receiptFormTable}>
      <View style={styles.tableHeader}>
        {[
          "No",
          "Tanggal",
          "Nama Barang",
          "Jenis Barang",
          "Jumlah",
          "Satuan",
        ].map((label, index) => (
          <View
            key={label}
            style={[
              styles.receiptCell,
              styles.receiptHeaderCell,
              { width: widths[index] },
            ]}
          >
            <Text style={styles.tableHeaderText}>{label}</Text>
          </View>
        ))}
      </View>
      {displayRows.map((row, index) => (
        <View
          key={row.id ?? `${row.namaBarang}-${index}`}
          style={styles.tableRow}
        >
          <View style={[styles.receiptCell, { width: widths[0] }]}>
            <Text style={styles.centerText}>
              {row.namaBarang ? index + 1 : ""}
            </Text>
          </View>
          <View style={[styles.receiptCell, { width: widths[1] }]}>
            <Text style={styles.centerText}>
              {row.namaBarang
                ? formatLetterDate(row.tanggal || generatedDate)
                : ""}
            </Text>
          </View>
          <View style={[styles.receiptCell, { width: widths[2] }]}>
            <Text>{row.namaBarang ?? ""}</Text>
          </View>
          <View style={[styles.receiptCell, { width: widths[3] }]}>
            <Text style={styles.centerText}>
              {row.namaBarang ? formatKategori(row.kategori) : ""}
            </Text>
          </View>
          <View style={[styles.receiptCell, { width: widths[4] }]}>
            <Text style={styles.centerText}>
              {row.namaBarang ? formatNumber(getApprovedQuantity(row)) : ""}
            </Text>
          </View>
          <View
            style={[
              styles.receiptCell,
              { width: widths[5] },
            ]}
          >
            <Text style={styles.centerText}>{row.satuan ?? ""}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const SignatureColumn = ({ title, role, name, nip }) => {
  const safeRole = cleanText(role, "");
  const safeName = cleanText(name, "");
  const safeNip = cleanText(nip, "");

  return (
    <View style={styles.signatureColumn}>
      <Text>{title}</Text>
      {safeRole ? <Text style={styles.signatureRole}>{safeRole}</Text> : null}
      <Text style={styles.signatureName}>{safeName || " "}</Text>
      {safeNip ? <Text style={styles.signatureNip}>NIP. {safeNip}</Text> : null}
    </View>
  );
};

const BapDocument = ({
  mainRows = [],
  otherRows = [],
  unitLabel = "-",
  secondPartyName = "-",
  secondPartyRole = "-",
  secondPartyNip = "-",
  bapNumber = "",
  firstPartyName = "",
  firstPartyRole = "",
  firstPartyNip = "",
  knownByPrimary = null,
  knownBySecondary = null,
  tembusan = [],
  generatedAt = new Date(),
}) => {
  const firstParty = {
    name: cleanText(firstPartyName, FIRST_PARTY.name),
    role: cleanText(firstPartyRole, FIRST_PARTY.role),
    signatureRole: cleanText(firstPartyRole, FIRST_PARTY.signatureRole),
    nip: cleanText(firstPartyNip, FIRST_PARTY.nip),
  };
  const secondParty = {
    name: cleanText(secondPartyName),
    role: cleanText(secondPartyRole, "Ketua"),
    nip: cleanText(secondPartyNip),
  };
  const bapNumberText = cleanText(bapNumber, "/BA-BP/UNIKOM/2023");
  const knownPrimary = knownByPrimary || KNOWN_BY[0];
  const knownSecondary = knownBySecondary || {
    title: `Ketua ${unitLabel}`,
    role: "",
    name: secondParty.name,
    nip: secondParty.nip,
  };
  const tembusanList = Array.isArray(tembusan)
    ? tembusan.map((item) => cleanText(item, "")).filter(Boolean)
    : [];
  const receiptRoleText = buildReceiptRoleText(secondParty.role, unitLabel);

  return (
    <Document
      title="Perlengkapan UNIKOM | BAP"
      subject="aplikasi berbasis website untuk keperluan perlengkapan di UNIKOM"
      author="Tio Reza Febrian Fazal Ahmad"
      keywords="perlengkapan UNIKOM"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.line}>
          <Text style={styles.label}>Nomor</Text>
          <Text style={styles.value}>: {bapNumberText}</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.label}>Lampiran</Text>
          <Text style={styles.value}>: -</Text>
        </View>
        <View style={styles.line}>
          <Text style={styles.label}>Perihal</Text>
          <Text style={styles.value}>: Berita Acara Serah Terima Barang</Text>
        </View>

        <Text style={styles.paragraph}>
          Pada hari ini tanggal {formatBapDate(generatedAt)}, kami yang bertanda
          tangan dibawah ini :
        </Text>

        <View style={styles.partyBlock}>
          <View style={styles.line}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>: {firstParty.name}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.label}>Jabatan</Text>
            <Text style={styles.value}>: {firstParty.role}</Text>
          </View>
          <Text>Selanjutnya disebut sebagai pihak kesatu</Text>
        </View>

        <View style={styles.partyBlock}>
          <View style={styles.line}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>: {secondParty.name}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.label}>Jabatan</Text>
            <Text style={styles.value}>: {secondParty.role}</Text>
          </View>
          <Text>Selanjutnya disebut sebagai pihak kedua</Text>
        </View>

        <Text style={styles.paragraph}>
          Pihak kesatu telah menyerahkan barang-barang di bawah ini kepada pihak
          kedua :
        </Text>
        <BapTable rows={mainRows} />

        <Text style={styles.sectionTitle}>Pengajuan Lainnya</Text>
        <BapTable rows={otherRows} />

        <Text style={styles.receivedText}>
          Barang-barang tersebut di atas telah diterima oleh pihak kedua dengan
          keadaan baik
        </Text>
      </Page>

      <Page size="A4" style={styles.pageTwo}>
        <Text style={styles.topNote}>Lampiran Surat No. {bapNumberText}</Text>
        <Text style={styles.dateLine}>
          Bandung, {formatLetterDate(generatedAt)}
        </Text>
        <View style={styles.signatures}>
          <SignatureColumn
            title="Pihak Kesatu,"
            role={firstParty.signatureRole}
            name={firstParty.name}
            nip={firstParty.nip}
          />
          <SignatureColumn
            title="Pihak Kedua,"
            role={secondParty.role}
            name={secondParty.name}
            nip={secondParty.nip}
          />
        </View>
        <Text style={styles.knownTitle}>Mengetahui,</Text>
        <View style={styles.signatures}>
          <SignatureColumn
            title={cleanText(knownPrimary?.title, "")}
            role={knownPrimary?.role}
            name={knownPrimary?.name}
            nip={knownPrimary?.nip}
          />
          <SignatureColumn
            title={cleanText(knownSecondary?.title, "")}
            role={knownSecondary?.role}
            name={knownSecondary?.name}
            nip={knownSecondary?.nip}
          />
        </View>
        <View style={styles.tembusan}>
          <Text>Tembusan :</Text>
          {tembusanList.length > 0 ? (
            tembusanList.map((item, index) => (
              <Text key={`${item}-${index}`} style={{ marginTop: 16 }}>
                {index + 1}. {item}
              </Text>
            ))
          ) : (
            <Text style={{ marginTop: 16 }}>1.</Text>
          )}
        </View>
      </Page>

      <Page size="A4" style={styles.pageThree}>
        <Text style={styles.title}>FORM SERAH TERIMA BARANG</Text>
        <View style={styles.formProgram}>
          <Text style={styles.formProgramLabel}>Nama</Text>
          <Text style={styles.formProgramColon}>:</Text>
          <Text style={styles.formProgramValue}>{secondParty.name}</Text>
        </View>
        <View style={styles.formProgram}>
          <Text style={styles.formProgramLabel}>Jabatan</Text>
          <Text style={styles.formProgramColon}>:</Text>
          <Text style={styles.formProgramValue}>{receiptRoleText}</Text>
        </View>
        <ReceiptTable rows={mainRows} generatedDate={generatedAt} />

        <Text style={styles.sectionTitle}>Pengajuan Lainnya</Text>
        <ReceiptTable rows={otherRows} generatedDate={generatedAt} />
      </Page>
    </Document>
  );
};

export default BapDocument;
