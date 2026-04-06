import Sidebar from "../Fragments/Sidebar";
import Navbar from "../Fragments/Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar />
      <div className="flex-1 ml-72 flex flex-col">
        <Navbar />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
