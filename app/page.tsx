"use client";

import { useState, useEffect } from 'react';
import { MainPage } from '@/components/MainPage';
import { UploadPage } from '@/components/UploadPage';
import { PredictionPage } from '@/components/PredictionPage';
import { ResultPage } from '@/components/ResultPage';
import { LearningPage } from '@/components/LearningPage';
import { PracticePage } from '@/components/PracticePage';
import { HistoryPage } from '@/components/HistoryPage';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { Tutorial } from '@/components/Tutorial';
import { useAuth } from '@/hooks/useAuth';
import { ClassSelectionModal } from '@/components/ClassSelectionModal';
import { UserPrediction } from '@/types';

export default function Home() {
  const { user, accessToken, signOut, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'main' | 'learning' | 'practice' | 'history' | 'upload' | 'prediction' | 'result'>('main');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [userPrediction, setUserPrediction] = useState<UserPrediction>({ cloudType: '', reason: '' });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if user has seen tutorial before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('cloudlab_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('cloudlab_tutorial_seen', 'true');
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('cloudlab_tutorial_seen', 'true');
  };

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  const handleStart = () => {
    setCurrentStep('upload');
  };

  const handleLearnClick = () => {
    setCurrentStep('learning');
  };

  const handlePracticeClick = () => {
    setCurrentStep('practice');
  };

  const handleHistoryClick = () => {
    setCurrentStep('history');
  };

  const handleBackToMain = () => {
    setCurrentStep('main');
  };

  const handleBackFromUpload = () => {
    setCurrentStep('main');
  };

  const handleBackFromPrediction = () => {
    setCurrentStep('upload');
  };

  const handleBackFromResult = () => {
    setCurrentStep('prediction');
  };

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setCurrentStep('prediction');
  };

  const handlePredictionSubmit = (prediction: UserPrediction) => {
    setUserPrediction(prediction);
    setCurrentStep('result');
  };

  const handleReset = () => {
    setCurrentStep('main');
    setUploadedImage(null);
    setUserPrediction({ cloudType: '', reason: '' });
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case 'main': return 0;
      case 'upload': return 1;
      case 'prediction': return 2;
      case 'result': return 3;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-blue-50">
      <Header
        user={user}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={signOut}
        showLoginModal={showLoginModal}
        onCloseModal={() => setShowLoginModal(false)}
        onLogoClick={handleReset}
      />

      {currentStep !== 'main' && currentStep !== 'learning' && currentStep !== 'practice' && currentStep !== 'history' && (
        <div className="pt-20 pb-4">
          <ProgressBar
            currentStep={getStepNumber()}
            totalSteps={4}
            onBack={
              currentStep === 'upload' ? handleBackFromUpload :
                currentStep === 'prediction' ? handleBackFromPrediction :
                  currentStep === 'result' ? handleBackFromResult :
                    undefined
            }
          />
        </div>
      )}

      <main className={currentStep === 'main' || currentStep === 'learning' || currentStep === 'practice' || currentStep === 'history' ? 'pt-16' : ''}>
        {currentStep === 'main' && <MainPage onStart={handleStart} onLearnClick={handleLearnClick} onPracticeClick={handlePracticeClick} onTutorialClick={handleShowTutorial} onHistoryClick={handleHistoryClick} isLoggedIn={!!user} />}
        {currentStep === 'learning' && <LearningPage onBack={handleBackToMain} />}
        {currentStep === 'practice' && <PracticePage onBack={handleBackToMain} />}
        {currentStep === 'history' && <HistoryPage onBack={handleBackToMain} accessToken={accessToken} />}
        {currentStep === 'upload' && <UploadPage onImageUpload={handleImageUpload} />}
        {currentStep === 'prediction' && uploadedImage && (
          <PredictionPage
            imageUrl={uploadedImage}
            onSubmit={handlePredictionSubmit}
          />
        )}
        {currentStep === 'result' && uploadedImage && (
          <ResultPage
            imageUrl={uploadedImage}
            userPrediction={userPrediction}
            onReset={handleReset}
            user={user}
            accessToken={accessToken}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}
      </main>

      {showTutorial && (
        <Tutorial
          onClose={handleCloseTutorial}
          onSkip={handleSkipTutorial}
        />
      )}

      {!loading && user && !user.className && !user.isAdmin && (
        <ClassSelectionModal
          onSelect={() => window.location.reload()}
        />
      )}
    </div>
  );
}
