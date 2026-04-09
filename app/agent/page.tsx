import { redirect } from "next/navigation";

/** Ancienne URL /agent → racine (l’activation est sur /) */
export default function AgentPage() {
  redirect("/");
}
