
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import PageHelmet from "../../components/Seo/PageHelmet";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Table from "../../components/Element/Table";
import { listAktivasiPengajuan } from "../../api/aktivasiPengajuanService";
import { fetchCetakBerkasAdmin } from "../../api/cetakBerkasService";
import Dropdown from "../../components/Element/Dropdown";
import VendorAtkDownloadModal from "../../components/Fragments/VendorAtkDownloadModal";
import BapRekapDocument from "../../components/Pdf/BapRekapDocument";
import { fetchRekapVendor } from "../../api/vendorService";
import { listDaftarPengajuanAdmin } from "../../api/pengajuanService";
import { listDropdownProdi } from "../../api/dropdownService";

const ITEMS_PER_PAGE = 10;
const TABS = ["ATK Tahunan", "ATK Ujian", "ATK Kelas"];
const KATEGORI_BY_TAB = {
  "ATK Tahunan": "tahunan",
  "ATK Ujian": "ujian",
  "ATK Kelas": "kelas",
};

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const getFirstArray = (...values) =>
  values.find((value) => Array.isArray(value)) ?? [];

const isOtherItem = (item = {}) =>
  Boolean(item?.is_lainnya ?? item?.isLainnya ?? item?.manual) ||
  Boolean(item?.nama && !item?.barang && !item?.barang_id && !item?.id_barang);

const formatCurrency = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return "Rp -";
  }

  return `Rp ${new Intl.NumberFormat("id-ID").format(numericValue)}`;
};

const normalizeRow = (item = {}, index, kind = "barang") => {
  const jumlah = toNumber(
    item.jumlah ??
      item.qty ??
      item.quantity ??
      item.jumlah_diajukan ??
      item.jumlahDiajukan,
    0,
  );
  const jumlahBeli = toNumber(
    item.jumlah_beli ??
      item.jumlahBeli ??
      item.jumlah_disetujui ??
      item.jumlahDisetujui,
    0,
  );
  const hargaValue = toNumber(
    item.harga ??
      item.harga_satuan ??
      item.harga_barang ??
      item.hargaBarang ??
      item.barang?.harga,
    0,
  );
  const subtotalValue = toNumber(
    item.subtotal ??
      item.total_harga ??
      item.totalHarga ??
      item.subtotal_harga ??
      (jumlahBeli || jumlah) * hargaValue,
    0,
  );
  const sisa = Math.max(0, jumlah - jumlahBeli);

  return {
    id:
      item.id ??
      item.id_barang ??
      item.barang_id ??
      item.idBarang ??
      `${kind}-${index}`,
    nama_barang: String(
      item.nama_barang ??
        item.nama ??
        item.barang?.nama_barang ??
        item.barang?.nama ??
        "-",
    ).trim(),
    satuan: String(
      item.satuan ?? item.unit ?? item.barang?.satuan ?? "-",
    ).trim(),
    jumlah,
    sisa,
    jumlahBeli,
    hargaValue,
    subtotalValue,
    bagian: String(
      item.bagian ??
        item.nama_bagian ??
        item.namaBagian ??
        item.bagian?.nama ??
        item.jurusan ??
        item.prodi ??
        item.program_studi ??
        item.programStudi ??
        item.pengaju?.bagian ??
        item.user?.bagian ??
        "",
    ).trim(),
    vendor: String(
      item.vendor ??
        item.nama_vendor ??
        item.vendor_nama ??
        item.vendor?.nama ??
        "-",
    ).trim(),
  };
};

const filterRows = (rows = [], query = "") => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return rows;
  }

  return rows.filter((row) =>
    [
      row.nama_barang,
      row.satuan,
      row.jumlah,
      row.sisa,
      row.jumlahBeli,
      row.vendor,
      row.hargaValue,
      row.subtotalValue,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
};

const paginateRows = (rows = [], page = 1) => {
  const safePage = Math.max(1, page);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  return rows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
};

const getTotalPages = (rows = []) =>
  Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));

const getVisiblePages = (currentPage, totalPages) => {
  const pages = new Set([1, totalPages, currentPage]);

  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
};

