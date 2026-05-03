import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

const TODAY_DATE_KEY = new Date().toISOString().slice(0, 10);

const toDateKey = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

const formatDateLabel = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const DashboardAktivasiSummaryCard = ({
  title,
  endDate,
  isActive,
  periodName,
}) => {
  const endDateKey = toDateKey(endDate);
  const isEnded = Boolean(endDateKey) && endDateKey < TODAY_DATE_KEY;
  const formattedEndDate = formatDateLabel(endDate);

  const statusClassName = isActive
    ? "bg-green-100 text-green-700"
    : isEnded
      ? "bg-red-100 text-red-600"
      : "bg-blue-100 text-blue-600";

  const statusLabel = isActive
    ? "Periode Sedang Aktif"
    : isEnded
      ? "Telah Berakhir Pada"
      : "Berakhir Pada";

  return (
    <div className="bg-white shadow-sm rounded-sm border border-gray-200 w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-600 font-medium">{title}</p>
          {periodName ? (
            <p className="text-xs text-gray-400 mt-1">{periodName}</p>
          ) : null}
        </div>
        <Link
          to="/aktivasi"
          className="bg-secondary p-2 rounded-xl text-primary hover:bg-primary hover:text-white duration-200 ease-out"
          aria-label="Lihat detail aktivasi"
        >
          <ArrowUpRightIcon className="w-5 h-5 font-bold" />
        </Link>
      </div>
      <div className="border-b border-gray-200 mb-4" />

      <div
        className={`${statusClassName} text-sm px-3 py-1.5 rounded-xl w-fit`}
      >
        {statusLabel} {formattedEndDate}
      </div>
    </div>
  );
};

export default DashboardAktivasiSummaryCard;
