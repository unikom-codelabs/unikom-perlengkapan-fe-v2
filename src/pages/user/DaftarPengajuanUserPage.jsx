import { useEffect, useMemo, useState } from "react";
import PageHelmet from "../../components/Seo/PageHelmet";
import { listPengajuanSaya } from "../../api/pengajuanService";
import { useAuth } from "../../context/useAuth";
import Table from "../../components/Element/Table";
import Pagination from "../../components/Element/Pagination";
import { STORAGE_BASE_URL as BASE_STORAGE_URL } from "../../config/env";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

const formatKategoriLabel = (value) => {
  const map = {
    tahunan: "Tahunan",
    ujian: "Ujian",
    kelas: "Kelas",
    habis_pakai: "Habis Pakai",
    tidak_habis_pakai: "Tidak Habis Pakai",
  };

  return map[value] ?? value ?? "-";
};

const DaftarPengajuanUserPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("tahunan");
  const [pengajuanList, setPengajuanList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [mainPage, setMainPage] = useState(1);
  const [lainnyaPage, setLainnyaPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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
  }, [isDekan, normalizedRole]);

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
        kategoriBarang: item.kategoriBarang || "",
        jumlah: item.jumlah ?? 0,
        jumlahDisetujui: item.jumlahDisetujui,
        status: item.status || submission.status || "Menunggu",
        isLainnya: Boolean(item.isLainnya),
        tahunAkademik: submission.tahunAkademik || "-",
        buktiFoto: item.buktiFoto || null,
        alasan: item.alasan || "",
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

  const mainTotalPages = Math.ceil(mainRows.length / ITEMS_PER_PAGE);
  const lainnyaTotalPages = Math.ceil(lainnyaRows.length / ITEMS_PER_PAGE);

  // Jumlah baris berubah tiap ganti tab, jadi halaman aktif dijepit ke rentang
  // yang masih ada supaya tabel tidak tampil kosong.
  const mainActualPage =
    mainTotalPages === 0 ? 1 : Math.min(mainPage, mainTotalPages);
  const lainnyaActualPage =
    lainnyaTotalPages === 0 ? 1 : Math.min(lainnyaPage, lainnyaTotalPages);

  const mainOffset = (mainActualPage - 1) * ITEMS_PER_PAGE;
  const lainnyaOffset = (lainnyaActualPage - 1) * ITEMS_PER_PAGE;

  const paginatedMainRows = useMemo(
    () => mainRows.slice(mainOffset, mainOffset + ITEMS_PER_PAGE),
    [mainRows, mainOffset],
  );

  const paginatedLainnyaRows = useMemo(
    () => lainnyaRows.slice(lainnyaOffset, lainnyaOffset + ITEMS_PER_PAGE),
    [lainnyaRows, lainnyaOffset],
  );

  return (
    <>
      <PageHelmet
        title="Daftar Pengajuan"
        description="Daftar kategori pengajuan perlengkapan yang tersedia untuk pengguna."
      />

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Daftar Barang Pengajuan</h1>
        </div>

        <div className="p-6">
          <div className="flex space-x-6 border-b border-gray-100 mb-6">
            {availableTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setMainPage(1);
                  setLainnyaPage(1);
                }}
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
                  { key: "no", label: "No", align: "center" },
                  { key: "namaBarang", label: "Nama Barang", align: "left" },
                  { key: "satuan", label: "Satuan", align: "center" },
                  { key: "kategori", label: "Kategori", align: "center" },
                  { key: "jumlah", label: "Jumlah", align: "center" },
                  { key: "jumlahDisetujui", label: "Jumlah Disetujui", align: "center" },
                  { key: "status", label: "Status", align: "center" },
                ]}
                rows={paginatedMainRows}
                renderRow={(item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-gray-500 text-center">
                      {mainOffset + index + 1}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-left">
                      {item.namaBarang}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-center">{item.satuan}</td>
                    <td className="px-6 py-4 text-gray-500 capitalize text-center">
                      {formatKategoriLabel(item.kategori)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-center">{item.jumlah}</td>
                    <td className="px-6 py-4 text-gray-500 text-center">
                      {item.jumlahDisetujui ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )}
              />

              <Pagination
                currentPage={mainActualPage}
                totalPages={mainTotalPages}
                onPageChange={setMainPage}
              />

              <div>
                <h2 className="text-[17px] font-bold text-gray-700 mb-4">
                  Pengajuan Lainnya
                </h2>
                <Table
                  title={null}
                  columns={[
                    { key: "no", label: "No", align: "center" },
                    { key: "namaBarang", label: "Nama Barang", align: "left" },
                    { key: "satuan", label: "Satuan", align: "center" },
                    { key: "kategori", label: "Kategori", align: "center" },
                    { key: "jumlah", label: "Jumlah", align: "center" },
                    { key: "jumlahDisetujui", label: "Jumlah Disetujui", align: "center" },
                    { key: "status", label: "Status", align: "center" },
                    { key: "buktiFoto", label: "Bukti Foto", align: "center" },
                    { key: "alasan", label: "Alasan", align: "left" },
                  ]}
                  rows={paginatedLainnyaRows}
                  renderRow={(item, index) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-gray-500 text-center">
                        {lainnyaOffset + index + 1}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-left">
                        {item.namaBarang}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-center">{item.satuan}</td>
                      <td className="px-6 py-4 text-gray-500 capitalize text-center">
                        {formatKategoriLabel(
                          item.kategoriBarang || item.kategori,
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-center">{item.jumlah}</td>
                      <td className="px-6 py-4 text-gray-500 text-center">
                        {item.jumlahDisetujui ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-center">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.buktiFoto ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage(
                                `${BASE_STORAGE_URL}${item.buktiFoto}`,
                              )
                            }
                            className="inline-flex items-center justify-center px-3 py-1 text-[11px] font-semibold text-[#4773da] bg-blue-50 border border-[#4773da] rounded-full hover:bg-[#4773da] hover:text-white transition-colors"
                          >
                            Lihat Foto
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-[200px] text-left">
                        <div
                          className="truncate text-sm"
                          title={item.alasan}
                        >
                          {item.alasan || "-"}
                        </div>
                      </td>
                    </tr>
                  )}
                />

                <Pagination
                  currentPage={lainnyaActualPage}
                  totalPages={lainnyaTotalPages}
                  onPageChange={setLainnyaPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">
                Preview Bukti Foto
              </h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50 min-h-[300px]">
              <img
                src={previewImage}
                alt="Bukti Foto"
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DaftarPengajuanUserPage;
