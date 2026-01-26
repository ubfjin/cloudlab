import { Cloud, PlayCircle, BookOpen, Dumbbell, Target, HelpCircle, History } from 'lucide-react';

interface MainPageProps {
  onStart: () => void;
  onLearnClick: () => void;
  onPracticeClick: () => void;
  onTutorialClick?: () => void;
  onHistoryClick?: () => void;
  isLoggedIn?: boolean;
}

export function MainPage({ onStart, onLearnClick, onPracticeClick, onTutorialClick, onHistoryClick, isLoggedIn }: MainPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <Cloud className="w-24 h-24 mx-auto mb-6 text-blue-500" />
          <h1 className="text-8xl mb-4">CloudLab</h1>
          <p className="text-xl text-gray-600 mb-2">구름 사진을 업로드하고 구름 종류를 판단해보세요</p>
          <p className="text-lg text-gray-500">AI와 함께하는 구름 관측 체험</p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={onStart}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
          >
            <PlayCircle className="w-6 h-6" />
            시작하기
          </button>

          <button 
            onClick={onLearnClick}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-4 border-2 border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            구름 종류 알아보기
          </button>

          <button 
            onClick={onPracticeClick}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-4 border-2 border-green-300 text-green-600 rounded-xl hover:bg-green-50 transition-colors"
          >
            <Dumbbell className="w-5 h-5" />
            구름 분류 연습하기
          </button>

          {onTutorialClick && (
            <button 
              onClick={onTutorialClick}
              className="w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              튜토리얼 보기
            </button>
          )}

          {isLoggedIn && onHistoryClick && (
            <button 
              onClick={onHistoryClick}
              className="w-full max-w-md mx-auto flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <History className="w-5 h-5" />
              기록 보기
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="mb-2">구름 학습</h3>
            <p className="text-sm text-gray-600">10가지 구름 종류의 특징과 고도를 학습하세요</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="mb-2">분류 연습</h3>
            <p className="text-sm text-gray-600">예제 사진으로 구름 분류<br />실력을 키워보세요</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="mb-2">AI 분석</h3>
            <p className="text-sm text-gray-600">내 예측과 AI 예측을 비교하며 학습하세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}