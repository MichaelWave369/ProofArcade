import { createFileRoute } from "@tanstack/react-router";
import { InstrumentLab } from "@/components/instrument-lab";

export const Route = createFileRoute("/lab")({ component: LabPage });

function LabPage() {
  return <InstrumentLab />;
}
