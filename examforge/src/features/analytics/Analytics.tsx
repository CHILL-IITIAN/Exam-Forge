import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStats } from "@/features/dashboard/useStats";
import { useAttemptsStore } from "@/stores/attemptsStore";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function Analytics() {
  const stats = useStats();
  const attempts = useAttemptsStore((s) => s.attempts);

  // accuracy over time series
  const series = useMemo(() => {
    const sorted = [...attempts].sort((a, b) => a.submittedAt - b.submittedAt);
    return sorted.map((a) => ({
      ts: a.submittedAt,
      pct: a.correctCount + a.wrongCount > 0 ? a.correctCount / (a.correctCount + a.wrongCount) : 0,
      title: a.testTitle,
    }));
  }, [attempts]);

  if (stats.totalAttempts === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <header className="mb-6">
          <h2 className="text-[22px] font-semibold tracking-[-0.025em]">Analytics</h2>
          <p className="text-[13.5px] text-muted mt-1">Premium insight layer — needs at least one attempt to come alive.</p>
        </header>
        <Card padded={false}>
          <EmptyState
            title="No data yet"
            description="Take a test (or load the starter pack) and your analytics will appear here."
            action={<Link to="/tests"><Button>Go to My Tests</Button></Link>}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h2 className="text-[22px] font-semibold tracking-[-0.025em]">Analytics</h2>
        <p className="text-[13.5px] text-muted mt-1">
          {stats.totalAttempts} attempt{stats.totalAttempts === 1 ? "" : "s"} analyzed.
        </p>
      </header>

      <Card title="Accuracy trend" badge="every attempt" className="mb-3.5">
        <TrendChart series={series} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-3.5">
        <Card title="Subject performance">
          <div className="space-y-3">
            {stats.subjectAccuracy.map((s) => (
              <div key={s.subject}>
                <div className="flex items-center justify-between text-[13px]">
                  <span>{s.subject}</span>
                  <span className="font-mono text-dim">{(s.accuracy * 100).toFixed(0)}% · {s.total} Qs</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-bg overflow-hidden">
                  <div
                    className={`h-full ${s.accuracy >= 0.7 ? "bg-emerald-500" : s.accuracy >= 0.5 ? "bg-amber-500" : "bg-red"}`}
                    style={{ width: `${Math.max(4, s.accuracy * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Consistency · last 14 days">
          <Heatmap counts={stats.weeklyCounts} />
        </Card>
      </div>
    </div>
  );
}

function TrendChart({ series }: { series: { ts: number; pct: number; title: string }[] }) {
  if (series.length === 0) return <p className="text-dim text-[13px]">No data.</p>;
  const W = 600, H = 160, PAD = 24;
  const step = series.length === 1 ? 0 : (W - PAD * 2) / (series.length - 1);
  const points = series.map((s, i) => ({ x: PAD + i * step, y: H - PAD - s.pct * (H - PAD * 2) }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H - PAD} L ${points[0].x} ${H - PAD} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px]">
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={PAD} x2={W - PAD} y1={H - PAD - g * (H - PAD * 2)} y2={H - PAD - g * (H - PAD * 2)} stroke="rgba(255,255,255,0.05)" />
        ))}
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(225,29,46,0.35)" />
            <stop offset="100%" stopColor="rgba(225,29,46,0)" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#trendFill)" />
        <path d={pathD} fill="none" stroke="rgb(225,29,46)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="rgb(255,59,77)" stroke="#0E0E11" strokeWidth="2">
            <title>{`${series[i].title}: ${(series[i].pct * 100).toFixed(0)}%`}</title>
          </circle>
        ))}
        {[0, 0.5, 1].map((g) => (
          <text key={g} x={4} y={H - PAD - g * (H - PAD * 2) + 4} fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="monospace">
            {(g * 100).toFixed(0)}%
          </text>
        ))}
      </svg>
    </div>
  );
}

function Heatmap({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {counts.map((v, i) => {
          const intensity = v / max;
          const bg = v === 0
            ? "rgba(255,255,255,0.04)"
            : `rgba(225,29,46,${0.15 + intensity * 0.7})`;
          return (
            <div
              key={i}
              className="aspect-square rounded-md border border-DEFAULT"
              style={{ background: bg }}
              title={`${v} attempt${v === 1 ? "" : "s"}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-dim font-mono">
        <span>14d ago</span>
        <span>today</span>
      </div>
    </div>
  );
}
