export type CloudType =
    | '권운' | '권적운' | '권층운'
    | '고적운' | '고층운'
    | '층운' | '층적운'
    | '적운' | '적란운' | '난층운';

export interface UserPrediction {
    cloudType: string;
    reason: string;
    date?: string;
    time?: string;
    location?: string;
    weather?: string;
    scientificReasoning?: string;
}

export interface ImageMetadata {
    date?: string; // YYYY-MM-DD
    time?: string; // HH:mm
    location?: {
        latitude: number;
        longitude: number;
    };
}

export interface WeatherData {
    temperature: number;
    humidity: number;
    cloudCoverage: number;
    wind: string;
    pressure: string;
    precipitation: number;
}

export interface AIPrediction {
  cloudType: string;
  cloudTypes?: { name: string; confidence: number }[];
  primaryCloud?: string;
  confidence: number;
  confidenceReason?: string;
  description: string;
  detailedCritique?: string;
  scientificReasoning?: string;
  educationalContent?: {
    formation: string;
    atmosphere: string;
    weather: string;
  };
  score?: number;
  gradingFeedback?: string;
  cloudState?: {
    state: string;
    transition?: string | null;
    stateConfidence: number;
    stateReason: string;
  };
  scientificFeedback?: string;
  scoreBreakdown?: {
    participation: number;
    typeMatch: number;
    visual: number;
    scientific: number;
  };
}
