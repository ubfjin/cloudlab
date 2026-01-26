import { createClient } from './supabase/client';
import { projectId, publicAnonKey } from './supabase/info';

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
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
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const { accessToken } = await getSession();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    };

    if (options.headers) {
        Object.assign(headers, options.headers);
    }

    const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-698a0d9f${endpoint}`,
        {
            ...options,
            headers
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}
