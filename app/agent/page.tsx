import { redirect } from "next/navigation";

/** Legacy /agent → code entry lives at /agent/activate */
export default function AgentPage() {
  redirect("/agent/activate");
}
