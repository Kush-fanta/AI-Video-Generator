 "use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { REVIEW_ENABLED } from "../lib/env";

export const Nav: React.FC = () => {
  const pathname = usePathname() || "/";

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 32,
        padding: "16px 32px",
        borderBottom: "1px solid #222",
        background: "#0a0a0a",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 18, color: "#C17A48", letterSpacing: "0.05em" }}>
        VARNAM
      </span>
      <Link
        href="/"
        style={{
          color: pathname === "/" ? "#fff" : "#666",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: pathname === "/" ? 600 : 400,
        }}
      >
        Catalog
      </Link>
      <Link
        href="/qc"
        style={{
          color: pathname === "/qc" ? "#fff" : "#666",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: pathname === "/qc" ? 600 : 400,
        }}
      >
        QC Review
      </Link>

      {/* Channel tabs */}
      <div style={{ width: 1, height: 20, background: "#222", margin: "0 8px" }} />
      <span style={{ color: "#444", fontSize: 11, letterSpacing: "0.08em" }}>CHANNELS</span>
      <Link
        href="/swarajya"
        style={{
          color: pathname.startsWith("/swarajya") ? "#D74545" : "#888",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: pathname.startsWith("/swarajya") ? 700 : 500,
        }}
      >
        Swarajya
      </Link>
      {REVIEW_ENABLED && (
        <>
          <Link
            href="/demo"
            style={navLinkStyle(pathname === "/demo")}
          >
            Demo
          </Link>
          <Link
            href="/vox"
            style={navLinkStyle(pathname === "/vox")}
          >
            Vox
          </Link>
        </>
      )}

    </nav>
  );
};

const navLinkStyle = (active: boolean): React.CSSProperties => ({
  color: active ? "#fff" : "#666",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: active ? 600 : 400,
});
