const Button = ({
  children,
  onClick,
  type = "button",
  classname = "",
  className = "",
  disabled = false,
  variant = "primary",
  shape = "rounded",
  fullWidth = true,
  ...props
}) => {
  const extraClassName = `${classname} ${className}`.trim();
  const variantClassName = {
    primary: "bg-[#4279df] text-white hover:bg-blue-600",
    outline:
      "border border-[#4773da] bg-white text-[#4773da] shadow-none hover:bg-blue-50 hover:text-[#365db8]",
  }[variant] ?? variant;
  const shapeClassName = {
    rounded: "rounded-lg",
    pill: "rounded-full",
  }[shape] ?? shape;
  const widthClassName = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      className={`inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 transition-colors text-sm shadow-sm disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200 ${widthClassName} ${shapeClassName} ${variantClassName} ${extraClassName}`.trim()}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
