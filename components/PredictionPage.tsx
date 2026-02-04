import { useState } from 'react';
import { AlertCircle, Info, X, MapPin, Loader2 } from 'lucide-react';
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
    description: '좋은 날씨에 나타나는 솜사탕 모양의 뭉게구름입니다. 밝은 흰색의 둥근 꼭대기와 평평한 밑면을 가지고 있습니다.'
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
  const [cloudType, setCloudType] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [scientificReasoning, setScientificReasoning] = useState('');
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [selectedCloudInfo, setSelectedCloudInfo] = useState<CloudType | null>(null);

  const handleGetWeather = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
      return;
    }

    setIsWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Call our API
          const response = await fetch('/api/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lon: longitude }),
          });

          if (!response.ok) throw new Error('Weather fetch failed');

          const data = await response.json();
          // Format: "맑음 (기온: 20°C, 습도: 50%)"
          // Approximate logic since we only get raw numbers. 
          // PrecipType: 0=None, 1=Rain, 2=Rain/Snow, 3=Snow, 5=Rain, 6=Rain/Snow, 7=Snow
          let condition = "맑음";
          if (data.precipType === '1' || data.precipType === '5') condition = "비";
          else if (data.precipType === '3' || data.precipType === '7') condition = "눈";
          else if (data.precipType === '2' || data.precipType === '6') condition = "진눈깨비";

          // Ideally we would get Sky condition (SKY) but Ultra Short Term Live doesn't provide it clearly in one go basically.
          // Using Precip as proxy for now or just generic.

          // Convert wind direction (VEC) to 16 cardinal directions or simple 8
          const vec = parseFloat(data.windDirection);
          const wsd = data.windSpeed;
          let windStr = "";
          if (!isNaN(vec)) {
            const directions = ["북", "북동", "동", "남동", "남", "남서", "서", "북서"];
            const index = Math.floor((vec + 22.5) / 45) % 8;
            windStr = `, 바람: ${directions[index]}풍 ${wsd}m/s`;
          }

          const weatherStr = `${condition} (기온: ${data.temperature}°C, 습도: ${data.humidity}%${windStr})`;
          setWeather(weatherStr);

          // Optionally hint location - but we don't have reverse geocoding yet
          // setLocation("현 위치"); 
        } catch (error) {
          console.error(error);
          alert('날씨 정보를 가져오는데 실패했습니다.');
        } finally {
          setIsWeatherLoading(false);
        }
      },
      (error) => {
        console.error(error);
        alert('위치 정보를 가져올 수 없습니다.');
        setIsWeatherLoading(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cloudType && reason.trim()) {
      onSubmit({ cloudType, reason, date, time, location, weather, scientificReasoning });
    }
  };

  const isValid = cloudType !== '' && reason.trim().length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl mb-8 text-center font-bold text-gray-800">구름의 종류를 예측해보세요</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Sticky Image */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
              <img
                src={imageUrl}
                alt="업로드된 구름 사진"
                className="w-full h-auto object-cover"
              />
              <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
                사진을 자세히 관찰하며 특징을 찾아보세요
              </div>
            </div>
          </div>

          {/* Right Column: Form & Hints */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              {/* Observation Details */}
              <div className="bg-blue-50/50 rounded-xl p-5 mb-8 border border-blue-100">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-500" />
                  관측 정보 기록
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">관측 일자</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">관측 시간</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">관측 위치</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: 서울대학교 중앙도서관 부근"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">날씨</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={weather}
                      onChange={(e) => setWeather(e.target.value)}
                      placeholder="예: 맑음, 흐림"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleGetWeather}
                      disabled={isWeatherLoading}
                      className="px-3 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1 text-sm font-medium whitespace-nowrap shadow-sm"
                    >
                      {isWeatherLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      현 위치 날씨
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    이 구름의 종류는 무엇일까요? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="cloud-types"
                    value={cloudType}
                    onChange={(e) => setCloudType(e.target.value)}
                    placeholder="구름 종류를 선택하거나 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    required
                  />
                  <datalist id="cloud-types">
                    {cloudTypes.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    해당 구름이라고 판단한 이유 <span className="text-red-500">*</span>
                  </label>
                  <div className="text-sm text-gray-500 mb-2">
                    💡 <strong>시각적 특징</strong>을 근거로 작성해주세요. (예: 모양, 색깔, 질감, 높이 등)
                  </div>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="예: 솜사탕처럼 윗부분이 둥글고 밑바닥은 평평해서 적운이라고 생각했습니다."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    과학적 추론 (선택사항)
                  </label>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl mb-3 border border-blue-100">
                    <p className="mb-2 font-semibold text-blue-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      이 지역의 대기 상태는 어떨까요?
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 opacity-90">
                      <li><strong>기온 감률</strong>: 상층으로 갈수록 기온이 급격히 낮아질까요?</li>
                      <li><strong>대기 안정도</strong>: 대기가 불안정해서 상승 기류가 강한가요? 아니면 안정한가요?</li>
                      <li><strong>날씨 시스템</strong>: 온대 저기압이나 전선의 영향이 있나요?</li>
                    </ul>
                  </div>
                  <textarea
                    value={scientificReasoning}
                    onChange={(e) => setScientificReasoning(e.target.value)}
                    placeholder="구름의 모양을 보고 유추할 수 있는 대기의 상태(상승기류, 안정도 등)나 기상 현상에 대해 적어주세요."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50 focus:bg-white transition-colors"
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={!isValid}
                  className={`w-full py-4 rounded-xl transition-all font-bold text-lg shadow-lg ${isValid
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  나의 예측 제출하기
                </button>
              </div>
            </form>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-400" />
                구름 도감 & 힌트
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {cloudTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedCloudInfo(selectedCloudInfo === type ? null : type)}
                    className={`p-3 rounded-lg text-left transition-all border ${selectedCloudInfo === type
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="text-sm font-medium text-gray-900">{type}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{cloudInfoMap[type].englishName}</div>
                  </button>
                ))}
              </div>

              {selectedCloudInfo && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-fadeIn">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{cloudInfoMap[selectedCloudInfo].name}</h4>
                      <div className="text-sm text-blue-600 font-medium">고도: {cloudInfoMap[selectedCloudInfo].altitude}</div>
                    </div>
                    <button
                      onClick={() => setSelectedCloudInfo(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
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
      </div>
    </div>
  );
}