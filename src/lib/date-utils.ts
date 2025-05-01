/**
 * Format a date to a readable string
 * @param date The date to format
 * @param format The format to use (short, medium, long)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: "short" | "medium" | "long" = "medium"
): string {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date:", date);
    return "Invalid date";
  }

  try {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: format === "short" ? "numeric" : "short",
      day: "numeric",
    };

    if (format === "long") {
      options.weekday = "long";
      options.month = "long";
    }

    return dateObj.toLocaleDateString("en-US", options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateObj.toDateString();
  }
}

/**
 * Format a date to show how long ago it was
 * @param date The date to format
 * @returns Relative time string (e.g., "2 days ago")
 */
export function timeAgo(date: Date | string | number): string {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    console.error("Invalid date:", date);
    return "Invalid date";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? "s" : ""} ago`;
}
