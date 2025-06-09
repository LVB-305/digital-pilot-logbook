"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const positionedGroupVariants = cva("relative flex flex-col gap-px", {
  variants: {
    variant: {
      default: "bg-border",
      ghost: "bg-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const positionedItemVariants = cva("relative bg-background", {
  variants: {
    position: {
      first: "rounded-t-lg",
      middle: "",
      last: "rounded-b-lg",
      single: "rounded-lg",
    },
  },
  defaultVariants: {
    position: "middle",
  },
});

interface PositionedGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof positionedGroupVariants> {
  asChild?: boolean;
}

interface PositionedItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof positionedItemVariants> {
  asChild?: boolean;
}

const PositionedGroup = React.forwardRef<HTMLDivElement, PositionedGroupProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(positionedGroupVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
PositionedGroup.displayName = "PositionedGroup";

const PositionedItem = React.forwardRef<HTMLDivElement, PositionedItemProps>(
  ({ className, position, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(positionedItemVariants({ position, className }))}
        {...props}
      />
    );
  }
);
PositionedItem.displayName = "PositionedItem";

export {
  PositionedGroup,
  PositionedItem,
  type PositionedGroupProps,
  type PositionedItemProps,
};
