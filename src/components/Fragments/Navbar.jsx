import Profile from "/src/assets/img/Profile.png";
import { useLocation, Link } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const formatPathName = (name) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="h-20 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="text-gray-400 text-sm font-medium flex gap-1">
        <Link
          to="/"
          className={`transition-colors ${pathnames.length === 0 ? "text-primary" : "hover:text-primary"}`}
        >
          Home
        </Link>
        {pathnames.length > 0 &&
          pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            return (
              <span key={to} className="flex gap-1">
                <span>/</span>
                {isLast ? (
                  <span className="text-primary">{formatPathName(value)}</span>
                ) : (
                  <Link
                    to={to}
                    className="hover:text-primary transition-colors"
                  >
                    {formatPathName(value)}
                  </Link>
                )}
              </span>
            );
          })}
      </div>

      <Link
        to="/profil"
        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
      >
        <img
          src={Profile}
          alt="User Profile"
          className="w-10 h-10 object-contain"
        />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900">
            Yayah Sutisnawati, S.E., M.M
          </span>
          <span className="text-xs text-gray-500">Direktur Logistik</span>
        </div>
      </Link>
    </header>
  );
};

export default Navbar;
