import React from "react";

const Label = ({ htmlFor, children }) => {
  return (
    <label htmlFor={htmlFor} className="block text-slate-800 text-base mb-2">
      {children}
    </label>
  );
};

export default Label;
