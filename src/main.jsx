import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import MainLayout from "./components/Layouts/MainLayout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import ErrorPage from "./pages/404";
import LoginPage from "./pages/LoginPage";
import {
  AktivasiPage,
  BagianPage,
  BarangPengajuanPage,
  CetakBerkasNonRutinPage,
  CetakBerkasRutinPage,
  DaftarPengajuanUserPage,
  DashboardPage,
  HistoriPengajuanAdminPage,
  HistoriPengajuanPenggunaPage,
  JabatanPage,
  ManajemenPenggunaPage,
  MemuatHalaman,
  PengajuanAtkTahunanPage,
  PengajuanNonRutinPage,
  PengajuanRutinPage,
  PengumumanPage,
  ProfilPage,
  VendorPage,
} from "./routes/halaman";

// Suspense diletakkan di dalam MainLayout supaya sidebar dan header tetap
// tampil selama isi halaman sedang diunduh.
const withLayout = (page, allowedRoles) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <MainLayout>
      <Suspense fallback={<MemuatHalaman />}>{page}</Suspense>
    </MainLayout>
  </ProtectedRoute>
);

const withProtectedLayout = (page) => withLayout(page);

const withAdminLayout = (page) => withLayout(page, ["admin"]);

const withUserLayout = (page) => withLayout(page, ["user"]);

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
    path: "/pengajuan-rutin/:kategori",
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
    path: "/histori-pengajuan-admin",
    element: withAdminLayout(<HistoriPengajuanAdminPage />),
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
