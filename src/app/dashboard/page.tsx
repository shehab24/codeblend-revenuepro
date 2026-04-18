import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardRouter() {
  const user = await currentUser();

  // If no user is logged in, send them to sign-in
  if (!user) {
    redirect("/sign-in");
  }

  // Check the role stored in Clerk's publicMetadata
  const role = user.publicMetadata?.role;

  // Redirect based on role
  if (role === "admin" || role === "ADMIN") {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/user");
  }
}
