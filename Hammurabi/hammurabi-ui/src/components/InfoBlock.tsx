// src/components/InfoBlock.tsx
import React from "react";

interface InfoBlockProps {
  label: string;
  value: string;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ label, value }) => {
  return (
    <div className="viewer-info-block">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
};

export default InfoBlock;
