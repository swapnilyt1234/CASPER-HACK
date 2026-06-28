import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Dashboard · DeRisk Vault" },
      { name: "description", content: "Live DeRisk Vault dashboard: premium rate, underwriting status, contract verification, vault operations, and the AI Sentinel audit trail." },
    ],
  }),
  component: Dashboard,
});
