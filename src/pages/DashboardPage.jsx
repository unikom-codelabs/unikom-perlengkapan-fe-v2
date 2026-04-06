import DashboardCard from "../components/Element/DashboardCard";
import { Helmet } from "react-helmet-async";

const DashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | UNIKOM Perlengkapan</title>
      </Helmet>
      <div className="grid grid-cols-3 gap-4">
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
    </>
  );
};

export default DashboardPage;
