import React from "react";

const VARIANT_STYLES = {
  primary:
    "text-[#4773da] hover:text-[#2f57b9] bg-[#e8efff] hover:bg-[#d7e3ff]",
  danger: "text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100",
  neutral: "text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200",
};

const ActionIconButton = ({
  label,
  icon: Icon,
  onClick,
  type = "button",
  variant = "neutral",
  disabled = false,
  className = "",
}) => {
  const colorClass = VARIANT_STYLES[variant] ?? VARIANT_STYLES.neutral;

  return (
    <div className="relative inline-flex group">
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-full transition-colors ${colorClass} disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim()}
        aria-label={label}
      >
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </button>
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 z-20">
        {label}
      </span>
    </div>
  );
};

export default ActionIconButton;
