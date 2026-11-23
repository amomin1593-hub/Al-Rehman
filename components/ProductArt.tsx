// Placeholder product artwork drawn in SVG, so the store looks finished before real photos exist.
// When you have photos, set `image_url` on a product (or in Supabase) and <ProductImage> will use it instead.
import React from "react";

type Props = {
  art: string;
  finish?: string; // hex colour of the metal finish
  tone?: string; // background tone
  id: string; // unique prefix for gradient ids
  className?: string;
  bare?: boolean; // no background
};

function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  if (amt >= 0) {
    r = Math.round(r + (255 - r) * amt);
    g = Math.round(g + (255 - g) * amt);
    b = Math.round(b + (255 - b) * amt);
  } else {
    r = Math.round(r * (1 + amt));
    g = Math.round(g * (1 + amt));
    b = Math.round(b * (1 + amt));
  }
  return `rgb(${r},${g},${b})`;
}

export default function ProductArt({ art, finish = "#c9ccd0", tone = "#ece8e1", id, className, bare }: Props) {
  const M = `url(#${id}-m)`; // metal, horizontal
  const MV = `url(#${id}-mv)`; // metal, vertical
  const C = `url(#${id}-c)`; // ceramic
  const dark = shade(finish, -0.45);

  const wallSpout = (
    <g>
      <circle cx="200" cy="104" r="17" fill={MV} />
      <rect x="194" y="108" width="12" height="34" rx="6" fill={M} />
    </g>
  );

  const counter = (
    <g>
      <rect x="28" y="262" width="344" height="14" rx="2" fill="#d7d0c5" />
      <rect x="28" y="276" width="344" height="60" fill="#cec6ba" opacity="0.55" />
    </g>
  );

  const stream = (x: number, y1: number, y2: number) => (
    <rect x={x} y={y1} width="5" height={y2 - y1} rx="2.5" fill={`url(#${id}-w)`} />
  );

  const mixer = (top: number) => (
    <g>
      <ellipse cx="190" cy="302" rx="70" ry="9" fill="#000" opacity="0.08" />
      <ellipse cx="190" cy="298" rx="30" ry="6" fill={dark} />
      <rect x="172" y={top} width="36" height={298 - top} rx="5" fill={M} />
      <path d={`M206 ${top + 14} H270 Q280 ${top + 14} 280 ${top + 24} V${top + 40} H264 V${top + 30} H206 Z`} fill={MV} />
      <rect x="264" y={top + 39} width="16" height="3" fill={dark} />
      <rect x="175" y={top - 14} width="30" height="16" rx="3" fill={M} />
      <path d={`M186 ${top - 8} L128 ${top - 34}`} stroke={dark} strokeWidth="11" strokeLinecap="round" />
      <path d={`M186 ${top - 10} L130 ${top - 35}`} stroke={shade(finish, 0.35)} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      {stream(269, top + 43, 292)}
    </g>
  );

  let body: React.ReactNode = null;
  switch (art) {
    case "basin-round":
      body = (
        <g>
          {wallSpout}
          {counter}
          <ellipse cx="200" cy="264" rx="96" ry="6" fill="#000" opacity="0.1" />
          <path d="M108 176 Q110 262 200 262 Q290 262 292 176 Z" fill={C} />
          <ellipse cx="200" cy="176" rx="92" ry="16" fill="#fbfaf8" stroke="#ddd7ce" />
          <ellipse cx="200" cy="178" rx="80" ry="11" fill="#e8e3dc" />
          {stream(197, 142, 178)}
        </g>
      );
      break;
    case "basin-rect":
      body = (
        <g>
          {wallSpout}
          {counter}
          <ellipse cx="200" cy="264" rx="108" ry="6" fill="#000" opacity="0.1" />
          <rect x="96" y="190" width="208" height="72" rx="8" fill={C} />
          <rect x="96" y="180" width="208" height="16" rx="6" fill="#fbfaf8" stroke="#ddd7ce" />
          <rect x="108" y="183" width="184" height="9" rx="4" fill="#e6e1da" />
          {stream(197, 142, 184)}
        </g>
      );
      break;
    case "basin-oval":
      body = (
        <g>
          <rect x="0" y="0" width="400" height="400" fill="#000" opacity="0.025" />
          {wallSpout}
          <ellipse cx="200" cy="330" rx="90" ry="8" fill="#000" opacity="0.07" />
          <path d="M86 186 Q96 282 200 288 Q304 282 314 186 Z" fill={C} />
          <ellipse cx="200" cy="186" rx="114" ry="18" fill="#fbfaf8" stroke="#ddd7ce" />
          <ellipse cx="200" cy="188" rx="98" ry="12" fill="#e8e3dc" />
          <rect x="190" y="288" width="20" height="40" rx="4" fill={M} />
          {stream(197, 142, 188)}
        </g>
      );
      break;
    case "faucet-basin":
      body = mixer(176);
      break;
    case "faucet-tall":
      body = mixer(104);
      break;
    case "faucet-pillar":
      body = (
        <g>
          <ellipse cx="200" cy="302" rx="60" ry="8" fill="#000" opacity="0.08" />
          <ellipse cx="200" cy="298" rx="26" ry="6" fill={dark} />
          <rect x="186" y="196" width="28" height="102" rx="4" fill={M} />
          <path d="M200 200 C200 140 276 140 276 196" stroke={M} strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d="M199 196 C199 146 270 146 271 190" stroke={shade(finish, 0.45)} strokeWidth="4" fill="none" opacity="0.5" />
          <rect x="268" y="194" width="16" height="10" rx="2" fill={dark} />
          <rect x="140" y="236" width="48" height="10" rx="5" fill={MV} />
          {stream(273, 205, 292)}
        </g>
      );
      break;
    case "faucet-kitchen":
    case "faucet-kitchen-pull":
      body = (
        <g>
          <ellipse cx="190" cy="304" rx="78" ry="9" fill="#000" opacity="0.08" />
          <ellipse cx="168" cy="300" rx="30" ry="6" fill={dark} />
          <rect x="150" y="206" width="36" height="94" rx="5" fill={M} />
          <path d="M168 210 V122 C168 52 272 52 272 122 V150" stroke={M} strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d="M165 205 V122 C165 60 264 58 266 118" stroke={shade(finish, 0.5)} strokeWidth="4" fill="none" opacity="0.45" />
          <rect x="261" y="146" width="22" height="34" rx="5" fill={MV} />
          <rect x="263" y="178" width="18" height="4" fill={dark} />
          <rect x="184" y="228" width="46" height="10" rx="5" fill={MV} />
          {art === "faucet-kitchen-pull" &&
            Array.from({ length: 9 }).map((_, i) => (
              <ellipse key={i} cx="168" cy={128 + i * 9} rx="16" ry="3.2" fill="none" stroke={dark} strokeWidth="2.5" />
            ))}
          {stream(270, 183, 296)}
        </g>
      );
      break;
    case "bidet-spray":
      body = (
        <g>
          <ellipse cx="200" cy="330" rx="110" ry="8" fill="#000" opacity="0.06" />
          <circle cx="108" cy="150" r="22" fill={MV} />
          <rect x="88" y="142" width="40" height="16" rx="3" fill={M} />
          <rect x="102" y="160" width="12" height="16" fill={dark} />
          <path d="M108 176 C104 320 262 330 266 254" stroke={dark} strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M108 176 C104 320 262 330 266 254" stroke={shade(finish, 0.4)} strokeWidth="9" fill="none" strokeDasharray="2 3" opacity="0.6" />
          <rect x="236" y="104" width="62" height="14" rx="5" fill={M} />
          <rect x="248" y="116" width="36" height="48" rx="13" fill={M} />
          <rect x="257" y="150" width="18" height="106" rx="9" fill={M} />
          <rect x="284" y="128" width="9" height="34" rx="4.5" fill={dark} />
          <ellipse cx="266" cy="120" rx="12" ry="4" fill={dark} opacity="0.5" />
        </g>
      );
      break;
    case "shower-head":
      body = (
        <g>
          {Array.from({ length: 22 }).map((_, i) => {
            const x = 106 + i * 9;
            return (
              <line key={i} x1={x} y1={168} x2={x + (i - 11) * 2.2} y2={300 + (i % 4) * 10}
                stroke="#a9b8bf" strokeWidth="1.6" strokeDasharray={`${10 + (i % 3) * 6} 9`} opacity={0.35 + (i % 3) * 0.15} />
            );
          })}
          <rect x="30" y="92" width="182" height="14" rx="7" fill={MV} />
          <rect x="24" y="78" width="14" height="42" rx="3" fill={M} />
          <rect x="196" y="96" width="14" height="50" rx="4" fill={M} />
          <ellipse cx="203" cy="152" rx="112" ry="15" fill={M} />
          <ellipse cx="203" cy="158" rx="104" ry="8" fill={dark} opacity="0.8" />
        </g>
      );
      break;
    case "shower-column":
      body = (
        <g>
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1={100 + i * 8} y1={84} x2={96 + i * 8.6} y2={260 + (i % 3) * 12}
              stroke="#a9b8bf" strokeWidth="1.5" strokeDasharray="12 10" opacity={0.35 + (i % 3) * 0.15} />
          ))}
          <ellipse cx="290" cy="336" rx="60" ry="7" fill="#000" opacity="0.07" />
          <rect x="284" y="62" width="14" height="268" rx="6" fill={M} />
          <rect x="150" y="58" width="146" height="11" rx="5" fill={MV} />
          <ellipse cx="152" cy="72" rx="68" ry="10" fill={M} />
          <ellipse cx="152" cy="77" rx="62" ry="5" fill={dark} opacity="0.8" />
          <rect x="262" y="238" width="58" height="42" rx="7" fill={M} />
          <circle cx="291" cy="259" r="10" fill={dark} />
          <rect x="300" y="132" width="16" height="78" rx="8" fill={M} />
          <ellipse cx="308" cy="128" rx="17" ry="8" fill={MV} />
        </g>
      );
      break;
    case "accessory-set":
      body = (
        <g>
          <rect x="92" y="96" width="36" height="16" rx="4" fill={M} />
          <circle cx="110" cy="168" r="44" fill="none" stroke={MV} strokeWidth="8" />
          <rect x="106" y="110" width="8" height="16" fill={dark} />
          <rect x="190" y="104" width="22" height="22" rx="11" fill={M} />
          <path d="M201 120 V170 Q201 190 222 186" stroke={MV} strokeWidth="9" fill="none" strokeLinecap="round" />
          <rect x="270" y="104" width="58" height="14" rx="4" fill={M} />
          <path d="M280 118 V150 H318 V118" stroke={MV} strokeWidth="6" fill="none" />
          <rect x="276" y="148" width="46" height="8" rx="4" fill={dark} />
          <rect x="70" y="262" width="80" height="12" rx="4" fill={M} />
          <path d="M80 262 Q110 238 140 262 Z" fill="#fbfaf8" stroke="#ddd7ce" />
          <rect x="190" y="238" width="16" height="36" rx="3" fill={M} />
          <rect x="206" y="250" width="34" height="8" rx="4" fill={MV} />
          <circle cx="290" cy="262" r="26" fill="#f4f1ec" stroke="#ddd7ce" />
          <rect x="280" y="226" width="20" height="10" rx="3" fill={M} />
          <path d="M290 236 V250" stroke={dark} strokeWidth="5" />
        </g>
      );
      break;
    case "towel-rail":
      body = (
        <g>
          <circle cx="78" cy="150" r="16" fill={MV} />
          <circle cx="322" cy="150" r="16" fill={MV} />
          <rect x="74" y="158" width="10" height="20" fill={dark} />
          <rect x="316" y="158" width="10" height="20" fill={dark} />
          <path d="M124 176 H276 V300 Q260 312 244 300 Q228 312 212 300 Q196 312 180 300 Q164 312 148 300 Q136 310 124 300 Z" fill="#f7f4ef" stroke="#e0dad1" />
          <path d="M124 176 H276 V214 H124 Z" fill="#efebe4" />
          <line x1="170" y1="214" x2="166" y2="298" stroke="#e3ddd4" strokeWidth="2" />
          <line x1="230" y1="214" x2="234" y2="298" stroke="#e3ddd4" strokeWidth="2" />
          <rect x="70" y="168" width="260" height="12" rx="6" fill={MV} />
        </g>
      );
      break;
    default:
      body = mixer(176);
  }

  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade(finish, -0.35)} />
          <stop offset="0.35" stopColor={shade(finish, 0.5)} />
          <stop offset="0.55" stopColor={finish} />
          <stop offset="1" stopColor={shade(finish, -0.45)} />
        </linearGradient>
        <linearGradient id={`${id}-mv`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(finish, 0.5)} />
          <stop offset="0.5" stopColor={finish} />
          <stop offset="1" stopColor={shade(finish, -0.4)} />
        </linearGradient>
        <linearGradient id={`${id}-c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e4dfd8" />
        </linearGradient>
        <linearGradient id={`${id}-w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#b9c9d0" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.38" r="0.75">
          <stop offset="0" stopColor={shade(tone, 0.45)} />
          <stop offset="1" stopColor={tone} />
        </radialGradient>
      </defs>
      {!bare && <rect width="400" height="400" fill={`url(#${id}-bg)`} />}
      {body}
    </svg>
  );
}
