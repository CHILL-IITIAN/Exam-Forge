import { Link } from "react-router-dom";
import { useTestsStore } from "@/stores/testsStore";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { formatDuration } from "@/lib/time";

export default function ExamHub() {
  const tests = useTestsStore((s) => s.tests);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h2 className="text-[22px] font-semibold tracking-[-0.025em]">Exam Engine</h2>
        <p className="text-[13.5px] text-muted mt-1">Pick a test to enter full-screen exam mode.</p>
      </header>

      {tests.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            title="No tests to take"
            description="Create a test first, or load the starter pack from your Tests library."
            action={<Link to="/tests"><Button>Go to My Tests</Button></Link>}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tests.map((t) => (
            <div key={t.id} className="bg-elevated border border-DEFAULT rounded-2xl p-5 flex flex-col gap-4 hover:border-strong transition">
              <div className="flex items-start justify-between gap-2">
                <Pill tone="info">{t.subject}</Pill>
                <span className="text-[11px] text-dim font-mono">{formatDuration(t.durationSec)}</span>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight">{t.title}</h3>
                <p className="text-[12px] text-dim mt-1">{t.questions.length} questions</p>
              </div>
              <Link to={`/exam/${t.id}`} className="mt-auto">
                <Button className="w-full">Start exam →</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
