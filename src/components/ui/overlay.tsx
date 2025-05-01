import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";

type ButtonConfig = {
  label: string;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean;
};

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  leadingButton?: ButtonConfig;
  trailingButton?: ButtonConfig;
  showDoneButton?: boolean;
  isDoneDisabled?: boolean;
}

export function Overlay({
  isOpen,
  onClose,
  title,
  children,
  leadingButton,
  trailingButton,
  showDoneButton = true,
  isDoneDisabled = false,
}: OverlayProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full h-full max-w-full sm:min-h-[500px] md:max-w-md md:max-h-[60vh] p-0 gap-0 bg-[#f5f5f5] dark:bg-zinc-900 [&>button]:hidden flex flex-col"
        aria-describedby={undefined}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="w-[60px]">
            {leadingButton && (
              <Button
                variant={leadingButton.variant || "ghost"}
                onClick={leadingButton.onClick}
                disabled={leadingButton.disabled}
                size="sm"
                className="text-blue-500"
              >
                {leadingButton.label}
              </Button>
            )}
          </div>
          <DialogTitle>
            <span className="text-lg font-medium">{title}</span>
          </DialogTitle>
          <div className="w-[60px] flex justify-end">
            {trailingButton ? (
              <Button
                variant={trailingButton.variant || "ghost"}
                onClick={trailingButton.onClick}
                disabled={trailingButton.disabled}
                size="sm"
                className="text-blue-500"
              >
                {trailingButton.label}
              </Button>
            ) : showDoneButton ? (
              <button
                onClick={onClose}
                disabled={isDoneDisabled}
                className="text-sm font-medium text-blue-500 hover:opacity-70 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Done
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
