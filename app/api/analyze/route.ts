import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { imageData } = await req.json();

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

[규칙]
- 반드시 위 라벨 중 하나만 cloudType으로 선택한다.
- confidence는 0~100 정수.
- description은 한국어로 2~4문장.
- description에는 (1) 형태/질감 (2) 층상/덩어리 구조 (3) 발달 정도 같은 시각 근거를 최소 2개 포함한다.
- 사진만으로 고도 판별이 어려우면 confidence를 60 이하로 낮추고, 왜 어려운지 설명에 포함한다.

반드시 아래 JSON만 출력:
{
  "cloudType": "string",
  "confidence": number,
  "description": "string"
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
                max_tokens: 500,
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
