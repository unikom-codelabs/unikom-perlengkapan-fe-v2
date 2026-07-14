import React, { useState, useEffect, useCallback, useMemo } from "react";
import PageHelmet from "../../components/Seo/PageHelmet";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Table from "../../components/Element/Table";
import { useAuth } from "../../context/useAuth";
import Dropdown from "../../components/Element/Dropdown";
import { getHistoriPengajuan } from "../../api/historiPengajuanService";
import { STORAGE_BASE_URL as BASE_STORAGE_URL } from "../../config/env";

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

const PaginatedTable = ({ title, rows, isLainnya = false }) => {
  const [page, setPage] = useState(1);
  const [prevRows, setPrevRows] = useState(rows);

  if (rows !== prevRows) {
    setPrevRows(rows);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const sliced = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const columns = [
    { key: "no", label: "No" },
    { key: "nama", label: "Nama Barang" },
    { key: "satuan", label: "Satuan" },
    { key: "kategori", label: "Kategori" },
    { key: "jumlah", label: "Jumlah" },
    { key: "jumlah_disetujui", label: "Jumlah Disetujui" },
    { key: "status", label: "Status" },
  ];

  if (isLainnya) {
    columns.push({ key: "bukti_foto", label: "Bukti Foto" });
    columns.push({ key: "alasan", label: "Alasan" });
  }

  return (
    <Table
      title={title}
      columns={columns}
      rows={sliced}
      renderRow={(item, idx) => (
        <tr key={item._uid ?? idx} className="border-t border-gray-100">
          <td className="px-6 py-4 text-gray-600">
            {(page - 1) * ITEMS_PER_PAGE + idx + 1}
          </td>
          <td className="px-6 py-4 text-gray-800">{item.nama}</td>
          <td className="px-6 py-4 text-gray-600">
            {item.unit ?? item.satuan ?? "–"}
          </td>
          <td className="px-6 py-4 text-gray-600">
            {formatKategori(item.kategori)}
          </td>
          <td className="px-6 py-4 text-gray-600 text-center">{item.jumlah_diajukan}</td>
          <td className="px-6 py-4 text-gray-600 text-center">{item.jumlah_disetujui}</td>
          <td className="px-6 py-4">
            <StatusBadge status={item.status} />
          </td>
          {isLainnya && (
            <>
              <td className="px-6 py-4 text-center">
                {item.bukti_foto ? (
                  <a
                    href={`${BASE_STORAGE_URL}${item.bukti_foto}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3 py-1 text-[11px] font-semibold text-[#4773da] bg-blue-50 border border-[#4773da] rounded-full hover:bg-[#4773da] hover:text-white transition-colors"
                  >
                    Lihat Foto
                  </a>
                ) : (
                  <span className="text-gray-400 text-xs italic">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-gray-600 max-w-[200px]">
                <div className="truncate text-sm" title={item.alasan}>
                  {item.alasan || "-"}
                </div>
              </td>
            </>
          )}
        </tr>
      )}
      footer={
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
      }
    />
  );
};

const formatKategori = (k) => {
  const map = {
    atk_tahunan: "ATK Tahunan",
    atk_ujian: "ATK Ujian",
    atk_kelas: "ATK Kelas",
    habis_pakai: "Habis Pakai",
    tidak_habis_pakai: "Tidak Habis Pakai",
  };
  return map[k] ?? k ?? "–";
};

const getJenisFromTab = (tab) =>
  ({
    "ATK Tahunan": "tahunan",
    "ATK Ujian": "ujian",
    "ATK Kelas": "kelas",
  })[tab] ?? null;

const normalizeBarangKategori = (value) => {
  const kategori = String(value ?? "")
    .trim()
    .toLowerCase();

  if (!kategori) {
    return "";
  }

  if (kategori.includes("ujian") || kategori.includes("atk_ujian")) {
    return "ujian";
  }

  if (kategori.includes("kelas") || kategori.includes("atk_kelas")) {
    return "kelas";
  }

  if (kategori.includes("tahunan") || kategori.includes("atk_tahunan")) {
    return "tahunan";
  }

  return "";
};

const normalizeHistoriKategori = (item = {}) => {
  const aktivasi = item?.aktivasi || {};
  const aktivasiJenis = String(aktivasi.jenis_pengajuan ?? "")
    .trim()
    .toLowerCase();
  if (["tahunan", "ujian", "kelas"].includes(aktivasiJenis)) {
    return aktivasiJenis;
  }

  const aktivasiKategori = String(aktivasi.kategori ?? "")
    .trim()
    .toLowerCase();
  if (aktivasiKategori) {
    if (
      aktivasiKategori.includes("ujian") ||
      aktivasiKategori.includes("atk_ujian")
    ) {
      return "ujian";
    }

    if (
      aktivasiKategori.includes("kelas") ||
      aktivasiKategori.includes("atk_kelas")
    ) {
      return "kelas";
    }

    if (
      aktivasiKategori.includes("tahunan") ||
      aktivasiKategori.includes("atk_tahunan")
    ) {
      return "tahunan";
    }
  }

  const rawKategoriCandidates = [
    item.kategori,
    item.jenis_pengajuan,
    item.tipe_pengajuan,
    item.jenis,
    item.tipe,
  ];

  const rawKategori = rawKategoriCandidates
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .map((value) => value.trim().toLowerCase())
    .find(Boolean);

  if (rawKategori) {
    if (rawKategori.includes("ujian") || rawKategori.includes("atk_ujian")) {
      return "ujian";
    }

    if (rawKategori.includes("kelas") || rawKategori.includes("atk_kelas")) {
      return "kelas";
    }

    if (
      rawKategori.includes("tahunan") ||
      rawKategori.includes("atk_tahunan")
    ) {
      return "tahunan";
    }
  }

  const itemKategoriCandidates = [
    ...(Array.isArray(item.barang) ? item.barang : []),
    ...(Array.isArray(item.barang_lainnya) ? item.barang_lainnya : []),
  ]
    .map((row) =>
      String(row?.kategori ?? "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);

  if (itemKategoriCandidates.some((value) => value.includes("atk_tahunan"))) {
    return "tahunan";
  }

  if (itemKategoriCandidates.some((value) => value.includes("atk_ujian"))) {
    return "ujian";
  }

  if (itemKategoriCandidates.some((value) => value.includes("atk_kelas"))) {
    return "kelas";
  }

  const jenisValue = String(aktivasi.tipe ?? item.jenis_pengajuan ?? item.tipe)
    .trim()
    .toLowerCase();

  if (jenisValue === "rutin") {
    return "tahunan";
  }

  const semesterValue = String(item.semester ?? aktivasi.semester ?? "")
    .trim()
    .toLowerCase();
  const ujianValue = String(item.ujian ?? aktivasi.ujian ?? "")
    .trim()
    .toLowerCase();

  if (ujianValue) {
    return "ujian";
  }

  if (["ganjil", "genap"].includes(semesterValue)) {
    return "kelas";
  }

  return "tahunan";
};

const filterByTab = (data, tab) => {
  if (!data?.length) return [];
  const jenis = getJenisFromTab(tab);
  if (!jenis) return data;
  return data.filter((d) => normalizeHistoriKategori(d) === jenis);
};

const formatDateLabel = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
};

const formatAktivasiTipe = (value) => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

  if (!normalized) {
    return "";
  }

  if (normalized === "rutin") {
    return "Rutin";
  }

  if (normalized === "non rutin" || normalized === "nonrutin") {
    return "Non Rutin";
  }

  return normalized
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
};

const appendAktivasiTipe = (label, tipeLabel) => {
  if (!label || !tipeLabel) {
    return label;
  }

  if (label.toLowerCase().includes(tipeLabel.toLowerCase())) {
    return label;
  }

  return `${label} - ${tipeLabel}`;
};

const getHistoriAktivasiKey = (histori = {}) => {
  const aktivasi = histori?.aktivasi ?? {};
  const candidates = [
    aktivasi.id,
    aktivasi.aktivasi_pengajuan_id,
    aktivasi.aktivasiPengajuanId,
    histori.aktivasi_pengajuan_id,
    histori.aktivasiPengajuanId,
    histori.id_aktivasi_pengajuan,
    histori.idAktivasiPengajuan,
    histori.id_aktivasi,
    histori.idAktivasi,
  ];

  const key = candidates.find(
    (value) => value !== undefined && value !== null && String(value).trim(),
  );

  return key !== undefined && key !== null ? String(key).trim() : "";
};

const getHistoriAktivasiLabel = (histori = {}) => {
  const aktivasi = histori?.aktivasi ?? {};
  const namaPeriode = String(
    aktivasi.nama_periode ??
      aktivasi.namaPeriode ??
      aktivasi.nama ??
      aktivasi.title ??
      histori.nama_periode ??
      histori.namaPeriode ??
      "",
  ).trim();
  const tahunAkademik = String(
    aktivasi.tahun_akademik ??
      aktivasi.tahunAkademik ??
      histori.tahun_akademik ??
      histori.tahunAkademik ??
      "",
  ).trim();
  const tipeLabel = formatAktivasiTipe(
    aktivasi.tipe ??
      aktivasi.tipe_pengajuan ??
      aktivasi.tipePengajuan ??
      histori.tipe ??
      histori.tipe_pengajuan,
  );

  if (namaPeriode && tahunAkademik && !namaPeriode.includes(tahunAkademik)) {
    return appendAktivasiTipe(`${namaPeriode} - ${tahunAkademik}`, tipeLabel);
  }

  if (namaPeriode) {
    return appendAktivasiTipe(namaPeriode, tipeLabel);
  }

  if (tahunAkademik) {
    return appendAktivasiTipe(tahunAkademik, tipeLabel);
  }

  const tanggalMulai = formatDateLabel(
    aktivasi.tanggal_mulai ??
      aktivasi.tanggalMulai ??
      aktivasi.aktif_mulai ??
      aktivasi.mulai,
  );
  const tanggalSelesai = formatDateLabel(
    aktivasi.tanggal_selesai ??
      aktivasi.tanggalSelesai ??
      aktivasi.aktif_selesai ??
      aktivasi.selesai,
  );

  if (tanggalMulai || tanggalSelesai) {
    return appendAktivasiTipe(
      [tanggalMulai, tanggalSelesai].filter(Boolean).join(" - "),
      tipeLabel,
    );
  }

  return getHistoriAktivasiKey(histori)
    ? `Aktivasi #${getHistoriAktivasiKey(histori)}`
    : "";
};

const getHistoriAktivasiSortValue = (histori = {}) => {
  const aktivasi = histori?.aktivasi ?? {};
  const dateValue =
    aktivasi.tanggal_selesai ??
    aktivasi.tanggalSelesai ??
    aktivasi.aktif_selesai ??
    aktivasi.selesai ??
    aktivasi.tanggal_mulai ??
    aktivasi.tanggalMulai ??
    aktivasi.aktif_mulai ??
    aktivasi.mulai ??
    histori.tanggal ??
    "";
  const timestamp = new Date(dateValue).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const buildAktivasiOptions = (data = []) => {
  return Array.from(
    data
      .reduce((map, item) => {
        const label = getHistoriAktivasiLabel(item);
        const value = getHistoriAktivasiKey(item) || label;

        if (!value || map.has(value)) {
          return map;
        }

        map.set(value, {
          value,
          label,
          sortValue: getHistoriAktivasiSortValue(item),
        });

        return map;
      }, new Map())
      .values(),
  ).sort((a, b) => b.sortValue - a.sortValue || a.label.localeCompare(b.label));
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

const HistoriPengajuanPenggunaPage = () => {
  const [activeTab, setActiveTab] = useState("ATK Tahunan");
  const [selectedAktivasi, setSelectedAktivasi] = useState("");
  const [histori, setHistori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser, authLoading } = useAuth();
  const normalizedJabatan = normalizeJabatanName(currentUser);
  const isDekan =
    normalizedJabatan.includes("dekan") ||
    normalizedJabatan.includes("kaprodi");

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
    (hasJabatanField || roleIncludesRestricted) && !isDekan,
  );

  const tabs = useMemo(() => {
    return authLoading
      ? ["ATK Tahunan"]
      : isJabatanOrRestrictedRole
        ? ["ATK Tahunan"]
        : ["ATK Tahunan", "ATK Ujian", "ATK Kelas"];
  }, [authLoading, isJabatanOrRestrictedRole]);

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

  const tabHistori = useMemo(
    () => filterByTab(histori, activeTab),
    [activeTab, histori],
  );
  const aktivasiOptions = useMemo(
    () => buildAktivasiOptions(tabHistori),
    [tabHistori],
  );

  useEffect(() => {
    if (aktivasiOptions.length === 0) {
      setSelectedAktivasi("");
      return;
    }

    const hasSelectedAktivasi = aktivasiOptions.some(
      (option) => option.value === selectedAktivasi,
    );

    if (!hasSelectedAktivasi) {
      setSelectedAktivasi(aktivasiOptions[0].value);
    }
  }, [aktivasiOptions, selectedAktivasi]);

  const filteredData = tabHistori.filter((d) => {
    if (!selectedAktivasi) return true;
    return (
      (getHistoriAktivasiKey(d) || getHistoriAktivasiLabel(d)) ===
      selectedAktivasi
    );
  });

  const activeJenis = getJenisFromTab(activeTab);

  const barangRows = filteredData.flatMap((d) =>
    (d.barang ?? []).flatMap((b, i) => {
      const jenisFromBarang = normalizeBarangKategori(b.kategori);
      const jenisFromParent = normalizeHistoriKategori(d);
      const jenis = jenisFromBarang || jenisFromParent;

      if (activeJenis && jenis && jenis !== activeJenis) {
        return [];
      }

      return [
        {
          _uid: `atk-${d.id}-${i}`,
          nama: b.nama_barang,
          unit: b.unit ?? "–",
          kategori: b.kategori,
          jumlah_diajukan: b.jumlah_diajukan,
          jumlah_disetujui: b.jumlah_disetujui,
          status: b.status,
        },
      ];
    }),
  );

  const lainnyaRows = filteredData.flatMap((d) =>
    (d.barang_lainnya ?? []).flatMap((b, i) => {
      const jenisFromParent = normalizeHistoriKategori(d);

      if (activeJenis && jenisFromParent && jenisFromParent !== activeJenis) {
        return [];
      }

      return [
        {
          _uid: `lain-${d.id}-${i}`,
          nama: b.nama,
          satuan: b.satuan ?? "–",
          kategori: b.kategori,
          jumlah_diajukan: b.jumlah_diajukan,
          jumlah_disetujui: b.jumlah_disetujui,
          status: b.status,
          bukti_foto: b.bukti_foto,
          alasan: b.alasan,
        },
      ];
    }),
  );

  const suratPengajuan = filteredData.find(
    (d) => d.surat_pengajuan,
  )?.surat_pengajuan;
  const suratURL = suratPengajuan
    ? `${BASE_STORAGE_URL}${suratPengajuan}`
    : null;

  const selectedAktivasiLabel =
    aktivasiOptions.find((option) => option.value === selectedAktivasi)
      ?.label ?? "-";

  return (
    <>
      <PageHelmet
        title="Histori Pengajuan"
        description="Lihat histori pengajuan perlengkapan yang pernah dibuat pengguna."
      />

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
              <label className="block text-sm text-gray-500 mb-2">
                Aktivasi
              </label>
              <Dropdown
                value={selectedAktivasi}
                onChange={(e) => setSelectedAktivasi(e.target.value)}
                disabled={loading || aktivasiOptions.length === 0}
              >
                {aktivasiOptions.length === 0 ? (
                  <option value="">Tidak ada aktivasi</option>
                ) : null}
                {aktivasiOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Dropdown>
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
                title={`Aktivasi : ${selectedAktivasiLabel}`}
                rows={barangRows}
              />
              <PaginatedTable title="Pengajuan Lainnya" rows={lainnyaRows} isLainnya={true} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HistoriPengajuanPenggunaPage;
