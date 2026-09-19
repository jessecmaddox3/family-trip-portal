export function assetPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//")
    ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${value}`
    : value;
}
