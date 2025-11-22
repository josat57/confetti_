"use client";

import React, { useEffect, useRef } from "react";
import { trapFocus } from "@/utils/accessibility";

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  onEscape?: () => void;
}

const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  onEscape,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const cleanup = trapFocus(containerRef.current);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        onEscape();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cleanup();
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, onEscape]);

  return (
    <div ref={containerRef} className="focus-trap-container">
      {children}
    </div>
  );
};

export default FocusTrap;
