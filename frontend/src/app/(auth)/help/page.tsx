import React, { Suspense } from "react";
import HelpClient from "./Help";

export default function HelpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HelpClient />
    </Suspense>
  );
}
