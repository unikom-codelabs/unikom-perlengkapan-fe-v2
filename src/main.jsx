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
import BarangPengajuanPage from "./pages/BarangPengajuanPage";
import PengajuanRutinPage from "./pages/PengajuanRutinPage";
import CetakBerkasRutinPage from "./pages/CetakBerkasRutinPage";
import ManajemenPenggunaPage from "./pages/ManajemenPenggunaPage";
import AktivasiPage from "./pages/AktivasiPage";
import PengajuanNonRutinPage from "./pages/PenhajuanNonRutin";
import CetakBerkasNonRutinPage from "./pages/CetakBerkasNonRutinPage";
import HistoriPengajuanPage from "./pages/HistoriPengajuanPage";
import PengumumanPage from "./pages/PengumumanPage";
import ProfilPage from "./pages/ProfilPage";
import LoginPage from "./pages/LoginPage";

const withProtectedLayout = (page) => (
  <ProtectedRoute>
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
    element: withProtectedLayout(<BarangPengajuanPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/daftar-pengajuan/rutin",
    element: withProtectedLayout(<PengajuanRutinPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/daftar-pengajuan/non-rutin",
    element: withProtectedLayout(<PengajuanNonRutinPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/cetak-berkas/rutin",
    element: withProtectedLayout(<CetakBerkasRutinPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/cetak-berkas/non-rutin",
    element: withProtectedLayout(<CetakBerkasNonRutinPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/histori-pengajuan",
    element: withProtectedLayout(<HistoriPengajuanPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/manajemen-pengguna",
    element: withProtectedLayout(<ManajemenPenggunaPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/aktivasi",
    element: withProtectedLayout(<AktivasiPage />),
    errorElement: <ErrorPage />,
  },
  {
    path: "/pengumuman",
    element: withProtectedLayout(<PengumumanPage />),
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
