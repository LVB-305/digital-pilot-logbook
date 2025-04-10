//https://gist.github.com/mjbalcueva/b21f39a8787e558d4c536bf68e267398
import { useFormContext } from "react-hook-form";
import { useState } from "react";

import { 
    FormControl, 
    FormField, 
    FormItem, 
    FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { EyeIcon, EyeOffIcon } from "lucide-react";

type PasswordInputProps = {
    name?: string;
    placeholder?: string;
    disabled: boolean
}

export function PasswordInput({
    name = "password",
    placeholder = "Password",
    disabled,
}: PasswordInputProps) {
    const { control } = useFormContext();
    const [ passwordVisibility, setPasswordVisibility ] = useState(false);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <div className="relative">
                            <Input 
                                {...field}
                                type={passwordVisibility ? "text" : "password"}
                                autoComplete="on"
                                disabled={disabled}
                                placeholder={placeholder}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent"
                                onClick={() => setPasswordVisibility(!passwordVisibility)}
                                disabled={disabled}
                            >
                                    {passwordVisibility ? (
                                        <EyeIcon className="h-4 w-4" aria-hidden="true" />
                                    ) : (
                                        <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                                    )}

                                    <span className="sr-only">{passwordVisibility ? "Hide password" : "Show password"}</span>
                            </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        ></FormField>
    )
}