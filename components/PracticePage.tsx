import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy, ChevronDown } from 'lucide-react';
import type { CloudType } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Cloud } from 'lucide-react';

interface PracticePageProps {
  onBack: () => void;
}

interface QuizQuestion {
  imageUrl: string;
  correctAnswer: CloudType;
  hint: string;
  explanation: string;
}

const cloudTypes: CloudType[] = [
  '권운', '권적운', '권층운',
  '고적운', '고층운',
  '층운', '층적운',
  '적운', '적란운', '난층운'
];

const quizQuestions: QuizQuestion[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1762212702678-2fb78c6037e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXJydXMlMjBjbG91ZHMlMjBtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjUzNjcyNjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    correctAnswer: '권운',
    hint: '높은 고도에서 가늘고 섬세한 깃털 모양',
    explanation: '권운(Cirrus)은 5,000-13,000m 고도에서 관찰되는 가늘고 섬세한 깃털 모양의 구름입니다. 빙정으로 이루어져 있습니다.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1614061517923-bedaf51c5733?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    correctAnswer: '권적운',
    hint: '높은 고도에 작고 둥근 구름이 비늘 모양으로 배열',
    explanation: '권적운(Cirrocumulus)은 5,000-13,000m 고도에서 작고 둥근 구름 덩어리들이 물결 무늬나 비늘 모양으로 배열된 구름입니다. "고등어 구름"이라고도 불립니다.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1584990471396-f8478db2f239?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    correctAnswer: '권층운',
    hint: '높은 고도에서 하늘을 얇게 덮는 막 형태',
    explanation: '권층운(Cirrostratus)은 5,000-13,000m 고도에서 하늘 전체를 얇게 덮는 막 형태의 구름입니다. 해나 달 주위에 무리(헤일로)를 만들기도 합니다.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1647823756609-343f03579006?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    correctAnswer: '고적운',
    hint: '중간 고도에 회백색 둥근 구름 덩어리들',
    explanation: '고적운(Altocumulus)은 2,000-7,000m 고도에서 회백색의 둥근 구름 덩어리들이 무리를 지어 나타나는 구름입니다. "양떼 구름"이라고도 불립니다.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1681488437311-0314bfdb831c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    correctAnswer: '고층운',
    hint: '중간 고도에서 하늘을 균일하게 덮는 회색 막',
    explanation: '고층운(Altostratus)은 2,000-7,000m 고도에서 하늘을 균일하게 덮는 회색 또는 푸른빛의 막 구름입니다. 태양이나 달을 희미하게 볼 수 있습니다.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1510938436901-8303e3fc0343?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhdHVzJTIwZm9nJTIwbW91bnRhaW58ZW58MXx8fHwxNzY1MzY3MjY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    correctAnswer: '층운',
    hint: '낮은 고도에 균일한 회색 구름층',
    explanation: '층운(Stratus)은 0-2,000m 고도에서 균일한 회색 구름층을 이루며, 안개와 비슷하지만 지표면에 닿지 않습니다.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1628284441192-abcea27ddcd7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    correctAnswer: '적운',
    hint: '솜사탕 모양의 밝은 흰색 뭉게구름',
    explanation: '적운(Cumulus)은 600-2,000m 고도에서 나타나는 솜사탕 모양의 뭉게구름입니다. 밝은 흰색의 둥근 꼭대기와 평평한 밑면을 가지고 있습니다.'
  },
  {
    imageUrl: 'https://plus.unsplash.com/premium_photo-1667143327618-bf16fc8777ba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8JUVDJUEwJTgxJUVCJTlFJTgwJUVDJTlBJUI0fGVufDB8fDB8fHww',
    correctAnswer: '적란운',
    hint: '수직으로 거대하게 발달한 구름',
    explanation: '적란운(Cumulonimbus)은 600-18,000m 고도에서 수직으로 크게 발달한 거대한 구름입니다. 천둥, 번개, 폭우를 동반합니다.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1656261575195-e49106cfc432?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaW1ib3N0cmF0dXMlMjByYWluJTIwY2xvdWRzfGVufDF8fHx8MTc2NTM2NTc3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    correctAnswer: '층적운',
    hint: '낮은 고도에 크고 둥근 구름 덩어리들',
    explanation: '층적운(Stratocumulus)은 0-2,000m 고도에서 크고 둥근 구름 덩어리들이 규칙적으로 배열된 구름입니다.'
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1691684117224-ec6721b57601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwcmFpbiUyMGNsb3Vkc3xlbnwxfHx8fDE3NjU0MjU2NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    correctAnswer: '난층운',
    hint: '낮은 고도에서 어둡게 덮으며 지속적인 비',
    explanation: '난층운(Nimbostratus)은 600-3,000m 고도에서 하늘을 어둡게 덮으며 지속적인 비나 눈을 내리는 두꺼운 구름입니다.'
  }
];

