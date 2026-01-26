import { Info } from 'lucide-react';

export function InfoBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="mb-1">
            <strong>실제 AI 분석:</strong> OpenAI GPT-4 Vision API를 사용하여 구름 사진을 실시간으로 분석합니다.
          </p>
          <p className="text-xs text-blue-600">
            10가지 구름 종류 (권운, 권적운, 권층운, 고적운, 고층운, 층운, 층적운, 적운, 적란운, 난층운) 중에서 가장 적합한 종류를 판별합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
