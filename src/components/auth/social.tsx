"use client";

import { useState } from "react";
import { providerMap } from "@/lib/auth/constants/providers";
import { socialAuthentication } from "@/actions/auth/social-auth";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/form-error";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export const Social = () => {
  const [error, setError] = useState<string | undefined>("");

  const socialAuth = async (service: keyof typeof providerMap) => {
    try {
      setError("");
      const data = await socialAuthentication(service);

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      setError("Authentication failed. Please try again.");
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
