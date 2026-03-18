import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Brain, Camera, Loader2, Sparkles } from 'lucide-react';
import { apiRequest } from '../utils/auth';
import type { CloudType } from '../types';
import { PredictionComparison } from './result/PredictionComparison';

interface Observation {
  imageUrl: string;
  userPrediction: {
    cloudType: CloudType;
    reason: string;
    date?: string;
    time?: string;
    location?: string;
    weather?: string;
    scientificReasoning?: string;
  };
  aiPrediction: {
    cloudType: CloudType;
    reason: string;
    confidence?: number;
    score?: number;
    detailedCritique?: string;
    scientificFeedback?: string;
    scoreBreakdown?: {
      participation: number;
      typeMatch: number;
      visual: number;
      scientific: number;
    };
  };
  scientificReasoning?: string; // Sometimes flattened by the API router
  userId: string;
  createdAt: string;
}

interface HistoryPageProps {
  onBack: () => void;
  accessToken: string | null;
  targetUserId?: string;
  targetUserEmail?: string;
}

export function HistoryPage({ onBack, accessToken, targetUserId, targetUserEmail }: HistoryPageProps) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadObservations();
  }, []);

  const loadObservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const options = accessToken ? { token: accessToken } : {};
      
      let url = '/observations';
      if (targetUserId) {
        url += `?userId=${targetUserId}`;
      }
      
      const data = await apiRequest(url, options);

      console.log('📊 Loaded observations:', data.observations);

      // Sort by date, newest first
      const sorted = (data.observations || []).sort((a: Observation, b: Observation) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setObservations(sorted);
    } catch (err) {
      console.error('Failed to load observations:', err);
      setError('기록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate total score from loaded observations
  const totalScore = observations.reduce((sum, obs) => sum + (obs.aiPrediction.score || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Camera className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl text-gray-900 font-bold">
              {targetUserEmail ? `${targetUserEmail}님의 기록` : '이전 기록'}
            </h1>
          </div>
          <p className="text-gray-600">
            {targetUserEmail ? '학생의 과거 관찰 통계 및 세부 기록입니다.' : '과거에 관측한 구름 기록을 확인하세요'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">기록을 불러오는 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadObservations}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && observations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-600">아직 관측 기록이 없습니다</h3>
            <p className="text-gray-500 mb-6">구름 사진을 업로드하고 분석해보세요!</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              관측 시작하기
            </button>
          </div>
        )}

        {/* Observations Grid */}
        {!loading && !error && observations.length > 0 && (
          <div className="space-y-6">
            {observations.map((obs, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-3 gap-6 p-6">
                  {/* Cloud Image */}
                  <div className="md:col-span-1">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative shadow-sm border border-gray-100">
                      <img
                        src={obs.imageUrl}
                        alt="구름 사진"
                        className="w-full h-full object-cover"
                      />
                      {obs.aiPrediction.score !== undefined && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-sm font-bold text-indigo-600 border border-indigo-100 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {obs.aiPrediction.score}점
                        </div>
                      )}
                    </div>

                    {/* Metadata Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div>
                        <span className="font-semibold text-gray-700">📍 위치:</span> <br />{obs.userPrediction.location || '-'}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">☀️ 날씨:</span> <br />{obs.userPrediction.weather || '-'}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">📅 일자:</span> <br />{obs.userPrediction.date || '-'}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">⏰ 시간:</span> <br />{obs.userPrediction.time || '-'}
                      </div>
                    </div>
                    
                    {/* Small Score Breakdown */}
                    {obs.aiPrediction.score !== undefined && (
                      <div className="mt-3 bg-indigo-50/50 rounded-lg p-3 text-xs text-indigo-900 border border-indigo-100">
                        <div className="font-semibold mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          점수 상세 ({obs.aiPrediction.score}/5점)
                        </div>
                        <ul className="space-y-1 text-indigo-700/80">
                          {obs.aiPrediction.scoreBreakdown ? (
                            <>
                              <li>• 참여 기본 점수: +{obs.aiPrediction.scoreBreakdown.participation}</li>
                              <li>• 구름 종류 {obs.userPrediction.cloudType === obs.aiPrediction.cloudType ? '일치' : '불일치'}: +{obs.aiPrediction.scoreBreakdown.typeMatch}</li>
                              <li>• 시각적 근거 평가: +{obs.aiPrediction.scoreBreakdown.visual}</li>
                              <li>• 과학적 추론 평가: +{obs.aiPrediction.scoreBreakdown.scientific}</li>
                            </>
                          ) : (
                            <>
                              {/* Fallback for older records without saved breakdown */}
                              <li>• 참여 기본 점수: +1</li>
                              <li>• 구름 종류 {obs.userPrediction.cloudType === obs.aiPrediction.cloudType ? '일치: +1' : '불일치: +0'}</li>
                              <li>• 시각/과학적 근거 평가: +{obs.aiPrediction.score - 1 - (obs.userPrediction.cloudType === obs.aiPrediction.cloudType ? 1 : 0)}</li>
                              <li className="text-gray-400 italic mt-1 text-[10px]">* 과도기 이전 기록입니다.</li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Predictions & Comparison */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <p className="text-sm text-gray-600 font-semibold">내 분석 구름</p>
                        </div>
                        <p className="text-2xl text-blue-700 font-bold">{obs.userPrediction.cloudType}</p>
                      </div>
                      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <p className="text-sm text-gray-600 font-semibold">AI 판정 결과</p>
                        </div>
                        <p className="text-2xl text-purple-700 font-bold">{obs.aiPrediction.cloudType}</p>
                      </div>
                    </div>

                    <PredictionComparison
                      userPrediction={{
                        cloudType: obs.userPrediction.cloudType,
                        reason: obs.userPrediction.reason,
                        scientificReasoning: obs.userPrediction.scientificReasoning || obs.scientificReasoning
                      }}
                      aiPrediction={{
                        cloudType: obs.aiPrediction.cloudType,
                        description: obs.aiPrediction.reason || '',
                        confidence: obs.aiPrediction.confidence || 0,
                        detailedCritique: obs.aiPrediction.detailedCritique || obs.aiPrediction.reason || '시각적 피드백이 저장되지 않았습니다.',
                        scientificFeedback: obs.aiPrediction.scientificFeedback,
                        score: obs.aiPrediction.score,
                        scoreBreakdown: obs.aiPrediction.scoreBreakdown
                      }}
                    />
                  </div>
                </div>

                {/* Match Indicator */}
                {obs.userPrediction.cloudType === obs.aiPrediction.cloudType && (
                  <div className="bg-green-50 border-t border-green-100 px-6 py-3">
                    <p className="text-sm text-green-600 text-center">
                      ✅ 정답! AI와 동일한 판단을 했습니다
                    </p>
                  </div>
                )}
                {obs.userPrediction.cloudType !== obs.aiPrediction.cloudType && (
                  <div className="bg-orange-50 border-t border-orange-100 px-6 py-3">
                    <p className="text-sm text-orange-600 text-center">
                      💡 AI와 다른 판단 - 각각의 이유를 비교해보세요
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Statistics Summary */}
        {!loading && !error && observations.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
            <h3 className="text-xl mb-4">관측 통계</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl mb-1">{observations.length}</p>
                <p className="text-sm opacity-90">총 관측 횟수</p>
              </div>
              <div className="text-center">
                <p className="text-3xl mb-1">
                  {observations.filter(obs => obs.userPrediction.cloudType === obs.aiPrediction.cloudType).length}
                </p>
                <p className="text-sm opacity-90">AI와 일치</p>
              </div>
              <div className="text-center">
                <p className="text-3xl mb-1">{totalScore}</p>
                <p className="text-sm opacity-90">총 획득 점수</p>
              </div>
              <div className="text-center">
                <p className="text-3xl mb-1">
                  {new Set(observations.map(obs => obs.userPrediction.cloudType)).size}
                </p>
                <p className="text-sm opacity-90">관측한 구름 종류</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}