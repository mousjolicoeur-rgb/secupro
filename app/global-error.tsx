"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Une erreur est survenue</h2>
          <p className="text-gray-400">Notre équipe a été notifiée automatiquement.</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
