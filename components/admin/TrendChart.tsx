import type { DailyCount } from "@/lib/admin-insights";

// نمودار میله‌ای سادهٔ SVG، بدون کتابخانهٔ چارت — کاملاً سمت سرور رندر
// می‌شه (بدون نیاز به هیدریت/جاوااسکریپت کلاینت). رنگ‌ها از همون متغیرهای
// CSS سایت (globals.css) میان تا با ظاهر فعلی هماهنگ بمونه.
export default function TrendChart({
  data,
  height = 120,
}: {
  data: DailyCount[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const barWidth = 100 / data.length;
  const gap = barWidth * 0.25;

  return (
    <div>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="h-24 w-full overflow-visible"
        role="img"
        aria-label="روند بازدید ۱۴ روز اخیر"
      >
        {data.map((d, i) => {
          const barHeight = (d.count / max) * (height - 20);
          const x = i * barWidth + gap / 2;
          const width = barWidth - gap;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={height - barHeight - 16}
                width={width}
                height={Math.max(barHeight, d.count > 0 ? 2 : 0)}
                rx={1}
                fill="var(--accent)"
                opacity={0.85}
              />
              <text
                x={x + width / 2}
                y={height - 4}
                textAnchor="middle"
                fontSize="6"
                fill="var(--muted-light)"
              >
                {new Date(d.date).toLocaleDateString("fa-IR-u-ca-persian", { day: "numeric" })}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
