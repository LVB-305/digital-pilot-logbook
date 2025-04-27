"use client";
import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ResetSchema } from "@/schemas/auth/auth";
import { resetPassword } from "@/actions/auth/reset";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormSucces } from "@/components/auth/form-succes";
import { FormError } from "@/components/auth/form-error";
import { redirect } from "next/navigation";

export const ResetForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ResetSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      resetPassword(values).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
        if (data?.success) {
          setSuccess(data.success);
          // Add a small delay to ensure state updates complete
          setTimeout(() => {
            redirect(data.redirectTo);
          }, 1000);
        }
      });
    });
  };

  return (
    <CardWrapper
      header="Reset Password"
      headerLabel="Please enter your email to reset your password"
      backButtonLabel="Found your password?"
      backButtonHref="/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>Email</FormLabel> */}
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="name@email.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSucces message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full cursor-pointer"
          >
            Send reset Email
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
