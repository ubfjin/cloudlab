interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const steps = ['업로드', '예측', '비교', '기록 완료'];
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index < currentStep ? 'bg-blue-500 text-white' :
                index === currentStep ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {index + 1}
              </div>
              <span className={`text-xs ${
                index <= currentStep ? 'text-blue-500' : 'text-gray-400'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