const getSemesterLabel = (aktivasi) => {
  const periode = String(aktivasi?.namaPeriode ?? "").toLowerCase();

  if (periode.includes("genap")) {
    return "Genap";
  }

  return periode.includes("ganjil") ? "Ganjil" : "";
};

const getUjianLabel = (aktivasi) => {
  const periode = String(aktivasi?.namaPeriode ?? "").toLowerCase();

  if (periode.includes("uas") || periode.includes("akhir")) {
    return "Ujian Akhir Semester";
  }

  return periode.includes("uts") || periode.includes("tengah")
    ? "Ujian Tengah Semester"
    : "Ujian";
};

// Sementara semua baris ikut dicetak supaya fitur bisa diuji sebelum ada data
// yang disetujui. Kembalikan ke filter row.jumlahBeli > 0 sebelum dipakai user.
const buildBapRekap = (rows = [], allUnits = []) => {
  const itemNames = [];
  const unitMap = new Map();

  allUnits.forEach((unit) => {
    if (unit) {
      unitMap.set(unit, {});
    }
  });

  rows.forEach((row) => {
    const itemName = row.nama_barang || "-";
    const unit = row.bagian || "Tanpa Bagian";

    if (!itemNames.includes(itemName)) {
      itemNames.push(itemName);
    }

    if (!unitMap.has(unit)) {
      unitMap.set(unit, {});
    }

    const quantities = unitMap.get(unit);
    quantities[itemName] =
      (quantities[itemName] ?? 0) + (row.jumlahBeli || row.jumlah);
  });

  const unitRows = Array.from(unitMap.entries()).map(([unit, quantities]) => ({
    unit,
    quantities,
  }));

  return { itemNames, unitRows };
};

