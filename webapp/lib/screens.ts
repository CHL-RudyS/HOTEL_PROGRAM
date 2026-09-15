export const SCREENS: { num: string; label: string; href: string }[] = [
  { num: "01", label: "Cabang & Lokasi", href: "/unit" },
  { num: "02", label: "Front Desk (FD) Dashboard", href: "/front-desk" },
  { num: "02A", label: "FD - Availability Grid", href: "/front-desk/availability" },
  { num: "02B", label: "FD - Check-in Wizard", href: "/front-desk/checkin" },
  { num: "02C", label: "FD - Folio View", href: "/front-desk/folio" },
  { num: "02D", label: "FD - Room Rack", href: "/front-desk/rack" },
  { num: "02E", label: "FD - Housekeeping", href: "/front-desk/housekeeping" },
  { num: "02F", label: "FD - POS Resto", href: "/front-desk/pos" },
  { num: "03", label: "GM Dashboard", href: "/gm" },
];

export function screenForPath(pathname: string) {
  // Longest-prefix match so nested routes (e.g. /front-desk/checkin/<id>) still
  // resolve to their screen's Menu Layar entry.
  const sorted = [...SCREENS].sort((a, b) => b.href.length - a.href.length);
  return sorted.find((s) => pathname === s.href || pathname.startsWith(s.href + "/"));
}
