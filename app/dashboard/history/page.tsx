import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const supabase = createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // ユーザーのサイト一覧を取得
  const { data: sites } = await supabase
    .from("monitored_sites")
    .select("id, name, url")
    .eq("user_id", session.user.id)
    .order("name");

  // チェック履歴を取得（最新50件）
  let history: any[] = [];
  
  if (sites && sites.length > 0) {
    const { data, error } = await supabase
      .from("site_check_history")
      .select(`
        *,
        monitored_sites (
          id,
          name,
          url
        )
      `)
      .in("site_id", sites.map(s => s.id))
      .order("checked_at", { ascending: false })
      .limit(50);
    
    if (error) {
      console.error("履歴取得エラー:", error);
    } else {
      history = data || [];
    }
  }

  return (
    <HistoryClient
      user={session.user}
      sites={sites || []}
      history={history}
    />
  );
}
