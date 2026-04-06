import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const CetakBerkasRutinPage = () => {
  const [activeTab, setActiveTab] = useState("ATK Tahunan");

  const tabs = ["ATK Tahunan", "ATK Ujian", "ATK Kelas"];

  const tableData = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    namaBarang: "Amplop Coklat",
    satuan: "Pak",
    jumlah: "-",
    sisa: "-",
    jumlahBeli: "-",
    harga: "-",
    subtotal: "-",
    vendor: "-",
  }));

  const renderTableSection = (title, subtitle) => (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-gray-700">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Cari"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#f0f4fc] text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 border-r border-gray-200">No</th>
              <th className="px-6 py-4 border-r border-gray-200">
                Nama Barang
              </th>
              <th className="px-6 py-4 border-r border-gray-200">Satuan</th>
              <th className="px-6 py-4 border-r border-gray-200">Jumlah</th>
              <th className="px-6 py-4 border-r border-gray-200">
                Sisa Pengajuan
              </th>
              <th className="px-6 py-4 border-r border-gray-200">
                Jumlah Beli
              </th>
              <th className="px-6 py-4 border-r border-gray-200">Harga</th>
              <th className="px-6 py-4 border-r border-gray-200">Subtotal</th>
              <th className="px-6 py-4">Vendor</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 bg-white hover:bg-gray-50"
              >
                <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                  {row.id}
                </td>
                <td className="px-6 py-3 border-r border-gray-200 text-gray-500">
                  {row.namaBarang}
                </td>
                <td className="px-6 py-3 border-r border-gray-200 text-gray-500">
                  {row.satuan}
                </td>
                <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                  {row.jumlah}
                </td>
                <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                  {row.sisa}
                </td>
                <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                  {row.jumlahBeli}
                </td>
                <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                  {row.harga}
                </td>
                <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                  {row.subtotal}
                </td>
                <td className="px-6 py-3 text-center text-gray-500">
                  {row.vendor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-center mt-4 gap-4">
        <div className="flex flex-wrap gap-3">
          <button className="bg-[#4773da] hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
            Download Daftar ATK
          </button>
          <button className="bg-[#4773da] hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
            Download Daftar ATK UNIKOM
          </button>
          <button className="bg-[#4773da] hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors">
            Download Daftar ATK dan Vendor
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button className="px-3 py-1.5 border border-[#4773da] bg-[#4773da] text-white rounded text-sm font-medium">
            1
          </button>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-500 bg-white hover:bg-gray-50 rounded text-sm font-medium">
            2
          </button>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-500 bg-white hover:bg-gray-50 rounded text-sm font-medium">
            3
          </button>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-500 bg-white hover:bg-gray-50 rounded text-sm font-medium">
            4
          </button>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-500 bg-white hover:bg-gray-50 rounded text-sm font-medium">
            5
          </button>
          <span className="px-1 text-gray-500">...</span>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-500 bg-white hover:bg-gray-50 rounded text-sm font-medium">
            20
          </button>
          <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderAtkTahunanContent = () => (
    <>
      {/* Filters ATK Tahunan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div>
          <label className="block text-sm text-gray-500 mb-2">Unit Kerja</label>
          <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500">
            <option value="">-- Pilih Unit Kerja --</option>
            <option value="1">Fakultas Teknik</option>
            <option value="2">Fakultas Ilmu Komputer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-2">Aktivasi</label>
          <select
            className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none appearance-none bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            <option value="">-- Pilih Aktivasi --</option>
          </select>
        </div>
      </div>

      {renderTableSection(
        "Total Harga : Rp -",
        "Pengajuan ATK Rutin tahunan 2025",
      )}

      {renderTableSection(
        "Total Harga : Rp -",
        "Pengajuan ATK Lainnya tahunan 2025",
      )}
    </>
  );

  const renderAtkKelasContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div>
          <label className="block text-sm text-gray-500 mb-2">
            Tahun Akademik
          </label>
          <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500">
            <option value="">-- Pilih Akademik --</option>
            <option value="2024/2025">2024/2025</option>
            <option value="2025/2026">2025/2026</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-2">Aktivasi</label>
          <select
            className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none appearance-none bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            <option value="">-- Pilih Aktivasi --</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-2">Prodi</label>
          <select
            className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none appearance-none bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            <option value="">-- Pilih Prodi --</option>
          </select>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h2 className="text-[17px] font-bold text-gray-700">
              Total Harga : Rp -
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pengajuan ATK Kelas 2025
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Cari"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#f0f4fc] text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 border-r border-gray-200 w-16">No</th>
                <th className="px-6 py-4 border-r border-gray-200">
                  Nama Barang
                </th>
                <th className="px-6 py-4 border-r border-gray-200 w-32">
                  Satuan
                </th>
                <th className="px-6 py-4 w-32">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {tableData.slice(0, 3).map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 bg-white hover:bg-gray-50"
                >
                  <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                    {row.id}
                  </td>
                  <td className="px-6 py-3 border-r border-gray-200 text-gray-500">
                    {row.namaBarang}
                  </td>
                  <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                    {row.satuan}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-500">
                    {row.jumlah}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center mt-4 gap-4">
          <div className="flex flex-wrap gap-3">
            <button className="bg-[#4773da] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
              Cetak BAP
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button className="px-3 py-1.5 border border-[#4773da] bg-[#4773da] text-white rounded text-sm font-medium">
              1
            </button>
            <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderAtkUjianContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div>
          <label className="block text-sm text-gray-500 mb-2">
            Tahun Akademik
          </label>
          <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500">
            <option value="">-- Pilih Akademik --</option>
            <option value="2024/2025">2024/2025</option>
            <option value="2025/2026">2025/2026</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-2">Aktivasi</label>
          <select
            className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none appearance-none bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            <option value="">-- Pilih Aktivasi --</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-2">Prodi</label>
          <select
            className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none appearance-none bg-gray-100 text-gray-400 cursor-not-allowed"
            disabled
          >
            <option value="">-- Pilih Prodi --</option>
          </select>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h2 className="text-[17px] font-bold text-gray-700">
              Total Harga : Rp -
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Pengajuan ATK Rutin tahunan 2025
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              placeholder="Cari"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#f0f4fc] text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 border-r border-gray-200 w-16">No</th>
                <th className="px-6 py-4 border-r border-gray-200">
                  Nama Barang
                </th>
                <th className="px-6 py-4 border-r border-gray-200 w-32">
                  Satuan
                </th>
                <th className="px-6 py-4 w-32">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {tableData.slice(0, 3).map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 bg-white hover:bg-gray-50"
                >
                  <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                    {row.id}
                  </td>
                  <td className="px-6 py-3 border-r border-gray-200 text-gray-500">
                    {row.namaBarang}
                  </td>
                  <td className="px-6 py-3 border-r border-gray-200 text-center text-gray-500">
                    {row.satuan}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-500">
                    {row.jumlah}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-center mt-4 gap-4">
          <div className="flex flex-wrap gap-3">
            <button className="bg-[#4773da] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
              Cetak BAP
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button className="px-3 py-1.5 border border-[#4773da] bg-[#4773da] text-white rounded text-sm font-medium">
              1
            </button>
            <button className="p-1.5 border border-gray-300 rounded text-gray-500 bg-white hover:bg-gray-50">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>Cetak Berkas Rutin</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden mb-6">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Cetak Berkas Rutin</h1>
        </div>

        <div className="p-6">
          <div className="flex space-x-6 border-b border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[15px] font-medium transition-colors relative ${
                  activeTab === tab
                    ? "text-[#4773da]"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#4773da]"></span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "ATK Tahunan" && renderAtkTahunanContent()}
          {activeTab === "ATK Ujian" && renderAtkUjianContent()}
          {activeTab === "ATK Kelas" && renderAtkKelasContent()}
        </div>
      </div>
    </>
  );
};

export default CetakBerkasRutinPage;
