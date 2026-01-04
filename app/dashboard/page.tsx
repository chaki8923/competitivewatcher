import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // ユーザープロフィールを取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  // 監視サイトを取得
  const { data: sites } = await supabase
    .from("monitored_sites")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <DashboardClient
      user={session.user}
      profile={profile}
      sites={sites || []}
    />
  );
}

