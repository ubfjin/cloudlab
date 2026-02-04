import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

        const userId = user.id;

        // Get total observations
        const { count: totalObservations, error: totalError } = await supabase
            .from('observations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (totalError) {
            console.error('Error fetching total stats:', totalError);
            return NextResponse.json({ error: totalError.message }, { status: 500 });
        }

        // Get correct predictions
        const { count: correctPredictions, error: correctError } = await supabase
            .from('observations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_match', true);

        if (correctError) {
            console.error('Error fetching correct stats:', correctError);
            return NextResponse.json({ error: correctError.message }, { status: 500 });
        }

        // Get total score
        const { data: scoreData, error: scoreError } = await supabase
            .from('observations')
            .select('score')
            .eq('user_id', userId);

        let totalScore = 0;
        if (!scoreError && scoreData) {
            totalScore = scoreData.reduce((sum, obs) => sum + (obs.score || 0), 0);
        }

        const total = totalObservations || 0;
        const correct = correctPredictions || 0;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        return NextResponse.json({
            totalObservations: total,
            correctPredictions: correct,
            accuracy,
            totalScore
        });

    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
