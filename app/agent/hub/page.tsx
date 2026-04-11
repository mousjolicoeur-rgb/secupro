import { redirect } from "next/navigation";

/** /agent/hub → le vrai Hub est à /agent/activate */
export default function HubRedirectPage() {
  redirect("/agent/activate");
}
