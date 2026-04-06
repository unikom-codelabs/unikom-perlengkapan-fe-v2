import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import MainLayout from "./components/Layouts/MainLayout";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MainLayout>
        <DashboardPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/pengajuan",
    element: (
      <MainLayout>
        <BarangPengajuanPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/daftar-pengajuan/rutin",
    element: (
      <MainLayout>
        <PengajuanRutinPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/daftar-pengajuan/non-rutin",
    element: (
      <MainLayout>
        <PengajuanNonRutinPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/cetak-berkas/rutin",
    element: (
      <MainLayout>
        <CetakBerkasRutinPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/cetak-berkas/non-rutin",
    element: (
      <MainLayout>
        <CetakBerkasNonRutinPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/histori-pengajuan",
    element: (
      <MainLayout>
        <HistoriPengajuanPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/manajemen-pengguna",
    element: (
      <MainLayout>
        <ManajemenPenggunaPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/aktivasi",
    element: (
      <MainLayout>
        <AktivasiPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/pengumuman",
    element: (
      <MainLayout>
        <PengumumanPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/profil",
    element: (
      <MainLayout>
        <ProfilPage />
      </MainLayout>
    ),
    errorElement: <ErrorPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </StrictMode>,
);
