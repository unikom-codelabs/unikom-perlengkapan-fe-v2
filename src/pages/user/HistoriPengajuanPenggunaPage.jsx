import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/useAuth";
import { getHistoriPengajuan } from "../../api/historiPengajuanService";

const BASE_STORAGE_URL = "http://perlengkapan.codelabspace.or.id/storage/";
const ITEMS_PER_PAGE = 10;

const StatusBadge = ({ status }) => {
  const map = {
    0: { label: "Menunggu", cls: "bg-yellow-100 text-yellow-700" },
    1: { label: "Disetujui", cls: "bg-green-100  text-green-700" },
    2: { label: "Ditolak", cls: "bg-red-100    text-red-700" },
  };
  const { label, cls } = map[status] ?? {
    label: "–",
    cls: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
};

const PaginatedTable = ({ title, rows }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const sliced = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  return (
    <div className="mb-10">
      <h3 className="text-[17px] font-bold text-gray-700 mb-4">{title}</h3>
      <div className="overflow-x-auto rounded-t-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f0f4fc] text-gray-600 font-semibold">
            <tr>
              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4">Nama Barang</th>
              <th className="px-6 py-4">Satuan</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Jumlah</th>
              <th className="px-6 py-4">Jumlah Disetujui</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="bg-[#f8f9fc]">
            {sliced.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              sliced.map((item, idx) => (
                <tr key={item._uid ?? idx} className="border-t border-gray-100">
                  <td className="px-6 py-4 text-gray-600">
                    {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                  </td>
                  <td className="px-6 py-4 text-gray-800">{item.nama}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.satuan ?? "–"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatKategori(item.kategori)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.jumlah_diajukan}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.jumlah_disetujui}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-3 py-1.5 border rounded text-sm font-medium ${
                n === page
                  ? "border-[#4773da] bg-[#4773da] text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const formatKategori = (k) => {
  const map = {
    atk_tahunan: "ATK Tahunan",
    habis_pakai: "Habis Pakai",
    tidak_habis_pakai: "Tidak Habis Pakai",
  };
  return map[k] ?? k ?? "–";
};

const filterByTab = (data, tab) => {
  if (!data?.length) return [];
  const jenisMap = {
    "ATK Tahunan": "rutin",
    "ATK Ujian": "ujian",
    "ATK Kelas": "kelas",
  };
  const jenis = jenisMap[tab];
  if (!jenis) return data;
  return data.filter(
    (d) => d.aktivasi?.jenis_pengajuan === jenis || d.aktivasi?.tipe === jenis,
  );
};

const extractYears = (data) => {
  const years = new Set();
  (data ?? []).forEach((d) => {
    const y = d.tanggal?.split("-")[0];
    if (y) years.add(y);
  });
  return Array.from(years).sort((a, b) => b - a);
};

const HistoriPengajuanPenggunaPage = () => {
  const [activeTab, setActiveTab] = useState("ATK Tahunan");
  const [selectedYear, setSelectedYear] = useState("");
  const [histori, setHistori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser, authLoading } = useAuth();

  const hasJabatanField = Boolean(
    currentUser &&
    (currentUser.jabatan ||
      currentUser.jabatan_id ||
      currentUser.jabatan_nama ||
      (typeof currentUser.jabatan === "object" &&
        Object.keys(currentUser.jabatan || {}).length > 0)),
  );
  const roleIncludesRestricted =
    currentUser &&
    (currentUser.role === "jabatan" ||
      currentUser.role === "role" ||
      (Array.isArray(currentUser.roles) &&
        (currentUser.roles.includes("jabatan") ||
          currentUser.roles.includes("role"))));
  const isJabatanOrRestrictedRole = Boolean(
    hasJabatanField || roleIncludesRestricted,
  );

  const tabs = authLoading
    ? ["ATK Tahunan"]
    : isJabatanOrRestrictedRole
      ? ["ATK Tahunan"]
      : ["ATK Tahunan", "ATK Ujian", "ATK Kelas"];

  useEffect(() => {
    if (!tabs.includes(activeTab) && tabs.length > 0) {
      setActiveTab(tabs[0]);
    }
  }, [tabs, activeTab]);

  const fetchHistori = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoriPengajuan();
      setHistori(data);
    } catch (err) {
      setError("Gagal memuat data. Silakan coba lagi.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistori();
  }, [fetchHistori]);

  const years = extractYears(histori);

  useEffect(() => {
    if (years.length > 0 && selectedYear === "") {
      setSelectedYear(years[0]);
    }
  }, [years]);

  const filteredData = filterByTab(histori, activeTab).filter((d) => {
    if (!selectedYear) return true;
    return d.tanggal?.startsWith(selectedYear);
  });

  const barangRows = filteredData.flatMap((d) =>
    (d.barang ?? []).map((b, i) => ({
      _uid: `atk-${d.id}-${i}`,
      nama: b.nama_barang,
      satuan: b.satuan ?? "–",
      kategori: b.kategori,
      jumlah_diajukan: b.jumlah_diajukan,
      jumlah_disetujui: b.jumlah_disetujui,
      status: b.status,
    })),
  );

  const lainnyaRows = filteredData.flatMap((d) =>
    (d.barang_lainnya ?? []).map((b, i) => ({
      _uid: `lain-${d.id}-${i}`,
      nama: b.nama,
      satuan: b.satuan ?? "–",
      kategori: b.kategori,
      jumlah_diajukan: b.jumlah_diajukan,
      jumlah_disetujui: b.jumlah_disetujui,
      status: b.status,
    })),
  );

  const suratPengajuan = filteredData.find(
    (d) => d.surat_pengajuan,
  )?.surat_pengajuan;
  const suratURL = suratPengajuan
    ? `${BASE_STORAGE_URL}${suratPengajuan}`
    : null;

  const tahunLabel = selectedYear || "-";

  return (
    <>
      <Helmet>
        <title>Histori Pengajuan</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden mb-6">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Histori Pengajuan</h1>
        </div>

        <div className="p-6">
          <div className="flex space-x-6 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[15px] font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-[#4773da]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4773da]" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Tahun</label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-600"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  ▾
                </span>
              </div>
            </div>

            <div className="md:col-start-3 flex items-end justify-end">
              {suratURL ? (
                <a
                  href={suratURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4773da] hover:underline font-medium"
                >
                  Lihat Surat Permohonan
                </a>
              ) : (
                <span className="text-sm text-gray-400 cursor-not-allowed select-none">
                  Lihat Surat Permohonan
                </span>
              )}
            </div>
          </div>

          {loading && (
            <div className="py-10 text-center text-gray-500 text-sm">
              Memuat data…
            </div>
          )}
          {error && !loading && (
            <div className="py-6 text-center text-red-500 text-sm">{error}</div>
          )}

          {!loading && !error && (
            <>
              <PaginatedTable
                title={`Tahun : ${tahunLabel}`}
                rows={barangRows}
              />
              <PaginatedTable title="Pengajuan Lainnya" rows={lainnyaRows} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HistoriPengajuanPenggunaPage;
