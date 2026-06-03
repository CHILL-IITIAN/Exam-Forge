import type { Test, Question, Subject } from "@/types/test";
import type { Attempt, AnswerRecord } from "@/types/attempt";
import { uid } from "@/lib/ids";

/** A small but realistic set of demo tests + a few past attempts. */

function q(
  type: Question["type"],
  stem: string,
  partial: Partial<Question>
): Question {
  const base = {
    id: uid("q"),
    stem,
    marks: 4,
    negativeMarks: 1,
    explanation: undefined as string | undefined,
  };
  if (type === "mcq") return { ...base, type, options: [], correct: 0, ...partial } as Question;
  if (type === "multi") return { ...base, type, options: [], correct: [], ...partial } as Question;
  return { ...base, type, correct: 0, ...partial } as Question;
}

function makeTest(
  ownerId: string,
  title: string,
  subject: Subject,
  durationMin: number,
  questions: Question[]
): Test {
  const now = Date.now();
  return {
    id: uid("t"),
    ownerId,
    title,
    subject,
    durationSec: durationMin * 60,
    instructions: "Mark for review allowed. Negative marking applies.",
    questions,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildSampleTests(ownerId: string): Test[] {
  const physics = makeTest(ownerId, "JEE Mock — Kinematics Sprint", "Physics", 30, [
    q("mcq", "A ball is thrown vertically up with 20 m/s. Time to reach max height (g = 10 m/s²)?", {
      options: ["1 s", "2 s", "3 s", "4 s"],
      correct: 1,
      topic: "Kinematics",
      explanation: "v = u − gt → 0 = 20 − 10t → t = 2 s.",
    }),
    q("mcq", "Two cars approach each other at 30 and 50 km/h. Relative velocity?", {
      options: ["20 km/h", "40 km/h", "80 km/h", "1500 km/h"],
      correct: 2,
      topic: "Relative Motion",
    }),
    q("integer", "A body falls freely from 80 m. Time to reach ground (g=10). Enter seconds.", {
      correct: 4,
      topic: "Free Fall",
    }),
    q("mcq", "Projectile launched at 45° has range R. At 30° (same speed) range is?", {
      options: ["R", "R√3/2", "R/2", "2R/√3"],
      correct: 1,
      topic: "Projectile",
    }),
  ]);

  const chem = makeTest(ownerId, "Inorganic Drill — Coordination Compounds", "Chemistry", 20, [
    q("mcq", "EAN of [Fe(CN)₆]⁴⁻?", {
      options: ["34", "36", "30", "32"],
      correct: 1,
      topic: "Coordination",
    }),
    q("multi", "Which are paramagnetic?", {
      options: ["[Ni(CN)₄]²⁻", "[NiCl₄]²⁻", "[Fe(H₂O)₆]³⁺", "[Co(NH₃)₆]³⁺"],
      correct: [1, 2],
      topic: "Magnetism",
    }),
    q("mcq", "IUPAC name of K₄[Fe(CN)₆]?", {
      options: [
        "Potassium hexacyanoferrate(II)",
        "Potassium hexacyanoferrate(III)",
        "Potassium ferrocyanide(III)",
        "Tetrapotassium ferrocyanide",
      ],
      correct: 0,
    }),
  ]);

  const bio = makeTest(ownerId, "NEET Bio Sprint — Cell Cycle", "Biology", 25, [
    q("mcq", "Synaptonemal complex is formed during?", {
      options: ["Leptotene", "Zygotene", "Pachytene", "Diplotene"],
      correct: 1,
      topic: "Meiosis",
    }),
    q("mcq", "DNA replication occurs in?", {
      options: ["G1", "S", "G2", "M"],
      correct: 1,
      topic: "Cell Cycle",
    }),
    q("integer", "How many chromatids are in a human cell at metaphase? Enter integer.", {
      correct: 92,
    }),
  ]);

  const maths = makeTest(ownerId, "Calculus — Integration Warmup", "Mathematics", 25, [
    q("mcq", "∫ sin²x dx = ?", {
      options: ["x/2 − sin2x/4 + C", "x/2 + sin2x/4 + C", "cos2x/2 + C", "−cos2x/2 + C"],
      correct: 0,
      topic: "Integration",
    }),
    q("integer", "Value of ∫₀^π sin x dx (enter integer).", {
      correct: 2,
    }),
    q("mcq", "d/dx (ln(sec x + tan x)) = ?", {
      options: ["sec x", "tan x", "sec x · tan x", "sec²x"],
      correct: 0,
    }),
  ]);

  return [physics, chem, bio, maths];
}

/**
 * Build a few plausible past attempts so the dashboard has real numbers
 * to display immediately after seeding.
 */
export function buildSampleAttempts(ownerId: string, tests: Test[]): Attempt[] {
  const attempts: Attempt[] = [];
  const now = Date.now();
  const day = 86400_000;

  // Predefined plausible results spread across the last 12 days
  const recipes: Array<{ testIdx: number; daysBack: number; correctRate: number; speed: number }> = [
    { testIdx: 0, daysBack: 0,  correctRate: 0.75, speed: 110 },
    { testIdx: 1, daysBack: 1,  correctRate: 0.66, speed: 95  },
    { testIdx: 2, daysBack: 2,  correctRate: 0.83, speed: 78  },
    { testIdx: 3, daysBack: 4,  correctRate: 0.50, speed: 130 },
    { testIdx: 0, daysBack: 5,  correctRate: 0.60, speed: 120 },
    { testIdx: 2, daysBack: 7,  correctRate: 0.72, speed: 85  },
    { testIdx: 1, daysBack: 10, correctRate: 0.45, speed: 140 },
  ];

  for (const r of recipes) {
    const test = tests[r.testIdx];
    if (!test) continue;
    const submittedAt = now - r.daysBack * day - 3600_000;
    const startedAt = submittedAt - test.durationSec * 1000 * 0.8;

    const answers: Record<string, AnswerRecord> = {};
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let scoreObtained = 0;
    let scoreMax = 0;

    test.questions.forEach((qn, i) => {
      scoreMax += qn.marks;
      // Deterministic but varied: every 4th is skipped, rest by correctRate seed
      const shouldSkip = (i + r.daysBack) % 5 === 0;
      if (shouldSkip) {
        skipped++;
        answers[qn.id] = {
          questionId: qn.id,
          value: null,
          isCorrect: false,
          marked: false,
          timeSpentSec: r.speed * 0.4,
        };
        return;
      }
      const isCorrect = ((i * 17 + r.daysBack) % 100) / 100 < r.correctRate;
      if (isCorrect) {
        correct++;
        scoreObtained += qn.marks;
      } else {
        wrong++;
        scoreObtained -= qn.negativeMarks;
      }
      answers[qn.id] = {
        questionId: qn.id,
        value: isCorrect
          ? (qn.type === "mcq" ? qn.correct : qn.type === "multi" ? qn.correct : qn.correct)
          : (qn.type === "mcq" ? (qn.correct + 1) % qn.options.length
             : qn.type === "multi" ? [0]
             : (qn.correct as number) + 1),
        isCorrect,
        marked: i % 6 === 0,
        timeSpentSec: r.speed + ((i % 3) - 1) * 10,
      };
    });

    attempts.push({
      id: uid("a"),
      ownerId,
      testId: test.id,
      testTitle: test.title,
      subject: test.subject,
      startedAt,
      submittedAt,
      durationUsedSec: Math.round(test.durationSec * (0.65 + (r.daysBack % 3) * 0.05)),
      totalQuestions: test.questions.length,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      scoreObtained,
      scoreMax,
      answers,
    });
  }

  return attempts;
}
