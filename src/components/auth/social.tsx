"use client";

import { useState } from "react";
import { redirect } from "next/navigation";

import { AuthProviders, providerMap } from "@/actions/auth/auth-providers";
import { createSession } from "@/actions/auth/auth-actions";
import { signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/form-error";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export const Social = () => {
  const [error, setError] = useState<string | undefined>("");

  const socialAuth = async (service: keyof typeof providerMap) => {
    const providerClass = new providerMap[service]();

    const provider: AuthProviders = providerClass;

    try {
      const result = await signInWithPopup(auth, provider);

      if (!result || !result.user) {
        setError("Google login failed");
      }

      await createSession(result.user.uid);
      redirect("/logbook");

      return result.user.uid;
    } catch (e) {
      let errorMessage;
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full items-center space-y-2">
      <div className="flex w-full items-center gap-x-2">
        <Button
          size="lg"
          className="w-full cursor-pointer"
          variant="outline"
          onClick={() => socialAuth("Google")}
        >
          <FcGoogle className="h-5 w-5" />
          <p className="ms-2">Continue with Google</p>
        </Button>
        {/* <Button
                    size="lg"
                    className="w-full cursor-pointer"
                    variant="outline"
                    onClick={() => socialAuth('Github')}
                >
                    <FaGithub className="h-5 w-5"/>
                </Button> */}
      </div>
      <FormError message={error} />
    </div>
  );
};
