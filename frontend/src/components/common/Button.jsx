import React from 'react';

/**
 * Universal Button component for VyapaarSathi
 * Enforces UX4G 48px touch targets, consistent tokens, and single text node rendering.
 * 
 * @param {'primary' | 'secondary' | 'ghost'} variant
 * @param {'default' | 'sm'} size
 */
export function Button({
  children,
  variant = 'primary',
  size = 'default',
  type = 'button',
  icon: Icon = null,
  iconPosition = 'right',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer select-none active:scale-98 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

  const sizeStyles = {
    default: "min-h-[48px] px-6 py-3 rounded-xl text-sm gap-2.5",
    sm: "min-h-[38px] px-4 py-1.5 rounded-lg text-xs gap-2"
  }[size] || "min-h-[48px] px-6 py-3 rounded-xl text-sm gap-2.5";

  const variantStyles = {
    primary: "bg-[#006B7A] hover:bg-[#00525E] text-white shadow-sm hover:shadow-md border border-[#00525E]",
    secondary: "bg-white hover:bg-slate-50 text-[#006B7A] border-2 border-slate-300 hover:border-[#009DB3] shadow-xs",
    ghost: "bg-transparent hover:bg-[#CBF9FF]/40 text-[#006B7A] border border-transparent"
  }[variant] || "bg-[#006B7A] hover:bg-[#00525E] text-white";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim()}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={size === 'sm' ? "w-3.5 h-3.5 shrink-0" : "w-4 h-4 shrink-0"} />
      )}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className={size === 'sm' ? "w-3.5 h-3.5 shrink-0" : "w-4 h-4 shrink-0"} />
      )}
    </button>
  );
}
