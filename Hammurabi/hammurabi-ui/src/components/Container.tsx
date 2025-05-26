// src/components/Container.tsx
import React, { forwardRef } from "react";

const Container = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    return <div ref={ref} {...props}>{children}</div>;
  }
);

export default Container;
