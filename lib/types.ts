export type Role = 'student' | 'staff' | 'security';
export type ReportType = 'lost' | 'found';
export const CATEGORIES = [
  'Electronics',
  'ID & cards',
  'Keys',
  'Bags',
  'Clothing',
  'Umbrellas',
  'Books & stationery',
  'Other',
] as const;
export type Category = (typeof CATEGORIES)[number];
export const STATUSES = [
  'Draft',
  'Reported',
  'Possible Match',
  'Under Review',
  'Ready for Pickup',
  'Returned',
  'Rejected',
  'Unclaimed',
] as const;
export type ReportStatus = (typeof STATUSES)[number];
export interface Profile {
  id: string;
  name: string;
  email: string;
  schoolId: string;
  role: Role;
  passwordHash?: string;
  salt?: string;
}
export interface CampusLocation {
  id: string;
  name: string;
  zone: string;
}
export interface ItemReport {
  id: string;
  reference: string;
  reporterId: string;
  type: ReportType;
  title: string;
  description: string;
  category: Category;
  color: string;
  brand: string;
  identifyingFeatures: string;
  date: string;
  time: string;
  locationId: string;
  imageUrl: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  storageLocation: string;
  contactPreference: string;
}
export interface ItemImage {
  id: string;
  reportId: string;
  url: string;
  private: boolean;
}
export interface ItemMatch {
  id: string;
  lostReportId: string;
  foundReportId: string;
  score: number;
  reasons: string[];
}
export interface OwnershipClaim {
  lostReportId?: string;
  id: string;
  reportId: string;
  claimantId: string;
  details: string;
  contents: string;
  proof: string;
  imageUrl: string;
  status: 'Under Review' | 'Ready for Pickup' | 'Rejected' | 'Returned';
  createdAt: string;
  reviewedAt?: string;
  reviewNote: string;
}
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'claim' | 'pickup' | 'returned';
  reportId: string;
  read: boolean;
  createdAt: string;
}
export interface ActivityLog {
  id: string;
  actorId: string;
  message: string;
  createdAt: string;
}
export interface DemoState {
  version: 1;
  profiles: Profile[];
  reports: ItemReport[];
  claims: OwnershipClaim[];
  notifications: Notification[];
  logs: ActivityLog[];
  saved: Record<string, string[]>;
  currentUserId: string | null;
}
export type Page =
  | 'home'
  | 'browse'
  | 'activity'
  | 'matches'
  | 'notifications'
  | 'security'
  | 'help';
export type ReportInput = Pick<
  ItemReport,
  | 'type'
  | 'title'
  | 'description'
  | 'category'
  | 'color'
  | 'brand'
  | 'identifyingFeatures'
  | 'date'
  | 'time'
  | 'locationId'
  | 'imageUrl'
  | 'contactPreference'
>;
