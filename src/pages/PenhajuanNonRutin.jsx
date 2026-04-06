import React, { useState } from "react";
import { Helmet } from "react-helmet-async";

const PengajuanNonRutinPage = () => {
  const [activeTab, setActiveTab] = useState("ATK Tahunan");

  const tabs = ["ATK Tahunan", "ATK Ujian", "ATK Kelas"];

  return (
    <>
      <Helmet>
        <title>Daftar Pengajuan Rutin</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">
            Data Barang Pengajuan Non Rutin
          </h1>
        </div>

        <div className="p-6">
          <div className="flex space-x-6 border-b border-gray-100 mb-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Unit Kerja
              </label>
              <select className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-gray-500">
                <option value="">-- Pilih Unit Kerja --</option>
                <option value="1">Fakultas Teknik</option>
                <option value="2">Fakultas Ilmu Budaya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Bidang</label>
              <select
                className="w-full border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none appearance-none bg-gray-100 text-gray-400 cursor-not-allowed"
                disabled
              >
                <option value="">-- Pilih Bidang --</option>
              </select>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-[17px] font-bold text-gray-700 mb-4">
              Tahun : -
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f0f4fc] text-gray-600 font-semibold">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Nama Barang</th>
                    <th className="px-6 py-4">Satuan</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Jumlah</th>
                    <th className="px-6 py-4">Jumlah Disetujui</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="7" className="px-6 py-6 text-gray-500">
                      Data tidak ditemukan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-[17px] font-bold text-gray-700 mb-4">
              Pengajuan Lainnya
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f0f4fc] text-gray-600 font-semibold">
                  <tr>
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Nama Barang</th>
                    <th className="px-6 py-4">Satuan</th>
                    <th className="px-6 py-4">Kategori</th>
                    <th className="px-6 py-4">Jumlah</th>
                    <th className="px-6 py-4">Jumlah Disetujui</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="7" className="px-6 py-6 text-gray-500">
                      Data tidak ditemukan
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PengajuanNonRutinPage;
