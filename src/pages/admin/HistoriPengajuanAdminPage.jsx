import React, { useEffect, useMemo, useState } from "react";
import PageHelmet from "../../components/Seo/PageHelmet";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Table from "../../components/Element/Table";
import Dropdown from "../../components/Element/Dropdown";
import { listUnitTypeTree } from "../../api/unitTypeService";
import { getHistoriPengajuanAdmin } from "../../api/historiPengajuanService";
import { STORAGE_BASE_URL as BASE_STORAGE_URL } from "../../config/env";

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

const normalizeHistoriJenis = (histori = {}) => {
  const aktivasiJenis = String(histori?.aktivasi?.jenis_pengajuan ?? "")
    .trim()
    .toLowerCase();

  if (["tahunan", "ujian", "kelas"].includes(aktivasiJenis)) {
    return aktivasiJenis;
  }

  const kategoriCandidates = [
    histori?.aktivasi?.kategori,
    histori?.kategori,
    histori?.jenis_pengajuan,
    histori?.tipe_pengajuan,
  ];

  const rawKategori = kategoriCandidates
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
    ...(Array.isArray(histori?.barang) ? histori.barang : []),
    ...(Array.isArray(histori?.barang_lainnya) ? histori.barang_lainnya : []),
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

  const tipeAktivasi = String(histori?.aktivasi?.tipe ?? histori?.tipe ?? "")
    .trim()
    .toLowerCase();

  if (tipeAktivasi === "rutin") {
    return "tahunan";
  }

  return "";
};

const formatKategori = (value) => {
  const map = {
    atk_tahunan: "ATK Tahunan",
    atk_ujian: "ATK Ujian",
    atk_kelas: "ATK Kelas",
    habis_pakai: "Habis Pakai",
    tidak_habis_pakai: "Tidak Habis Pakai",
  };

  return map[value] ?? value ?? "-";
};

