import { Cloud, User, LogOut } from 'lucide-react';
import { LoginModal } from './LoginModal';
import type { AuthUser } from '../utils/auth';

interface HeaderProps {
  user: AuthUser | null;
  onLoginClick: () => void;
  onLogout: () => void;
  showLoginModal: boolean;
  onCloseModal: () => void;
  onLogoClick?: () => void;
}

export function Header({ user, onLoginClick, onLogout, showLoginModal, onCloseModal, onLogoClick }: HeaderProps) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Cloud className="w-8 h-8 text-blue-500" />
            <span className="text-xl">CloudLab</span>
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors"
            >
              로그인12
            </button>
          )}
        </div>
      </header>

      {showLoginModal && <LoginModal onClose={onCloseModal} />}
    </>
  );
}