import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import MainLayout from "./components/Layouts/MainLayout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ErrorPage from "./pages/404";
import DashboardPage from "./pages/DashboardPage";
import BarangPengajuanPage from "./pages/admin/BarangPengajuanPage";
import PengajuanRutinPage from "./pages/admin/PengajuanRutinPage";
import PengajuanAtkTahunanPage from "./pages/user/PengajuanAtkPage";
import DaftarPengajuanUserPage from "./pages/user/DaftarPengajuanUserPage";
import CetakBerkasRutinPage from "./pages/admin/CetakBerkasRutinPage";
import ManajemenPenggunaPage from "./pages/admin/ManajemenPenggunaPage";
import VendorPage from "./pages/admin/VendorPage";
import JabatanPage from "./pages/admin/JabatanPage";
import BagianPage from "./pages/admin/BagianPage";
import AktivasiPage from "./pages/admin/AktivasiPage";
import PengajuanNonRutinPage from "./pages/admin/PengajuanNonRutinPage";
import CetakBerkasNonRutinPage from "./pages/admin/CetakBerkasNonRutinPage";
import HistoriPengajuanPenggunaPage from "./pages/user/HistoriPengajuanPenggunaPage";
import PengumumanPage from "./pages/admin/PengumumanPage";
import ProfilPage from "./pages/ProfilPage";
import LoginPage from "./pages/LoginPage";

const withProtectedLayout = (page) => (
  <ProtectedRoute>
    <MainLayout>{page}</MainLayout>
  </ProtectedRoute>
);

const withAdminLayout = (page) => (
  <ProtectedRoute allowedRoles={["admin"]}>
    <MainLayout>{page}</MainLayout>
  </ProtectedRoute>
);

const withUserLayout = (page) => (
  <ProtectedRoute allowedRoles={["user"]}>
    <MainLayout>{page}</MainLayout>
  </ProtectedRoute>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: withProtectedLayout(<DashboardPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/pengajuan",
    element: withAdminLayout(<BarangPengajuanPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/daftar-pengajuan",
    element: withUserLayout(<DaftarPengajuanUserPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/daftar-pengajuan/rutin",
    element: withAdminLayout(<PengajuanRutinPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/pengajuan-rutin/tahunan",
    element: withUserLayout(<PengajuanAtkTahunanPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/daftar-pengajuan/non-rutin",
    element: withAdminLayout(<PengajuanNonRutinPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/cetak-berkas/rutin",
    element: withAdminLayout(<CetakBerkasRutinPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/cetak-berkas/non-rutin",
    element: withAdminLayout(<CetakBerkasNonRutinPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/histori-pengajuan",
    element: withProtectedLayout(<HistoriPengajuanPenggunaPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/manajemen-pengguna",
    element: withAdminLayout(<ManajemenPenggunaPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/manajemen/pengguna",
    element: withAdminLayout(<ManajemenPenggunaPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/manajemen/vendor",
    element: withAdminLayout(<VendorPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/manajemen/jabatan",
    element: withAdminLayout(<JabatanPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/manajemen/bagian",
    element: withAdminLayout(<BagianPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/aktivasi",
    element: withAdminLayout(<AktivasiPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/pengumuman",
    element: withAdminLayout(<PengumumanPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/profil",
    element: withProtectedLayout(<ProfilPage />),
    errorElement: <ErrorPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <HelmetProvider>
        <RouterProvider router={router} />
      </HelmetProvider>
    </AuthProvider>
  </StrictMode>,
);
