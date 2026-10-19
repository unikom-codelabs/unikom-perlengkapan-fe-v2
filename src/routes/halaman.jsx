import { lazy } from "react";

// Halaman dimuat saat dibuka, bukan sekaligus di awal. Sebelumnya semua
// halaman beserta pustaka berat (react-pdf, exceljs, xlsx, editor quill)
// ikut terunduh hanya untuk menampilkan halaman login.
export const DashboardPage = lazy(() => import("../pages/DashboardPage"));
export const BarangPengajuanPage = lazy(() => import("../pages/admin/BarangPengajuanPage"));
export const PengajuanRutinPage = lazy(() => import("../pages/admin/PengajuanRutinPage"));
export const PengajuanAtkTahunanPage = lazy(() => import("../pages/user/PengajuanAtkPage"));
export const DaftarPengajuanUserPage = lazy(() => import("../pages/user/DaftarPengajuanUserPage"));
export const CetakBerkasRutinPage = lazy(() => import("../pages/admin/CetakBerkasRutinPage"));
export const ManajemenPenggunaPage = lazy(() => import("../pages/admin/ManajemenPenggunaPage"));
export const VendorPage = lazy(() => import("../pages/admin/VendorPage"));
export const JabatanPage = lazy(() => import("../pages/admin/JabatanPage"));
export const BagianPage = lazy(() => import("../pages/admin/BagianPage"));
export const AktivasiPage = lazy(() => import("../pages/admin/AktivasiPage"));
export const PengajuanNonRutinPage = lazy(() => import("../pages/admin/PengajuanNonRutinPage"));
export const CetakBerkasNonRutinPage = lazy(() => import("../pages/admin/CetakBerkasNonRutinPage"));
export const HistoriPengajuanPenggunaPage = lazy(() => import("../pages/user/HistoriPengajuanPenggunaPage"));
export const HistoriPengajuanAdminPage = lazy(() => import("../pages/admin/HistoriPengajuanAdminPage"));
export const PengumumanPage = lazy(() => import("../pages/admin/PengumumanPage"));
export const ProfilPage = lazy(() => import("../pages/ProfilPage"));

export const MemuatHalaman = () => (
  <div className="p-6 text-sm text-gray-500">Memuat halaman...</div>
);
