"use client";
import * as z from "zod";
import { useState, useTransition, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { NewPasswordSchema } from "@/schemas/auth/auth";
import { newPassword } from "@/actions/auth/new-password";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormSucces } from "@/components/auth/form-succes";
import { FormError } from "@/components/auth/form-error";
import { PasswordInput } from "@/components/auth/password-input";

export const NewPasswordFormComponent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("oobCode");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      newPassword(values, token).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  return (
    <CardWrapper
      header="Reset Password"
      headerLabel="Please enter a new password for your account"
      backButtonLabel="Found your (old) password?"
      backButtonHref="/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <PasswordInput
              name="password"
              placeholder="Password"
              disabled={isPending}
            />
            <PasswordInput
              name="confirm_password"
              placeholder="Confirm Password"
              disabled={isPending}
            />
          </div>
          <FormError message={error} />
          <FormSucces message={success} />
          <Button disabled={isPending} type="submit" className="w-full">
            Reset password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export const NewPasswordForm = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordFormComponent />
    </Suspense>
  );
};
