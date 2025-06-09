import useLocalStorage from "./useLocalStorage";

export type PilotFunction =
  | "PIC"
  | "Co-Pilot"
  | "Dual"
  | "Instructor"
  | "Solo"
  | "SPIC"
  | "PICUS";

export const useDefaultFunction = () => {
  return useLocalStorage<PilotFunction>("defaultFunction", "PIC");
};
