import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Option {
  label: string;
  value: string;
}

interface FloatingSelectProps {
  isOpen: boolean;
  onClose: () => void;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export function FloatingSelect({
  isOpen,
  onClose,
  options,
  value,
  onChange,
  triggerRef,
}: FloatingSelectProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerRef.current || !isOpen) return;

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect();
      const menuWidth = 250;

      // By default, align with the right edge of the trigger
      let left = rect.right - menuWidth;
      let top = rect.bottom + 8;

      // If aligning with right edge would push it off-screen to the left,
      // align with the left edge of the trigger instead
      if (left < 8) {
        left = Math.max(8, rect.left);
      }

      // If the menu would overflow bottom, show it above the trigger
      const viewportHeight = window.innerHeight;
      const menuHeight = ref.current?.offsetHeight || 300; // Use 300px as fallback height
      if (rect.bottom + menuHeight > viewportHeight) {
        top = rect.top - menuHeight - 8;
      }

      setPosition({
        top,
        left,
        width: menuWidth,
      });
    };

    updatePosition();

    // Update position on scroll and resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, triggerRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Short delay to ensure click events are captured
    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[1000] animate-in fade-in slide-in-from-top-2 rounded-lg bg-white shadow-lg dark:bg-zinc-900"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: "calc(100vh - 100px)", // Prevent menu from being taller than viewport
        pointerEvents: "auto",
      }}
    >
      <div className="max-h-72 overflow-auto rounded-lg divide-y divide-gray-100 dark:divide-zinc-800">
        {options.map((option) => (
          <button
            key={option.value}
            className="flex w-full items-center justify-start p-2 space-x-2 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleOptionClick(option.value);
            }}
          >
            {value === option.value ? (
              <Check className="h-4 w-4" />
            ) : (
              <div className="w-4" />
            )}
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
