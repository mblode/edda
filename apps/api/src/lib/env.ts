export const readTrimmedEnv = (name: string) => {
  const value = process.env[name];
  if (typeof value !== "string") {
    return;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }
  return trimmed;
};
