import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardCard from "../components/Element/DashboardCard";
import DashboardAktivasiSummaryCard from "../components/Element/DashboardAktivasiSummaryCard";
import DashboardPengumumanSection from "../components/Element/DashboardPengumumanSection";
import { listAktivasiPengajuan } from "../api/aktivasiPengajuanService";
import { listPengumuman } from "../api/pengumumanService";
import { useAuth } from "../context/useAuth";

const AKTIVASI_TITLE_BY_KATEGORI = {
  tahunan: "Pengajuan ATK Tahunan",
  ujian: "Pengajuan ATK Ujian",
  kelas: "Pengajuan ATK Kelas",
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

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const [isLoadingAktivasi, setIsLoadingAktivasi] = useState(false);
  const [isLoadingPengumuman, setIsLoadingPengumuman] = useState(false);
  const [aktivasiError, setAktivasiError] = useState("");
  const [pengumumanError, setPengumumanError] = useState("");
  const [aktivasiList, setAktivasiList] = useState([]);
  const [pengumumanList, setPengumumanList] = useState([]);

  const normalizedRole = normalizeUserRole(currentUser);
  const isUserRole = normalizedRole === "user";

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

  const highlightedAktivasi = useMemo(() => {
    if (!Array.isArray(aktivasiList) || aktivasiList.length === 0) {
      return null;
    }

    const filteredList = isUserRole
      ? aktivasiList.filter(
          (item) => String(item.kategori).toLowerCase() === "tahunan",
        )
      : aktivasiList;

    if (filteredList.length === 0) {
      return null;
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

    return sortedList[0] ?? null;
  }, [aktivasiList, isUserRole]);

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
          ) : highlightedAktivasi ? (
            <div className="max-w-xl">
              <DashboardAktivasiSummaryCard
                title={
                  AKTIVASI_TITLE_BY_KATEGORI[highlightedAktivasi.kategori] ||
                  "Pengajuan ATK"
                }
                periodName={highlightedAktivasi.namaPeriode}
                endDate={highlightedAktivasi.tanggalSelesai}
                isActive={highlightedAktivasi.statusAktif}
              />
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <DashboardCard
            title="Pengajuan ATK Tahunan"
            value={73}
            icon="total-pengajuan-icon"
          />
          <DashboardCard
            title="Pengajuan ATK Ujian"
            value={11}
            icon="pengajuan-rutin-icon"
          />
          <DashboardCard
            title="Pengajuan ATK Kelas"
            value={7}
            icon="pengajuan-non-rutin-icon"
          />
        </div>
      )}
    </>
  );
};

export default DashboardPage;