export function PracticePage({ onBack }: PracticePageProps) {
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<CloudType | ''>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Shuffle questions on component mount
  useEffect(() => {
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
  }, []);

  // Return early if questions are not shuffled yet
  if (shuffledQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Cloud className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-gray-600">문제를 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
    setTotalAnswered(prev => prev + 1);

    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setIsAnswered(false);
      setShowDropdown(false);
      setShowHint(false);
    }
  };

  const handleReset = () => {
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setIsAnswered(false);
    setScore(0);
    setTotalAnswered(0);
    setShowDropdown(false);
    setShowHint(false);
  };

  const isLastQuestion = currentQuestionIndex === shuffledQuestions.length - 1;
  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl">구름 분류 연습</h1>
                <p className="text-sm text-gray-600">
                  문제 {currentQuestionIndex + 1} / {shuffledQuestions.length}
                </p>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">
                    {score} / {totalAnswered}
                  </span>
                  {totalAnswered > 0 && (
                    <span className="text-sm text-gray-600">({accuracy}%)</span>
                  )}
                </div>
              </div>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="처음부터 다시"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Quiz Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-visible">
            {/* Cloud Image */}
            <div className="relative h-96 overflow-hidden bg-gray-100 rounded-t-2xl">
              <ImageWithFallback
                src={currentQuestion.imageUrl}
                alt="구름 사진"
                className="w-full h-full object-cover"
              />
              {!isAnswered && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm transition-colors shadow-lg"
                >
                  {showHint ? '💡 힌트 숨기기' : '💡 힌트 보기'}
                </button>
              )}
              {showHint && !isAnswered && (
                <div className="absolute top-16 right-4 bg-white/95 backdrop-blur-sm text-gray-800 px-4 py-3 rounded-lg text-sm shadow-xl max-w-xs border border-blue-200">
                  {currentQuestion.hint}
                </div>
              )}
            </div>

            {/* Quiz Content */}
            <div className="p-8">
              <h2 className="text-2xl mb-2">이 구름은 무엇일까요?</h2>
              <p className="text-gray-600 mb-6">10가지 구름 종류 중에서 선택하세요</p>

              {/* Dropdown Select */}
              <div className="mb-6 relative z-30">
                <button
                  onClick={() => !isAnswered && setShowDropdown(!showDropdown)}
                  disabled={isAnswered}
                  className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-lg transition-colors ${isAnswered
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                    : selectedAnswer
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                    }`}
                >
                  <span className={selectedAnswer ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedAnswer || '구름 종류를 선택하세요'}
                  </span>
                  <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && !isAnswered && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
                    {cloudTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedAnswer(type);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${selectedAnswer === type ? 'bg-blue-100' : ''
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {!isAnswered && (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className={`w-full py-4 rounded-lg transition-colors ${selectedAnswer
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  정답 확인
                </button>
              )}

              {/* Result Feedback */}
              {isAnswered && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Correct/Incorrect Message */}
                  <div
                    className={`p-6 rounded-lg ${isCorrect
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-red-50 border-2 border-red-200'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="w-8 h-8 text-green-600" />
                          <h3 className="text-2xl text-green-900">정답입니다! 🎉</h3>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-8 h-8 text-red-600" />
                          <h3 className="text-2xl text-red-900">아쉽습니다!</h3>
                        </>
                      )}
                    </div>

                    {!isCorrect && (
                      <p className="text-red-800 mb-2">
                        정답은 <strong>{currentQuestion.correctAnswer}</strong>입니다.
                      </p>
                    )}

                    <p className="text-gray-700 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>

                  {/* Next Button */}
                  {!isLastQuestion ? (
                    <button
                      onClick={handleNext}
                      className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
                    >
                      다음 문제
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg text-center">
                        <h3 className="text-2xl mb-2">연습 완료! 🎊</h3>
                        <p className="text-purple-100 mb-2">
                          총 {shuffledQuestions.length}문제 중 {score}개 정답
                        </p>
                        <p className="text-3xl">정확도: {accuracy}%</p>
                      </div>
                      <button
                        onClick={handleReset}
                        className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        처음부터 다시 연습하기
                      </button>
                      <button
                        onClick={onBack}
                        className="w-full py-4 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        메인으로 돌아가기
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 flex gap-2">
            {shuffledQuestions.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all ${index < currentQuestionIndex
                  ? 'bg-green-500'
                  : index === currentQuestionIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}