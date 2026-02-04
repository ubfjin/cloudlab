import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Cloud, Save, RefreshCw, BarChart3, AlertCircle, User, Sparkles, Brain, Info, BookOpen, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
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
  cloudType: string;
  cloudTypes?: { name: string; confidence: number }[];
  primaryCloud?: string;
  confidence: number;
  confidenceReason?: string;
  description: string;
  detailedCritique?: string;
  scientificReasoning?: string;
  educationalContent?: {
    formation: string;
    atmosphere: string;
    weather: string;
  };
  score?: number;
  gradingFeedback?: string;
  cloudState?: {
    state: string;
    transition?: string | null;
    stateConfidence: number;
    stateReason: string;
  };
  scientificFeedback?: string;
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
  const [showConfidenceReason, setShowConfidenceReason] = useState(false);

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
            imageData: imageUrl,
            userPrediction: {
              cloudType: userPrediction.cloudType,
              reason: userPrediction.reason
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('AI analysis failed:', error);
        throw new Error(error.error || 'AI 분석에 실패했습니다');
      }

      const data = await response.json();

      if (!data.primaryCloud && !data.cloudType) {
        console.error('Invalid AI response:', data);
        throw new Error('AI 응답 형식이 올바르지 않습니다');
      }

      setAIPrediction({
        cloudType: data.primaryCloud || data.cloudType,
        cloudTypes: data.cloudTypes,
        primaryCloud: data.primaryCloud,
        confidence: data.confidence,
        confidenceReason: data.confidenceReason,
        description: data.description,
        detailedCritique: data.detailedCritique,
        scientificReasoning: data.scientificReasoning,
        educationalContent: data.educationalContent,
        score: data.score,
        gradingFeedback: data.gradingFeedback,
        cloudState: data.cloudState,
        scientificFeedback: data.scientificFeedback
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('AI Analysis aborted');
        return;
      }
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
    const isKnownType = cloudTypes.includes(userPrediction.cloudType as CloudType);

    if (Math.random() > 0.5 && userPrediction.cloudType && isKnownType) {
      demoCloudType = userPrediction.cloudType as CloudType;
    } else {
      demoCloudType = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];
    }

    // Demo score logic
    let demoScore = 1; // Base score for participation
    let feedback = "데모 모드 채점 결과입니다.";

    if (demoCloudType === userPrediction.cloudType) {
      demoScore += 2;
    }

    // Simulate reasoning check (randomly give points if reason exists)
    const hasReason = userPrediction.reason && userPrediction.reason.length > 5;
    if (hasReason && Math.random() > 0.3) {
      demoScore += 2;
    }

    if (demoScore === 1) feedback = "아쉽네요. 종류와 설명 모두 조금 더 관찰이 필요해요.";
    else if (demoScore === 3) feedback = "종류나 설명 중 하나만 맞았습니다. 조금 더 분발해볼까요?";
    else if (demoScore === 5) feedback = "완벽합니다! 종류와 설명 모두 정확해요.";

    setAIPrediction({
      cloudType: demoCloudType,
      confidence: Math.floor(Math.random() * 20) + 75, // 75-95% confidence
      confidenceReason: "시각적 특징이 뚜렷하여 높은 신뢰도를 보입니다.",
      description: descriptions[demoCloudType],
      detailedCritique: "사용자님의 관찰은 훌륭했으나 세부적인 종류 판단에서 차이가 있었습니다.",
      scientificReasoning: "해당 구름은 대기 불안정으로 인해 수직으로 발달하는 형태를 보입니다.",
      educationalContent: {
        formation: "지표면 가열로 인한 상승 기류",
        atmosphere: "불안정",
        weather: "소나기가 내릴 수 있음"
      },
      score: demoScore,
      gradingFeedback: feedback
    });

    setAnalyzing(false);
  };

  const loadStats = async () => {
    try {
      const options = accessToken ? { token: accessToken } : {};
      const data = await apiRequest('/stats', options);
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
        token: accessToken,
        body: JSON.stringify({
          imageUrl,
          userPrediction: {
            cloudType: userPrediction.cloudType,
            reason: userPrediction.reason,
            date: userPrediction.date,
            time: userPrediction.time,
            location: userPrediction.location,
            weather: userPrediction.weather
          },
          aiPrediction: {
            cloudType: aiPrediction.cloudType, // Saving primary cloud
            reason: aiPrediction.description,
            confidence: aiPrediction.confidence,
            score: aiPrediction.score
          },
          isMatch
        })
      });

      setSaved(true);
      await loadStats();

      setTimeout(() => {
        setShowSaveOptions(false);
      }, 1500);
    } catch (error: any) {
      console.error('Error saving observation:', error);
      toast.error(`기록 저장 실패: ${error.message || '알 수 없는 오류'}`);
      setSaving(false);
    }
  };

  const isMatch = aiPrediction && userPrediction.cloudType === aiPrediction.cloudType;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 font-bold">
          분석 결과
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Sticky Image */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
              <img
                src={imageUrl}
                alt="분석된 구름 사진"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Multi-cloud Chips */}
            {aiPrediction?.cloudTypes && aiPrediction.cloudTypes.length > 1 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  함께 감지된 구름
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiPrediction.cloudTypes.filter(c => c.name !== aiPrediction.cloudType).map((cloud, idx) => (
                    <div key={idx} className="bg-blue-50 px-3 py-1.5 rounded-full text-sm text-blue-700 font-medium flex items-center gap-1.5 border border-blue-100">
                      <span>{cloud.name}</span>
                      <span className="text-xs bg-white px-1.5 rounded-full text-blue-500">{cloud.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {analyzing ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center border border-gray-100">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-900 font-medium text-lg">AI가 구름을 정밀 분석 중입니다...</p>
                <p className="text-sm text-gray-500 mt-2">형태, 고도, 대기 상태를 종합적으로 판단하고 있습니다.</p>
              </div>
            ) : analysisError ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="mb-2 text-red-700 font-semibold">AI 분석 중 문제가 발생했습니다</h3>
                    <p className="text-sm text-gray-600 mb-4">{analysisError}</p>
                    {/* ... error handling buttons ... */}
                    {analysisError.includes('quota') || analysisError.includes('exceeded') ? (
                      <div className="space-y-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-yellow-800">
                            💡 OpenAI API 사용량이 초과되었습니다.
                            <br />데모 모드로 풍부한 분석 기능을 체험해보세요!
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={useDemoMode}
                            className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                          >
                            데모 모드로 체험하기
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={analyzeCloud}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        다시 시도
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : aiPrediction ? (
              <>
                {/* 1. Score Card (Top Priority) */}
                {aiPrediction?.score !== undefined && (
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-lg transform transition-transform hover:scale-[1.01]">
                    <div className="bg-white rounded-xl p-6 text-center">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Observation Score</div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Sparkles
                            key={star}
                            className={`w-6 h-6 ${star <= aiPrediction.score! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <div className="text-5xl font-black text-gray-900 mb-2 tracking-tight">
                        {aiPrediction.score}
                        <span className="text-xl text-gray-400 font-normal"> / 5</span>
                      </div>
                      <p className="text-gray-600 font-medium text-lg mb-4">
                        "{aiPrediction.gradingFeedback}"
                      </p>

                      <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
                          참여 +1
                        </span>
                        <span className={`px-3 py-1 rounded-full border ${isMatch ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                          종류 정답 {isMatch ? '+1' : '+0'}
                        </span>
                        <span className={`px-3 py-1 rounded-full border ${((aiPrediction.score || 0) >= 3) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                          시각적 근거 +2
                        </span>
                        <span className={`px-3 py-1 rounded-full border ${((aiPrediction.score || 0) >= 5) ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                          과학적 추론 +1
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Main Result Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-500 font-medium">AI 분석 결과</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{aiPrediction.cloudType}</span>
                        {demoMode && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Demo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">분석 신뢰도</span>
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-blue-600">{aiPrediction.confidence}%</span>
                        {aiPrediction.confidenceReason && (
                          <div className="relative group">
                            <button
                              onClick={() => setShowConfidenceReason(!showConfidenceReason)}
                              className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
                            >
                              <HelpCircle className="w-4 h-4 ml-1" />
                            </button>
                            {/* Tooltip on hover/click */}
                            <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                              {aiPrediction.confidenceReason}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                        style={{ width: `${aiPrediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed text-lg">
                    {aiPrediction.description}
                  </p>
                </div>

                {/* 3. Prediction Comparison */}
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
                          {userPrediction.scientificReasoning && (
                            <div className="pt-3 border-t border-gray-200">
                              <span className="text-xs font-semibold text-blue-500 uppercase">과학적 추론</span>
                              <p className="text-sm text-gray-700 mt-1">
                                {userPrediction.scientificReasoning}
                              </p>
                            </div>
                          )}
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

                {/* 4. Scientific Context (Renamed from Encyclopedia) */}
                {aiPrediction.educationalContent && (
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
                          <p className="text-gray-600 leading-relaxed text-sm">{aiPrediction.educationalContent.formation}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
                          🌡️
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">대기 상태 분석</div>
                          <p className="text-gray-600 leading-relaxed text-sm">{aiPrediction.educationalContent.atmosphere}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start p-4 rounded-xl bg-gray-50 hover:bg-indigo-50/50 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0 text-xl">
                          ☔
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 mb-1">예상 날씨</div>
                          <p className="text-gray-600 leading-relaxed text-sm">{aiPrediction.educationalContent.weather}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Cloud State Analysis (Optional) */}
                {aiPrediction.cloudState && (
                  <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-lg">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-indigo-700 pb-3">
                      <BarChart3 className="w-5 h-5 text-indigo-300" />
                      구름 상태 정밀 분석
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Development Stage</div>
                        <div className="text-3xl font-bold mb-2">{aiPrediction.cloudState.state}</div>
                        <div className="text-indigo-200 text-sm">
                          {aiPrediction.cloudState.transition ? `현재 ${aiPrediction.cloudState.transition} 과정에 있습니다.` : '전형적인 상태를 유지하고 있습니다.'}
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <p className="text-sm leading-relaxed text-indigo-100">
                          "{aiPrediction.cloudState.stateReason}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Action Bar */}
                <div className="sticky bottom-4 z-20">
                  <div className="bg-white/90 backdrop-blur-lg p-2 rounded-2xl shadow-2xl border border-gray-200 flex gap-3 max-w-md mx-auto">
                    {!showSaveOptions ? (
                      <>
                        <button
                          onClick={() => user ? handleSaveObservation() : setShowSaveOptions(true)}
                          className="flex-1 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 font-medium"
                          disabled={saving || saved}
                        >
                          {saving ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                              저장 중...
                            </>
                          ) : saved ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              저장 완료
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              {user ? '결과 저장' : '결과 저장'}
                            </>
                          )}
                        </button>
                        <button
                          onClick={onReset}
                          className="px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex-1 flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                        <button
                          onClick={onLoginClick}
                          className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm"
                        >
                          로그인 후 저장
                        </button>
                        <button
                          onClick={onReset}
                          className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-medium text-sm"
                        >
                          건너뛰기
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}