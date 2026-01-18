export type RoleType = 'organizer' | 'master' | 'partner' | 'editor';
export type RoleStatus = 'pending' | 'active' | 'suspended' | 'graduated' | 'rejected';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'in_review';
export type ReputationLevel = 'newcomer' | 'active' | 'expert' | 'leader' | 'legend';

export type OrganizerLevel = 'novice' | 'experienced' | 'leading';
export type MasterLevel = 'apprentice' | 'master' | 'mentor';
export type EditorLevel = 'proofreader' | 'author' | 'section_editor' | 'chief_editor';
export type PartnershipType = 'basic' | 'premium' | 'exclusive';

export interface UserRole {
  id: number;
  user_id: number;
  role_type: RoleType;
  status: RoleStatus;
  granted_at: string;
  expires_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  level_data?: OrganizerLevelData | MasterLevelData | EditorLevelData;
}

export interface RoleApplication {
  id: number;
  user_id: number;
  role_type: RoleType;
  status: ApplicationStatus;
  application_data: Record<string, any>;
  reviewer_id?: number;
  reviewer_name?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
  name?: string;
  email?: string;
}

export interface UserReputation {
  id: number;
  user_id: number;
  total_score: number;
  level: ReputationLevel;
  events_attended: number;
  events_organized: number;
  articles_published: number;
  helpful_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface ReputationHistory {
  id: number;
  user_id: number;
  points: number;
  action_type: string;
  description: string;
  related_entity_type?: string;
  related_entity_id?: number;
  created_at: string;
}

export interface OrganizerLevelData {
  id: number;
  user_id: number;
  level: OrganizerLevel;
  events_organized: number;
  preferred_formats: string[];
  preferred_locations: string[];
  test_passed: boolean;
  test_score?: number;
  created_at: string;
  updated_at: string;
}

export interface MasterLevelData {
  id: number;
  user_id: number;
  level: MasterLevel;
  specializations: string[];
  portfolio_urls: string[];
  trial_session_completed: boolean;
  trial_session_rating?: number;
  sessions_completed: number;
  created_at: string;
  updated_at: string;
}

export interface EditorLevelData {
  id: number;
  user_id: number;
  level: EditorLevel;
  articles_published: number;
  articles_edited: number;
  specialization?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerTypeData {
  id: number;
  user_id: number;
  sauna_id?: number;
  partnership_type: PartnershipType;
  contract_signed: boolean;
  contract_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRolesResponse {
  roles: UserRole[];
  reputation: UserReputation | null;
}

export const ROLE_LABELS: Record<RoleType, string> = {
  organizer: 'Организатор',
  master: 'Мастер',
  partner: 'Партнёр',
  editor: 'Редактор',
};

export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  organizer: 'Создавайте и проводите банные события для сообщества',
  master: 'Проводите профессиональные сеансы парения',
  partner: 'Предоставляйте свою баню для мероприятий',
  editor: 'Создавайте контент и статьи о банной культуре',
};

export const REPUTATION_LEVELS: Record<ReputationLevel, { label: string; minScore: number; color: string }> = {
  newcomer: { label: 'Новичок', minScore: 0, color: 'gray' },
  active: { label: 'Активный', minScore: 101, color: 'blue' },
  expert: { label: 'Эксперт', minScore: 501, color: 'purple' },
  leader: { label: 'Лидер', minScore: 1001, color: 'orange' },
  legend: { label: 'Легенда', minScore: 2500, color: 'amber' },
};

export const ORGANIZER_LEVEL_LABELS: Record<OrganizerLevel, string> = {
  novice: 'Новичок',
  experienced: 'Опытный',
  leading: 'Ведущий',
};

export const MASTER_LEVEL_LABELS: Record<MasterLevel, string> = {
  apprentice: 'Подмастерье',
  master: 'Мастер',
  mentor: 'Мастер-наставник',
};

export const EDITOR_LEVEL_LABELS: Record<EditorLevel, string> = {
  proofreader: 'Корректор',
  author: 'Автор',
  section_editor: 'Редактор рубрики',
  chief_editor: 'Главный редактор',
};

export const REPUTATION_ACTIONS = {
  EVENT_ATTENDED: { points: 10, label: 'Посещение события' },
  EVENT_ORGANIZED: { points: 20, label: 'Организация события' },
  ARTICLE_PUBLISHED: { points: 15, label: 'Публикация статьи' },
  HELPFUL_REVIEW: { points: 5, label: 'Полезный отзыв' },
  MASTER_VERIFIED: { points: 30, label: 'Верификация мастера' },
  PARTNER_ADDED: { points: 50, label: 'Добавление бани-партнёра' },
};