import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Overlay } from "@/components/ui/overlay";
import { Form } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import { FormError } from "@/components/auth/form-error";
import { FormSucces } from "@/components/auth/form-succes";
import { ChangePasswordSchema } from "@/schemas/auth/auth";
import { changePassword } from "@/actions/auth/change-password";
import { Label } from "@/components/ui/label";

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordDialog({ isOpen, onClose }: PasswordDialogProps) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ChangePasswordSchema>) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const result = await changePassword(values);
      if (result?.error) {
        setError(result.error);
      }
      if (result?.success) {
        setSuccess(result.success);
        form.reset();
        setTimeout(onClose, 2000);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      leadingButton={{
        label: "Cancel",
        onClick: onClose,
        variant: "ghost",
        disabled: isPending,
      }}
      trailingButton={{
        label: "Save",
        onClick: form.handleSubmit(onSubmit),
        variant: "ghost",
        disabled: isPending,
      }}
      showDoneButton={false}
    >
      <div className="w-full p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Current Password</Label>
                <PasswordInput
                  name="current_password"
                  placeholder="Current Password"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">New Password</Label>
                <PasswordInput
                  name="password"
                  placeholder="New Password"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Confirm Password</Label>
                <PasswordInput
                  name="confirm_password"
                  placeholder="Confirm New Password"
                  disabled={isPending}
                />
              </div>
            </div>
            <FormError message={error} />
            <FormSucces message={success} />
          </form>
        </Form>
      </div>
    </Overlay>
  );
}
