import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Cloud, Save, RefreshCw, BarChart3, AlertCircle, User, Sparkles } from 'lucide-react';
import type { CloudType, UserPrediction } from '../types';
import type { AuthUser } from '../utils/auth';
import { apiRequest } from '../utils/auth';


interface ResultPageProps {
  imageUrl: string;
  userPrediction: UserPrediction;
  onReset: () => void;
  user: AuthUser | null;
  accessToken: string | null;
  onLoginClick: () => void;
}

interface AIPrediction {
  cloudType: CloudType;
  confidence: number;
  description: string;
}

export function ResultPage({ imageUrl, userPrediction, onReset, user, accessToken, onLoginClick }: ResultPageProps) {
  const [aiPrediction, setAIPrediction] = useState<AIPrediction | null>(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState<{ totalObservations: number; correctPredictions: number; accuracy: number } | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Call real AI analysis
    analyzeCloud();
  }, []);

  useEffect(() => {
    // Load user stats if logged in
    if (user && accessToken) {
      loadStats();
    }
  }, [user, accessToken]);

  const analyzeCloud = async () => {
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch(
        '/api/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: imageUrl
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('AI analysis failed:', error);
        throw new Error(error.error || 'AI 분석에 실패했습니다');
      }

      const data = await response.json();

      if (!data.cloudType || !data.confidence || !data.description) {
        console.error('Invalid AI response:', data);
        throw new Error('AI 응답 형식이 올바르지 않습니다');
      }

      setAIPrediction({
        cloudType: data.cloudType,
        confidence: data.confidence,
        description: data.description
      });
    } catch (error: any) {
      console.error('AI analysis error:', error);
      setAnalysisError(error.message || 'AI 분석 중 오류가 발생했습니다');
    } finally {
      setAnalyzing(false);
    }
  };

  const useDemoMode = () => {
    setDemoMode(true);
    setAnalysisError(null);

    // Generate a random demo prediction
    const cloudTypes: CloudType[] = ['권운', '권적운', '권층운', '고적운', '고층운', '층운', '층적운', '적운', '적란운', '난층운'];
    const descriptions: Record<CloudType, string> = {
      '권운': '높은 고도(5-13km)에서 관찰되는 가늘고 섬세한 깃털 모양의 구름입니다. 빙정으로 이루어져 있으며 맑은 날씨를 나타냅니다.',
      '권적운': '높은 고도에 작고 둥근 구름 덩어리들이 물결 무늬나 비늘 모양으로 배열된 구름입니다.',
      '권층운': '높은 고도에서 하늘 전체를 얇게 덮는 막 형태의 구름으로, 해나 달 주위에 무리를 만들기도 합니다.',
      '고적운': '중간 고도(2-7km)에 나타나는 회백색의 둥근 구름 덩어리들이 무리를 지어 나타나는 구름입니다.',
      '고층운': '중간 고도에서 하늘을 균일하게 덮는 회색 또는 푸른색의 막 구름입니다.',
      '층운': '낮은 고도(지표-2km)에서 균일한 회색 구름층을 이루며, 이슬비를 내릴 수 있습니다.',
      '층적운': '낮은 고도에 크고 둥근 구름 덩어리들이 규칙적으로 배열된 구름입니다.',
      '적운': '좋은 날씨에 나타나는 솜사탕 모양의 뭉게구름으로, 수직으로 발달합니다.',
      '적란운': '강한 상승기류로 수직 발달한 거대한 구름으로, 천둥 번개를 동반합니다.',
      '난층운': '낮은 고도에서 하늘을 어둡게 덮으며 지속적인 비나 눈을 내리는 구름입니다.'
    };

    // Randomly pick a cloud type (50% chance to match user prediction for better UX)
    let demoCloudType: CloudType;
    if (Math.random() > 0.5 && userPrediction.cloudType) {
      demoCloudType = userPrediction.cloudType as CloudType;
    } else {
      demoCloudType = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];
    }

    setAIPrediction({
      cloudType: demoCloudType,
      confidence: Math.floor(Math.random() * 20) + 75, // 75-95% confidence
      description: descriptions[demoCloudType]
    });

    setAnalyzing(false);
  };

  const loadStats = async () => {
    try {
      const data = await apiRequest('/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSaveObservation = async () => {
    if (!user || !accessToken || !aiPrediction) return;

    setSaving(true);
    try {
      await apiRequest('/observations', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl,
          userPrediction: {
            cloudType: userPrediction.cloudType,
            reason: userPrediction.reason
          },
          aiPrediction: {
            cloudType: aiPrediction.cloudType,
            reason: aiPrediction.description,
            confidence: aiPrediction.confidence
          },
          isMatch
        })
      });

      setSaved(true);
      await loadStats();

      setTimeout(() => {
        setShowSaveOptions(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to save observation:', error);
      alert('기록 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const isMatch = aiPrediction && userPrediction.cloudType === aiPrediction.cloudType;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl mb-8 text-center">분석 결과</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="rounded-2xl overflow-hidden shadow-lg mb-4">
              <img
                src={imageUrl}
                alt="분석된 구름 사진"
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            {analyzing ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">AI가 구름을 분석하고 있습니다...</p>
                <p className="text-sm text-gray-500 mt-2">OpenAI Vision API 사용 중</p>
              </div>
            ) : analysisError ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="mb-2 text-red-700">AI 분석 오류</h3>
                    <p className="text-sm text-gray-600 mb-4">{analysisError}</p>

                    {analysisError.includes('quota') || analysisError.includes('exceeded') ? (
                      <div className="space-y-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-yellow-800">
                            💡 OpenAI API 할당량이 초과되었습니다.
                            <br />데모 모드로 서비스를 체험해보세요!
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={useDemoMode}
                            className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                          >
                            데모 모드로 계속하기
                          </button>
                          <button
                            onClick={analyzeCloud}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            다시 시도
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={analyzeCloud}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        다시 시도
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : aiPrediction ? (
              <>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Cloud className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl">AI 판별 결과</h3>
                    {demoMode && (
                      <span className="ml-auto px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        데모 모드
                      </span>
                    )}
                  </div>
                  <div className="mb-4">
                    <div className="text-3xl mb-2">{aiPrediction.cloudType}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>신뢰도:</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${aiPrediction.confidence}%` }}
                        ></div>
                      </div>
                      <span>{aiPrediction.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{aiPrediction.description}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border-2 border-blue-100">
                  <h3 className="mb-4 flex items-center gap-2">
                    {isMatch ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className="text-green-700">예측이 일치합니다!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-orange-500" />
                        <span className="text-orange-700">예측이 다릅니다</span>
                      </>
                    )}
                  </h3>

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-sm text-gray-600">항목</th>
                          <th className="text-left py-2 text-sm text-gray-600">사용자 예측</th>
                          <th className="text-left py-2 text-sm text-gray-600">AI 예측</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 text-sm text-gray-600">구름 종류</td>
                          <td className="py-3">{userPrediction.cloudType}</td>
                          <td className="py-3 text-blue-600">{aiPrediction.cloudType}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 판단 이유 비교 */}
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="mb-3 text-sm">🔍 판단 이유 비교</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 사용자 판단 이유 */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-900">사용자 판단 이유</span>
                        </div>
                        {userPrediction.reason ? (
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {userPrediction.reason}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            이유를 입력하지 않았습니다
                          </p>
                        )}
                      </div>

                      {/* AI 판단 이유 */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-900">AI 판단 이유</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {aiPrediction.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {user && stats && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-sm border-2 border-purple-100">
                    <h3 className="mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-purple-500" />
                      나의 관측 통계
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl text-purple-600">{stats.totalObservations}</div>
                        <div className="text-xs text-gray-600">총 관측</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl text-green-600">{stats.correctPredictions}</div>
                        <div className="text-xs text-gray-600">정답</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl text-blue-600">{stats.accuracy}%</div>
                        <div className="text-xs text-gray-600">정확도</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {aiPrediction && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="mb-4">📌 오늘의 관측 기록</h3>

            {!showSaveOptions ? (
              <div className="flex gap-4">
                <button
                  onClick={() => user ? handleSaveObservation() : setShowSaveOptions(true)}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  disabled={saving || saved}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      저장 중...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      저장 완료!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {user ? '기록 저장하기' : '기록 저장하기'}
                    </>
                  )}
                </button>
                <button
                  onClick={onReset}
                  className="flex-1 py-3 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  새로 시작하기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">기록을 저장하고 나의 구름 관측 히스토리를 확인하세요!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={onLoginClick}
                    className="py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    로그인하고 저장하기
                  </button>
                  <button
                    onClick={onReset}
                    className="py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    게스트로 계속하기
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {isMatch && aiPrediction && (
          <div className="mt-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="text-xl mb-2">축하합니다!</h3>
            <p>AI와 예측이 일치했어요. 구름 감지 레벨 UP! 🌤️</p>
          </div>
        )}
      </div>
    </div>
  );
}