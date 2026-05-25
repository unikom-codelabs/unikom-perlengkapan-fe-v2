import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardCard from "../components/Element/DashboardCard";
import DashboardAktivasiSummaryCard from "../components/Element/DashboardAktivasiSummaryCard";
import DashboardPengumumanSection from "../components/Element/DashboardPengumumanSection";
import {
  getAktivasiPengajuanSummary,
  listAktivasiPengajuan,
} from "../api/aktivasiPengajuanService";
import { listPengumuman } from "../api/pengumumanService";
import { useAuth } from "../context/useAuth";

const AKTIVASI_TITLE_BY_KATEGORI = {
  tahunan: "Pengajuan ATK Tahunan",
  ujian: "Pengajuan ATK Ujian",
  kelas: "Pengajuan ATK Kelas",
};

const ADMIN_DASHBOARD_CARDS = [
  {
    id: 1,
    kategori: "tahunan",
    title: "Pengajuan ATK Tahunan",
    icon: "total-pengajuan-icon",
  },
  {
    id: 2,
    kategori: "ujian",
    title: "Pengajuan ATK Ujian",
    icon: "pengajuan-rutin-icon",
  },
  {
    id: 3,
    kategori: "kelas",
    title: "Pengajuan ATK Kelas",
    icon: "pengajuan-non-rutin-icon",
  },
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

  if (responseData?.error) {
    return responseData.error;
  }

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
};

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
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

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [isLoadingAktivasi, setIsLoadingAktivasi] = useState(false);
  const [isLoadingPengumuman, setIsLoadingPengumuman] = useState(false);
  const [aktivasiError, setAktivasiError] = useState("");
  const [pengumumanError, setPengumumanError] = useState("");
  const [aktivasiList, setAktivasiList] = useState([]);
  const [pengumumanList, setPengumumanList] = useState([]);
  const [adminSummaries, setAdminSummaries] = useState({});
  const [isLoadingAdminSummaries, setIsLoadingAdminSummaries] = useState(false);
  const [adminSummaryError, setAdminSummaryError] = useState("");

  const normalizedRole = normalizeUserRole(currentUser);
  const normalizedJabatan = normalizeJabatanName(currentUser);
  const isUserRole = normalizedRole === "user";
  const isDekan =
    normalizedJabatan.includes("dekan") ||
    normalizedJabatan.includes("kaprodi");

  const allowedKategori =
    isUserRole && !isDekan ? ["tahunan"] : ["tahunan", "ujian", "kelas"];

  useEffect(() => {
    if (!isUserRole) {
      return;
    }

    const fetchAktivasi = async () => {
      setIsLoadingAktivasi(true);
      setAktivasiError("");

      try {
        const data = await listAktivasiPengajuan();
        setAktivasiList(data);
      } catch (error) {
        setAktivasiError(
          getApiErrorMessage(error, "Gagal mengambil data aktivasi."),
        );
      } finally {
        setIsLoadingAktivasi(false);
      }
    };

    const fetchPengumuman = async () => {
      setIsLoadingPengumuman(true);
      setPengumumanError("");

      try {
        const data = await listPengumuman();
        setPengumumanList(data);
      } catch (error) {
        setPengumumanError(
          getApiErrorMessage(error, "Gagal mengambil data pengumuman."),
        );
      } finally {
        setIsLoadingPengumuman(false);
      }
    };

    fetchAktivasi();
    fetchPengumuman();
  }, [isUserRole]);

  useEffect(() => {
    if (isUserRole) {
      return;
    }

    const fetchAdminSummaries = async () => {
      setIsLoadingAdminSummaries(true);
      setAdminSummaryError("");

      try {
        const settledSummaries = await Promise.allSettled(
          ADMIN_DASHBOARD_CARDS.map((card) =>
            getAktivasiPengajuanSummary(card.id),
          ),
        );
        const summariesById = settledSummaries.reduce((map, result, index) => {
          const cardId = ADMIN_DASHBOARD_CARDS[index].id;

          if (result.status === "fulfilled") {
            map[cardId] = result.value;
          }

          return map;
        }, {});

        setAdminSummaries(summariesById);

        if (settledSummaries.some((result) => result.status === "rejected")) {
          setAdminSummaryError(
            "Sebagian ringkasan dashboard gagal dimuat.",
          );
        }
      } catch (error) {
        setAdminSummaries({});
        setAdminSummaryError(
          getApiErrorMessage(error, "Gagal mengambil ringkasan dashboard."),
        );
      } finally {
        setIsLoadingAdminSummaries(false);
      }
    };

    fetchAdminSummaries();
  }, [isUserRole]);

  const availableAktivasi = useMemo(() => {
    if (!Array.isArray(aktivasiList) || aktivasiList.length === 0) {
      return [];
    }

    const filteredList = isUserRole
      ? aktivasiList.filter((item) =>
          allowedKategori.includes(String(item.kategori).toLowerCase()),
        )
      : aktivasiList;

    if (filteredList.length === 0) {
      return [];
    }

    const sortedList = [...filteredList].sort((a, b) => {
      if (a.statusAktif !== b.statusAktif) {
        return a.statusAktif ? -1 : 1;
      }

      return (
        toTimestamp(b.tanggalSelesai || b.tanggalMulai) -
        toTimestamp(a.tanggalSelesai || a.tanggalMulai)
      );
    });

    if (!isDekan) {
      return sortedList.slice(0, 1);
    }

    const byKategori = new Map();
    sortedList.forEach((item) => {
      const key = String(item.kategori || "").toLowerCase();
      if (!key || byKategori.has(key)) {
        return;
      }

      byKategori.set(key, item);
    });

    return Array.from(byKategori.values()).slice(0, 3);
  }, [aktivasiList, allowedKategori, isDekan, isUserRole]);

  const latestPengumuman = useMemo(() => {
    if (!Array.isArray(pengumumanList)) {
      return [];
    }

    return [...pengumumanList]
      .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
      .slice(0, 3);
  }, [pengumumanList]);

  return (
    <>
      <Helmet>
        <title>Dashboard | UNIKOM Perlengkapan</title>
      </Helmet>

      {isUserRole ? (
        <>
          {aktivasiError ? (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {aktivasiError}
            </p>
          ) : null}

          {isLoadingAktivasi ? (
            <div className="py-8 text-center text-gray-500">
              Memuat data aktivasi...
            </div>
          ) : availableAktivasi.length > 0 ? (
            isDekan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {availableAktivasi.map((aktivasi) => (
                  <DashboardAktivasiSummaryCard
                    key={
                      aktivasi.id ||
                      `${aktivasi.kategori}-${aktivasi.namaPeriode}`
                    }
                    title={
                      AKTIVASI_TITLE_BY_KATEGORI[aktivasi.kategori] ||
                      "Pengajuan ATK"
                    }
                    periodName={aktivasi.namaPeriode}
                    endDate={aktivasi.tanggalSelesai}
                    isActive={aktivasi.statusAktif}
                  />
                ))}
              </div>
            ) : (
              <div className="max-w-xl">
                <DashboardAktivasiSummaryCard
                  title={
                    AKTIVASI_TITLE_BY_KATEGORI[availableAktivasi[0].kategori] ||
                    "Pengajuan ATK"
                  }
                  periodName={availableAktivasi[0].namaPeriode}
                  endDate={availableAktivasi[0].tanggalSelesai}
                  isActive={availableAktivasi[0].statusAktif}
                />
              </div>
            )
          ) : (
            <div className="max-w-xl bg-white rounded-sm shadow-sm border border-gray-200 p-6 text-gray-500 text-sm">
              Data aktivasi belum tersedia.
            </div>
          )}

          <DashboardPengumumanSection
            items={latestPengumuman}
            isLoading={isLoadingPengumuman}
            errorMessage={pengumumanError}
          />
        </>
      ) : (
        <>
          {adminSummaryError ? (
            <p className="mb-4 rounded border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-700">
              {adminSummaryError}
            </p>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ADMIN_DASHBOARD_CARDS.map((card) => {
              const summary = adminSummaries[card.id];

              return (
                <DashboardCard
                  key={card.id}
                  title={card.title}
                  value={
                    isLoadingAdminSummaries
                      ? "..."
                      : summary?.statistik?.jumlahPengajuanMasuk ?? 0
                  }
                  icon={card.icon}
                  periodLabel={summary?.aktivasi?.tahunAkademik || "-"}
                  summaryId={card.id}
                />
              );
            })}
          </div>
        </>
      )}
    </>
  );
};

export default DashboardPage;
