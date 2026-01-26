import { useState, useEffect } from 'react';
import { createClient } from '../utils/supabase/client';
import type { AuthUser } from '../utils/auth';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        console.log('[useAuth] Initializing auth...');
        console.log('[useAuth] Current URL:', window.location.href);
        console.log('[useAuth] Has hash?', window.location.hash);

        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            console.log('[useAuth] getSession result:', { session: !!session, error });

            if (session) {
                console.log('[useAuth] ✅ Session found:', session.user.email);
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name
                });
                setAccessToken(session.access_token);
            } else {
                console.log('[useAuth] ❌ No session found');
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[useAuth] Auth state changed:', event, session?.user?.email);

            if (session) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name
                });
                setAccessToken(session.access_token);
            } else {
                setUser(null);
                setAccessToken(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        setAccessToken(null);
    };

    return { user, accessToken, loading, signOut };
}
