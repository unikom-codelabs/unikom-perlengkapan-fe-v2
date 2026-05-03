import { useState } from "react";
import Logo from "/src/assets/img/logo-unikom.png";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ModalKonfirmasiHapus from "../Element/ModalKonfirmasiHapus";
import {
  HomeIcon as HomeOutline,
  ArchiveBoxIcon as ArchiveOutline,
  ClipboardDocumentListIcon as ClipboardDocumentListOutline,
  BoltIcon as BoltOutline,
  DocumentTextIcon as DocumentOutline,
  PrinterIcon as PrintOutline,
  ClockIcon as ClockOutline,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon as LogoutOutline,
  MegaphoneIcon as MegaphoneOutline,
  ArrowDownTrayIcon as ArrowDownTrayOutline,
  PlusCircleIcon as PlusCircleOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  ArchiveBoxIcon as ArchiveSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListSolid,
  BoltIcon as BoltSolid,
  DocumentTextIcon as DocumentSolid,
  PrinterIcon as PrintSolid,
  ClockIcon as ClockSolid,
  MegaphoneIcon as MegaphoneSolid,
  ArrowDownTrayIcon as ArrowDownTraySolid,
  PlusCircleIcon as PlusCircleSolid,
} from "@heroicons/react/24/solid";

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

