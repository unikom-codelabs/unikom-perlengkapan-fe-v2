import { useEffect, useRef, useState } from "react";

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

const AktivasiCard = ({
  title,
  periodName,
  startDate,
  endDate,
  isActive,
  isActivating,
  isDeleting,
  showManageActions,
  onActivate,
  onEdit,
  onDelete,
  isActivateDisabled,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isMenuDisabled = isActivating || isDeleting;
  const isMenuVisible = isMenuOpen && !isMenuDisabled;

  useEffect(() => {
    if (!isMenuVisible) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuVisible]);

  const isValidDate = (dateString) => {
    const d = new Date(dateString);
    return d instanceof Date && !isNaN(d);
  };

  const formattedStartDate =
    startDate && isValidDate(startDate)
      ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(startDate))
      : "-";

  const formattedDate =
    endDate && isValidDate(endDate)
      ? new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(endDate))
      : "-";

  const endDateKey = toDateKey(endDate);
  const isEnded = Boolean(endDateKey) && endDateKey < TODAY_DATE_KEY;

  const statusClassName = isActive
    ? "bg-green-100 text-green-700"
    : isEnded
      ? "bg-red-100 text-red-600"
      : "bg-blue-100 text-blue-600";

  const statusLabel = isActive
    ? "Periode sedang aktif"
    : isEnded
      ? "Telah berakhir pada"
      : "Berakhir pada";

  const activateButtonLabel = isActivating ? "Mengaktifkan..." : "Aktivasi";

  return (
    <div className="bg-white shadow-sm rounded-sm border-slate-200 w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-600 font-medium">{title}</p>
          {periodName ? (
            <p className="text-xs text-gray-400 mt-1">{periodName}</p>
          ) : null}
        </div>
        {showManageActions ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              disabled={isMenuDisabled}
              aria-label="Buka menu aksi"
              className="border border-primary text-primary p-2 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-5 h-5"
              >
                <path d="M4 7h16" strokeLinecap="round" />
                <path d="M4 12h16" strokeLinecap="round" />
                <path d="M4 17h16" strokeLinecap="round" />
              </svg>
            </button>

            {isMenuVisible ? (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit?.();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-blue-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete?.();
                  }}
                  disabled={isDeleting || isActivating}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={onActivate}
            disabled={isActivateDisabled}
            className="border border-primary text-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
          >
            {activateButtonLabel}
          </button>
        )}
      </div>
      <div className="border-b border-gray-200 mb-4" />
      <div className="text-xs text-gray-500 mb-3">
        Periode: <span className="font-medium">{formattedStartDate}</span> s.d.{" "}
        <span className="font-medium">{formattedDate}</span>
      </div>
      <div className={`${statusClassName} text-sm p-2 rounded-xl w-fit`}>
        {statusLabel} <span>{formattedDate}</span>
      </div>
    </div>
  );
};

export default AktivasiCard;
