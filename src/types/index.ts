export interface SiteSettings {
  academyName: string;
  tagline: string;
  welcomeMessage: string;
  logoUrl: string;
  faviconUrl: string;
  introduction: string;
  history: string;
  mission: string;
  vision: string;
  educationalApproach: string;
  phone: string;
  email: string;
  address: string;
  mapUrl: string;
  whatsappUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  footerText: string;
}

export interface ManagedItem {
  id: string;
  order: number;
  published: boolean;
}

export interface Person extends ManagedItem {
  name: string;
  position: string;
  qualifications: string;
  experience: string;
  bio: string;
  photoUrl: string;
  additionalInfo: string;
}

export interface AcademyEvent extends ManagedItem {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  imageUrl: string;
  videoUrl: string;
}

export interface Achievement extends ManagedItem {
  title: string;
  description: string;
  year: string;
  imageUrl: string;
}

export interface GalleryItem extends ManagedItem {
  mediaType: 'image' | 'video';
  url: string;
  title: string;
  caption: string;
  category: string;
}

export const ADMISSION_STATUSES = ['New', 'Under Review', 'Accepted', 'Rejected'] as const;
export type AdmissionStatus = (typeof ADMISSION_STATUSES)[number];

export interface Admission {
  id: string;
  studentName: string;
  dateOfBirth: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  email: string;
  gradeApplied: string;
  previousSchool: string;
  address: string;
  notes: string;
  status: AdmissionStatus;
  createdAt?: unknown;
}

export const FEEDBACK_STATUSES = ['New', 'In Progress', 'Resolved'] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export interface FeedbackItem {
  id: string;
  kind: 'Feedback' | 'Complaint';
  name: string;
  anonymous: boolean;
  contact: string;
  subject: string;
  message: string;
  status: FeedbackStatus;
  read: boolean;
  createdAt?: unknown;
}

export interface AppNotification {
  id: string;
  type: 'admission' | 'feedback';
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt?: unknown;
}
