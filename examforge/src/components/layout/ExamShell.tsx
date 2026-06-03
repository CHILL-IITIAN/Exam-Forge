import { Outlet } from "react-router-dom";
import { useSessionBootstrap } from "@/features/auth/useSessionBootstrap";

/** No sidebar / no chrome — pure exam atmosphere. */
export default function ExamShell() {
  useSessionBootstrap();
  return <Outlet />;
}