const formatStatus = (value) => {
  const map = {
    0: "Menunggu",
    1: "Disetujui",
    2: "Ditolak",
  };

  return map[value] ?? value ?? "-";
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

const normalizeUnitTypeName = (item = {}) =>
  String(item?.nama ?? item?.name ?? "").trim();

const getUnitTypeChildrenNames = (item = {}) =>
  (Array.isArray(item?.children) ? item.children : [])
    .map((child) => normalizeUnitTypeName(child))
    .filter(Boolean);

const normalizeUnitValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const HistoriPengajuanAdminPage = () => {
  const [activeTab, setActiveTab] = useState("ATK Tahunan");
  const [jabatanOptions, setJabatanOptions] = useState([]);
  const [bagianOptions, setBagianOptions] = useState([]);
  const [selectedJabatan, setSelectedJabatan] = useState("");
  const [selectedBagian, setSelectedBagian] = useState("");
  const [selectedBagianType, setSelectedBagianType] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
  const [selectedAktivasi, setSelectedAktivasi] = useState("");
  const [selectedAktivasiUjian, setSelectedAktivasiUjian] = useState("");
  const [selectedAktivasiKelas, setSelectedAktivasiKelas] = useState("");
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [isLoadingHistori, setIsLoadingHistori] = useState(false);
  const [historiData, setHistoriData] = useState([]);

  const tabs = ["ATK Tahunan", "ATK Ujian", "ATK Kelas"];
  const isUjianTab = activeTab === "ATK Ujian";
  const isTahunanTab = activeTab === "ATK Tahunan";
  const isKelasTab = activeTab === "ATK Kelas";

  const aktivasiOptions = Array.from(
    historiData
      .reduce((map, item) => {
        if (normalizeHistoriJenis(item) !== "tahunan") {
          return map;
        }

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

  const selectedAktivasiLabel =
    aktivasiOptions.find((option) => option.value === selectedAktivasi)
      ?.label ?? "";
  const aktivasiOptionsUjian = Array.from(
    historiData
      .reduce((map, item) => {
        if (normalizeHistoriJenis(item) !== "ujian") {
          return map;
        }

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

  const selectedAktivasiUjianLabel =
    aktivasiOptionsUjian.find(
      (option) => option.value === selectedAktivasiUjian,
    )?.label ?? "";

  const aktivasiOptionsKelas = Array.from(
    historiData
      .reduce((map, item) => {
        if (normalizeHistoriJenis(item) !== "kelas") {
          return map;
        }

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

  const selectedAktivasiKelasLabel =
    aktivasiOptionsKelas.find(
      (option) => option.value === selectedAktivasiKelas,
    )?.label ?? "";
  const ujianJabatanOptions = useMemo(() => {
    return jabatanOptions
      .map((item) => {
        const label = normalizeUnitTypeName(item);
        const normalizedLabel = label.toLowerCase();

        if (normalizedLabel !== "dekan" && normalizedLabel !== "kaprodi") {
          return null;
        }

        return {
          value: label,
          label,
        };
      })
      .filter(Boolean);
  }, [jabatanOptions]);

  const dekanBagianOptions = useMemo(() => {
    const dekan = jabatanOptions.find(
      (item) => normalizeUnitTypeName(item).toLowerCase() === "dekan",
    );

    return getUnitTypeChildrenNames(dekan);
  }, [jabatanOptions]);
  const kaprodiProdiOptions = useMemo(() => {
    const kaprodi = jabatanOptions.find(
      (item) => normalizeUnitTypeName(item).toLowerCase() === "kaprodi",
    );

    return getUnitTypeChildrenNames(kaprodi);
  }, [jabatanOptions]);
  useEffect(() => {
    const fetchFilters = async () => {
      setIsLoadingFilters(true);
      setIsLoadingHistori(true);

      try {
        const [historiDataResponse, unitTypes] = await Promise.all([
          getHistoriPengajuanAdmin(),
          listUnitTypeTree().catch(() => []),
        ]);

        const historiList = Array.isArray(historiDataResponse)
          ? historiDataResponse
          : [];
        const jabatanUnits = Array.isArray(unitTypes) ? unitTypes : [];

        setJabatanOptions(jabatanUnits);
        setHistoriData(historiList);
      } catch {
        setJabatanOptions([]);
        setHistoriData([]);
      } finally {
        setIsLoadingFilters(false);
        setIsLoadingHistori(false);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    if (!selectedJabatan) {
      setBagianOptions([]);
      setSelectedBagian("");
      return;
    }

    const jabatan = jabatanOptions.find((item) => {
      const jabatanId = String(
        item?.id ?? item?.unit_id ?? item?.id_unit_type ?? "",
      ).trim();

      return jabatanId && jabatanId === String(selectedJabatan).trim();
    });

    const children = Array.isArray(jabatan?.children) ? jabatan.children : [];
    const childNames = children
      .map((child) => String(child?.nama ?? child?.name ?? "").trim())
      .filter(Boolean);
    setBagianOptions(childNames);
    setSelectedBagian("");
  }, [jabatanOptions, selectedJabatan]);

  useEffect(() => {
    if (!isUjianTab) {
      return;
    }

    setSelectedBagian("");
    setSelectedProdi("");
    setSelectedAktivasiUjian("");
  }, [isUjianTab, selectedBagianType]);

  useEffect(() => {
    if (!isKelasTab) {
      return;
    }

    setSelectedBagian("");
    setSelectedProdi("");
    setSelectedAktivasiKelas("");
  }, [isKelasTab, selectedBagianType]);

  const activeJenis = getJenisFromTab(activeTab);
  const filteredHistori = historiData.filter((item) => {
    const itemJenis = normalizeHistoriJenis(item);

    if (activeJenis && itemJenis && itemJenis !== activeJenis) {
      return false;
    }

    const hasRequiredSelections = isUjianTab
      ? selectedBagianType &&
        (selectedBagianType.toLowerCase() === "dekan"
          ? selectedBagian
          : selectedProdi) &&
        selectedAktivasiUjian
      : isKelasTab
        ? selectedBagianType &&
          (selectedBagianType.toLowerCase() === "dekan"
            ? selectedBagian
            : selectedProdi) &&
          selectedAktivasiKelas
        : selectedJabatan && selectedBagian && selectedAktivasi;

    if (!hasRequiredSelections) {
      return false;
    }

    if (isUjianTab) {
      if (selectedBagianType) {
        const unitFilter =
          selectedBagianType.toLowerCase() === "dekan"
            ? selectedBagian
            : selectedProdi;
        if (
          unitFilter &&
          normalizeUnitValue(item?.user?.unit) !==
            normalizeUnitValue(unitFilter)
        ) {
          return false;
        }
      }

      if (
        selectedAktivasiUjian &&
        (getHistoriAktivasiKey(item) || getHistoriAktivasiLabel(item)) !==
          selectedAktivasiUjian
      ) {
        return false;
      }

      return true;
    }

    if (isKelasTab) {
      if (selectedBagianType) {
        const unitFilter =
          selectedBagianType.toLowerCase() === "dekan"
            ? selectedBagian
            : selectedProdi;
        if (
          unitFilter &&
          normalizeUnitValue(item?.user?.unit) !==
            normalizeUnitValue(unitFilter)
        ) {
          return false;
        }
      }

      if (
        selectedAktivasiKelas &&
        (getHistoriAktivasiKey(item) || getHistoriAktivasiLabel(item)) !==
          selectedAktivasiKelas
      ) {
        return false;
      }

      return true;
    }

    if (
      selectedBagian &&
      normalizeUnitValue(item?.user?.unit) !==
        normalizeUnitValue(selectedBagian)
    ) {
      return false;
    }

    if (
      selectedAktivasi &&
      (getHistoriAktivasiKey(item) || getHistoriAktivasiLabel(item)) !==
        selectedAktivasi
    ) {
      return false;
    }

    return true;
  });

  const barangRows = filteredHistori.flatMap((histori) =>
    (histori?.barang ?? []).flatMap((item) => {
      const jenisFromBarang = normalizeBarangKategori(item?.kategori);
      const jenisFromParent = normalizeHistoriJenis(histori);
      const jenis = jenisFromBarang || jenisFromParent;

      if (activeJenis && jenis && jenis !== activeJenis) {
        return [];
      }

      return [
        {
          id: `barang-${histori.id}-${item.id}`,
          nama: item?.nama_barang ?? "-",
          satuan: item?.unit ?? item?.satuan ?? "-",
          kategori: formatKategori(item?.kategori),
          jumlah: item?.jumlah_diajukan ?? 0,
          jumlah_disetujui: item?.jumlah_disetujui ?? 0,
          status: formatStatus(item?.status),
        },
      ];
    }),
  );

  const barangLainnyaRows = filteredHistori.flatMap((histori) => {
    const jenisFromParent = normalizeHistoriJenis(histori);

    if (activeJenis && jenisFromParent && jenisFromParent !== activeJenis) {
      return [];
    }

    return (histori?.barang_lainnya ?? []).map((item) => ({
      id: `barang-lain-${histori.id}-${item.id}`,
      nama: item?.nama ?? "-",
      satuan: item?.satuan ?? "-",
      kategori: formatKategori(item?.kategori),
      jumlah: item?.jumlah_diajukan ?? 0,
      jumlah_disetujui: item?.jumlah_disetujui ?? 0,
      status: formatStatus(item?.status),
      bukti_foto: item?.bukti_foto,
      alasan: item?.alasan,
    }));
  });

  const renderTableSection = (title, rows, emptyMessage, isLainnya = false) => {
    const columns = [
      { key: "no", label: "No", align: "center" },
      { key: "nama", label: "Nama Barang", align: "left" },
      { key: "satuan", label: "Satuan", align: "center" },
      { key: "kategori", label: "Kategori", align: "center" },
      { key: "jumlah", label: "Jumlah", align: "center" },
      { key: "jumlah_disetujui", label: "Jumlah Disetujui", align: "center" },
      { key: "status", label: "Status", align: "center" },
    ];

    if (isLainnya) {
      columns.push({ key: "bukti_foto", label: "Bukti Foto", align: "center" });
      columns.push({ key: "alasan", label: "Alasan", align: "left" });
    }

    return (
      <Table
        title={title}
        columns={columns}
        rows={rows}
        emptyMessage={emptyMessage}
        renderRow={(row, index) => (
          <tr key={row.id}>
            <td className="px-6 py-4 text-center">{index + 1}</td>
            <td className="px-6 py-4 text-left">{row.nama}</td>
            <td className="px-6 py-4 text-center">{row.satuan}</td>
            <td className="px-6 py-4 text-center">{row.kategori}</td>
            <td className="px-6 py-4 text-center">{row.jumlah}</td>
            <td className="px-6 py-4 text-center">{row.jumlah_disetujui}</td>
            <td className="px-6 py-4 text-center">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(row.status)}`}
              >
                {row.status}
              </span>
            </td>
            {isLainnya && (
              <>
                <td className="px-6 py-4 text-center">
                  {row.bukti_foto ? (
                    <a
                      href={`${BASE_STORAGE_URL}${row.bukti_foto}`}
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
                <td className="px-6 py-4 text-gray-600 max-w-[200px] text-left">
                  <div className="truncate text-sm" title={row.alasan}>
                    {row.alasan || "-"}
                  </div>
                </td>
              </>
            )}
          </tr>
        )}
      footer={
        <div className="flex justify-end mt-4">
          <div className="flex items-center space-x-1">
            <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button className="px-3 py-1.5 border border-[#4773da] bg-[#4773da] text-white rounded text-sm font-medium">
              1
            </button>
            <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      }
    />
  );
  };

  const renderContent = () => (
    <>
      {isUjianTab ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Jabatan</label>
            <Dropdown
              value={selectedBagianType}
              onChange={(event) => setSelectedBagianType(event.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
            >
              <option value="">-- Pilih Jabatan --</option>
              {ujianJabatanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Dropdown>
          </div>
          {selectedBagianType &&
          selectedBagianType.toLowerCase() === "dekan" ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">Bagian</label>
              <Dropdown
                value={selectedBagian}
                onChange={(event) => setSelectedBagian(event.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Bagian --</option>
                {dekanBagianOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}
          {selectedBagianType &&
          selectedBagianType.toLowerCase() === "kaprodi" ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Program Studi
              </label>
              <Dropdown
                value={selectedProdi}
                onChange={(event) => setSelectedProdi(event.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Program Studi --</option>
                {kaprodiProdiOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}
          {selectedBagianType &&
          (selectedBagianType.toLowerCase() === "dekan"
            ? selectedBagian
            : selectedProdi) ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Aktivasi
              </label>
              <Dropdown
                value={selectedAktivasiUjian}
                onChange={(event) =>
                  setSelectedAktivasiUjian(event.target.value)
                }
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
                disabled={isLoadingFilters}
              >
                <option value="">-- Pilih Aktivasi --</option>
                {aktivasiOptionsUjian.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}
        </div>
      ) : isKelasTab ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Jabatan</label>
            <Dropdown
              value={selectedBagianType}
              onChange={(event) => setSelectedBagianType(event.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
            >
              <option value="">-- Pilih Jabatan --</option>
              {ujianJabatanOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Dropdown>
          </div>
          {selectedBagianType &&
          selectedBagianType.toLowerCase() === "dekan" ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">Bagian</label>
              <Dropdown
                value={selectedBagian}
                onChange={(event) => setSelectedBagian(event.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Bagian --</option>
                {dekanBagianOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}
          {selectedBagianType &&
          selectedBagianType.toLowerCase() === "kaprodi" ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Program Studi
              </label>
              <Dropdown
                value={selectedProdi}
                onChange={(event) => setSelectedProdi(event.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Program Studi --</option>
                {kaprodiProdiOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}
          {selectedBagianType &&
          (selectedBagianType.toLowerCase() === "dekan"
            ? selectedBagian
            : selectedProdi) ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Aktivasi
              </label>
              <Dropdown
                value={selectedAktivasiKelas}
                onChange={(event) =>
                  setSelectedAktivasiKelas(event.target.value)
                }
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
                disabled={isLoadingFilters}
              >
                <option value="">-- Pilih Aktivasi --</option>
                {aktivasiOptionsKelas.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Jabatan</label>
            <Dropdown
              value={selectedJabatan}
              onChange={(event) => setSelectedJabatan(event.target.value)}
              className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
            >
              <option value="">-- Pilih Jabatan --</option>
              {jabatanOptions.map((option) => (
                <option
                  key={option.unit_id ?? option.id ?? option.id_unit_type ?? option.unit_type_id ?? option.nama}
                  value={
                    option.unit_id ?? option.id ?? option.id_unit_type ?? option.unit_type_id ?? ""
                  }
                >
                  {option.name ?? option.nama}
                </option>
              ))}
            </Dropdown>
          </div>
          {selectedJabatan ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">Bagian</label>
              <Dropdown
                value={selectedBagian}
                onChange={(event) => setSelectedBagian(event.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
              >
                <option value="">-- Pilih Bagian --</option>
                {bagianOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}
          {selectedJabatan && selectedBagian ? (
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Aktivasi
              </label>
              <Dropdown
                value={selectedAktivasi}
                onChange={(event) => setSelectedAktivasi(event.target.value)}
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500"
                disabled={isLoadingFilters}
              >
                <option value="">-- Pilih Aktivasi --</option>
                {aktivasiOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Dropdown>
            </div>
          ) : null}
        </div>
      )}

      {isTahunanTab || isKelasTab ? (
        <div className="flex justify-end mb-6">
          {(() => {
            const suratPengajuan = filteredHistori.find(
              (item) => item?.surat_pengajuan,
            )?.surat_pengajuan;
            const suratURL = suratPengajuan
              ? `${BASE_STORAGE_URL}${suratPengajuan}`
              : null;

            if (!suratURL) {
              return (
                <span className="text-sm text-gray-400 cursor-not-allowed select-none">
                  Lihat Surat Permohonan
                </span>
              );
            }

            return (
              <a
                href={suratURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#4773da] hover:underline font-medium"
              >
                Lihat Surat Permohonan
              </a>
            );
          })()}
        </div>
      ) : null}

      {renderTableSection(
        isTahunanTab
          ? `Aktivasi : ${selectedAktivasiLabel || "-"}`
          : isUjianTab
            ? `Aktivasi : ${selectedAktivasiUjianLabel || "-"}`
            : `Aktivasi : ${selectedAktivasiKelasLabel || "-"}`,
        barangRows,
        isLoadingHistori
          ? "Memuat data..."
          : isUjianTab
            ? selectedBagianType &&
              (selectedBagianType.toLowerCase() === "dekan"
                ? selectedBagian
                : selectedProdi) &&
              selectedAktivasiUjian
              ? "Data tidak ditemukan"
              : "Pilih jabatan, bagian atau program studi, dan aktivasi untuk melihat data"
            : isKelasTab
              ? selectedBagianType &&
                (selectedBagianType.toLowerCase() === "dekan"
                  ? selectedBagian
                  : selectedProdi) &&
                selectedAktivasiKelas
                ? "Data tidak ditemukan"
                : "Pilih jabatan, bagian atau program studi, dan aktivasi untuk melihat data"
              : selectedJabatan && selectedBagian && selectedAktivasi
                ? "Data tidak ditemukan"
                : "Pilih jabatan, bagian, dan aktivasi untuk melihat data",
      )}
      {renderTableSection(
        "Pengajuan Lainnya",
        barangLainnyaRows,
        isLoadingHistori
          ? "Memuat data..."
          : isUjianTab
            ? selectedBagianType &&
              (selectedBagianType.toLowerCase() === "dekan"
                ? selectedBagian
                : selectedProdi) &&
              selectedAktivasiUjian
              ? "Data tidak ditemukan"
              : "Pilih jabatan, bagian atau program studi, dan aktivasi untuk melihat data"
            : isKelasTab
              ? selectedBagianType &&
                (selectedBagianType.toLowerCase() === "dekan"
                  ? selectedBagian
                  : selectedProdi) &&
                selectedAktivasiKelas
                ? "Data tidak ditemukan"
                : "Pilih jabatan, bagian atau program studi, dan aktivasi untuk melihat data"
              : selectedJabatan && selectedBagian && selectedAktivasi
                ? "Data tidak ditemukan"
                : "Pilih jabatan, bagian, dan aktivasi untuk melihat data",
        true
      )}
    </>
  );

  return (
    <>
      <PageHelmet
        title="Histori Pengajuan Admin"
        description="Lihat dan filter histori pengajuan perlengkapan dari sisi admin."
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
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4773da]"></span>
                )}
              </button>
            ))}
          </div>

          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default HistoriPengajuanAdminPage;
