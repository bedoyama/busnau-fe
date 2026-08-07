export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "development") return;

  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

  if (!useMocks) return;

  const { server } = await import("./lib/mocks/node");
  server.listen({ onUnhandledRequest: "bypass" });
}
