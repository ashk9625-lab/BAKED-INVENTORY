"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  function goBack() {
    // If this page was opened from another page in the app, return there.
    // Otherwise send the user safely to the BAKED dashboard.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="baked-back-button"
      aria-label="Go back"
    >
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button>
  );
}
