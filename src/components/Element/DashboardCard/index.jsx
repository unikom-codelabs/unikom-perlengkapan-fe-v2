import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import DashboardDetailModal from "../DashboardDetailModal";

const DashboardCard = ({ title, value }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm rounded-sm border-slate-200 w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-500">{title}</p>
        <div
          className="bg-secondary p-2 rounded-xl text-primary hover:bg-primary hover:text-white cursor-pointer duration-200 ease-out"
          onClick={() => setIsModalOpen(true)}
        >
          <ArrowUpRightIcon className="w-5 h-5 font-bold" />
        </div>
      </div>
      <div className="border-b border-gray-200" />
      <div className="flex items-center justify-between gap-2 mt-4">
        <div className="flex items-center gap-2">
          <p className="text-4xl text-primary font-bold">{value}</p>
          <p className="text-gray-500">Pengajuan</p>
        </div>
        <div>
          <p className="text-gray-500">2025/2026</p>
        </div>
      </div>

      {isModalOpen && (
        <DashboardDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={title}
        />
      )}
    </div>
  );
};

export default DashboardCard;
