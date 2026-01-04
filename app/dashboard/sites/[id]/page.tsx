import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import SiteDetailClient from "./SiteDetailClient";

export default async function SiteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // サイト情報を取得
  const { data: site } = await supabase
    .from("monitored_sites")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single();

  if (!site) {
    notFound();
  }

  // 変更履歴を取得
  const { data: changes } = await supabase
    .from("site_changes")
    .select("*")
    .eq("site_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return <SiteDetailClient site={site} changes={changes || []} />;
}

