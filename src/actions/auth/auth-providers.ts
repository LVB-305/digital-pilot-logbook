import { GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";

export type AuthProviders = GoogleAuthProvider | GithubAuthProvider;

export const providerMap = {
  Google: GoogleAuthProvider,
  // Github: GithubAuthProvider
} as const;
