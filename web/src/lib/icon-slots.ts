import type { IconName } from "@/components/Icon";

/**
 * Icons you have added as images. For each name listed here the app shows
 * `/icons/<name>.png` (file in `web/public/icons/`) instead of the built-in
 * drawing. Names not listed keep the built-in icon, so nothing breaks while
 * you add files one by one. See `public/icons/README.md` for the full list.
 */
export const CUSTOM_ICONS: IconName[] = [];

/** Change to "svg" if you download SVG files instead of PNG. */
export const ICON_EXTENSION: "png" | "svg" = "png";
