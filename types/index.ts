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

export interface WeatherData {
    temperature: number;
    humidity: number;
    cloudCoverage: number;
    wind: string;
    pressure: string;
    precipitation: number;
}
