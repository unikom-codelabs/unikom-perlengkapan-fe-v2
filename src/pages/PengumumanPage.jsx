import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ModalBuatPengumuman from "../components/Element/ModalBuatPengumuman";

const PengumumanPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pengumumanData = [
    {
      id: 1,
      title: "Pengajuan ATK Ujian Akhir Semester Ganjil T.A.2025/2026",
      author: "Yayah Sutisnawati, S.E., M.M",
      date: "Selasa, 20 Januari 2026 - 08:32 AM",
      content:
        "Sehubungan dengan akan berlangsungnya Ujian Akhir Semester Ganjil Tahun Akademik 2025 / 2026, maka pengajuan ATK lembar jawaban UAS dan amplop cokelat yang dibutuhkan untuk Ujian tersebut kami terima dari hari Senin tanggal 19 Januari 2026 dan paling lambat kami terima hari Kamis tanggal 22 Januari 2026, dengan disertai jumlah kelas dan jumlah mahasiswa yang mengikuti UTS.",
    },
    {
      id: 2,
      title: "Pengajuan ATK Ujian Akhir Semester Ganjil T.A.2025/2026",
      author: "Yayah Sutisnawati, S.E., M.M",
      date: "Selasa, 20 Januari 2026 - 08:32 AM",
      content:
        "Sehubungan dengan akan berlangsungnya Ujian Akhir Semester Ganjil Tahun Akademik 2025 / 2026, maka pengajuan ATK lembar jawaban UAS dan amplop cokelat yang dibutuhkan untuk Ujian tersebut kami terima dari hari Senin tanggal 19 Januari 2026 dan paling lambat kami terima hari Kamis tanggal 22 Januari 2026, dengan disertai jumlah kelas dan jumlah mahasiswa yang mengikuti UTS.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Pengumuman | UNIKOM Perlengkapan</title>
      </Helmet>

      <div className="bg-white rounded shadow-sm overflow-hidden mb-6">
        <div className="bg-[#4773da] text-white px-6 py-4">
          <h1 className="text-xl font-semibold">Pengumuman</h1>
        </div>

        <div className="p-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="Cari"
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-[#4773da] hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors w-full sm:w-auto"
            >
              Tambah Pengumuman <PlusIcon className="h-4 w-4 stroke-2" />
            </button>
          </div>

          <div className="flex flex-col gap-8">
            {pengumumanData.map((item) => (
              <div key={item.id} className="bg-white">
                {" "}
                <div className="bg-[#3e64ca] px-6 py-4 flex justify-between items-center text-white">
                  <h2 className="font-semibold tracking-wide">{item.title}</h2>
                  <div className="flex items-center gap-3">
                    <button className="p-2 bg-white text-[#4773da] rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-[#d84841] text-white rounded-full hover:bg-red-700 transition-colors shadow-sm">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 flex flex-col md:flex-row gap-6 border-x border-b border-gray-200">
                  <div className="w-full md:w-62.5 shrink-0">
                    <div className="w-full aspect-3/4 border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                      <span className="text-gray-400 text-sm">
                        Document Placeholder
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col grow">
                    <h3 className="font-bold text-gray-800 text-[16px] mb-1">
                      Dibuat Oleh {item.author}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">{item.date}</p>
                    <p className="text-[15px] text-gray-600 leading-relaxed text-justify mb-4">
                      {item.content}
                    </p>
                    <div className="mt-auto flex justify-end">
                      <a
                        href="#"
                        className="text-[#4773da] text-sm hover:underline font-medium"
                      >
                        Baca Selengkapnya
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ModalBuatPengumuman
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default PengumumanPage;
