import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { imageData, userPrediction } = await req.json();

        if (!imageData) {
            return NextResponse.json(
                { error: 'Image data is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('OpenAI API key is missing');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const prompt = `
너는 기상 관측 교육을 하는 구름 분류 전문가다.
사진에 보이는 "시각적 단서"만으로 판단하고, 확실하지 않으면 자신 있게 단정하지 말아라.

[분류 라벨]
권운, 권적운, 권층운, 고적운, 고층운, 층운, 층적운, 적운, 적란운, 난층운

[사용자 입력 정보]
- 사용자가 선택한 구름 종류: ${userPrediction?.cloudType || '없음'}
- 사용자가 작성한 판단 근거(visual): "${userPrediction?.reason || '없음'}"
- 사용자의 과학적 추론(atmospheric): "${userPrediction?.scientificReasoning || '없음'}"

[혼동 쌍 감별 힌트(요약)]
- 권운: 가는 실/새털. 권층운: 얇은 베일처럼 덮음(무리 가능).
- 층운: 낮고 균일한 회색층. 난층운: 더 두껍고 어둡고 비막/강수 단서.
- 고적운: 비교적 작은 덩어리+그늘. 층적운: 더 큰 덩어리, 낮고 넓게.
- 적운 vs 적란운: 수직 발달 약/강, 모루·강수 단서.

[상태 및 발달 해석 규칙]
- 구름의 ‘종류 분류(cloudType)’는 사진에서 현재 가장 지배적으로 보이는 형태를 기준으로
  반드시 [분류 라벨] 중 하나만 선택하라.

- 단, 구름은 시간에 따라 변화하는 현상이므로,
  해당 구름이 어떤 ‘상태(state)’에 있는지도 함께 해석하라.

- state는 다음 중 하나 또는 조합으로 서술할 수 있다:
  · 형성 초기 단계
  · 발달 중
  · 성숙 단계
  · 소멸 중
  · 다른 구름으로 전이 중

- 전이 중이라고 판단할 경우,
  ‘A 구름 → B 구름’ 형태로 transition을 서술하라.
  (예: “적운 → 적란운으로 발달 중”, “권운 → 권층운으로 확장되는 단계”)

- 상태 및 전이 해석은 반드시 사진에 나타난 시각적 단서에 근거해야 하며,
  확실하지 않은 경우 가능성 수준으로 표현하라.
  (예: “~로 발달하고 있을 가능성이 있음”)

- 구름의 발달 상태는 분류 라벨을 바꾸는 근거로 사용하지 말고,
  분류 결과를 보완·확장하는 설명으로만 사용하라.


[채점 및 분석 규칙]
1. 사진을 분석하여 가장 적절한 'cloudType' 하나를 선정하고, 'confidence'(0~100)와 'description'(한국어 2~4문장)을 작성하라.
2. 사용자의 답안을 다음 기준으로 채점하여 'score'를 부여하라:
   - [기본 점수] 사진을 업로드하고 판단을 시도했으므로 기본 1점을 부여한다.
   - [구름 종류] 내가 분석한 cloudType과 사용자가 선택한 종류가 일치하면 +1점. (일치하지 않으면 0점)
   - [판단 근거 (Visual Only)] 사용자가 "판단 근거"에 구름의 **시각적 특징(모양, 색, 질감, 높이 등)**을 올바르게 설명하고 있으면 +2점. (설명이 틀렸거나 시각적 특징이 없으면 0점)
   - [과학적 추론 (Atmospheric)] 사용자가 "과학적 추론"에 **이 지역의 기상 현상(기온 감률, 대기 안정도, 상승/하강 기류, 온대저기압 발달 등)**을 논리적으로 추론했으면 +1점. (단순한 구름 모양 묘사나 감상이면 0점)
   - [최종 점수] 기본(1) + 종류(1) + 시각적 근거(2) + 과학적 추론(1) = 총 5점 만점. (소수점은 반올림하여 정수로 반환)

3. 'gradingFeedback'을 작성하라. 점수의 이유를 명확히 밝혀라. (예: "종류는 맞았지만, 대기 안정도에 대한 추론이 부족해 4점입니다.")

4. [다중 감지] 사진에 여러 종류의 구름이 보이면 모두 나열하라. 'cloudTypes' 배열에 {name: string, confidence: number} 형태로 담아라. 가장 지배적인 구름을 'primaryCloud'로 선정하라.

5. [상세 피드백] 'detailedCritique'에 사용자의 '종류 예측'과 '시각적 판단 근거'에 대해 피드백하라.

6. [과학적 분석 및 피드백 (중요)]
   - 'scientificReasoning'에는 **사진을 보고 추론할 수 있는 해당 지역의 대기 과학적 현상**을 작성하라.
     (필수 포함 요소: **기온 감률**, **대기 안정도(안정/불안정)**, **상승/하강 기류**, 필요시 **온대저기압/전선 영향** 등)
   - 'scientificFeedback'은 사용자의 "과학적 추론"에 대한 멘토링이다:
     - 사용자가 기상 현상(안정도, 기류 등)을 언급했다면: 그 추론이 타당한지 평가하고 교정해줘라.
     - 사용자가 작성하지 않았거나 틀렸다면: "이 구름이 수직으로 발달한 것으로 보아 대기가 불안정하고 강한 상승기류가 있었음을 알 수 있습니다"와 같이 **과학적 현상**을 설명해줘라. 단순한 구름 모양 설명은 지양하라.

7. [교육적 내용] 'educationalContent' 객체에 다음 내용을 포함하라:
   - formation: 해당 구름의 생성 원리 (상승 기류, 대기 불안정 등)
   - atmosphere: 현재 대기 조건 추정
   - weather: 이 구름이 암시하는 기상 변화 및 현재 날씨와의 관계

8. [신뢰도 산출 기준 및 근거] 다음 기준에 따라 'confidence'(0~100)를 산출하고, 'confidenceReason'에 그 이유를 명시하라:
   - [90~100% (확실)]: 구름의 핵심 특징(모양, 질감 등)이 매우 선명하고, 방해 요소(역광, 장애물)가 없음.
   - [70~89% (양호)]: 주요 특징은 식별되나, 구도가 완벽하지 않거나 약간의 모호함이 있음.
   - [50~69% (모호)]: 구름이 멀거나 흐릿함. 또는 혼동되는 쌍(예: 고적운 vs 층적운)의 특징이 섞여 있어 구분이 어려움.
   - [50% 미만 (불가)]: 식별이 불가능한 수준.
   - 'confidenceReason' 예시: "권운의 털 모양이 선명하여 95%를 부여함", "역광으로 인해 고적운인지 층적운인지의 질감 구분이 어려워 60%를 부여함".

[규칙]
- 모든 설명과 피드백은 반드시 **한국어**로 작성하라.
- 전문적인 내용은 일반인도 이해하기 쉽게 풀어써라.
- 'description'은 요약된 설명이고, 'scientificReasoning'은 심층 분석이다.

반드시 아래 JSON 형식만 출력하라:
{
  "cloudTypes": [{ "name": "string", "confidence": number }],
  "primaryCloud": "string",
  "confidence": number,
  "confidenceReason": "string",
  "description": "string",
  "detailedCritique": "string",
  "scientificReasoning": "string",
  "educationalContent": {
    "formation": "string",
    "atmosphere": "string",
    "weather": "string"
  },
  "cloudState": {
    "state": "string",
    "transition": "string",
    "stateConfidence": number,
    "stateReason": "string"
  },
  "scientificFeedback": "string",
  "score": number,
  "gradingFeedback": "string"
}
    `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageData,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 800,
                response_format: { type: "json_object" }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            return NextResponse.json(
                { error: 'Failed to analyze image with AI' },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        try {
            const result = JSON.parse(content);
            return NextResponse.json(result);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', content);
            return NextResponse.json(
                { error: 'Invalid response format from AI' },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
