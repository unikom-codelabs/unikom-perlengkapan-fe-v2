import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const MAX_VISIBLE_PAGES = 5;

const buildPageNumbers = (currentPage, totalPages) => {
  const pageNumbers = [];

  if (totalPages <= MAX_VISIBLE_PAGES + 2) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else if (currentPage <= MAX_VISIBLE_PAGES - 1) {
    for (let i = 1; i <= MAX_VISIBLE_PAGES; i++) {
      pageNumbers.push(i);
    }
    pageNumbers.push("...");
    pageNumbers.push(totalPages);
  } else if (currentPage > totalPages - MAX_VISIBLE_PAGES + 2) {
    pageNumbers.push(1);
    pageNumbers.push("...");
    for (let i = totalPages - MAX_VISIBLE_PAGES + 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    pageNumbers.push(1);
    pageNumbers.push("...");
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      pageNumbers.push(i);
    }
    pageNumbers.push("...");
    pageNumbers.push(totalPages);
  }

  return pageNumbers;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const goTo = (page) => {
    const target = Math.min(Math.max(page, 1), totalPages);

    if (target !== currentPage) {
      onPageChange(target);
    }
  };

  return (
    <div className="flex justify-end items-center mt-6">
      <nav className="flex items-center space-x-1">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {buildPageNumbers(currentPage, totalPages).map((page, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => typeof page === "number" && goTo(page)}
            disabled={page === "..."}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? "bg-[#4279df] text-white"
                : page === "..."
                  ? "text-gray-500 cursor-default"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
