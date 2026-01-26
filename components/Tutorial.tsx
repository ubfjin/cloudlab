import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TutorialProps {
  onClose: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  image: string;
  tips?: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    title: '🌥 CloudLab에 오신 것을 환영합니다!',
    description: 'CloudLab은 AI 기술을 활용하여 구름의 종류를 판별하고 학습할 수 있는 교육용 웹 서비스입니다. 사진을 업로드하면 10가지 구름 종류를 자동으로 분석해드립니다.',
    image: 'cloud welcome',
    tips: [
      '권운, 권적운, 권층운 (상층운)',
      '고적운, 고층운 (중층운)',
      '층운, 층적운, 난층운 (하층운)',
      '적운, 적란운 (수직운)'
    ]
  },
  {
    title: '📸 1단계: 구름 사진 업로드',
    description: '먼저 하늘에 있는 구름 사진을 업로드하세요. 카메라로 직접 촬영하거나 갤러리에서 선택할 수 있습니다.',
    image: 'camera cloud',
    tips: [
      '구름이 선명하게 보이는 사진을 선택하세요',
      '여러 종류의 구름이 있다면 가장 눈에 띄는 구름을 기준으로 하세요',
      '낮 시간대에 촬영한 사진이 분석에 유리합니다'
    ]
  },
  {
    title: '🤔 2단계: 나의 예측 입력',
    description: 'AI 분석 전에 먼저 여러분이 직접 구름의 종류를 예측해보세요. 10가지 구름 종류 중 하나를 선택하고, 그렇게 생각한 이유를 작성합니다.',
    image: 'thinking person',
    tips: [
      '구름의 모양, 높이, 색깔을 관찰하세요',
      '이유를 자세히 작성할수록 학습 효과가 높아집니다',
      '틀려도 괜찮아요! 비교를 통해 배우는 것이 목적입니다'
    ]
  },
  {
    title: '🤖 3단계: AI 분석 & 결과 비교',
    description: 'OpenAI GPT-4 Vision이 구름 사진을 분석합니다. 여러분의 예측과 AI의 분석 결과를 비교하면서 구름에 대해 더 깊이 이해할 수 있습니다.',
    image: 'artificial intelligence',
    tips: [
      'AI가 분석한 구름 종류와 상세한 설명을 확인하세요',
      '여러분의 예측과 비교하며 차이점을 학습하세요',
      '결과는 자동으로 기록되어 통계로 확인할 수 있습니다'
    ]
  },
  {
    title: '📚 학습 & 연습 모드',
    description: '구름 판별이 어렵다면 \"구름 종류 알아보기\"에서 10가지 구름을 학습하고, \"구름 분류 연습하기\"에서 퀴즈를 풀어보세요!',
    image: 'education learning',
    tips: [
      '각 구름의 특징과 날씨 예보 정보를 상세히 제공합니다',
      '연습 모드에서 실제 사진으로 퀴즈를 풀 수 있습니다',
      '정확도를 확인하며 실력을 향상시켜보세요'
    ]
  }
];

export function Tutorial({ onClose, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Load image for current step
    const loadImage = async () => {
      // Use a simple placeholder for now
      setImageUrl('');
    };
    loadImage();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 relative">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl">CloudLab 튜토리얼</h2>
          </div>
          {/* Progress Dots */}
          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-white'
                    : index < currentStep
                    ? 'bg-white/60'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step Content */}
          <div className="mb-6">
            <h3 className="text-2xl mb-4">{currentStepData.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              {currentStepData.description}
            </p>

            {/* Tips Section */}
            {currentStepData.tips && currentStepData.tips.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                <h4 className="text-sm mb-3 text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  핵심 포인트
                </h4>
                <ul className="space-y-2">
                  {currentStepData.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {currentStep + 1} / {tutorialSteps.length}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg"
            >
              {isLastStep ? '시작하기' : '다음'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
