import React from "react";
import Logo from "/src/assets/img/logo-unikom.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F8F8F8] font-sans">
      <div className="w-full max-w-md bg-white rounded shadow-md p-8 pt-10 pb-8">
        <div className="flex flex-col items-center mb-6">
          <img src={Logo} alt="UNIKOM Logo" className="w-75 mb-2" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
