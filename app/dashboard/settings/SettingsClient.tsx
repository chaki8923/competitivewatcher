"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email?: string;
};

type Profile = {
  notification_email: boolean;
  notification_slack: boolean;
  slack_webhook_url: string | null;
} | null;

type Props = {
  user: User;
  profile: Profile;
};

export default function SettingsClient({ user, profile }: Props) {
  const router = useRouter();
  const [notificationEmail, setNotificationEmail] = useState(
    profile?.notification_email ?? true
  );
  const [notificationSlack, setNotificationSlack] = useState(
    profile?.notification_slack ?? false
  );
  const [slackWebhookUrl, setSlackWebhookUrl] = useState(
    profile?.slack_webhook_url ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notification_email: notificationEmail,
          notification_slack: notificationSlack,
          slack_webhook_url: slackWebhookUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "保存に失敗しました");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-primary-600"
            >
              Track On
            </Link>
            <span className="text-sm text-gray-600">{user.email}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:underline text-sm"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">設定</h1>

        {/* 通知設定 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            通知設定
          </h2>

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
              設定を保存しました
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* メール通知 */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="notification_email"
                checked={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <div className="ml-3">
                <label
                  htmlFor="notification_email"
                  className="font-medium text-gray-900 cursor-pointer"
                >
                  メール通知を受け取る
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  変更検知時にメールで通知します
                </p>
              </div>
            </div>

            {/* Slack通知 */}
            <div>
              <div className="flex items-start mb-3">
                <input
                  type="checkbox"
                  id="notification_slack"
                  checked={notificationSlack}
                  onChange={(e) => setNotificationSlack(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="ml-3">
                  <label
                    htmlFor="notification_slack"
                    className="font-medium text-gray-900 cursor-pointer"
                  >
                    Slack通知を受け取る
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    変更検知時にSlackに通知します
                  </p>
                </div>
              </div>

              {notificationSlack && (
                <div className="ml-7">
                  <label
                    htmlFor="slack_webhook_url"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Slack Webhook URL
                  </label>
                  <input
                    type="url"
                    id="slack_webhook_url"
                    value={slackWebhookUrl}
                    onChange={(e) => setSlackWebhookUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="https://hooks.slack.com/services/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <a
                      href="https://api.slack.com/messaging/webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Webhook URLの取得方法
                    </a>
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

