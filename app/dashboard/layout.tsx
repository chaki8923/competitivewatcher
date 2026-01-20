import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FeedbackWidget from "../components/FeedbackWidget";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // 管理者かどうかを確認
  const { data: adminData } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", session.user.id)
    .single();

  const isAdmin = !!adminData;

  return (
    <>
      {children}
      <FeedbackWidget isAdmin={isAdmin} />
    </>
  );
}
