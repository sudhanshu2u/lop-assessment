"use client";

interface Props {
  value: number; // 0-100
  size?: number;
}

export default function MaturityGauge({ value, size = 80 }: Props) {
  const r = (size / 2) * 0.75;
  const cx = size / 2;
  const cy = size / 2 + size * 0.1;
  const startAngle = -210;
  const totalAngle = 240;
  const angle = startAngle + (value / 100) * totalAngle;

  function polar(deg: number, radius: number) {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function arcPath(startDeg: number, endDeg: number, radius: number) {
    const s = polar(startDeg, radius);
    const e = polar(endDeg, radius);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const color =
    value >= 70 ? "#059669" : value >= 40 ? "#f59e0b" : "#dc2626";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.7}>
        {/* Background arc */}
        <path
          d={arcPath(startAngle, startAngle + totalAngle, r)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={size * 0.1}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {value > 0 && (
          <path
            d={arcPath(startAngle, angle, r)}
            fill="none"
            stroke={color}
            strokeWidth={size * 0.1}
            strokeLinecap="round"
          />
        )}
        {/* Center text */}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={size * 0.2}
          fontWeight={700}
          fill="#111827"
        >
          {value}
        </text>
      </svg>
    </div>
  );
}
