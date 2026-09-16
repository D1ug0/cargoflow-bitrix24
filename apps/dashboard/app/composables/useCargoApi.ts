export function useCargoApi() {
  const config = useRuntimeConfig();
  const baseURL = import.meta.server
    ? (config.apiBaseInternal as string)
    : (config.public.apiBase as string);

  return {
    get: <T>(path: string, query?: Record<string, string | number | undefined>) =>
      $fetch<T>(path, { baseURL, query }),
    post: <T>(path: string, body: Record<string, unknown>) =>
      $fetch<T>(path, { baseURL, method: 'POST', body }),
    patch: <T>(path: string, body: Record<string, unknown>) =>
      $fetch<T>(path, { baseURL, method: 'PATCH', body }),
  };
}
