import { BookOpen, User, Sparkles } from 'lucide-react';
import type { AIPrediction, UserPrediction } from '@/types';

interface PredictionComparisonProps {
  userPrediction: UserPrediction;
  aiPrediction: AIPrediction;
}

export function PredictionComparison({ userPrediction, aiPrediction }: PredictionComparisonProps) {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        관측 및 추론 비교
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Side */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-5 rounded-2xl h-full">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-bold text-gray-900">나의 생각</span>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">판단 근거</span>
                <p className="text-sm text-gray-700 mt-1">
                  {userPrediction.reason || <span className="text-gray-400 italic">입력 없음</span>}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <span className="text-xs font-semibold text-blue-500 uppercase">과학적 추론</span>
                <p className="text-sm text-gray-700 mt-1">
                  {userPrediction.scientificReasoning || <span className="text-gray-400 italic">작성하지 않음</span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Side */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-5 rounded-2xl h-full border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-900">AI의 피드백</span>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase">시각적 분석 피드백</span>
                <p className="text-sm text-blue-800 mt-1">
                  {aiPrediction.detailedCritique}
                </p>
              </div>
              {aiPrediction.scientificFeedback && (
                <div className="pt-3 border-t border-blue-200">
                  <span className="text-xs font-semibold text-indigo-500 uppercase">과학적 추론 피드백</span>
                  <p className="text-sm text-blue-800 mt-1">
                    {aiPrediction.scientificFeedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
