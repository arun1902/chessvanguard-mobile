import { Brand } from '@/constants/brand';

export type DashboardStation = {
  id: string;
  title: string;
  description: string;
  badge?: string;
  icon: {
    ios: string;
    android: string;
    web: string;
  };
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
};

export const DASHBOARD_STATIONS: DashboardStation[] = [
  {
    id: 'coaches',
    title: 'Choose Your Coach',
    description: 'Browse coaches and book your first lesson',
    badge: 'CHOOSE COACH',
    icon: { ios: 'person.2.fill', android: 'group', web: 'group' },
    iconColor: '#D97706',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  {
    id: 'tournaments',
    title: 'Tournament Arena',
    description: 'Join online battles or offline championships',
    icon: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
    iconColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  {
    id: 'training',
    title: 'My Training Camp',
    description: 'View schedules & join classroom',
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
    iconColor: '#EA580C',
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  {
    id: 'fame',
    title: 'My Hall of Fame',
    description: 'View your chess achievements & medals',
    icon: { ios: 'medal.fill', android: 'military_tech', web: 'military_tech' },
    iconColor: '#E11D48',
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  {
    id: 'support',
    title: 'Need Help?',
    description: 'Get in touch with our team',
    icon: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
    iconColor: '#0284C7',
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
];

export const DEMO_STUDENT = {
  name: 'Arun Kumar',
  coins: 0,
  notificationCount: 3,
  currentStreak: 0,
  longestStreak: 0,
};

export const DEMO_COACH = {
  initial: 'C',
  languages: ['English', 'Hindi'],
  bio: 'i have exp. in 6 year in chess',
  priceLabel: '₹19 demo class',
};

export const DashboardColors = {
  welcomeBorder: '#FDE68A',
  welcomeBg: '#FFFBEB',
  streakOrange: '#F97316',
  streakYellow: '#CA8A04',
  headerMuted: Brand.subtitle,
} as const;
