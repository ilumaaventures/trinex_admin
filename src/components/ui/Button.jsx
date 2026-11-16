export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}) {
  const base =
    "inline-flex items-center justify-center font-sans font-semibold uppercase tracking-wider transition-all duration-200 rounded-[2px] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizes = {
    sm: "py-1.5 px-3 text-[11px]",
    md: "py-2 px-4 text-xs",
    lg: "py-2.5 px-5 text-sm",
  };

  const variants = {
    primary:
      "bg-[#527C50] hover:bg-[#315C3C] text-white border border-[#527C50] shadow-sm",
    secondary:
      "bg-[#315C3C] hover:bg-[#202B25] text-white border border-white/10 shadow-sm",
    outline:
      "bg-transparent hover:bg-[#315C3C]/5 text-[#202B25] border border-[#E5EAE4]",
    danger:
      "bg-red-600 hover:bg-red-700 text-white border border-red-600 shadow-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
