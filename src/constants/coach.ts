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

/** Full-day 30-minute slots in 12-hour format (matches web `generateTimeSlots` + `formatTime12h`). */
function buildCoachTimeOptions(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30]) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      slots.push(
        `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
      );
    }
  }
  return slots;
}

export const DEMO_TIME_OPTIONS = buildCoachTimeOptions();
