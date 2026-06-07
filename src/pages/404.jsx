import { Link, useRouteError } from "react-router-dom";
import PageHelmet from "../components/Seo/PageHelmet";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <>
      <PageHelmet
        title="Halaman Tidak Ditemukan"
        description="Halaman yang diminta tidak ditemukan di aplikasi UNIKOM Perlengkapan."
      />
      <div className="flex justify-center min-h-screen items-center font-poppins px-6">
        <div className="text-center">
          <h1 className="font-bold text-2xl mb-4">Oops!</h1>
          <p className="mb-4">Sorry, an unexpected error has occured</p>
          <p className="mb-6">{error.statusText || error.message}</p>
          <Link
            className="bg-none text-sm text-blue-600 font-medium p-2 hover:bg-slate-300 rounded-lg duration-200 ease-out"
            to={"/"}
          >
            Kembali
          </Link>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
