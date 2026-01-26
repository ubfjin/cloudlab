import { useState } from 'react';
import { X, Mail } from 'lucide-react';
import { signInWithMagicLink, signInWithGoogle } from '../utils/auth';

interface LoginModalProps {
  onClose: () => void;
}

export function LoginModal({ onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await signInWithMagicLink(email);
    
    if (result.success) {
      setEmailSent(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      setError(result.error || '로그인 링크 전송에 실패했습니다');
    }
    setIsLoading(false);
  };

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

        <h2 className="text-2xl mb-6">로그인</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {emailSent ? (
          <div className="text-center py-8">
            <Mail className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600 mb-2">로그인 링크를 이메일로 보내드립니다</p>
            <p className="text-sm text-gray-500">이메일을 확인하고 링크를 클릭해주세요</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleEmailLogin} className="mb-6">
              <label className="block mb-2 text-sm text-gray-600">이메일 로그인</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? '로딩 중...' : '로그인 링크 전송'}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </button>
              
              <div className="text-xs text-gray-500 text-center pt-2">
                ⚠️ 소셜 로그인을 사용하려면 Supabase에서 설정이 필요합니다
                <br />
                <a 
                  href="https://supabase.com/docs/guides/auth/social-login/auth-google" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Google 설정
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}