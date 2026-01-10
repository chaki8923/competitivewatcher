"use client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  result: {
    hasChanges: boolean;
    importance?: 'high' | 'medium' | 'low';
    aiAnalysis?: {
      summary: string;
      intent: string;
      suggestions: string[];
    };
    diffResult?: {
      changesCount: number;
      changePercentage: number;
    };
  };
  siteName: string;
  siteId: string;
};

export default function CheckResultModal({ isOpen, onClose, result, siteName, siteId }: Props) {
  if (!isOpen) return null;

  const importanceConfig = {
    high: {
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: '🔴',
      label: '重要',
    },
    medium: {
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      icon: '🟡',
      label: '中',
    },
    low: {
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      icon: '🟢',
      label: '軽微',
    },
  };

  const config = result.importance ? importanceConfig[result.importance] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* ヘッダー */}
        <div className={`p-6 ${result.hasChanges ? `bg-gradient-to-r ${config?.color}` : 'bg-gradient-to-r from-gray-400 to-gray-500'} text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black opacity-10" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {result.hasChanges ? (
                  <>
                    <span className="text-4xl">{config?.icon}</span>
                    <h2 className="text-3xl font-bold">変更を検知しました！</h2>
                  </>
                ) : (
                  <>
                    <span className="text-4xl">✅</span>
                    <h2 className="text-3xl font-bold">変更なし</h2>
                  </>
                )}
              </div>
              <p className="text-white text-opacity-90 text-lg">{siteName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {result.hasChanges && result.aiAnalysis ? (
            <div className="space-y-6">
              {/* 統計情報 */}
              {result.diffResult && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-xl border-2 ${config?.borderColor} ${config?.bgColor}`}>
                    <div className="text-sm text-gray-600 mb-1">変更箇所</div>
                    <div className={`text-3xl font-bold ${config?.textColor}`}>
                      {result.diffResult.changesCount}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">箇所</div>
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${config?.borderColor} ${config?.bgColor}`}>
                    <div className="text-sm text-gray-600 mb-1">変更率</div>
                    <div className={`text-3xl font-bold ${config?.textColor}`}>
                      {result.diffResult.changePercentage}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">変更</div>
                  </div>
                </div>
              )}

              {/* 変更点の要約 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">📝</span>
                  <h3 className="text-xl font-bold text-gray-900">変更点</h3>
                </div>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {result.aiAnalysis.summary}
                </div>
              </div>

              {/* マーケ意図 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-2xl">🎯</span>
                  <h3 className="text-xl font-bold text-gray-900">マーケティング意図</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {result.aiAnalysis.intent}
                </p>
              </div>

              {/* 推奨施策 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-2xl">💡</span>
                  <h3 className="text-xl font-bold text-gray-900">推奨施策</h3>
                </div>
                <div className="space-y-3">
                  {result.aiAnalysis.suggestions.map((suggestion, i) => (
                    <div key={i} className="flex items-start space-x-3 bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 flex-1 pt-1">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                変更は検出されませんでした
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                前回のチェックから、{siteName}に変更はありませんでした。
              </p>
              <p className="text-sm text-gray-500">
                定期的に自動チェックを行っています。<br />
                変更があった場合は通知でお知らせします。
              </p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            閉じる
          </button>
          {result.hasChanges && (
            <button
              onClick={() => {
                window.location.href = `/dashboard/sites/${siteId}`;
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-medium shadow-lg"
            >
              詳細を見る →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
