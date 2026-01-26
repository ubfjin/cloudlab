import { useState } from 'react';
import { AlertCircle, Info, X } from 'lucide-react';
import type { CloudType, UserPrediction } from '../types';

interface PredictionPageProps {
  imageUrl: string;
  onSubmit: (prediction: UserPrediction) => void;
}

const cloudTypes: CloudType[] = [
  '권운', '권적운', '권층운',
  '고적운', '고층운',
  '층운', '층적운',
  '적운', '적란운', '난층운'
];

interface CloudInfo {
  name: CloudType;
  englishName: string;
  altitude: string;
  description: string;
}

const cloudInfoMap: Record<CloudType, CloudInfo> = {
  '권운': {
    name: '권운',
    englishName: 'Cirrus',
    altitude: '5,000 - 13,000m',
    description: '높은 고도에서 관찰되는 가늘고 섬세한 깃털 모양의 구름입니다. 빙정(얼음 결정)으로 이루어져 있으며 햇빛을 받으면 아름답게 빛납니다.'
  },
  '권적운': {
    name: '권적운',
    englishName: 'Cirrocumulus',
    altitude: '5,000 - 13,000m',
    description: '높은 고도에 작고 둥근 구름 덩어리들이 물결 무늬나 비늘 양으로 규칙적으로 배열된 구름입니다. "고등어 구름" 또는 "비늘구름"이라고도 불립니다.'
  },
  '권층운': {
    name: '권층운',
    englishName: 'Cirrostratus',
    altitude: '5,000 - 13,000m',
    description: '높은 고도에서 하늘 전체를 얇게 덮는 막 형태의 구름입니다. 해나 달 주위에 둥근 무리(헤일로)를 만들기도 합니다.'
  },
  '고적운': {
    name: '고적운',
    englishName: 'Altocumulus',
    altitude: '2,000 - 7,000m',
    description: '중간 고도에 나타나는 회백색의 둥근 구름 덩어리들이 무리를 지어 나타나는 구름입니다. 양떼 구름이라고도 불립니다.'
  },
  '고층운': {
    name: '고층운',
    englishName: 'Altostratus',
    altitude: '2,000 - 7,000m',
    description: '중간 고도에서 하늘을 균일하게 덮는 회색 또는 푸른빛의 막 구름입니다. 태양이나 달을 희미하게 볼 수 있습니다.'
  },
  '층운': {
    name: '층운',
    englishName: 'Stratus',
    altitude: '0 - 2,000m',
    description: '낮은 고도에서 균일한 회색 구름층을 이루며, 안개와 비슷하지만 지표면에 닿지 않습니다. 이슬비를 내릴 수 있습니다.'
  },
  '층적운': {
    name: '층적운',
    englishName: 'Stratocumulus',
    altitude: '0 - 2,000m',
    description: '낮은 고도에 크고 둥근 구름 덩어리들이 규칙적으로 배열된 구름입니다. 회색 또는 흰색이며 부분적으로 밝은 부분이 있습니다.'
  },
  '적운': {
    name: '적운',
    englishName: 'Cumulus',
    altitude: '600 - 2,000m',
    description: '좋��� 날씨에 나타나는 솜사탕 모양의 뭉게구름입니다. 밝은 흰색의 둥근 꼭대기와 평평한 밑면을 가지고 있습니다.'
  },
  '적란운': {
    name: '적란운',
    englishName: 'Cumulonimbus',
    altitude: '600 - 18,000m',
    description: '강한 상승기류로 수직으로 크게 발달한 거대한 구름입니다. 천둥, 번개, 폭우, 우박 등을 동반합니다.'
  },
  '난층운': {
    name: '난층운',
    englishName: 'Nimbostratus',
    altitude: '600 - 3,000m',
    description: '낮은 고도에서 하늘을 어둡게 덮으며 지속적인 비나 눈을 내리는 두꺼운 구름입니다.'
  }
};

export function PredictionPage({ imageUrl, onSubmit }: PredictionPageProps) {
  const [cloudType, setCloudType] = useState<CloudType | ''>('');
  const [reason, setReason] = useState('');
  const [selectedCloudInfo, setSelectedCloudInfo] = useState<CloudType | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cloudType) {
      onSubmit({ cloudType, reason });
    }
  };

  const isValid = cloudType !== '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl mb-8 text-center">구름의 종류를 예측해보세요</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={imageUrl} 
                alt="업로드된 구름 사진" 
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <label className="block mb-2">
                  이 구름의 종류는 무엇일까요? <span className="text-red-500">*</span>
                </label>
                <select
                  value={cloudType}
                  onChange={(e) => setCloudType(e.target.value as CloudType)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">선택해주세요</option>
                  {cloudTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block mb-2">
                  구름 이름 판단 이유 (선택)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="어떤 특징 때문에 이 구름이라고 생각하시나요?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={!isValid}
                className={`w-full py-3 rounded-lg transition-colors ${
                  isValid 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                나의 예측 저장
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="mb-4">💡 구름 분류 힌트 (클릭하여 설명 보기)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cloudTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedCloudInfo(selectedCloudInfo === type ? null : type)}
                className={`p-3 rounded-lg text-left transition-all ${
                  selectedCloudInfo === type 
                    ? 'bg-blue-100 border-2 border-blue-500' 
                    : 'bg-gray-50 border-2 border-transparent hover:bg-blue-50'
                }`}
              >
                <div className="text-sm">{type}</div>
                <div className="text-xs text-gray-500 mt-1">{cloudInfoMap[type].englishName}</div>
              </button>
            ))}
          </div>
          
          {selectedCloudInfo && (
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 animate-fadeIn">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="mb-1">{cloudInfoMap[selectedCloudInfo].name} ({cloudInfoMap[selectedCloudInfo].englishName})</h4>
                  <div className="text-sm text-blue-600">고도: {cloudInfoMap[selectedCloudInfo].altitude}</div>
                </div>
                <button
                  onClick={() => setSelectedCloudInfo(null)}
                  className="p-1 hover:bg-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {cloudInfoMap[selectedCloudInfo].description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}