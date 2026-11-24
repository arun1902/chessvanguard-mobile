export const DEMO_COACH_USER = {
  username: 'arunchauhan69875',
  name: 'Coach',
  specialization: 'General Chess',
  experienceYears: 6,
  mobile: '9122053667',
  email: 'arunchauhan69875@gmail.com',
  about: 'i have exp. in 6 year in chess',
  education: 'B.sc',
  languages: ['English', 'Hindi', 'Punjabi'] as const,
  notificationCount: 6,
  regularSlots: 30,
  demoSlots: 108,
};

export const DEMO_COACH_CLASS = {
  studentName: 'Arun Kumar',
  coachLabel: 'with Coach',
  dateLabel: 'Nov 20, 2026',
  timeLabel: '1:00 PM',
  batchLabel: 'Friday - 13:00',
  type: 'Demo' as const,
  status: 'Needs action' as const,
};

export type CoachNotification = {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
};

export const DEMO_COACH_NOTIFICATIONS: CoachNotification[] = [
  {
    id: '1',
    title: 'Demo Booked: Arun Kumar',
    body: 'Arun Kumar has booked a demo session with Coach on Friday 20 November 2026 at 13:00 IST.',
    timeAgo: '4 days ago',
  },
  {
    id: '2',
    title: 'Demo Booked: Arun Kumar',
    body: 'Arun Kumar has booked a demo session with Coach on Friday 20 November 2026 at 13:00 IST.',
    timeAgo: '8 days ago',
  },
  {
    id: '3',
    title: 'Demo Booked: Arun Kumar',
    body: 'Arun Kumar has booked a demo session with Coach on Friday 20 November 2026 at 13:00 IST.',
    timeAgo: '8 days ago',
  },
  {
    id: '4',
    title: 'Demo Booked: Arun Kumar',
    body: 'Arun Kumar has booked a demo session with Coach on Friday 20 November 2026 at 13:00 IST.',
    timeAgo: '8 days ago',
  },
  {
    id: '5',
    title: 'Demo Booked: Arun Kumar',
    body: 'Arun Kumar has booked a demo session with Coach on Friday 20 November 2026 at 13:00 IST.',
    timeAgo: '8 days ago',
  },
  {
    id: '6',
    title: 'Demo Booked: Arun Kumar',
    body: 'Arun Kumar has booked a demo session with Coach on Friday 20 November 2026 at 13:00 IST.',
    timeAgo: '8 days ago',
  },
];

export type CoachNavItem = {
  href:
    | '/coach/students'
    | '/coach/puzzles'
    | '/coach/classes'
    | '/coach/tournament'
    | '/coach/profile'
    | '/coach/support';
  title: string;
  description: string;
  icon: { ios: string; android: string; web: string };
};

export const COACH_NAV_ITEMS: CoachNavItem[] = [
  {
    href: '/coach/students',
    title: 'Students',
    description: 'Track attendance and progress',
    icon: { ios: 'person.2.fill', android: 'group', web: 'group' },
  },
  {
    href: '/coach/puzzles',
    title: 'Puzzles',
    description: 'Browse and manage themes',
    icon: { ios: 'puzzlepiece.fill', android: 'extension', web: 'extension' },
  },
  {
    href: '/coach/classes',
    title: 'Classes',
    description: 'Upcoming, past, and cancelled',
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  },
  {
    href: '/coach/tournament',
    title: 'Tournament',
    description: 'Tournament publishing',
    icon: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
  },
  {
    href: '/coach/profile',
    title: 'My Profile',
    description: 'Profile and teaching settings',
    icon: { ios: 'person.crop.circle.fill', android: 'person', web: 'person' },
  },
  {
    href: '/coach/support',
    title: 'Support',
    description: 'Message us on WhatsApp',
    icon: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
  },
];

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const COACH_DAYS = WEEKDAYS;

/** Demo regular slots (subset for mobile UI). */
export const DEMO_REGULAR_SLOTS: Record<string, string[]> = {
  Monday: ['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'],
  Tuesday: ['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'],
  Wednesday: ['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'],
  Thursday: ['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM'],
  Friday: ['12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM'],
};

/** Demo demo-session slots (subset). */
export const DEMO_DEMO_SLOTS: Record<string, string[]> = {
  Monday: ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM'],
  Tuesday: ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM'],
  Wednesday: ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM'],
  Thursday: ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM'],
};

export const DEMO_TIME_OPTIONS = [
  '12:30 AM',
  '01:30 AM',
  '02:30 AM',
  '03:30 AM',
  '04:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
] as const;
