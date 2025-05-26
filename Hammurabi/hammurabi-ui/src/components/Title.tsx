// src/components/Title.tsx
import React from "react";

interface TitleProps {
  text: string;
  className?: string;
}

const Title: React.FC<TitleProps> = ({ text, className }) => {
  return <h2 className={className}>{text}</h2>;
};

export default Title;
