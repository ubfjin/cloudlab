'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
    LineChart,
    Users,
    ArrowLeft,
    Search,
    Filter
} from 'lucide-react';
import { HistoryPage } from '@/components/HistoryPage';

interface UserProfile {
    id: string;
    email: string;
    class_name: string;
    totalScore?: number;
}

interface Observation {
    id: number;
    imageUrl: string;
    userPrediction: {
        cloudType: string;
        reason: string;
        date?: string;
        time?: string;
        location?: string;
        weather?: string;
    };
    aiPrediction: {
        cloudType: string;
        score: number;
    };
    createdAt: string;
}

export default function AdminPage() {
    const { user, loading: authLoading, accessToken } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userObservations, setUserObservations] = useState<Observation[]>([]);
    const [obsLoading, setObsLoading] = useState(false);
    const [excludedObservationIds, setExcludedObservationIds] = useState<Set<number>>(new Set());
    const [viewingDetails, setViewingDetails] = useState(false);

    useEffect(() => {
        if (!authLoading && !user?.isAdmin) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user?.isAdmin && accessToken) {
            fetchUsers();
        }
    }, [user, accessToken]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserObservations = async (targetUser: UserProfile) => {
        setObsLoading(true);
        setSelectedUser(targetUser);
        try {
            const res = await fetch(`/api/observations?userId=${targetUser.id}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserObservations(data.observations || []);
                setExcludedObservationIds(new Set()); // Reset on user change
            }
        } catch (error) {
            console.error('Failed to fetch observations:', error);
        } finally {
            setObsLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        selectedClass === 'all' || u.class_name === selectedClass
    );

    const toggleObservationScore = (obsId: number) => {
        setExcludedObservationIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(obsId)) {
                newSet.delete(obsId);
            } else {
                newSet.add(obsId);
            }
            return newSet;
        });
    };

    const calculateCurrentTotalScore = (user: UserProfile) => {
        if (!user.totalScore) return 0;
        
        // Only calculate the deduction if this is the currently selected user
        // and we have loaded their observations.
        if (selectedUser?.id === user.id && userObservations.length > 0) {
            let deduction = 0;
            userObservations.forEach(obs => {
                if (excludedObservationIds.has(obs.id)) {
                    deduction += (obs.aiPrediction.score || 0);
                }
            });
            return user.totalScore - deduction;
        }
        
        // For users not currently selected, just return their base total score
        return user.totalScore;
    };

    if (authLoading || (loading && !users.length)) {
        return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;
    }

    if (!user?.isAdmin) return null;

    if (viewingDetails && selectedUser) {
        return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
                <HistoryPage
                    onBack={() => setViewingDetails(false)}
                    accessToken={accessToken}
                    targetUserId={selectedUser.id}
                    targetUserEmail={selectedUser.email}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <LineChart className="w-8 h-8 text-blue-600" />
                            관리자 대시보드
                        </h1>
                        <p className="text-gray-600 mt-2">학생들의 관찰 활동을 모니터링합니다.</p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        메인으로 돌아가기
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar: User List */}
                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-gray-500" />
                                    사용자 목록 <span className="text-sm font-normal text-gray-500">({filteredUsers.length})</span>
                                </h2>
                            </div>

                            {/* Filter */}
                            <div className="flex gap-2">
                                {['all', '26년도 1학기', '일반인'].map((cls) => (
                                    <button
                                        key={cls}
                                        onClick={() => {
                                            setSelectedClass(cls);
                                            setSelectedUser(null);
                                        }}
                                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${selectedClass === cls
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        {cls === 'all' ? '전체' : cls}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredUsers.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => fetchUserObservations(u)}
                                    className={`w-full p-3 rounded-lg text-left transition-all ${selectedUser?.id === u.id
                                        ? 'bg-blue-50 border-blue-100 ring-1 ring-blue-200'
                                        : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <div className="font-medium text-gray-900 truncate">{u.email}</div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                                        <span className={`px-2 py-0.5 rounded-full ${u.class_name === '26년도 1학기' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {u.class_name || '미지정'}
                                        </span>
                                        <span className="font-semibold text-blue-600">
                                            총점: {calculateCurrentTotalScore(u)}점
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Observations */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-[calc(100vh-12rem)] overflow-y-auto">
                        {!selectedUser ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p>좌측 목록에서 사용자를 선택하여<br />관찰 기록을 확인하세요.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <span className="text-blue-600">{selectedUser.email}</span>
                                        <span className="text-gray-400 font-normal text-base">님의 관찰 기록</span>
                                    </h3>
                                    <button
                                        onClick={() => setViewingDetails(true)}
                                        className="text-sm font-medium px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                                    >
                                        학생 화면으로 자세히 보기
                                    </button>
                                </div>

                                {obsLoading ? (
                                    <div className="text-center py-12 text-gray-500">기록 불러오는 중...</div>
                                ) : userObservations.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-500">아직 관찰 기록이 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {userObservations.map((obs) => {
                                            const isExcluded = excludedObservationIds.has(obs.id);
                                            return (
                                            <div key={obs.id} className={`bg-white border rounded-xl p-5 transition-shadow ${isExcluded ? 'border-gray-200 opacity-60' : 'border-blue-200 hover:shadow-md'}`}>
                                                <div className="flex gap-4">
                                                    {/* Image */}
                                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                                                        <img
                                                            src={obs.imageUrl}
                                                            alt="Cloud Observation"
                                                            className={`w-full h-full object-cover ${isExcluded ? 'grayscale' : ''}`}
                                                        />
                                                        {isExcluded && (
                                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">제외됨</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${isExcluded ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-700'}`}>
                                                                    AI: {obs.aiPrediction.cloudType}
                                                                </span>
                                                                <span className="text-sm text-gray-500">
                                                                    (User: {obs.userPrediction.cloudType})
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-400">
                                                                {new Date(obs.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                                                            <span className="font-semibold text-gray-900">관찰 이유:</span> {obs.userPrediction.reason}
                                                        </p>

                                                        {/* Metadata Grid */}
                                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2">
                                                            <div>
                                                                <span className="font-semibold text-gray-700">📍 위치:</span> {obs.userPrediction.location || '-'}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-gray-700">☀️ 날씨:</span> {obs.userPrediction.weather || '-'}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-gray-700">📅 일자:</span> {obs.userPrediction.date || '-'}
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-gray-700">⏰ 시간:</span> {obs.userPrediction.time || '-'}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-3">
                                                            <div className={`text-sm ${isExcluded ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                                                                정확도 점수: <span className="font-medium truncate">{obs.aiPrediction.score}점</span>
                                                            </div>
                                                            
                                                            <button
                                                                onClick={() => toggleObservationScore(obs.id)}
                                                                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                                                    isExcluded 
                                                                    ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200' 
                                                                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                                }`}
                                                            >
                                                                {isExcluded ? '점수 반영하기' : '총점에서 제외'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                        
                                        {/* Total Score Footer */}
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                        <LineChart className="w-5 h-5 text-blue-600" />
                                                        최종 평가 점수
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        제외된 기록을 뺀 순수 합산 점수입니다. (총 {userObservations.length}개 기록 중 {userObservations.length - excludedObservationIds.size}개 반영)
                                                    </p>
                                                </div>
                                                <div className="text-3xl font-black text-blue-600">
                                                    {calculateCurrentTotalScore(selectedUser)}<span className="text-lg font-medium text-gray-600 ml-1">점</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
