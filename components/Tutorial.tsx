import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TutorialProps {
  onClose: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  tips?: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    title: '🌥 CloudLab 시작하기',
    description: 'CloudLab은 나만의 구름 관측소입니다. 구름 사진을 업로드하면 AI가 구름의 종류를 분석해줍니다.',
    tips: [
      '구름 종류를 판별하고 학습해보세요',
      '나의 관측 기록을 모아보세요',
      'AI와 함께 대기과학자가 되어보세요'
    ]
  },
  {
    title: 'Step 1. 구름 사진 업로드',
    description: '메인 화면에서 \"구름 종류 분류하기\"를 선택한 후, 관측한 구름 사진을 업로드하세요. 사진을 드래그하거나 클릭하여 선택할 수 있습니다.',
    tips: [
      '구름 형태가 잘 보이는 사진을 골라주세요',
      '넓게 촬영된 사진이 분석에 좋습니다',
      '낮에 찍은 선명한 사진을 권장합니다'
    ]
  },
  {
    title: 'Step 2. 나의 예측하기',
    description: 'AI 분석 전에 이 구름이 어떤 종류일지 직접 생각해보세요. 구름의 모양과 특징을 보고 예측을 선택합니다.',
    tips: [
      '힌트 보기를 통해 도움을 받을 수 있어요',
      '틀려도 괜찮아요, 학습하는 과정입니다',
      '판단 이유를 적으면 더 깊이 이해할 수 있어요'
    ]
  },
  {
    title: 'Step 3. 분석 결과 확인',
    description: 'AI의 분석 결과와 나의 예측을 비교해보세요. AI가 분석한 구름 종류와 신뢰도, 그리고 상세한 설명을 확인할 수 있습니다.',
    tips: [
      '예측이 일치하는지 확인해보세요',
      'AI의 판단 이유를 읽어보세요',
      '결과를 저장하여 기록을 남길 수 있습니다'
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
                className={`h-2 flex-1 rounded-full transition-all ${index === currentStep
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
        <div className="p-8 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* Step Content */}
          <div className="mb-6">
            <h3 className="text-2xl mb-4 text-blue-900">{currentStepData.title}</h3>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              {currentStepData.description}
            </p>

            {/* Tips Section */}
            {currentStepData.tips && currentStepData.tips.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-sm font-semibold mb-3 text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Tip
                </h4>
                <ul className="space-y-3">
                  {currentStepData.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-3">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></span>
                      <span className="leading-relaxed">{tip}</span>
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
