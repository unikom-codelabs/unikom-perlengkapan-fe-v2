import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/useAuth";
import { listPengajuan, listPengajuanSaya } from "../../api/pengajuanService";

const TAB_OPTIONS = [
  { label: "ATK Tahunan", value: "tahunan" },
  { label: "ATK Ujian", value: "ujian" },
  { label: "ATK Kelas", value: "kelas" },
];

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

const PengajuanRutinPage = () => {
  const [activeTab, setActiveTab] = useState("tahunan");
  const [searchQuery, setSearchQuery] = useState("");
  const [pengajuanList, setPengajuanList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const { currentUser } = useAuth();

  const normalizedRole = normalizeUserRole(currentUser);
  const isUserRole = normalizedRole === "user";
  const tabOptions = useMemo(
    () => (isUserRole ? [TAB_OPTIONS[0]] : TAB_OPTIONS),
    [isUserRole],
  );

  useEffect(() => {
    if (!tabOptions.some((tab) => tab.value === activeTab)) {
      setActiveTab(tabOptions[0].value);
    }
  }, [activeTab, tabOptions]);

  useEffect(() => {
    const fetchPengajuan = async () => {
      setIsLoading(true);
      setPageError("");

      try {
        const data =
          normalizedRole === "user"
            ? await listPengajuanSaya()
            : await listPengajuan();
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
  }, [normalizedRole]);

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

    return rows
      .filter((row) => row.kategori === activeTab)
      .filter((row) => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return row.namaBarang.toLowerCase().includes(query);
      });
  }, [activeTab, pengajuanList, searchQuery]);

  const mainRows = useMemo(
    () => rowsByTab.filter((item) => !item.isLainnya),
    [rowsByTab],
  );

  const lainnyaRows = useMemo(
    () => rowsByTab.filter((item) => item.isLainnya),
    [rowsByTab],
  );

  const tahunLabel = useMemo(() => {
    if (mainRows[0]?.tahunAkademik && mainRows[0].tahunAkademik !== "-") {
      return mainRows[0].tahunAkademik;
    }

    return "-";
  }, [mainRows]);

  const renderTable = (rows = [], options = {}) => {
    const { showAksi = false, bordered = false } = options;

    return (
      <div className="overflow-x-auto">
        <table
          className={`w-full text-sm text-left ${bordered ? "border-collapse" : ""}`}
        >
          <thead className="bg-[#f0f4fc] text-gray-600 font-semibold">
            <tr>
              <th
                className={`px-6 py-4 ${bordered ? "border border-gray-200" : ""}`}
              >
                No
              </th>
              <th
                className={`px-6 py-4 ${bordered ? "border border-gray-200" : ""}`}
              >
                Nama Barang
              </th>
              <th
                className={`px-6 py-4 ${bordered ? "border border-gray-200" : ""}`}
              >
                Satuan
              </th>
              <th
                className={`px-6 py-4 ${bordered ? "border border-gray-200" : ""}`}
              >
                Kategori
              </th>
              <th
                className={`px-6 py-4 ${bordered ? "border border-gray-200" : ""}`}
              >
                Jumlah
              </th>
              <th
                className={`px-6 py-4 ${bordered ? "border border-gray-200" : ""}`}
              >
                Jumlah Disetujui
              </th>
              <th
                className={`px-6 py-4 ${bordered ? "border border-gray-200" : ""}`}
              >
                Status
              </th>
              {showAksi ? (
                <th
                  className={`px-6 py-4 text-center ${bordered ? "border border-gray-200" : ""}`}
                >
                  Aksi
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((item, index) => (
                <tr key={item.id}>
                  <td
                    className={`px-6 py-4 text-gray-500 ${bordered ? "border border-gray-200" : ""}`}
                  >
                    {index + 1}
                  </td>
                  <td
                    className={`px-6 py-4 text-gray-600 ${bordered ? "border border-gray-200" : ""}`}
                  >
                    {item.namaBarang}
                  </td>
                  <td
                    className={`px-6 py-4 text-gray-500 ${bordered ? "border border-gray-200" : ""}`}
                  >
                    {item.satuan}
                  </td>
                  <td
                    className={`px-6 py-4 text-gray-500 capitalize ${bordered ? "border border-gray-200" : ""}`}
                  >
                    {item.kategori}
                  </td>
                  <td
                    className={`px-6 py-4 text-gray-500 ${bordered ? "border border-gray-200" : ""}`}
                  >
                    {item.jumlah}
                  </td>
                  <td
                    className={`px-6 py-4 text-gray-500 ${bordered ? "border border-gray-200" : ""}`}
                  >
                    {item.jumlahDisetujui ?? "-"}
                  </td>
                  <td
                    className={`px-6 py-4 text-gray-500 ${bordered ? "border border-gray-200" : ""}`}
                  >
                    {item.status}
                  </td>
                  {showAksi ? (
                    <td
                      className={`px-6 py-4 text-center ${bordered ? "border border-gray-200" : ""}`}
                    >
                      <div className="inline-flex items-center gap-4 text-xs">
                        <span className="inline-flex items-center gap-1 text-[#3b82f6]">
                          Edit <PencilSquareIcon className="h-3.5 w-3.5" />
                        </span>
                        <span className="inline-flex items-center gap-1 text-red-500">
                          Hapus <TrashIcon className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showAksi ? "8" : "7"}
                  className={`px-6 py-6 text-gray-500 ${bordered ? "border border-gray-200" : ""}`}
                >
                  Data tidak ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Daftar Pengajuan Rutin | UNIKOM Perlengkapan</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">
            {isUserRole ? "Daftar Pengajuan" : "Data Barang Pengajuan Rutin"}
          </h1>
        </div>

        <div className="p-6">
          {isUserRole ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex space-x-6 border-b border-gray-100">
                {tabOptions.map((tab) => (
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

              <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Cari"
                  className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex space-x-6 border-b border-gray-100 mb-6">
                {tabOptions.map((tab) => (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    Unit Kerja
                  </label>
                  <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500">
                    <option value="">-- Pilih Unit Kerja --</option>
                    <option value="1">Fakultas Teknik</option>
                    <option value="2">Fakultas Ilmu Budaya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">
                    Bidang
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none appearance-none bg-gray-100 text-gray-400 cursor-not-allowed"
                    disabled
                  >
                    <option value="">-- Pilih Bidang --</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {pageError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {pageError}
            </p>
          ) : null}

          {isLoading ? (
            <div className="py-8 text-center text-gray-500">
              Memuat data pengajuan...
            </div>
          ) : isUserRole ? (
            <>
              <div className="mb-8">
                <h2 className="text-[26px] font-bold text-gray-700 mb-4">
                  Pengajuan ATK tahunan
                </h2>
                {renderTable(mainRows, { showAksi: true, bordered: true })}
              </div>

              <div>
                <h2 className="text-[26px] font-bold text-gray-700 mb-4">
                  Pengajuan Lainnya
                </h2>
                {renderTable(lainnyaRows, { showAksi: true, bordered: true })}
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">{renderTable(mainRows)}</div>

              <div>
                <h2 className="text-[17px] font-bold text-gray-700 mb-4">
                  Pengajuan Lainnya
                </h2>
                {renderTable(lainnyaRows)}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PengajuanRutinPage;
