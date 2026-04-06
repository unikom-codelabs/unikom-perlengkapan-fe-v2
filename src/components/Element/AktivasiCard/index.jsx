const AktivasiCard = ({ title, endDate }) => {
  const isValidDate = (dateString) => {
    const d = new Date(dateString);
    return d instanceof Date && !isNaN(d);
  };

  const formattedDate =
    endDate && isValidDate(endDate)
      ? new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(endDate))
      : "-";

  return (
    <div className="bg-white shadow-sm rounded-sm border-slate-200 w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600 font-medium">{title}</p>
        <button className="border border-primary text-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer">
          Aktifkan
        </button>
      </div>
      <div className="border-b border-gray-200 mb-4" />
      <div className="bg-red-200 text-red-500 text-sm p-2 rounded-xl w-fit">
        Telah berakhir pada <span>{formattedDate}</span>
      </div>
    </div>
  );
};

export default AktivasiCard;
