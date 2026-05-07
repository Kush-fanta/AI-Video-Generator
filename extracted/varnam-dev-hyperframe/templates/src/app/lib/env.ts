export const isTruthy = (value: string | undefined): boolean => {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

export const REVIEW_ENABLED =
  process.env.NODE_ENV === "development" ||
  isTruthy(process.env.NEXT_PUBLIC_ENABLE_REVIEW) ||
  isTruthy(process.env.VITE_ENABLE_REVIEW);
