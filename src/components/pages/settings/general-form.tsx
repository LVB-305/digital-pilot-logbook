"use client";

import useLocalStorage from "@/hooks/useLocalStorage";

export function GeneralForm() {
  const [sortPreference, setSortPreference] = useLocalStorage(
    "crewSortPreference",
    "firstName"
  );
  const [nameOrder, setNameOrder] = useLocalStorage(
    "nameOrder",
    "firstNameFirst"
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Crew List Sort Preference
        </label>
        <select
          value={sortPreference}
          onChange={(e) => setSortPreference(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name Display Order
        </label>
        <select
          value={nameOrder}
          onChange={(e) => setNameOrder(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="firstNameFirst">First Name First</option>
          <option value="lastNameFirst">Last Name First</option>
        </select>
      </div>
    </div>
  );
}
