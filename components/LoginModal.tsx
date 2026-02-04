import { useState } from 'react';
import { X } from 'lucide-react';
import { signInWithGoogle } from '../utils/auth';
import { createClient } from '../utils/supabase/client';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    console.log('[LoginModal] Google login button clicked');
    setError('');
    setIsLoading(true);

    try {
      const result = await signInWithGoogle();
      console.log('[LoginModal] signInWithGoogle result:', result);

      if (!result.success) {
        setError(result.error || 'Google 로그인에 실패했습니다');
        setIsLoading(false);
      }
      // If successful, the browser will redirect to Google - don't set loading to false or close modal
    } catch (err) {
      console.error('[LoginModal] Unexpected error:', err);
      setError('예상치 못한 오류가 발생했습니다');
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError('로그인 실패: 아이디(이메일) 또는 비밀번호를 확인해주세요.');
        setIsLoading(false);
      } else {
        // Login successful, modal will close via auth state change listener in parent or we can close here
        window.location.reload(); // Simple reload to refresh auth state
      }
    } catch (err) {
      console.error(err);
      setError('로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Prevent closing when clicking backdrop
        e.stopPropagation();
      }}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl mb-6 text-center">{isAdminMode ? '관리자 로그인' : '로그인'}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {!isAdminMode ? (
            <>
              <p className="text-center text-gray-600 mb-6">
                CloudLab에 오신 것을 환영합니다!<br />
                구글 계정으로 간편하게 로그인하세요.
              </p>

              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google로 계속하기
              </button>
            </>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">아이디 (이메일)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isLoading ? '로그인 중...' : '관리자 로그인'}
              </button>
            </form>
          )}

          <div className="text-center pt-4">
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {isAdminMode ? '일반 사용자 로그인으로 돌아가기' : '관리자이신가요?'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}