import { Sparkles } from 'lucide-react';
import type { AIPrediction } from '@/types';

interface ScoreCardProps {
  prediction: AIPrediction;
  isMatch: boolean;
}

export function ScoreCard({ prediction, isMatch }: ScoreCardProps) {
  if (prediction.score === undefined) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.01]">
      <div className="bg-white rounded-xl p-6 text-center">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Observation Score</div>
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Sparkles
              key={star}
              className={`w-6 h-6 ${star <= prediction.score! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
            />
          ))}
        </div>
        <div className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
          {prediction.score}
          <span className="text-xl text-gray-400 font-normal"> / 5</span>
        </div>
        <p className="text-gray-600 font-medium text-lg mb-4">
          "{prediction.gradingFeedback}"
        </p>

        <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
            참여 +{prediction.scoreBreakdown?.participation ?? 1}
          </span>
          <span className={`px-3 py-1 rounded-full border ${isMatch ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
            종류 정답 +{prediction.scoreBreakdown?.typeMatch ?? (isMatch ? 1 : 0)}
          </span>
          <span className={`px-3 py-1 rounded-full border ${((prediction.scoreBreakdown?.visual || 0) > 0) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
            시각적 근거 +{prediction.scoreBreakdown?.visual ?? 0}
          </span>
          <span className={`px-3 py-1 rounded-full border ${((prediction.scoreBreakdown?.scientific || 0) > 0) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
            과학적 추론 +{prediction.scoreBreakdown?.scientific ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
