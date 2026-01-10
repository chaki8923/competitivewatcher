"use client";

type Props = {
  isOpen: boolean;
  siteName: string;
  progress: number; // 0-100
};

export default function CheckingModal({ isOpen, siteName, progress }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center max-w-md px-8">
        {/* アニメーションアイコン */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* 外側の回転リング */}
          <div className="absolute inset-0 border-4 border-primary-200 rounded-full animate-spin" 
               style={{ borderTopColor: 'rgb(14, 165, 233)', animationDuration: '2s' }} />
          
          {/* 内側の回転リング（逆方向） */}
          <div className="absolute inset-3 border-4 border-primary-300 rounded-full animate-spin" 
               style={{ borderBottomColor: 'rgb(14, 165, 233)', animationDuration: '1.5s', animationDirection: 'reverse' }} />
          
          {/* 中央のアイコン */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-primary-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* テキスト */}
        <h2 className="text-3xl font-bold text-white mb-4 animate-pulse">
          サイトをチェック中...
        </h2>
        
        <p className="text-primary-200 text-lg mb-6">
          {siteName}
        </p>

        {/* プログレスバー */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ステータステキスト */}
        <div className="text-sm text-gray-400 space-y-2">
          {progress < 30 && (
            <p className="animate-fadeIn">🌐 ページを読み込んでいます...</p>
          )}
          {progress >= 30 && progress < 60 && (
            <p className="animate-fadeIn">📊 コンテンツを分析しています...</p>
          )}
          {progress >= 60 && progress < 90 && (
            <p className="animate-fadeIn">🤖 AIで差分を解析中...</p>
          )}
          {progress >= 90 && (
            <p className="animate-fadeIn">✨ もう少しで完了です...</p>
          )}
        </div>

        {/* 注意書き */}
        <div className="mt-8 text-xs text-gray-500">
          <p>このページを閉じないでください</p>
        </div>
      </div>
    </div>
  );
}
