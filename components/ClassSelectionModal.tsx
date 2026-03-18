import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X } from 'lucide-react';

interface ClassSelectionModalProps {
    onSelect: (className: string) => void;
    onClose?: () => void;
}

export function ClassSelectionModal({ onSelect, onClose }: ClassSelectionModalProps) {
    const [loading, setLoading] = useState(false);
    const { accessToken } = useAuth();

    const handleSelect = async (className: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ className })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            onSelect(className);
        } catch (error) {
            console.error('Error saving class:', error);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-xl relative">
                {onClose && (
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">환영합니다! 👋</h2>
                <p className="text-center text-gray-600 mb-8">
                    참여하시는 학급 또는 소속을 선택해주세요.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => handleSelect('26년도 1학기')}
                        disabled={loading}
                        className="w-full py-4 px-6 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 hover:border-blue-200 transition-all text-left group"
                    >
                        <span className="block text-lg font-bold text-blue-900 group-hover:text-blue-700">26년도 1학기</span>
                        <span className="text-sm text-blue-600">지구과학 수업을 듣는 학생이라면 이곳을 선택하세요.</span>
                    </button>

                    <button
                        onClick={() => handleSelect('일반인')}
                        disabled={loading}
                        className="w-full py-4 px-6 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 hover:border-gray-200 transition-all text-left group"
                    >
                        <span className="block text-lg font-bold text-gray-900 group-hover:text-gray-700">일반인</span>
                        <span className="text-sm text-gray-600">수업과 관계없이 구름을 관찰하고 있다면 이곳을 선택하세요.</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
