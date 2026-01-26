import { useState } from 'react';
import { ArrowLeft, Cloud, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import type { CloudType } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LearningPageProps {
  onBack: () => void;
}

interface CloudInfo {
  name: CloudType;
  englishName: string;
  altitude: string;
  description: string;
  characteristics: string[];
  weather: string;
  imageUrl: string;
}

const cloudData: CloudInfo[] = [
  {
    name: '권운',
    englishName: 'Cirrus',
    altitude: '5,000 - 13,000m',
    description: '높은 고도에서 관찰되는 가늘고 섬세한 깃털 모양의 구름입니다. 빙정(얼음 결정)으로 이루어져 있으며 햇빛을 받으면 아름답게 빛납니다.',
    characteristics: [
      '섬유 모양 또는 깃털 모양',
      '흰색이며 투명함',
      '얼음 결정으로 구성',
      '바람이 강한 고도에서 형성'
    ],
    weather: '일반적으로 맑은 날씨를 나타내지만, 24시간 내 날씨 변화의 전조일 수 있습니다.',
    imageUrl: 'https://images.unsplash.com/photo-1716252834591-1cda88ddf817?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: '권적운',
    englishName: 'Cirrocumulus',
    altitude: '5,000 - 13,000m',
    description: '높은 고도에 작고 둥근 구름 덩어리들이 물결 무늬나 비늘 양으로 규칙적으로 배열된 구름입니다. "고등어 구름" 또는 "비늘구름"이라고도 불립니다.',
    characteristics: [
      '작은 알갱이 또는 물결 무늬',
      '규칙적인 패턴으로 배열',
      '그림자가 없음',
      '얼음 결정과 과냉각 물방울로 구성'
    ],
    weather: '보통 좋은 날씨이지만, 12-24시간 내 날씨가 변할 수 있는 신호입니다.',
    imageUrl: 'https://images.unsplash.com/photo-1698759731853-a01de237f355?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: '권층운',
    englishName: 'Cirrostratus',
    altitude: '5,000 - 13,000m',
    description: '높은 고도에서 하늘 전체를 얇게 덮는 막 형태의 구름입니다. 해나 달 주위에 둥근 무리(헤일로)를 만들기도 합니다.',
    characteristics: [
      '얇고 투명한 막 형태',
      '하늘 전체를 덮음',
      '해와 달 주위에 무리 현상',
      '매끄럽고 균일한 외관'
    ],
    weather: '12-24시간 내 비나 눈이 올 가능성이 높습니다.',
    imageUrl: 'https://images.unsplash.com/photo-1722992587004-2dd3a1c46d7c?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: '고적운',
    englishName: 'Altocumulus',
    altitude: '2,000 - 7,000m',
    description: '중간 고도에 나타나는 회백색의 둥근 구름 덩어리들이 무리를 지어 나타나는 구름입니다. 양떼 구름이라고도 불립니다.',
    characteristics: [
      '둥근 덩어리들이 그룹으로 배열',
      '회색 또는 흰색',
      '부분적으로 그림자가 있음',
      '물방울로 구성'
    ],
    weather: '날씨가 변할 수 있는 징조이며, 여름철에는 뇌우의 전조일 수 있습니다.',
    imageUrl: 'https://images.unsplash.com/photo-1716831120678-48e2b5f2a484?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHRvY3VtdWx1c3xlbnwxfHx8fDE3NjU0MTM0OTl8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: '고층운',
    englishName: 'Altostratus',
    altitude: '2,000 - 7,000m',
    description: '중간 고도에서 하늘을 균일하게 덮는 회색 또는 푸른빛의 막 구름입니다. 태양이나 달을 희미하게 볼 수 있습니다.',
    characteristics: [
      '균일한 회색 또는 청회색',
      '하늘을 넓게 덮음',
      '태양/달의 윤곽이 흐릿하게 보임',
      '물방울과 얼음 결정으로 구성'
    ],
    weather: '지속적인 비나 눈 올 가능성이 있습니다.',
    imageUrl: 'https://images.unsplash.com/photo-1598177585104-fe97cc082ce8?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: '층운',
    englishName: 'Stratus',
    altitude: '0 - 2,000m',
    description: '낮은 고도에서 균일한 회색 구름층을 이루며, 안개와 비슷하지만 지표면에 닿지 않습니다. 이슬비를 내릴 수 있습니다.',
    characteristics: [
      '균일한 회색층',
      '낮은 고도',
      '안개와 유사한 외관',
      '태양을 완전히 가림'
    ],
    weather: '흐린 날씨이며, 이슬비나 가랑비를 동반할 수 있습니다.',
    imageUrl: 'https://images.unsplash.com/photo-1760905276945-7edefc18e59e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: '층적운',
    englishName: 'Stratocumulus',
    altitude: '0 - 2,000m',
    description: '낮은 고도에 크고 둥근 구름 덩어리들이 규칙적으로 배열된 구름입니다. 회색 또는 흰색이며 부분적으로 밝은 부분이 있습니다.',
    characteristics: [
      '큰 둥근 덩어리',
      '회색과 흰색 혼합',
      '규칙적 또 불규칙적 배열',
      '밝은 부과 어두운 부분'
    ],
    weather: '보 건조한 날씨이지만, 때때로 가벼운 비나 눈이 올 수 있습니다.',
    imageUrl: 'https://images.unsplash.com/photo-1593648238305-7f9a89bb553e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: '적운',
    englishName: 'Cumulus',
    altitude: '600 - 2,000m',
    description: '좋은 날씨에 나타나는 솜사탕 모양의 뭉게구름입니다. 밝은 흰색의 둥근 꼭대기와 평평한 밑면을 가지고 있습니다.',
    characteristics: [
      '둥글고 솜털 같은 모양',
      '밝은 흰색',
      '평평한 밑면',
      '수직으로 발달'
    ],
    weather: '일반적으로 좋은 날씨를 나타냅니다.',
    imageUrl: 'https://images.unsplash.com/photo-1758612181584-ea4fad017752?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: '적란운',
    englishName: 'Cumulonimbus',
    altitude: '600 - 18,000m',
    description: '강한 상승기류로 수직으로 크게 발달한 거대한 구름입니다. 천둥, 번개, 우, 우박 등을 동반니다.',
    characteristics: [
      '수직으로 거대하게 발달',
      '모루 모양의 대기',
      '어두 밑면',
      '강 상승기류'
    ],
    weather: '강한 뇌우, 폭우, 번개, 천둥, 우박, 돌풍 등을 동반합니다.',
    imageUrl: 'https://images.unsplash.com/photo-1653312571723-88968b128e54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdW11bG9uaW1idXN8ZW58MXx8fHwxNzY1NDEzNTAxfDA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    name: '난층운',
    englishName: 'Nimbostratus',
    altitude: '600 - 3,000m',
    description: '낮은 고도에서 하늘을 어둡게 덮으며 지속적인 비나 눈을 내리는 두꺼운 구름입니다.',
    characteristics: [
      '두껍고 어두운 회색',
      '하늘을 완전히 덮음',
      '경계가 불분명',
      '지속적인 강수'
    ],
    weather: '지속적인 비나 눈이 내립니다.',
    imageUrl: 'https://images.unsplash.com/photo-1708013815516-c0014f9e72ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaW1ib3N0cmF0dXMlMjByYWluJTIwY2xvdWRzJTIwZGFya3xlbnwxfHx8fDE3NjU0MjY5NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

export function LearningPage({ onBack }: LearningPageProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-blue-500" />
              <div>
                <h1 className="text-2xl">구름 종류 알아보기</h1>
                <p className="text-sm text-gray-600">10가지 주요 구름 형태를 알아보세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-2xl mb-3">🌥 구름 분류 가이드</h2>
          <p className="text-blue-100 leading-relaxed mb-4">
            구름은 고도와 형태에 따라 상층운(5-13km), 중층운(2-7km), 하층운(0-2km), 수직운으로 분류됩니다. 
            각 구름의 특징을 잘 관찰하면 날씨를 예측할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm text-blue-200">상층운 (5-13km)</div>
              <div className="text-sm">권운, 권적운, 권층운</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm text-blue-200">중층운 (2-7km)</div>
              <div className="text-sm">고적운, 고층운</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm text-blue-200">하층운 (0-2km)</div>
              <div className="text-sm">층운, 층적운, 난층운</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm text-blue-200">수직운 (수직 발달)</div>
              <div className="text-sm">적운, 적란운</div>
            </div>
          </div>
        </div>

        {/* Cloud Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cloudData.map((cloud, index) => (
            <div
              key={cloud.name}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Cloud Image */}
              <div className="relative h-80 overflow-hidden">
                <ImageWithFallback
                  src={cloud.imageUrl}
                  alt={`${cloud.name} (${cloud.englishName})`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  {cloud.altitude}
                </div>
              </div>

              {/* Cloud Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl mb-1">{cloud.name}</h3>
                    <p className="text-sm text-gray-500">{cloud.englishName}</p>
                  </div>
                  <Cloud className="w-8 h-8 text-blue-400" />
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  {cloud.description}
                </p>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleCard(index)}
                  className="w-full flex items-center justify-between py-2 px-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-700"
                >
                  <span className="text-sm">
                    {expandedCard === index ? '상세 정보 접기' : '상세 정보 보기'}
                  </span>
                  {expandedCard === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>

                {/* Expanded Content */}
                {expandedCard === index && (
                  <div className="mt-4 space-y-4 animate-fadeIn">
                    {/* Characteristics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm mb-2 text-gray-700">🔍 주요 특징</h4>
                      <ul className="space-y-1">
                        {cloud.characteristics.map((char, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weather Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <h4 className="text-sm mb-2 text-blue-900">☁️ 날씨 예보</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {cloud.weather}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-8 text-center shadow-lg">
          <h3 className="text-2xl mb-3">준비되셨나요?</h3>
          <p className="text-purple-100 mb-6">
            이제 직접 구름 사진을 업로드하고 AI와 함께 분류해보세요!
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors shadow-md"
          >
            구름 판별하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}