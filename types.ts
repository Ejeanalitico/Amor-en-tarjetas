
export enum Rarity {
  COMMON = 'Común',
  RARE = 'Rara',
  EPIC = 'Épica',
  LEGENDARY = 'Legendaria',
  SPECIAL = 'Especial',
}

export interface ICard {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  playedAt?: Date;
  playedBy?: string; // User ID
  geminiContext?: string; // AI generated flavor text
}

export interface IUser {
  id: string;
  name: string;
  email?: string;
  gender?: string; // 'Male', 'Female', 'Other'
  avatar: string;
  partnerName?: string;
  partnerGender?: string; // 'Male', 'Female', 'Other'
  coupleCode?: string; // Code to link partners
  lastPlayedDate?: Date | null; // Track last play for daily limit
  deck: ICard[];
}

export interface IFeedItem {
  id: string;
  card: ICard;
  user: IUser;
  timestamp: Date;
  likes: number;
  comments: number;
  memoryImage?: string; // URL for a photo added
}

export interface IStory {
  id: string;
  user: IUser;
  activeCard: ICard;
  expiresAt: Date;
}

export type ViewState = 'feed' | 'deck' | 'profile';
