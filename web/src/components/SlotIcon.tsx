import { Icon, type IconName } from "./Icon";
import { CUSTOM_ICONS, ICON_EXTENSION } from "@/lib/icon-slots";

export type Tone = "teal" | "sky" | "leaf" | "sun";

/** A tinted square that shows your own image (public/icons/<name>.png) or the built-in icon. */
export function SlotIcon({ name, tone = "teal", size = "md", className = "" }: { name: IconName; tone?: Tone; size?: "sm" | "md" | "lg"; className?: string }) {
  const px = size === "lg" ? 56 : size === "sm" ? 36 : 44;
  return (
    <span className={`icon-tile ${tone} ${className}`} style={{ width: px, height: px }}>
      {CUSTOM_ICONS.includes(name)
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={`/icons/${name}.${ICON_EXTENSION}`} alt="" width={Math.round(px * 0.6)} height={Math.round(px * 0.6)} />
        : <Icon name={name} size={Math.round(px * 0.5)} />}
    </span>
  );
}
