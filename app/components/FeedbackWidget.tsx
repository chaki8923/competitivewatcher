"use client";

import { useState, useEffect, useRef } from "react";
import { MdFeedback, MdClose, MdSend, MdThumbUp, MdCheck } from "react-icons/md";
import { HiLightBulb } from "react-icons/hi";

type Feedback = {
  id: string;
  title: string;
  description: string;
  status: string;
  likes_count: number;
  liked_by_user: boolean;
  created_at: string;
};

type Props = {
  isAdmin: boolean;
};

export default function FeedbackWidget({ isAdmin }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"list" | "create">("list");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && view === "list") {
      fetchFeedbacks();
    }
  }, [isOpen, view]);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/feedback");
      const data = await response.json();
      setFeedbacks(data.feedback || []);
    } catch (error) {
      console.error("フィードバック取得エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        setTitle("");
        setDescription("");
        setView("list");
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("投稿エラー:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (feedbackId: string) => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("いいねエラー:", error);
    }
  };

  const handleResolve = async (feedbackId: string) => {
    if (!confirm("この要望を解決済みにしますか？")) return;

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/resolve`, {
        method: "POST",
      });

      if (response.ok) {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("解決済み設定エラー:", error);
    }
  };

  return (
    <>
      {/* フローティングボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-full shadow-2xl hover:from-primary-700 hover:to-primary-800 transition-all z-50 flex items-center space-x-2 hover:scale-110"
      >
        {isOpen ? <MdClose className="text-2xl" /> : <HiLightBulb className="text-2xl" />}
        {!isOpen && <span className="font-medium pr-2">要望・提案</span>}
      </button>

      {/* ウィジェット */}
      {isOpen && (
        <div ref={widgetRef} className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200 animate-slideUp">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HiLightBulb className="text-2xl" />
              <div>
                <h3 className="font-bold text-lg">要望・提案</h3>
                <p className="text-xs text-primary-100">お気軽にご意見をお寄せください</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition"
            >
              <MdClose className="text-xl" />
            </button>
          </div>

          {/* タブ */}
          <div className="flex border-b">
            <button
              onClick={() => setView("list")}
              className={`flex-1 py-3 text-sm font-medium transition ${
                view === "list"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              みんなの要望
            </button>
            <button
              onClick={() => setView("create")}
              className={`flex-1 py-3 text-sm font-medium transition ${
                view === "create"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              新規投稿
            </button>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-4">
            {view === "list" ? (
              loading ? (
                <div className="text-center py-8 text-gray-500">読み込み中...</div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8">
                  <HiLightBulb className="text-5xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">まだ要望がありません</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className={`bg-gray-50 rounded-lg p-3 border transition hover:shadow-md ${
                        feedback.status === "resolved"
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm flex-1 text-gray-900">{feedback.title}</h4>
                        {feedback.status === "resolved" && (
                          <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <MdCheck className="text-sm" />
                            <span>解決済み</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {feedback.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleLike(feedback.id)}
                          className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition ${
                            feedback.liked_by_user
                              ? "bg-primary-100 text-primary-700"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          <MdThumbUp className="text-sm" />
                          <span>{feedback.likes_count}</span>
                        </button>
                        {isAdmin && feedback.status === "open" && (
                          <button
                            onClick={() => handleResolve(feedback.id)}
                            className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                          >
                            解決済みにする
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例: スクショ比較機能が欲しい"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    詳細
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="どんな機能が欲しいか、詳しく教えてください"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !description.trim()}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdSend />
                  <span>{loading ? "送信中..." : "送信する"}</span>
                </button>
                <p className="text-xs text-gray-500 text-center">
                  送信すると開発者に通知が届きます
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
