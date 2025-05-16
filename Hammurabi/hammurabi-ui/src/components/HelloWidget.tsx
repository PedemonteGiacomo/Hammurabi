import React from "react";
import { useComponentVariant } from "../hooks/useComponentVariant";

type Variant = {
  background: string;
  text: string;
  padding: string | number;
  borderRadius: number;
};

const HelloWidget: React.FC = () => {
  const { background, text, padding, borderRadius } =
    useComponentVariant<Variant>("HelloWidget");

  return (
    <div
      style={{
        background,
        color: text,
        padding,
        borderRadius,
        textAlign: "center",
        fontSize: "1.25rem",
      }}
    >
      👋 Hello from a <strong>schema-driven</strong> component!
    </div>
  );
};

export default HelloWidget;
