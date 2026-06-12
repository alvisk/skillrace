"use client";

import dynamic from "next/dynamic";

export const SceneLoader = dynamic(() => import("./race-scene"), {
  ssr: false,
  loading: () => <div className="scene scene-loading">INITIALIZING TRACK…</div>,
});
