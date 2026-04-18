import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { observationId } = await req.json();
        if (!observationId) {
            return NextResponse.json({ error: 'Observation ID is required' }, { status: 400 });
        }

        // Fetch the observation to append the tag to reason_user
        const { data: obs, error: fetchError } = await supabase
            .from('observations')
            .select('user_id, reason_user')
            .eq('id', observationId)
            .single();

        if (fetchError || !obs) {
            return NextResponse.json({ error: 'Observation not found' }, { status: 404 });
        }

        if (obs.user_id !== user.id) {
            return NextResponse.json({ error: 'Not authorized for this observation' }, { status: 403 });
        }

        if (obs.reason_user && obs.reason_user.includes('[OBJECTION_RAISED]')) {
            return NextResponse.json({ success: true, message: 'Already raised' });
        }

        const updatedReason = `${obs.reason_user || ''} [OBJECTION_RAISED]`;

        const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceRoleKey) {
            console.warn('No service role key provided in env, falling back to anon key. Updates may fail due to RLS.');
        }

        const supabaseAdmin = supabaseServiceRoleKey 
            ? createClient(supabaseUrl, supabaseServiceRoleKey) 
            : supabase;

        const { error: updateError } = await supabaseAdmin
            .from('observations')
            .update({ reason_user: updatedReason })
            .eq('id', observationId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Objection API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
