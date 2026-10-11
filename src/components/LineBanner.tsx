"use client";

import * as React from "react";
import "@/styles/line-banner.css";

export default function LineBanner(): React.JSX.Element {
  return (
    <div className="line-banner" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/navunder.jpg"
        alt=""
        className="line-banner__img"
        draggable={false}
      />
    </div>
  );
}
