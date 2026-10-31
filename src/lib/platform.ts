import type { Platform } from "../types/project";

export const platformLabels: Record<Platform, string> = {
  linux: "Linux",
  windows: "Windows",
  android: "Android",
  macos: "macOS",
  other: "Other",
};

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (ua.includes("windows")) return "windows";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "other";
}

export function platformFromAsset(name: string): Platform {
  const n = name.toLowerCase();
  if (n.endsWith(".apk") || n.includes("android")) return "android";
  if (n.endsWith(".exe") || n.endsWith(".msi") || n.includes("windows"))
    return "windows";
  if (n.endsWith(".dmg") || n.endsWith(".pkg") || n.includes("macos"))
    return "macos";
  if (
    n.endsWith(".rpm") ||
    n.endsWith(".deb") ||
    n.endsWith(".appimage") ||
    n.includes("linux")
  )
    return "linux";
  return "other";
}

export function isChecksumAsset(name: string): boolean {
  return /sha256|checksums?/i.test(name);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
