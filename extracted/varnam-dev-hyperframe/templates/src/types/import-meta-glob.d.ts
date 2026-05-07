export {};

declare global {
  interface ImportMeta {
    glob<T>(
      path: string | readonly string[],
      options?: {
        eager?: boolean;
      }
    ): Record<string, T>;
  }
}
