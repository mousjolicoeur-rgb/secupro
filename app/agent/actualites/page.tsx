import { redirect } from "next/navigation";

/** /agent/actualites — en attente du module d'actualités */
export default function ActualitesPage() {
  redirect("/agent/activate");
}
