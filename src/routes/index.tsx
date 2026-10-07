import { createFileRoute } from "@tanstack/react-router";
import { Arcade } from "@/components/arcade";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Arcade />;
}