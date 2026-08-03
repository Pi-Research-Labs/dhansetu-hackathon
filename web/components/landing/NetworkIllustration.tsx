"use client";

import { Sprout, Users, Building2, Store } from "lucide-react";

interface NetworkIllustrationProps {
  t: any;
}

export default function NetworkIllustration({ t }: NetworkIllustrationProps) {
  const N = t.land.nodes;
  const nodes = [
    { x: 96, y: 66, icon: Sprout, label: N.farmer, ring: "#2E7D32" },
    { x: 120, y: 232, icon: Users, label: N.shg, ring: "#D84315" },
    { x: 604, y: 66, icon: Building2, label: N.bank, ring: "#1565C0" },
    { x: 588, y: 232, icon: Store, label: N.ent, ring: "#2E7D32" },
  ];
  const hub = { x: 350, y: 148 };

  return (
    <svg viewBox="0 0 700 300" className="w-full max-w-[560px] mx-auto block">
      <defs>
        <linearGradient id="hubg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
      </defs>
      {nodes.map((n, i) => (
        <path
          key={i}
          className="flowline"
          d={`M ${n.x} ${n.y} Q ${(n.x + hub.x) / 2} ${(n.y + hub.y) / 2 + (n.y < hub.y ? 34 : -34)} ${hub.x} ${hub.y}`}
          fill="none"
          stroke={n.ring}
          strokeWidth="1.8"
          opacity="0.55"
        />
      ))}
      <circle className="pulse" cx={hub.x} cy={hub.y} r="34" fill="url(#hubg)" opacity="0.35" />
      <circle className="pulse pulse2" cx={hub.x} cy={hub.y} r="34" fill="url(#hubg)" opacity="0.25" />
      <circle cx={hub.x} cy={hub.y} r="34" fill="url(#hubg)" />
      <text
        x={hub.x}
        y={hub.y + 6}
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill="#fff"
        fontFamily="'Poppins', sans-serif"
      >
        AI
      </text>
      <circle cx={hub.x + 26} cy={hub.y - 26} r="4" fill="#D84315" />
      <circle cx={hub.x - 30} cy={hub.y + 24} r="3" fill="#D84315" opacity="0.8" />
      {nodes.map((n, i) => {
        const IconComponent = n.icon;
        return (
          <g key={i} className="floaty" style={{ animationDelay: `${i * 0.7}s` }}>
            <circle cx={n.x} cy={n.y} r="30" fill="#fff" stroke={n.ring} strokeWidth="2" />
            <foreignObject x={n.x - 14} y={n.y - 14} width="28" height="28">
              <div className="w-full h-full flex items-center justify-center text-[#1A2016]">
                <IconComponent className="w-6 h-6 text-[#1A2016]" />
              </div>
            </foreignObject>
            <text
              x={n.x}
              y={n.y + 52}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#1A2016"
              fontFamily="'Inter', sans-serif"
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
