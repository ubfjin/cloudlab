import { BarChart3 } from 'lucide-react';
import type { AIPrediction } from '@/types';

interface CloudStateAnalysisProps {
  prediction: AIPrediction;
}

export function CloudStateAnalysis({ prediction }: CloudStateAnalysisProps) {
  if (!prediction.cloudState) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-indigo-700 pb-3">
        <BarChart3 className="w-5 h-5 text-indigo-300" />
        구름 상태 정밀 분석
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Development Stage</div>
          <div className="text-3xl font-bold mb-2">{prediction.cloudState.state}</div>
          <div className="text-indigo-200 text-sm">
            {prediction.cloudState.transition ? `현재 ${prediction.cloudState.transition} 과정에 있습니다.` : '전형적인 상태를 유지하고 있습니다.'}
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm leading-relaxed text-indigo-100">
            "{prediction.cloudState.stateReason}"
          </p>
        </div>
      </div>
    </div>
  );
}
