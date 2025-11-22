"use client";

import React from "react";

interface SkipNavigationProps {
  links?: { href: string; label: string }[];
}

const SkipNavigation: React.FC<SkipNavigationProps> = ({ links }) => {
  const defaultLinks = [
    { href: "#main-content", label: "Skip to main content" },
    { href: "#navigation", label: "Skip to navigation" },
    { href: "#footer", label: "Skip to footer" },
  ];

  const navigationLinks = links || defaultLinks;

  const handleSkip = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      (target as HTMLElement).focus();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="sr-only-focusable">
      {navigationLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => handleSkip(e, link.href)}
          className="absolute top-0 left-0 z-50 px-4 py-2 bg-teal-600 text-white font-medium rounded-br-lg focus:not-sr-only focus:block"
        >
          {link.label}
        </a>
      ))}
      <style jsx>{`
        .sr-only-focusable a {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        .sr-only-focusable a:focus {
          position: absolute;
          width: auto;
          height: auto;
          padding: 0.5rem 1rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>
    </div>
  );
};

export default SkipNavigation;
