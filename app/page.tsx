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
import { UserPrediction, ImageMetadata } from '@/types';

export default function Home() {
  const { user, accessToken, signOut, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'main' | 'learning' | 'practice' | 'history' | 'upload' | 'prediction' | 'result'>('main');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedMetadata, setUploadedMetadata] = useState<ImageMetadata | undefined>(undefined);
  const [userPrediction, setUserPrediction] = useState<UserPrediction>({ cloudType: '', reason: '' });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  // Check if user has seen tutorial before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('cloudlab_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  // Restore flow state after login redirect
  useEffect(() => {
    const savedStateStr = sessionStorage.getItem('cloudlab_flow_state');
    if (savedStateStr) {
      try {
        const savedState = JSON.parse(savedStateStr);
        if (savedState.currentStep && savedState.uploadedImage) {
          setCurrentStep(savedState.currentStep);
          setUploadedImage(savedState.uploadedImage);
          if (savedState.uploadedMetadata) setUploadedMetadata(savedState.uploadedMetadata);
          if (savedState.userPrediction) setUserPrediction(savedState.userPrediction);
        }
      } catch (e) {
        console.error('Failed to parse saved flow state', e);
      }
      
      // Clean up the storage so it doesn't persist forever
      sessionStorage.removeItem('cloudlab_flow_state');
    }
  }, []);

  // Save flow state when it changes (only when in prediction flow)
  useEffect(() => {
    if (currentStep === 'upload' || currentStep === 'prediction' || currentStep === 'result') {
      const state = {
        currentStep,
        uploadedImage,
        uploadedMetadata,
        userPrediction
      };
      sessionStorage.setItem('cloudlab_flow_state', JSON.stringify(state));
    } else {
      sessionStorage.removeItem('cloudlab_flow_state');
      sessionStorage.removeItem('cloudlab_ai_prediction');
      sessionStorage.removeItem('cloudlab_auto_save_after_login');
    }
  }, [currentStep, uploadedImage, uploadedMetadata, userPrediction]);

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

  const handleImageUpload = (imageUrl: string, metadata?: ImageMetadata) => {
    setUploadedImage(imageUrl);
    setUploadedMetadata(metadata);
    setCurrentStep('prediction');
  };

  const handlePredictionSubmit = (prediction: UserPrediction) => {
    setUserPrediction(prediction);
    setCurrentStep('result');
  };

  const handleReset = () => {
    setCurrentStep('main');
    setUploadedImage(null);
    setUploadedMetadata(undefined);
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
        onChangeClass={() => setShowClassModal(true)}
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
            metadata={uploadedMetadata}
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

      {(!loading && user && !user.className && !user.isAdmin) || showClassModal ? (
        <ClassSelectionModal
          onSelect={() => window.location.reload()}
          onClose={user?.className ? () => setShowClassModal(false) : undefined}
        />
      ) : null}
    </div>
  );
}
