// src/components/Button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <button {...props} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
    {children}
  </button>
);

export default Button;