const Sidebar = () => {
  const [isManajemenOpen, setIsManajemenOpen] = useState(true);
  const [isDaftarPengajuanOpen, setIsDaftarPengajuanOpen] = useState(true);
  const [isCetakBerkasOpen, setIsCetakBerkasOpen] = useState(true);
  const [isUserPengajuanOpen, setIsUserPengajuanOpen] = useState(true);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logoutUser, currentUser } = useAuth();

  const normalizedRole = normalizeUserRole(currentUser);
  const isUserRole = normalizedRole === "user";

  const isDaftarPengajuanActive =
    location.pathname.startsWith("/daftar-pengajuan");
  const isCetakBerkasActive = location.pathname.startsWith("/cetak-berkas");
  const isManajemenActive =
    location.pathname === "/manajemen-pengguna" ||
    location.pathname.startsWith("/manajemen/");
  const isUserPengajuanActive =
    location.pathname.startsWith("/pengajuan-rutin");

  const handleOpenLogoutConfirm = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleCloseLogoutConfirm = () => {
    if (isLoggingOut) {
      return;
    }

    setIsLogoutConfirmOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logoutUser();
      navigate("/login", { replace: true });
      setIsLogoutConfirmOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-72 bg-white h-screen fixed z-20 flex flex-col">
      <div className="px-6 pt-6 shrink-0">
        <img src={Logo} alt="Logo" />
        <div className="border-b border-gray-200 py-4 mb-4" />
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        {isUserRole ? (
          <>
            <h2 className="text-sm text-primary uppercase mb-2">Menu</h2>
            <ul className="p-2">
              <li className="mb-6">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <HomeSolid className="w-5 h-5" />
                      ) : (
                        <HomeOutline className="w-5 h-5" />
                      )}
                      <span>Home</span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>

            <h2 className="text-sm text-primary uppercase mb-2">Pengajuan</h2>
            <ul className="p-2">
              <li className="mb-6">
                <div
                  className="flex justify-between items-center cursor-pointer hover:text-primary"
                  onClick={() => setIsUserPengajuanOpen((prev) => !prev)}
                >
                  <div className="flex gap-2 items-center">
                    {isUserPengajuanActive ? (
                      <PlusCircleSolid className="w-5 h-5 text-primary" />
                    ) : (
                      <PlusCircleOutline className="w-5 h-5 text-gray-600" />
                    )}
                    <span
                      className={
                        isUserPengajuanActive ? "text-primary" : "text-gray-700"
                      }
                    >
                      Pengajuan Rutin
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                      isUserPengajuanOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isUserPengajuanOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="ml-2 pl-4 border-l border-gray-200 flex flex-col gap-3">
                      <li>
                        <NavLink
                          to="/pengajuan-rutin/tahunan"
                          className={({ isActive }) =>
                            `block transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-gray-500 hover:text-primary"
                            }`
                          }
                        >
                          ATK Tahunan
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>

              <li className="mb-6">
                <NavLink
                  to="/daftar-pengajuan"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <DocumentSolid className="w-5 h-5" />
                      ) : (
                        <DocumentOutline className="w-5 h-5" />
                      )}
                      <span>Daftar Pengajuan</span>
                    </>
                  )}
                </NavLink>
              </li>

              <li className="mb-4">
                <NavLink
                  to="/histori-pengajuan"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <ClockSolid className="w-5 h-5" />
                      ) : (
                        <ClockOutline className="w-5 h-5" />
                      )}
                      <span>Histori Pengajuan</span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>

            <h2 className="text-sm text-primary uppercase mb-2">Bantuan</h2>
            <ul className="p-2">
              <li className="mb-4">
                <NavLink
                  to="/download-user-guide"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <ArrowDownTraySolid className="w-5 h-5" />
                      ) : (
                        <ArrowDownTrayOutline className="w-5 h-5" />
                      )}
                      <span>Download User Guide</span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>

            <h2 className="text-sm text-primary uppercase mb-2">Keluar</h2>
            <ul className="p-2">
              <li className="mb-4">
                <button
                  onClick={handleOpenLogoutConfirm}
                  className="w-full flex gap-2 items-center text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                >
                  <LogoutOutline className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </li>
            </ul>
          </>
        ) : (
          <>
            <h2 className="text-sm text-primary uppercase mb-2">Menu</h2>
            <ul className="p-2">
              <li className="mb-6">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <HomeSolid className="w-5 h-5" />
                      ) : (
                        <HomeOutline className="w-5 h-5" />
                      )}
                      <span>Dashboard</span>
                    </>
                  )}
                </NavLink>
              </li>
              <li className="mb-6">
                <NavLink
                  to="/pengajuan"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <ArchiveSolid className="w-5 h-5" />
                      ) : (
                        <ArchiveOutline className="w-5 h-5" />
                      )}
                      <span>Barang Pengajuan</span>
                    </>
                  )}
                </NavLink>
              </li>
              <li className="mb-6">
                <div
                  className="flex justify-between items-center cursor-pointer text-gray-700 hover:text-primary"
                  onClick={() => setIsManajemenOpen(!isManajemenOpen)}
                >
                  <div className="flex gap-2 items-center">
                    {isManajemenActive ? (
                      <ClipboardDocumentListSolid className="w-5 h-5 text-primary" />
                    ) : (
                      <ClipboardDocumentListOutline className="w-5 h-5" />
                    )}
                    <span className={isManajemenActive ? "text-primary" : ""}>
                      Manajemen
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                      isManajemenOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isManajemenOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="ml-2 pl-4 border-l border-gray-200 flex flex-col gap-3">
                      <li>
                        <NavLink
                          to="/manajemen/pengguna"
                          className={({ isActive }) =>
                            `block transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-gray-500 hover:text-primary"
                            }`
                          }
                        >
                          Pengguna
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/manajemen/vendor"
                          className={({ isActive }) =>
                            `block transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-gray-500 hover:text-primary"
                            }`
                          }
                        >
                          Vendor
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/manajemen/jabatan"
                          className={({ isActive }) =>
                            `block transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-gray-500 hover:text-primary"
                            }`
                          }
                        >
                          Jabatan
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/manajemen/bagian"
                          className={({ isActive }) =>
                            `block transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-gray-500 hover:text-primary"
                            }`
                          }
                        >
                          Bagian
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>

            <h2 className="text-sm text-primary uppercase mb-2">Pengajuan</h2>
            <ul className="p-2">
              <li className="mb-6">
                <NavLink
                  to="/aktivasi"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <BoltSolid className="w-5 h-5" />
                      ) : (
                        <BoltOutline className="w-5 h-5" />
                      )}
                      <span>Aktivasi</span>
                    </>
                  )}
                </NavLink>
              </li>
              <li className="mb-6">
                <div
                  className="flex justify-between items-center cursor-pointer text-gray-700 hover:text-primary"
                  onClick={() =>
                    setIsDaftarPengajuanOpen(!isDaftarPengajuanOpen)
                  }
                >
                  <div className="flex gap-2 items-center">
                    {isDaftarPengajuanActive ? (
                      <DocumentSolid className="w-5 h-5 text-primary" />
                    ) : (
                      <DocumentOutline className="w-5 h-5" />
                    )}
                    <span
                      className={isDaftarPengajuanActive ? "text-primary" : ""}
                    >
                      Daftar Pengajuan
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                      isDaftarPengajuanOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isDaftarPengajuanOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="ml-2 pl-4 border-l border-gray-200 flex flex-col gap-3">
                      <li>
                        <NavLink
                          to="/daftar-pengajuan/rutin"
                          className={({ isActive }) =>
                            `block transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-gray-500 hover:text-primary"
                            }`
                          }
                        >
                          Rutin
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/daftar-pengajuan/non-rutin"
                          className={({ isActive }) =>
                            `block transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-gray-500 hover:text-primary"
                            }`
                          }
                        >
                          Non Rutin
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li className="mb-6">
                <div
                  className="flex justify-between items-center cursor-pointer text-gray-700 hover:text-primary"
                  onClick={() => setIsCetakBerkasOpen(!isCetakBerkasOpen)}
                >
                  <div className="flex gap-2 items-center">
                    {isCetakBerkasActive ? (
                      <PrintSolid className="w-5 h-5 text-primary" />
                    ) : (
                      <PrintOutline className="w-5 h-5" />
                    )}
                    <span className={isCetakBerkasActive ? "text-primary" : ""}>
                      Cetak Berkas
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
                      isCetakBerkasOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isCetakBerkasOpen
                      ? "grid-rows-[1fr] opacity-100 mt-3"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="ml-2 pl-4 border-l border-gray-200 flex flex-col gap-3">
                      <li>
                        <NavLink
                          to="/cetak-berkas/rutin"
                          className={({ isActive }) =>
                            `block transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-gray-500 hover:text-primary"
                            }`
                          }
                        >
                          Rutin
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/cetak-berkas/non-rutin"
                          className={({ isActive }) =>
                            `block transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-gray-500 hover:text-primary"
                            }`
                          }
                        >
                          Non Rutin
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
              <li className="mb-4">
                <NavLink
                  to="/histori-pengajuan"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <ClockSolid className="w-5 h-5" />
                      ) : (
                        <ClockOutline className="w-5 h-5" />
                      )}
                      <span>Histori Pengajuan</span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>

            <h2 className="text-sm text-primary uppercase mb-2">Informasi</h2>
            <ul className="p-2">
              <li className="mb-4">
                <NavLink
                  to="/pengumuman"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <MegaphoneSolid className="w-5 h-5" />
                      ) : (
                        <MegaphoneOutline className="w-5 h-5" />
                      )}
                      <span>Pengumuman</span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>

            <h2 className="text-sm text-primary uppercase mb-2">Bantuan</h2>
            <ul className="p-2">
              <li className="mb-4">
                <NavLink
                  to="/download-user-guide"
                  className={({ isActive }) =>
                    `flex gap-2 items-center ${
                      isActive
                        ? "text-primary"
                        : "text-gray-700 hover:text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <ArrowDownTraySolid className="w-5 h-5" />
                      ) : (
                        <ArrowDownTrayOutline className="w-5 h-5" />
                      )}
                      <span>Download User Guide</span>
                    </>
                  )}
                </NavLink>
              </li>
            </ul>

            <h2 className="text-sm text-primary uppercase mb-2">Keluar</h2>
            <ul className="p-2">
              <li className="mb-4">
                <button
                  onClick={handleOpenLogoutConfirm}
                  className="w-full flex gap-2 items-center text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                >
                  <LogoutOutline className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </li>
            </ul>
          </>
        )}
      </div>

      <ModalKonfirmasiHapus
        isOpen={isLogoutConfirmOpen}
        onClose={handleCloseLogoutConfirm}
        onConfirm={handleLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        isProcessing={isLoggingOut}
        confirmButtonClassName="bg-[#4279df] hover:bg-blue-700"
      />
    </div>
  );
};

export default Sidebar;
