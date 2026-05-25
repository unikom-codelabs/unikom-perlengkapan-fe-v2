import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { listPengajuanSaya } from "../../api/pengajuanService";
import { useAuth } from "../../context/useAuth";
import Table from "../../components/Element/Table";

const TAB_OPTIONS = [
  { label: "ATK Tahunan", value: "tahunan" },
  { label: "ATK Ujian", value: "ujian" },
  { label: "ATK Kelas", value: "kelas" },
];

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (responseData?.errors && typeof responseData.errors === "object") {
    const detailedErrors = Object.values(responseData.errors)
      .flat()
      .filter(
        (message) => typeof message === "string" && message.trim().length > 0,
      );

    if (detailedErrors.length > 0) {
      return detailedErrors.join("\n");
    }
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

const normalizeUserRole = (user = {}) => {
  const roleCandidates = [
    user?.role,
    user?.level,
    user?.jabatan?.nama,
    user?.jabatan_nama,
    user?.jabatan,
  ];

  const firstRole = roleCandidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return String(firstRole ?? "")
    .trim()
    .toLowerCase();
};

const normalizeJabatanName = (user = {}) => {
  const candidates = [user?.jabatan_nama, user?.jabatan?.nama, user?.jabatan];

  const firstJabatan = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return String(firstJabatan ?? "")
    .trim()
    .toLowerCase();
};

const getStatusBadgeClass = (status) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (["disetujui", "approved", "approve", "selesai"].includes(normalized)) {
    return "bg-green-100 text-green-700";
  }

  if (["ditolak", "rejected", "reject"].includes(normalized)) {
    return "bg-red-100 text-red-700";
  }

  return "bg-yellow-100 text-yellow-700";
};

const DaftarPengajuanUserPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("tahunan");
  const [pengajuanList, setPengajuanList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const normalizedRole = normalizeUserRole(currentUser);
  const normalizedJabatan = normalizeJabatanName(currentUser);

  const isDekan =
    normalizedJabatan.includes("dekan") ||
    normalizedJabatan.includes("kaprodi");

  const allowedKategori = useMemo(() => {
    if (normalizedRole === "user" && !isDekan) {
      return ["tahunan"];
    }

    return TAB_OPTIONS.map((tab) => tab.value);
  }, [isDekan, normalizedRole, normalizedJabatan]);

  const availableTabs = useMemo(
    () => TAB_OPTIONS.filter((tab) => allowedKategori.includes(tab.value)),
    [allowedKategori],
  );

  useEffect(() => {
    if (availableTabs.length === 0) {
      return;
    }

    if (!allowedKategori.includes(activeTab)) {
      setActiveTab(availableTabs[0].value);
    }
  }, [activeTab, allowedKategori, availableTabs]);

  useEffect(() => {
    const fetchPengajuan = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const data = await listPengajuanSaya();
        setPengajuanList(data);
      } catch (error) {
        setPageError(
          getApiErrorMessage(error, "Gagal mengambil data daftar pengajuan."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPengajuan();
  }, []);

  const rowsByTab = useMemo(() => {
    const rows = pengajuanList.flatMap((submission) =>
      (submission.items || []).map((item, index) => ({
        id: `${submission.id}-${item.id ?? index}`,
        namaBarang: item.namaBarang || "-",
        satuan: item.satuan || "-",
        kategori: item.kategori || submission.kategori || "tahunan",
        jumlah: item.jumlah ?? 0,
        jumlahDisetujui: item.jumlahDisetujui,
        status: item.status || submission.status || "Menunggu",
        isLainnya: Boolean(item.isLainnya),
        tahunAkademik: submission.tahunAkademik || "-",
      })),
    );

    return rows.filter((row) => row.kategori === activeTab);
  }, [activeTab, pengajuanList]);

  const mainRows = useMemo(
    () => rowsByTab.filter((item) => !item.isLainnya),
    [rowsByTab],
  );

  const lainnyaRows = useMemo(
    () => rowsByTab.filter((item) => item.isLainnya),
    [rowsByTab],
  );

  return (
    <>
      <Helmet>
        <title>Daftar Pengajuan | UNIKOM Perlengkapan</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Data Barang Pengajuan</h1>
        </div>

        <div className="p-6">
          <div className="flex space-x-6 border-b border-gray-100 mb-6">
            {availableTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`pb-3 text-[15px] font-medium transition-colors relative ${
                  activeTab === tab.value
                    ? "text-[#4773da]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.value ? (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4773da]" />
                ) : null}
              </button>
            ))}
          </div>

          {pageError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {pageError}
            </p>
          ) : null}

          {isLoading ? (
            <div className="py-8 text-center text-gray-500">
              Memuat data pengajuan...
            </div>
          ) : (
            <>
              <Table
                title={null}
                columns={[
                  { key: "no", label: "No" },
                  { key: "namaBarang", label: "Nama Barang" },
                  { key: "satuan", label: "Satuan" },
                  { key: "kategori", label: "Kategori" },
                  { key: "jumlah", label: "Jumlah" },
                  { key: "jumlahDisetujui", label: "Jumlah Disetujui" },
                  { key: "status", label: "Status" },
                ]}
                rows={mainRows}
                renderRow={(item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {item.namaBarang}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.satuan}</td>
                    <td className="px-6 py-4 text-gray-500 capitalize">
                      {item.kategori}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.jumlah}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.jumlahDisetujui ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )}
              />

              <div>
                <h2 className="text-[17px] font-bold text-gray-700 mb-4">
                  Pengajuan Lainnya
                </h2>
                <Table
                  title={null}
                  columns={[
                    { key: "no", label: "No" },
                    { key: "namaBarang", label: "Nama Barang" },
                    { key: "satuan", label: "Satuan" },
                    { key: "kategori", label: "Kategori" },
                    { key: "jumlah", label: "Jumlah" },
                    { key: "jumlahDisetujui", label: "Jumlah Disetujui" },
                    { key: "status", label: "Status" },
                  ]}
                  rows={lainnyaRows}
                  renderRow={(item, index) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.namaBarang}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{item.satuan}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize">
                        {item.kategori}
                      </td>
                      <td className="px-6 py-4 text-gray-500">{item.jumlah}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.jumlahDisetujui ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DaftarPengajuanUserPage;
