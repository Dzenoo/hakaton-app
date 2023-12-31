const Button = ({ onClick, type, children, disabled, variant }) => {
  const ButtonVariant = {
    primary: "bg-[#4857f4] hover:bg-[#3b47d8] font-bold",
    secondary: "bg-transparent border hover:bg-[#3b3b3b] font-bold",
    danger: "bg-[#f04747] hover:bg-[#f04747dc] font-bold",
  };

  const variantButton = ButtonVariant[variant];

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${variantButton} p-3 rounded-md text-[13px] text-white w-full disabled:opacity-30 disabled:cursor-not-allowed transition-all`}
    >
      {children}
    </button>
  );
};

export default Button;
