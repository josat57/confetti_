"use client";

import React, { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { detectSwipe } from "@/utils/gestures";

interface TouchMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: "left" | "right" | "bottom";
}

const TouchMenu: React.FC<TouchMenuProps> = ({
  isOpen,
  onClose,
  children,
  position = "left",
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    // Detect swipe to close
    const cleanup = detectSwipe(menuRef.current, (event) => {
      if (
        (position === "left" && event.direction === "left") ||
        (position === "right" && event.direction === "right") ||
        (position === "bottom" && event.direction === "down")
      ) {
        onClose();
      }
    });

    // Prevent body scroll when menu is open
    document.body.style.overflow = "hidden";

    return () => {
      cleanup();
      document.body.style.overflow = "";
    };
  }, [isOpen, position, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    left: "left-0 top-0 bottom-0 w-80 max-w-[85vw]",
    right: "right-0 top-0 bottom-0 w-80 max-w-[85vw]",
    bottom: "left-0 right-0 bottom-0 max-h-[85vh] rounded-t-2xl",
  };

  const slideClasses = {
    left: isOpen ? "translate-x-0" : "-translate-x-full",
    right: isOpen ? "translate-x-0" : "translate-x-full",
    bottom: isOpen ? "translate-y-0" : "translate-y-full",
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className={`fixed bg-white shadow-xl z-50 transition-transform duration-300 ${positionClasses[position]} ${slideClasses[position]}`}
      >
        {/* Handle for bottom sheet */}
        {position === "bottom" && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100% - 64px)" }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default TouchMenu;
