import { InternalConfig } from "@/types/internal-config";

export const isMvpPageEnabled = (
  config: InternalConfig | undefined,
  page: string
): boolean => {
  const pages = config?.KAS_MVP_PAGES;
  if (!pages || pages.length === 0) return true;
  return pages.includes(page);
};
