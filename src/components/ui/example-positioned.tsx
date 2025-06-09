"use client";

import * as React from "react";
import { PositionedGroup, PositionedItem } from "./positioned-group";

export function ExamplePositioned() {
  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Example with default variant (with separators) */}
      <PositionedGroup>
        <PositionedItem position="first" className="p-4">
          <h3 className="font-medium">First Item</h3>
          <p className="text-sm text-muted-foreground">
            With rounded top corners
          </p>
        </PositionedItem>
        <PositionedItem position="middle" className="p-4">
          <h3 className="font-medium">Middle Item</h3>
          <p className="text-sm text-muted-foreground">No rounded corners</p>
        </PositionedItem>
        <PositionedItem position="last" className="p-4">
          <h3 className="font-medium">Last Item</h3>
          <p className="text-sm text-muted-foreground">
            With rounded bottom corners
          </p>
        </PositionedItem>
      </PositionedGroup>

      {/* Example with ghost variant (no separators) */}
      <PositionedGroup variant="ghost" className="space-y-2">
        <PositionedItem position="single" className="p-4 border">
          <h3 className="font-medium">Single Item</h3>
          <p className="text-sm text-muted-foreground">All corners rounded</p>
        </PositionedItem>
        <PositionedItem position="single" className="p-4 border">
          <h3 className="font-medium">Another Single Item</h3>
          <p className="text-sm text-muted-foreground">All corners rounded</p>
        </PositionedItem>
      </PositionedGroup>
    </div>
  );
}
