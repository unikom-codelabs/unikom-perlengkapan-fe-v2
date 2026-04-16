import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  classname = "bg-primary",
}) => {
  return (
    <button
      className={`space-x-1.5 bg-[#4279df] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg w-full transition-colors text-sm shadow-sm`}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
