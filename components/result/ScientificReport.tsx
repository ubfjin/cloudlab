import { Brain } from 'lucide-react';
import type { AIPrediction } from '@/types';

interface ScientificReportProps {
  prediction: AIPrediction;
}

export function ScientificReport({ prediction }: ScientificReportProps) {
  if (!prediction.educationalContent) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-900">
        <Brain className="w-6 h-6 text-indigo-600" />
        과학적 분석 리포트
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
            🌥️
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 mb-1">생성 원리</div>
            <p className="text-gray-600 leading-relaxed text-sm">{prediction.educationalContent.formation}</p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
            🌡️
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 mb-1">대기 상태 분석</div>
            <p className="text-gray-600 leading-relaxed text-sm">{prediction.educationalContent.atmosphere}</p>
          </div>
        </div>

        <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
            ☔
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 mb-1">예상 날씨</div>
            <p className="text-gray-600 leading-relaxed text-sm">{prediction.educationalContent.weather}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
