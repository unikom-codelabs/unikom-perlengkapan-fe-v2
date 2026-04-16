import React from "react";

const Input = ({ type, placeholder, name }) => {
  return (
    <input
      type={type}
      className="pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4279df] w-full"
      placeholder={placeholder}
      name={name}
      id={name}
    />
  );
};

export default Input;
