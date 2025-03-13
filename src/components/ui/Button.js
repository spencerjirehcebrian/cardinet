"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      href,
      isLoading = false,
      disabled = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      className = "",
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Define variant styles
    const variantStyles = {
      primary:
        "bg-yellow-500 text-black hover:bg-yellow-400 hover:text-black hover:shadow-sm",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      outlined:
        "border border-yellow-500 text-yellow-500 hover:bg-yellow-300 hover:text-black",
      danger: "bg-red-500 text-white hover:bg-red-600",
      success: "bg-green-500 text-white hover:bg-green-600",
      ghost: "text-gray-700 hover:bg-gray-100",
      link: "text-blue-500 hover:underline p-0",
    };

    // Define size styles
    const sizeStyles = {
      sm: "text-xs px-3 py-1",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3",
      xl: "text-lg px-8 py-4",
    };

    // Handle rounded styles
    const roundedStyles = {
      sm: "rounded",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    };

    const rounded = variant === "link" ? "" : roundedStyles.full;

    // Compute the final className
    const buttonClasses = `
      ${variant !== "link" ? sizeStyles[size] : ""}
      ${variantStyles[variant]}
      ${rounded}
      ${fullWidth ? "w-full" : ""}
      ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}
      ${
        variant !== "link"
          ? "transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          : ""
      }
      ${className}
      ${
        icon && children
          ? iconPosition === "left"
            ? "flex items-center"
            : "flex flex-row-reverse items-center"
          : ""
      }
    `;

    // Render icon with proper spacing
    const renderIcon = () => {
      if (!icon) return null;

      return (
        <span
          className={`${
            children ? (iconPosition === "left" ? "mr-2" : "ml-2") : ""
          }`}
        >
          {icon}
        </span>
      );
    };

    // Render loading spinner
    const renderContent = () => {
      if (isLoading) {
        return (
          <span className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2" />
            {children || "Loading..."}
          </span>
        );
      }

      if (icon && !children) {
        return renderIcon();
      }

      if (icon && children) {
        return (
          <>
            {iconPosition === "left" && renderIcon()}
            <span>{children}</span>
            {iconPosition === "right" && renderIcon()}
          </>
        );
      }

      return children;
    };

    // If href is provided, render as a Link component
    if (href && !disabled) {
      return (
        <Link href={href} className={buttonClasses} ref={ref} {...props}>
          {renderContent()}
        </Link>
      );
    }

    // Otherwise render as a button
    return (
      <button
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {renderContent()}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
