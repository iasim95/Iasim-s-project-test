import {
  UtensilsCrossed,
  Car,
  Home,
  Popcorn,
  HeartPulse,
  MoreHorizontal,
  ShoppingBag,
  Plane,
  GraduationCap,
  Dumbbell,
  Gift,
  PawPrint,
  Zap,
  type LucideIcon,
} from "lucide-react";

const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/aliment|comida|super|grocer/i, UtensilsCrossed],
  [/transp|coche|car|gasolina|uber|taxi/i, Car],
  [/vivienda|alquiler|hipoteca|casa|hogar/i, Home],
  [/servicio|factura|luz|agua|internet|telefon/i, Zap],
  [/ocio|entretenim|cine|juego/i, Popcorn],
  [/salud|medic|farmacia|gym|deporte/i, HeartPulse],
  [/ropa|compra|shopping|tienda/i, ShoppingBag],
  [/viaje|vacacion|vuelo/i, Plane],
  [/educ|curso|formaci/i, GraduationCap],
  [/fitness|entren/i, Dumbbell],
  [/regalo/i, Gift],
  [/mascota|pet/i, PawPrint],
];

export function getCategoryIcon(name: string): LucideIcon {
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(name));
  return match ? match[1] : MoreHorizontal;
}

export function CategoryIcon({
  name,
  color,
  size = "md",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = getCategoryIcon(name);
  const dims = size === "sm" ? "size-7" : size === "lg" ? "size-11" : "size-9";
  const iconDims = size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4";

  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-full`}
      style={{ backgroundColor: `${color}22`, color }}
    >
      {/* eslint-disable-next-line react-hooks/static-components -- looked up from a fixed icon map, not created per render */}
      <Icon className={iconDims} />
    </div>
  );
}
