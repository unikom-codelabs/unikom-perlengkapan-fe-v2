import { Helmet } from "react-helmet-async";
import AktivasiCard from "../components/Element/AktivasiCard";

const AktivasiPage = () => {
  return (
    <>
      <Helmet>
        <title>Aktivasi | UNIKOM Perlengkapan</title>
      </Helmet>
      <div className="grid grid-cols-3 gap-6 mt-6">
        <AktivasiCard
          title="Pengajuan ATK Tahunan"
          endDate="2025-09-20T23:59:59Z"
        />
        <AktivasiCard
          title="Pengajuan ATK Ujian"
          endDate="2025-10-15T23:59:59Z"
        />
        <AktivasiCard
          title="Pengajuan ATK Kelas"
          endDate="2025-11-20T23:59:59Z"
        />
      </div>
    </>
  );
};

export default AktivasiPage;
