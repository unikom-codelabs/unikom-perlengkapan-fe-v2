import { useState } from "react";
import Logo from "/src/assets/img/logo-unikom.png";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon as HomeOutline,
  ArchiveBoxIcon as ArchiveOutline,
  UsersIcon as UsersOutline,
  BoltIcon as BoltOutline,
  DocumentTextIcon as DocumentOutline,
  PrinterIcon as PrintOutline,
  ClockIcon as ClockOutline,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon as LogoutOutline,
  MegaphoneIcon as MegaphoneOutline,
  ArrowDownTrayIcon as ArrowDownTrayOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  ArchiveBoxIcon as ArchiveSolid,
  UsersIcon as UsersSolid,
  BoltIcon as BoltSolid,
  DocumentTextIcon as DocumentSolid,
  PrinterIcon as PrintSolid,
  ClockIcon as ClockSolid,
  MegaphoneIcon as MegaphoneSolid,
  ArrowDownTrayIcon as ArrowDownTraySolid,
} from "@heroicons/react/24/solid";

const Sidebar = () => {
  const [isDaftarPengajuanOpen, setIsDaftarPengajuanOpen] = useState(true);
  const [isCetakBerkasOpen, setIsCetakBerkasOpen] = useState(true);
  const location = useLocation();

  const isDaftarPengajuanActive =
    location.pathname.startsWith("/daftar-pengajuan");
  const isCetakBerkasActive = location.pathname.startsWith("/cetak_berkas");

  return (
    <div className="w-72 bg-white h-screen fixed flex flex-col">
      <div className="px-6 pt-6 shrink-0">
        <img src={Logo} alt="Logo" />
        <div className="border-b border-gray-200 py-4 mb-4" />
      </div>
      <div className="flex-1 px-6 pb-6 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <h2 className="text-sm text-primary uppercase mb-2">Menu</h2>
        <ul className="p-2">
          <li className="mb-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex gap-2 items-center ${
                  isActive ? "text-primary" : "text-gray-700 hover:text-primary"
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
                  isActive ? "text-primary" : "text-gray-700 hover:text-primary"
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
          <li className="mb-4">
            <NavLink
              to="/manajemen-pengguna"
              className={({ isActive }) =>
                `flex gap-2 items-center ${
                  isActive ? "text-primary" : "text-gray-700 hover:text-primary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <UsersSolid className="w-5 h-5" />
                  ) : (
                    <UsersOutline className="w-5 h-5" />
                  )}
                  <span>Manajemen Pengguna</span>
                </>
              )}
            </NavLink>
          </li>
        </ul>
        <h2 className="text-sm text-primary uppercase mb-2">Pengajuan</h2>
        <ul className="p-2">
          <li className="mb-6">
            <NavLink
              to="/aktivasi"
              className={({ isActive }) =>
                `flex gap-2 items-center ${
                  isActive ? "text-primary" : "text-gray-700 hover:text-primary"
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
              onClick={() => setIsDaftarPengajuanOpen(!isDaftarPengajuanOpen)}
            >
              <div className="flex gap-2 items-center">
                {isDaftarPengajuanActive ? (
                  <DocumentSolid className="w-5 h-5 text-primary" />
                ) : (
                  <DocumentOutline className="w-5 h-5" />
                )}
                <span className={isDaftarPengajuanActive ? "text-primary" : ""}>
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
                  isActive ? "text-primary" : "text-gray-700 hover:text-primary"
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
                  isActive ? "text-primary" : "text-gray-700 hover:text-primary"
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
                  isActive ? "text-primary" : "text-gray-700 hover:text-primary"
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
              onClick={() => {
                console.log("Keluar diklik");
              }}
              className="w-full flex gap-2 items-center text-red-600 hover:text-red-800 transition-colors cursor-pointer"
            >
              <LogoutOutline className="w-5 h-5" />
              <span>Keluar</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
