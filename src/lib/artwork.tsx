import type { ReactNode } from "react";

export const COLORS: Record<string, string> = {
  Cream: "#f3ecdc",
  Black: "#1b1b1f",
  Sage: "#9bb08c",
  Terracotta: "#c8593b",
  Sky: "#8fb8de",
  Butter: "#f2d16b",
  Navy: "#23305a",
  Blush: "#efb8b0",
};

const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum < 120;
};

/** Each design is drawn inside the chest area (roughly x 120-280, y 110-300). */
const DESIGNS: Record<string, (ink: string, accent: string) => ReactNode> = {
  sunrise: (ink, accent) => (
    <g>
      <g className="art-spin">
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="196" y="120" width="8" height="26" rx="4" fill={accent} transform={`rotate(${i * 30} 200 205)`} />
        ))}
      </g>
      <circle cx="200" cy="205" r="34" fill={ink} />
      <path d="M130 275h140" stroke={ink} strokeWidth="6" strokeLinecap="round" />
    </g>
  ),
  wave: (ink, accent) => (
    <g fill="none" strokeWidth="7" strokeLinecap="round">
      {[150, 185, 220, 255].map((y, i) => (
        <path key={y} className="art-wave" style={{ animationDelay: `${i * -0.5}s` }} stroke={i % 2 ? accent : ink} d={`M125 ${y} q19 -22 37 0 t37 0 t37 0 t37 0`} />
      ))}
    </g>
  ),
  mountain: (ink, accent) => (
    <g>
      <path d="M125 280 L180 175 L215 235 L240 200 L275 280Z" fill={ink} />
      <path d="M165 205 L180 175 L195 205 L180 198Z" fill={accent} />
      {[[150, 140], [225, 130], [255, 165], [190, 125]].map(([x, y], i) => (
        <circle key={i} className="art-twinkle" style={{ animationDelay: `${i * 0.4}s` }} cx={x} cy={y} r="4" fill={accent} />
      ))}
    </g>
  ),
  bloom: (ink, accent) => (
    <g className="art-spin-slow">
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse key={i} cx="200" cy="170" rx="15" ry="36" fill={i % 2 ? accent : ink} transform={`rotate(${i * 45} 200 205)`} opacity=".92" />
      ))}
      <circle cx="200" cy="205" r="14" fill={ink} />
    </g>
  ),
  orbit: (ink, accent) => (
    <g fill="none" stroke={ink} strokeWidth="4">
      <ellipse cx="200" cy="205" rx="72" ry="26" transform="rotate(-24 200 205)" />
      <circle cx="200" cy="205" r="30" fill={accent} stroke="none" />
      <g className="art-spin"><circle cx="200" cy="205" r="0" /><circle cx="270" cy="205" r="8" fill={ink} stroke="none" /></g>
    </g>
  ),
  dots: (ink, accent) => (
    <g>
      {Array.from({ length: 25 }).map((_, i) => {
        const x = 140 + (i % 5) * 30, y = 145 + Math.floor(i / 5) * 30;
        return <circle key={i} className="art-pulse" style={{ animationDelay: `${(i % 5 + Math.floor(i / 5)) * 0.15}s` }} cx={x} cy={y} r="9" fill={(i * 7) % 3 ? ink : accent} />;
      })}
    </g>
  ),
  smile: (ink, accent) => (
    <g className="art-float">
      <circle cx="200" cy="205" r="62" fill={accent} />
      <ellipse className="art-blink" cx="178" cy="190" rx="6" ry="10" fill={ink} />
      <ellipse className="art-blink" cx="222" cy="190" rx="6" ry="10" fill={ink} />
      <path d="M168 225 q32 34 64 0" fill="none" stroke={ink} strokeWidth="7" strokeLinecap="round" />
    </g>
  ),
  bolt: (ink, accent) => (
    <g>
      <circle cx="200" cy="205" r="66" fill="none" stroke={ink} strokeWidth="5" strokeDasharray="10 12" className="art-spin-slow" />
      <path className="art-flash" d="M212 140 L170 215 h28 l-10 55 l44 -82 h-30z" fill={accent} stroke={ink} strokeWidth="4" strokeLinejoin="round" />
    </g>
  ),
  plain: () => null,
};

export const ARTWORK_KEYS = Object.keys(DESIGNS);

type TeeProps = { artwork: string; color?: string; className?: string; label?: string };

export function Tee({ artwork, color = "Cream", className, label }: TeeProps) {
  const fill = COLORS[color] ?? COLORS.Cream;
  const dark = isDark(fill);
  const ink = dark ? "#f3ecdc" : "#1b1b1f";
  const accent = dark ? "#f2d16b" : "#c8593b";
  const draw = DESIGNS[artwork] ?? DESIGNS.plain;
  return (
    <svg viewBox="0 0 400 440" className={className} role="img" aria-label={label ?? `${color} t-shirt`}>
      <ellipse cx="200" cy="425" rx="120" ry="9" fill="currentColor" opacity=".12" />
      <path
        d="M130 30 C150 60 250 60 270 30 L340 60 L385 150 L328 178 L300 145 L300 400 Q300 410 290 410 L110 410 Q100 410 100 400 L100 145 L72 178 L15 150 L60 60 Z"
        fill={fill}
      />
      <path d="M100 145 L100 400 M300 145 L300 400" stroke="#000" strokeOpacity=".06" strokeWidth="14" />
      <path d="M72 178 L100 145 M328 178 L300 145" stroke="#000" strokeOpacity=".12" strokeWidth="3" />
      <path d="M130 30 C150 72 250 72 270 30" fill="none" stroke="#000" strokeOpacity=".16" strokeWidth="10" strokeLinecap="round" />
      {draw(ink, accent)}
    </svg>
  );
}
