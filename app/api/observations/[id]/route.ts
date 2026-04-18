import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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

        // Admin check
        const isAdmin = user.email?.startsWith('cloudlab2601');
        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin only' }, { status: 403 });
        }

        const observationId = params.id;
        const body = await req.json();
        const { score, removeObjection } = body;

        let updateData: any = {};
        
        if (score !== undefined) {
             updateData.score = score;
        }

        if (removeObjection) {
            // First fetch current reason_user to remove tag
            const { data: obs } = await supabase
                .from('observations')
                .select('reason_user')
                .eq('id', observationId)
                .single();
                
            if (obs && obs.reason_user) {
                updateData.reason_user = obs.reason_user.replace('[OBJECTION_RAISED]', '').trim();
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('observations')
            .update(updateData)
            .eq('id', observationId)
            .select()
            .single();

        if (error) {
            console.error('Error updating observation:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, observation: data });

    } catch (error: any) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
