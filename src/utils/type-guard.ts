export function isMongoError(
  err: unknown
): err is { code: number; message: string } {
  return (
    err !== null &&
    typeof err === "object" &&
    "code" in err &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (err as any).code === "number"
  );
}