const CetakBerkasPage = ({ tipe = "rutin" }) => {
  const [activeTab, setActiveTab] = useState("ATK Tahunan");
  const [aktivasiList, setAktivasiList] = useState([]);
  const [isLoadingAktivasi, setIsLoadingAktivasi] = useState(false);
  const [validAktivasiIds, setValidAktivasiIds] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedAktivasiId, setSelectedAktivasiId] = useState("");
  const [cetakData, setCetakData] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mainSearchQuery, setMainSearchQuery] = useState("");
  const [otherSearchQuery, setOtherSearchQuery] = useState("");
  const [mainPage, setMainPage] = useState(1);
  const [otherPage, setOtherPage] = useState(1);
  const [otherPrices, setOtherPrices] = useState({});
  const [isVendorAtkModalOpen, setIsVendorAtkModalOpen] = useState(false);
  const [isPreparingBap, setIsPreparingBap] = useState(false);
  const [prodiList, setProdiList] = useState([]);
  const [daftarPengajuanRows, setDaftarPengajuanRows] = useState([]);
  const [rekapVendorList, setRekapVendorList] = useState([]);
  const [selectedRekapVendorId, setSelectedRekapVendorId] = useState("");
  const [isLoadingRekapVendor, setIsLoadingRekapVendor] = useState(false);
  const [rekapVendorError, setRekapVendorError] = useState("");
  const normalizedTipe = String(tipe).replace(/[^a-z0-9]/gi, "").toLowerCase();
  const tipeLabel = normalizedTipe === "nonrutin" ? "Non Rutin" : "Rutin";
  const pageTitle = `Cetak Berkas ${tipeLabel}`;
  const kategoriAtk = KATEGORI_BY_TAB[activeTab] ?? "tahunan";
  const isTahunanTab = kategoriAtk === "tahunan";

  const getYearFromAktivasi = useCallback(
    (item) => {
      const tahunAkademik = String(item?.tahunAkademik ?? "").trim();
      const kategori = String(item?.kategori ?? kategoriAtk)
        .trim()
        .toLowerCase();
      const academicYearMatch = tahunAkademik.match(
        /\b((?:19|20)\d{2})\s*[/-]\s*((?:19|20)\d{2})\b/,
      );

      if (academicYearMatch) {
        return kategori === "tahunan"
          ? academicYearMatch[1]
          : academicYearMatch[2];
      }

      const digits = tahunAkademik.match(/\d{4}/g);

      if (kategori === "tahunan") {
        if (digits?.length) {
          return digits[0];
        }
      }

      const dateValue = item?.aktifMulai ?? item?.aktifSelesai;
      if (dateValue) {
        const parsedDate = new Date(dateValue);
        if (!Number.isNaN(parsedDate.getTime())) {
          return String(parsedDate.getFullYear());
        }
      }

      return digits?.[0] ?? "";
    },
    [kategoriAtk],
  );

  const getAktivasiLabel = useCallback(
    (item) => {
      const kategori = String(item?.kategori ?? kategoriAtk)
        .trim()
        .toLowerCase();
      const tahunAkademik = String(item?.tahunAkademik ?? "").trim();
      const academicYearMatch = tahunAkademik.match(
        /\b((?:19|20)\d{2})\s*[/-]\s*((?:19|20)\d{2})\b/,
      );
      const yearLabel =
        kategori === "tahunan"
          ? getYearFromAktivasi(item)
          : academicYearMatch
            ? `${academicYearMatch[1]}/${academicYearMatch[2]}`
            : getYearFromAktivasi(item);
      const itemTipeRaw = String(item?.tipe ?? "");
      const itemTipe = itemTipeRaw.replace(/[^a-z0-9]/gi, "").toLowerCase();
      const itemTipeLabel = itemTipe === "nonrutin" ? "Non Rutin" : "Rutin";
      const fallbackLabel =
        item?.namaPeriode || item?.tahunAkademik || `Aktivasi #${item?.id}`;

      return yearLabel
        ? `${yearLabel} - ${itemTipeLabel}`
        : `${fallbackLabel} - ${itemTipeLabel}`;
    },
    [getYearFromAktivasi, kategoriAtk],
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoadingAktivasi(true);
    setErrorMessage("");

    listAktivasiPengajuan()
      .then((data) => {
        if (isMounted) {
          setAktivasiList(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setAktivasiList([]);
          setErrorMessage(error?.message ?? "Gagal memuat aktivasi.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingAktivasi(false);
        }
      });

    listDropdownProdi()
      .then((data) => {
        if (isMounted) {
          setProdiList(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProdiList([]);
        }
      });

    listDaftarPengajuanAdmin()
      .then((data) => {
        if (isMounted) {
          const rows = Array.isArray(data) ? data : [];
          const ids = rows
            .map((item) => String(item.aktivasiId || ""))
            .filter(Boolean);
          setValidAktivasiIds(new Set(ids));
          setDaftarPengajuanRows(rows);
        }
      })
      .catch(() => {
        if (isMounted) {
          setValidAktivasiIds(new Set());
          setDaftarPengajuanRows([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [normalizedTipe]);

  const filteredAktivasi = useMemo(
    () =>
      aktivasiList.filter((item) => {
        if (validAktivasiIds !== null && !validAktivasiIds.has(String(item.id))) {
          return false;
        }

        const kategori = String(item?.kategori ?? "")
          .trim()
          .toLowerCase();
        const itemTipe = String(item?.tipe ?? "")
          .replace(/[^a-z0-9]/gi, "")
          .toLowerCase();

        return itemTipe === normalizedTipe && kategori === kategoriAtk;
      }),
    [aktivasiList, kategoriAtk, normalizedTipe, validAktivasiIds],
  );

  const availableYears = useMemo(() => {
    const years = filteredAktivasi
      .map((item) => getYearFromAktivasi(item))
      .filter(Boolean);
    return Array.from(new Set(years));
  }, [filteredAktivasi, getYearFromAktivasi]);

  const aktivasiByYear = useMemo(() => {
    if (!selectedYear) {
      return filteredAktivasi;
    }

    return filteredAktivasi.filter(
      (item) => getYearFromAktivasi(item) === selectedYear,
    );
  }, [filteredAktivasi, getYearFromAktivasi, selectedYear]);

  useEffect(() => {
    if (availableYears.length === 0) {
      setSelectedYear("");
      return;
    }

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    if (aktivasiByYear.length === 0) {
      setSelectedAktivasiId("");
      return;
    }

    const validIds = aktivasiByYear
      .map((item) => String(item?.id ?? ""))
      .filter(Boolean);

    if (!validIds.includes(String(selectedAktivasiId))) {
      setSelectedAktivasiId(validIds[0]);
    }
  }, [aktivasiByYear, selectedAktivasiId]);

  useEffect(() => {
    setMainSearchQuery("");
    setOtherSearchQuery("");
    setMainPage(1);
    setOtherPage(1);
    setCetakData(null);
    setIsLoadingData(false);
    setOtherPrices({});
    setRekapVendorList([]);
    setRekapVendorError("");
  }, [activeTab, selectedAktivasiId, selectedYear]);

  useEffect(() => {
    let isMounted = true;

    if (!selectedAktivasiId) {
      setCetakData(null);
      setIsLoadingData(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingData(true);
    setErrorMessage("");

    fetchCetakBerkasAdmin({
      tahun: selectedYear,
      id_aktivasi: selectedAktivasiId,
      tipe: normalizedTipe,
      kategori_atk: kategoriAtk,
    })
      .then((data) => {
        if (isMounted) {
          setCetakData(data ?? null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setCetakData(null);
          setErrorMessage(error?.message ?? "Gagal memuat data cetak.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingData(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    isTahunanTab,
    kategoriAtk,
    normalizedTipe,
    selectedAktivasiId,
    selectedYear,
  ]);

  const selectedAktivasi = useMemo(
    () =>
      aktivasiByYear.find(
        (item) => String(item?.id ?? "") === String(selectedAktivasiId),
      ) ?? null,
    [aktivasiByYear, selectedAktivasiId],
  );
  const selectedAktivasiLabel = selectedAktivasi
    ? getAktivasiLabel(selectedAktivasi)
    : "";
  const aktivasiKeterangan = `Aktivasi: ${selectedAktivasiLabel || "-"}`;

  const { mainRows, otherRows } = useMemo(() => {
    const explicitOtherRows = getFirstArray(
      cetakData?.barang_pengajuan_lainnya,
      cetakData?.barangPengajuanLainnya,
      cetakData?.barang_lainnya,
      cetakData?.barangLainnya,
      cetakData?.lainnya,
    );
    const explicitMainRows = getFirstArray(
      cetakData?.barang_pengajuan,
      cetakData?.barangPengajuan,
      cetakData?.barang,
      cetakData?.items,
      cetakData?.detail_barang,
      cetakData?.detailBarang,
    );

    const mainSource =
      explicitOtherRows.length > 0
        ? explicitMainRows.filter((item) => !isOtherItem(item))
        : explicitMainRows.filter((item) => !isOtherItem(item));
    const otherSource =
      explicitOtherRows.length > 0
        ? explicitOtherRows
        : explicitMainRows.filter((item) => isOtherItem(item));

    return {
      mainRows: mainSource.map((item, index) =>
        normalizeRow(item, index, "barang"),
      ),
      otherRows: otherSource.map((item, index) =>
        normalizeRow(item, index, "lainnya"),
      ),
    };
  }, [cetakData]);

  const otherRowsWithManualPrice = useMemo(
    () =>
      otherRows.map((row) => {
        const manualPrice = otherPrices[row.id];
        const hargaValue =
          manualPrice === undefined || manualPrice === ""
            ? row.hargaValue
            : toNumber(manualPrice, 0);
        return {
          ...row,
          hargaValue,
          subtotalValue: hargaValue * row.jumlahBeli,
        };
      }),
    [otherPrices, otherRows],
  );

  const filteredMainRows = useMemo(
    () => filterRows(mainRows, mainSearchQuery),
    [mainRows, mainSearchQuery],
  );
  const filteredOtherRows = useMemo(
    () => filterRows(otherRowsWithManualPrice, otherSearchQuery),
    [otherRowsWithManualPrice, otherSearchQuery],
  );

  const mainTotalPages = getTotalPages(filteredMainRows);
  const otherTotalPages = getTotalPages(filteredOtherRows);
  const safeMainPage = Math.min(mainPage, mainTotalPages);
  const safeOtherPage = Math.min(otherPage, otherTotalPages);
  const paginatedMainRows = paginateRows(filteredMainRows, safeMainPage);
  const paginatedOtherRows = paginateRows(filteredOtherRows, safeOtherPage);
  const mainTotal = filteredMainRows.reduce(
    (total, row) => total + row.subtotalValue,
    0,
  );
  const otherTotal = filteredOtherRows.reduce(
    (total, row) => total + row.subtotalValue,
    0,
  );
  const tahunLabel = selectedYear || new Date().getFullYear();

  useEffect(() => {
    setMainPage(1);
  }, [mainSearchQuery]);

  useEffect(() => {
    setOtherPage(1);
  }, [otherSearchQuery]);

  useEffect(() => {
    if (mainPage > mainTotalPages) {
      setMainPage(mainTotalPages);
    }
  }, [mainPage, mainTotalPages]);

  useEffect(() => {
    if (otherPage > otherTotalPages) {
      setOtherPage(otherTotalPages);
    }
  }, [otherPage, otherTotalPages]);

  const updateOtherPrice = (rowId, value) => {
    setOtherPrices((current) => ({
      ...current,
      [rowId]: value,
    }));
  };

  const openVendorAtkModal = useCallback(() => {
    setIsVendorAtkModalOpen(true);
    setSelectedRekapVendorId("");
    setRekapVendorError("");

    if (rekapVendorList.length > 0) {
      return;
    }

    setIsLoadingRekapVendor(true);

    fetchRekapVendor({ id_aktivasi: selectedAktivasiId })
      .then((data) => {
        setRekapVendorList(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        setRekapVendorList([]);
        setRekapVendorError(error?.message ?? "Gagal memuat data vendor.");
      })
      .finally(() => {
        setIsLoadingRekapVendor(false);
      });
  }, [rekapVendorList.length, selectedAktivasiId]);

  const closeVendorAtkModal = () => {
    setIsVendorAtkModalOpen(false);
  };

  const bapUnits = useMemo(
    () => prodiList.map((item) => String(item?.nama ?? "").trim()).filter(Boolean),
    [prodiList],
  );

  const bapSourceRows = useMemo(
    () =>
      daftarPengajuanRows
        .filter(
          (row) => String(row.aktivasiId ?? "") === String(selectedAktivasiId),
        )
        .map((row) => ({
          bagian: String(row.userUnit ?? "").trim(),
          nama_barang: String(row.namaBarang ?? "").trim(),
          jumlah: toNumber(row.jumlah, 0),
          jumlahBeli: toNumber(row.jumlahDisetujui, 0),
        })),
    [daftarPengajuanRows, selectedAktivasiId],
  );

  const bapRekap = useMemo(
    () => buildBapRekap(bapSourceRows, bapUnits),
    [bapSourceRows, bapUnits],
  );

  const tahunAkademikLabel = String(
    selectedAktivasi?.tahunAkademik ?? tahunLabel,
  ).trim();
  const semesterLabel = getSemesterLabel(selectedAktivasi);
  const bapTitleLine1 =
    kategoriAtk === "kelas"
      ? "Daftar Penerimaan ATK Spidol Tinta & Penghapus Whiteboard"
      : `Daftar Permintaan ATK ${getUjianLabel(selectedAktivasi)}`;
  const bapTitleLine2 = [
    "Semester",
    kategoriAtk === "kelas" ? "" : semesterLabel,
    `TA. ${tahunAkademikLabel}`,
  ]
    .filter(Boolean)
    .join(" ");

  const handleCetakBap = async () => {
    if (isPreparingBap || bapRekap.itemNames.length === 0) {
      return;
    }

    setIsPreparingBap(true);
    setErrorMessage("");

    try {
      const blob = await pdf(
        <BapRekapDocument
          titleLine1={bapTitleLine1}
          titleLine2={bapTitleLine2}
          itemNames={bapRekap.itemNames}
          unitRows={bapRekap.unitRows}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bap-${kategoriAtk}-${tahunLabel}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage(error?.message ?? "Gagal menyiapkan PDF BAP.");
    } finally {
      setIsPreparingBap(false);
    }
  };

  const renderSearchInput = (value, onChange) => (
    <div className="relative w-full md:w-80">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
        placeholder="Cari"
      />
    </div>
  );

  const renderPagination = (currentPage, totalPages, setPage) => {
    if (totalPages <= 1) {
      return null;
    }

    const visiblePages = getVisiblePages(currentPage, totalPages);

    return (
      <div className="flex justify-end items-center mt-4">
        <nav className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1];
            const showGap = previousPage && page - previousPage > 1;

            return (
              <React.Fragment key={page}>
                {showGap ? (
                  <span className="px-1 text-gray-500">...</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setPage(page)}
                  className={`px-3 py-1.5 border rounded text-sm font-medium ${
                    currentPage === page
                      ? "border-[#4773da] bg-[#4773da] text-white"
                      : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </nav>
      </div>
    );
  };

  const mainColumns = [
    { key: "no", label: "No", align: "center" },
    { key: "nama_barang", label: "Nama Barang", align: "left" },
    { key: "satuan", label: "Satuan", align: "center" },
    { key: "jumlah", label: "Jumlah", align: "center" },
    { key: "sisa", label: "Sisa Pengajuan", align: "center" },
    { key: "jumlahBeli", label: "Jumlah Beli", align: "center" },
    { key: "harga", label: "Harga", align: "center" },
    { key: "subtotal", label: "Subtotal", align: "center" },
    { key: "vendor", label: "Vendor", align: "left" },
  ];
  const otherColumns = [
    { key: "no", label: "No", align: "center" },
    { key: "nama_barang", label: "Nama Barang", align: "left" },
    { key: "satuan", label: "Satuan", align: "center" },
    { key: "jumlah", label: "Jumlah", align: "center" },
    { key: "sisa", label: "Sisa Pengajuan", align: "center" },
    { key: "jumlahBeli", label: "Jumlah Beli", align: "center" },
    { key: "harga", label: "Harga", align: "center" },
    { key: "subtotal", label: "Subtotal", align: "center" },
    { key: "vendor", label: "Vendor", align: "left" },
  ];

  const renderMainRow = (row, index) => (
    <tr
      key={row.id}
      className="border-b border-gray-200 bg-white hover:bg-gray-50"
    >
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {(safeMainPage - 1) * ITEMS_PER_PAGE + index + 1}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-gray-500 text-left">
        {row.nama_barang}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {row.satuan}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {row.jumlah}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {row.sisa}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {row.jumlahBeli}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {formatCurrency(row.hargaValue)}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {formatCurrency(row.subtotalValue)}
      </td>
      <td className="px-6 py-3 text-left text-gray-500">{row.vendor}</td>
    </tr>
  );

  const renderOtherRow = (row, index) => (
    <tr
      key={row.id}
      className="border-b border-gray-200 bg-white hover:bg-gray-50"
    >
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {(safeOtherPage - 1) * ITEMS_PER_PAGE + index + 1}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-gray-500 text-left">
        {row.nama_barang}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {row.satuan}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {row.jumlah}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {row.sisa}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {row.jumlahBeli}
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center">
        <input
          type="number"
          min="0"
          value={otherPrices[row.id] ?? (row.hargaValue || "")}
          onKeyDown={(e) => {
            if (['.', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
          }}
          onChange={(event) => {
            let val = event.target.value;
            if (val !== "") {
              val = val.replace(/^0+/, "") || "0";
            }
            updateOtherPrice(row.id, val);
          }}
          className="w-32 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="0"
        />
      </td>
      <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
        {formatCurrency(row.subtotalValue)}
      </td>
      <td className="px-6 py-3 text-left text-gray-500">{row.vendor}</td>
    </tr>
  );

  const renderTableBlock = ({
    title,
    subtitle,
    rows,
    columns,
    renderRow,
    currentPage,
    totalPages,
    setPage,
    total,
    searchValue,
    onSearchChange,
    showActions = false,
  }) => (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-gray-700">
            {`${title} : ${formatCurrency(total)}`}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          <p className="text-sm text-gray-500 mt-1">{aktivasiKeterangan}</p>
        </div>
        {renderSearchInput(searchValue, onSearchChange)}
      </div>

      <Table
        title={null}
        columns={columns}
        rows={rows}
        emptyMessage={
          isLoadingData
            ? "Memuat data cetak..."
            : searchValue
              ? `Tidak ada data yang cocok dengan pencarian "${searchValue}".`
              : "Data tidak ditemukan"
        }
        wrapperClass="overflow-x-auto border border-gray-200"
        renderRow={renderRow}
      />

      <div className="flex flex-col lg:flex-row justify-between items-center -mt-6 mb-10 gap-4">
        <div className="flex flex-wrap gap-3">
          {showActions && isTahunanTab ? (
            <>
              <button
                type="button"
                onClick={openVendorAtkModal}
                className="bg-[#4773da] hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
              >
                Download Daftar ATK dan Vendor
              </button>
            </>
          ) : showActions ? (
            <button
              type="button"
              onClick={handleCetakBap}
              disabled={isPreparingBap || bapRekap.itemNames.length === 0}
              className="bg-[#4773da] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPreparingBap ? "Menyiapkan PDF..." : "Cetak BAP"}
            </button>
          ) : null}
        </div>
        {renderPagination(currentPage, totalPages, setPage)}
      </div>
    </div>
  );

  const contentSubtitle = isTahunanTab
    ? `Pengajuan ATK ${tipeLabel} tahunan ${tahunLabel}`
    : `Pengajuan ${activeTab} ${tipeLabel} ${tahunLabel}`;

  return (
    <>
      <PageHelmet
        title={pageTitle}
        description={`Cetak dan unduh berkas pengajuan ${tipeLabel.toLowerCase()} di UNIKOM Perlengkapan.`}
      />

      <VendorAtkDownloadModal
        isVisible={isVendorAtkModalOpen}
        vendors={rekapVendorList}
        selectedVendorId={selectedRekapVendorId}
        isLoading={isLoadingRekapVendor}
        errorMessage={rekapVendorError}
        onSelectVendor={setSelectedRekapVendorId}
        onClose={closeVendorAtkModal}
      />

      <div className="bg-white rounded shadow-sm overflow-hidden mb-6">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
        </div>

        <div className="p-6">
          <div className="flex space-x-6 border-b border-gray-200 mb-6">
            {TABS.map((tab) => (
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
                {activeTab === tab ? (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4773da]" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Tahun</label>
              <Dropdown
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                disabled={isLoadingAktivasi || availableYears.length === 0}
              >
                <option value="">-- Pilih Tahun --</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Dropdown>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Aktivasi
              </label>
              <Dropdown
                value={selectedAktivasiId}
                onChange={(event) => setSelectedAktivasiId(event.target.value)}
                disabled={
                  isLoadingAktivasi ||
                  aktivasiByYear.length === 0 ||
                  !selectedYear
                }
              >
                <option value="">-- Pilih Aktivasi --</option>
                {aktivasiByYear.map((item) => (
                  <option key={item.id} value={item.id}>
                    {getAktivasiLabel(item)}
                  </option>
                ))}
              </Dropdown>
            </div>
          </div>

          {errorMessage ? (
            <div className="mb-4 text-sm text-red-600">{errorMessage}</div>
          ) : null}

          {isLoadingData ? (
            <div className="mb-4 text-sm text-gray-500">
              Memuat data cetak...
            </div>
          ) : null}

          {renderTableBlock({
            title: "Total Harga",
            subtitle: contentSubtitle,
            rows: paginatedMainRows,
            columns: mainColumns,
            renderRow: renderMainRow,
            currentPage: safeMainPage,
            totalPages: mainTotalPages,
            setPage: setMainPage,
            total: mainTotal,
            searchValue: mainSearchQuery,
            onSearchChange: setMainSearchQuery,
            showActions: true,
          })}

          {renderTableBlock({
            title: "Total Harga Pengajuan Lainnya",
            subtitle: `${contentSubtitle} - Pengajuan Lainnya`,
            rows: paginatedOtherRows,
            columns: otherColumns,
            renderRow: renderOtherRow,
            currentPage: safeOtherPage,
            totalPages: otherTotalPages,
            setPage: setOtherPage,
            total: otherTotal,
            searchValue: otherSearchQuery,
            onSearchChange: setOtherSearchQuery,
          })}
        </div>
      </div>
    </>
  );
};

export default CetakBerkasPage;
