export interface TaskStep {
  id: string;
  title: string;
  description: string;
  timeEstimate: string;
}

export type PlaceType = 'Online' | 'CSC Center' | 'Bank' | 'Panchayat Office' | 'Government Office' | 'Post Office' | 'ATM';

export interface Task {
  id:string;
  title: string;
  purpose: string;
  timeRequired: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Documents' | 'Finance' | 'Career' | 'Health' | 'Digital Safety' | 'Bank' | 'Property' | 'Law';
  overview: {
    what: string;
    why: string;
    who: string;
  };
  steps: TaskStep[];
  commonMistakes: string[];
  officialLinks: { title: string; url: string }[];
  completionMethods: PlaceType[];
  relevantFor?: UserRole[];
  moreInfo?: {
    type: 'video' | 'article';
    url: string;
    title: string;
  };
}

export interface Scheme {
  id: string;
  name: string;
  category: string;
  type: 'Central' | 'State';
  state?: string;
  status: 'Upcoming' | 'Active' | 'Ending Soon' | 'Expired';
  launchDate: string;
  deadline?: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  applicationProcess: string;
  officialLink: string;
  completionMethods: PlaceType[];
  moreInfo?: {
    type: 'video' | 'article';
    url: string;
    title: string;
  };
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface Locale {
  [lang: string]: Translation;
}

export type Progress = {
  [taskId: string]: {
    [stepId: string]: boolean;
  };
};

export type UserRole = 'student' | 'working' | 'parent' | 'senior' | 'general';

export type Theme = 'light' | 'dark' | 'system';

// Types for Eligibility Check feature
export interface EligibilityQuestion {
  id: string;
  question: {
    en: string;
    hi: string;
  };
  // The expected answer for eligibility. true for 'yes', false for 'no'.
  expects: boolean; 
  failReason: {
    en: string;
    hi: string;
  };
}

export interface EligibilityLogic {
  questions: EligibilityQuestion[];
}

export type EligibilityData = {
  [itemId: string]: EligibilityLogic;
};

// Types for Scam Alert feature
export interface ScamAlert {
  message: {
    en: string;
    hi: string;
  };
  severity: 'info' | 'warning' | 'critical';
}

export interface ScamAlertData {
  [itemId: string]: ScamAlert[];
}

// Types for Family Share
export type ShareType = 'son' | 'daughter' | 'brother' | 'csc' | 'other';