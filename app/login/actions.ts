"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const supabase = createServerActionClient({ cookies });
  const admin = createAdminClient();

  // 1. Check if locked
  const { data: attempt } = await admin
    .from("login_attempts")
    .select("*")
    .eq("email", email)
    .single();

  if (attempt?.is_locked) {
    return { error: "アカウントがロックされています。解除には管理者への連絡が必要です。" };
  }

  // 2. Attempt login
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // 3. Increment attempts
    const newAttempts = (attempt?.attempts || 0) + 1;
    const isLocked = newAttempts >= 5;

    const { error: upsertError } = await admin
      .from("login_attempts")
      .upsert({
        email,
        attempts: newAttempts,
        is_locked: isLocked,
        last_attempt_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (upsertError) {
      console.error("Login attempt update failed:", upsertError);
    }

    if (isLocked) {
      return { error: "アカウントがロックされました（5回失敗）。解除には管理者への連絡が必要です。" };
    }

    // Rate limit error handling
    if (error.message.includes("rate limit")) {
      return { error: "アクセスが集中しています。少し時間をおいてから再度お試しください。" };
    }

    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  // 4. Reset attempts on success
  if (attempt) {
    // Reset count and unlock
    await admin
      .from("login_attempts")
      .update({ attempts: 0, is_locked: false })
      .eq("email", email);
  }

  redirect("/dashboard");
}
