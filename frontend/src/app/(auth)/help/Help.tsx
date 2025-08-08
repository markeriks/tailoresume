"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Verify from "@/app/(auth)/verify/Verify";
import Reset from "@/app/(auth)/reset-password/Reset";

export default function HelpClient() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode) {
      setMode(queryMode);
    }
  }, [searchParams]);

  if (!mode) {
    return <div>Please provide a mode parameter in the URL.</div>;
  }

  if (mode.startsWith("verify")) {
    return <Verify />;
  }

  if (mode.startsWith("reset")) {
    return <Reset />;
  }

  return <div>Invalid mode parameter.</div>;
}
