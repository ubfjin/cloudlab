import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Check authentication via Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        // Create an authenticated client for this request
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;
        const body = await req.json();
        const { imageUrl, userPrediction, aiPrediction, isMatch } = body;

        // Validate required fields
        if (!imageUrl || !userPrediction || !aiPrediction) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('observations')
            .insert({
                user_id: userId,
                image_url: imageUrl,
                cloud_type_user: userPrediction.cloudType,
                reason_user: userPrediction.reason,
                cloud_type_ai: aiPrediction.cloudType,
                reason_ai: aiPrediction.reason,
                confidence: aiPrediction.confidence,
                score: aiPrediction.score,
                is_match: isMatch,
                scientific_reasoning_user: userPrediction.scientificReasoning,
                scientific_feedback_ai: aiPrediction.scientificFeedback,
                cloud_state_ai: aiPrediction.cloudState,
                observation_date: userPrediction.date,
                observation_time: userPrediction.time,
                location: userPrediction.location,
                weather: userPrediction.weather
            })
            .select()
            .single();

        if (error) {
            console.error('Error inserting observation:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, observation: data });

    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Check authentication via Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');

        // Create an authenticated client for this request
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get('userId');

        // Admin Check
        const isAdmin = user.email?.startsWith('cloudlab2601');
        const userId = user.id;

        let queryUserId = userId;
        if (isAdmin && targetUserId) {
            queryUserId = targetUserId;
        }

        const { data, error } = await supabase
            .from('observations')
            .select('*')
            .eq('user_id', queryUserId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching observations:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Map DB snake_case columns to camelCase expected by frontend
        const observations = data.map(obs => ({
            id: obs.id, // Include ID for React keys
            imageUrl: obs.image_url,
            userPrediction: {
                cloudType: obs.cloud_type_user,
                reason: obs.reason_user,
                date: obs.observation_date,
                time: obs.observation_time,
                location: obs.location,
                weather: obs.weather
            },
            aiPrediction: {
                cloudType: obs.cloud_type_ai,
                reason: obs.reason_ai,
                confidence: obs.confidence,
                score: obs.score,
                scientificFeedback: obs.scientific_feedback_ai,
                cloudState: obs.cloud_state_ai
            },
            scientificReasoning: obs.scientific_reasoning_user,
            userId: obs.user_id,
            createdAt: obs.created_at
        }));

        return NextResponse.json({ observations });

    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
