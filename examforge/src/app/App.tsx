import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "@/features/auth/Landing";
import Login from "@/features/auth/Login";
import Signup from "@/features/auth/Signup";
import AuthGuard from "@/features/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/features/dashboard/Dashboard";
import TestsLibrary from "@/features/tests/TestsLibrary";
import TestBuilder from "@/features/tests/TestBuilder";
import ExamHub from "@/features/exam/ExamHub";
import ExamRunner from "@/features/exam/ExamRunner";
import Results from "@/features/results/Results";
import History from "@/features/history/History";
import Analytics from "@/features/analytics/Analytics";
import Reflection from "@/features/reflection/Reflection";
import ExamShell from "@/components/layout/ExamShell";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"       element={<Landing />} />
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected app (with sidebar) */}
      <Route element={<AuthGuard />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard"          element={<Dashboard />} />
          <Route path="/tests"              element={<TestsLibrary />} />
          <Route path="/tests/new"          element={<TestBuilder />} />
          <Route path="/tests/:id/edit"     element={<TestBuilder />} />
          <Route path="/exam"               element={<ExamHub />} />
          <Route path="/results/:attemptId" element={<Results />} />
          <Route path="/history"            element={<History />} />
          <Route path="/analytics"          element={<Analytics />} />
          <Route path="/reflection"         element={<Reflection />} />
        </Route>

        {/* Full-screen exam mode (no sidebar) */}
        <Route element={<ExamShell />}>
          <Route path="/exam/:testId" element={<ExamRunner />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
