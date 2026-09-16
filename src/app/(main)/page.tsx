"use client";

import * as React from "react";
import dynamic from "next/dynamic";

const HomeView = dynamic(() => import("@/components/home/HomeView"), { ssr: false });

export default function HomePage() {

    return <HomeView />;
}
