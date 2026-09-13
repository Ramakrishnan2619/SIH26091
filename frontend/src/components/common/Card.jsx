import React from 'react';

/**
 * Universal Card component for VyapaarSathi
 * Standardizes padding, shadow, border-radius, and elevation tokens across
 * stat cards, step cards, and form section cards.
 * 
 * @param {'default' | 'compact' | 'spacious'} padding
 * @param {boolean} hoverable
 * @param {string} className
 */
export function Card({
  children,
  padding = 'default',
  hoverable = true,
  className = '',
  ...props
}) {
  const paddingStyles = {
    compact: "p-4",
    default: "p-6",
    spacious: "p-8"
  }[padding] || "p-6";

  const hoverStyles = hoverable 
    ? "hover:shadow-md hover:border-[#009DB3]/40 transition-all duration-200" 
    : "";

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs ${paddingStyles} ${hoverStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
