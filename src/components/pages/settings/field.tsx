import { useState, useEffect } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Save } from "lucide-react";
import { fetchFieldValue } from "@/actions/pages/settings/fetch-field-value";

interface FieldProps {
  label: string;
  dbField: string;
  onUpdate: (field: string, value: string) => Promise<void>;
}

export default function Field({ label, dbField, onUpdate }: FieldProps) {
  const [value, setValue] = useState<string>("");
  const [savedValue, setSavedValue] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadInitialValue = async () => {
      const initialValue = await fetchFieldValue(dbField);
      if (initialValue) {
        setValue(initialValue);
        setSavedValue(initialValue);
      }
    };
    loadInitialValue();
  }, [dbField]);

  const handleSave = async () => {
    if (value === savedValue) {
      setIsEditing(false);
      return;
    }

    if (!value.trim()) return;

    try {
      setIsLoading(true);
      await onUpdate(dbField, value);
      setSavedValue(value);
      setIsEditing(false);
    } catch (error) {
      setValue(savedValue); // Revert on error
      console.error(`Error saving ${dbField}: `, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  // Cancel editing if user presses Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setValue(savedValue);
      setIsEditing(false);
    } else if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Label className="text-base font-medium">{label}</Label>
      <div className="relative w-full max-w-[250px] md:max-w-sm">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={!savedValue ? label : ""}
          disabled={!isEditing || isLoading}
          onKeyDown={handleKeyDown}
          onBlur={isEditing ? handleSave : undefined}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={handleButtonClick}
          disabled={isLoading}
        >
          {isEditing ? (
            <Save className="h-4 w-4" />
          ) : !savedValue ? (
            <Plus className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
