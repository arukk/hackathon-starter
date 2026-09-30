import { redirect } from "next/navigation";

/** Kept so old starter links (/protected) don't break. */
export default function ProtectedPage() {
  redirect("/dashboard");
}
