"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AirportsErrorMessageProps {
  onRetry?: () => void;
}

export function AirportsErrorMessage({ onRetry }: AirportsErrorMessageProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error loading airports data</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          The airports data file could not be loaded. Please make sure you have
          placed the airports.json file in the correct location.
        </p>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Expected location:</strong>{" "}
            <code>/public/data/airports.json</code>
          </p>
          <p>
            <strong>URL path:</strong> <code>/data/airports.json</code>
          </p>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4"
          >
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
