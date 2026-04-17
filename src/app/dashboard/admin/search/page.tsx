import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ClientSearch } from "./ClientSearch";

export default async function AdminSearchPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata?.role !== "admin") {
    redirect("/dashboard/user");
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Live Number Look-up</h2>
      <ClientSearch />
    </div>
  );
}
