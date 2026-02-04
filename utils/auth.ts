import { createClient } from './supabase/client';

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    className?: string; // e.g. '26년도 1학기'
    isAdmin?: boolean;
}

export interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
}

// Get current session
export async function getSession(): Promise<AuthState> {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        return { user: null, accessToken: null };
    }

    return {
        user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name
        },
        accessToken: session.access_token
    };
}

// Sign in with magic link
export async function signInWithMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin
        }
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Sign in with OAuth (Google)
export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    console.log('[Auth] Starting Google OAuth sign in...');
    console.log('[Auth] Current origin:', window.location.origin);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            }
        }
    });

    console.log('[Auth] OAuth response:', { data, error });

    if (error) {
        console.error('[Auth] Google OAuth error:', error);
        return { success: false, error: error.message };
    }

    if (data?.url) {
        console.log('[Auth] ✅ Redirecting to Google:', data.url);
        window.location.href = data.url;
        return { success: true };
    } else {
        console.error('[Auth] ❌ No OAuth URL generated');
        return { success: false, error: 'OAuth URL not generated' };
    }
}

// Sign in with OAuth (Kakao)
export async function signInWithKakao(): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

// Sign out
export async function signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
}

// API utilities
interface ApiRequestOptions extends RequestInit {
    token?: string;
}

// API utilities
export async function apiRequest(endpoint: string, options: ApiRequestOptions = {}) {
    let accessToken = options.token;

    if (!accessToken) {
        const session = await getSession();
        accessToken = session.accessToken || undefined;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase environment variables are missing');
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken || supabaseAnonKey}`,
    };

    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    const response = await fetch(
        `/api${endpoint}`,
        {
            ...options,
            headers
        }
    );

    if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
            const textHTML = await response.text();
            try {
                const error = JSON.parse(textHTML);
                errorMessage = error.error || error.message || JSON.stringify(error);
            } catch {
                errorMessage = textHTML || `Request failed with status ${response.status}`;
            }
        } catch (e) {
            errorMessage = `Request failed with status ${response.status}`;
        }
        console.error(`API Error (${endpoint}):`, errorMessage);
        throw new Error(errorMessage);
    }

    return response.json();
}
