// https://github.com/shadcn-ui/ui/blob/main/apps/www/app/(app)/examples/authentication/page.tsx
import { Metadata } from "next";
import Link from "next/link";

import { NewPasswordForm } from "@/components/auth/new-password-form";

export const metadata: Metadata = {
  title: "New Password",
  description: "Account new password.",
};

export default function NewPasswordPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
      <NewPasswordForm />
      <p className="px-8 text-center text-sm text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
