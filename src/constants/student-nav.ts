export type StudentNavItem = {
  href:
    | '/coaches'
    | '/classes'
    | '/tournaments'
    | '/puzzles'
    | '/refill'
    | '/refer'
    | '/hall-of-fame'
    | '/support'
    | '/profile';
  title: string;
  description: string;
  section: 'journey' | 'treasury' | 'account';
  icon: { ios: string; android: string; web: string };
};

export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  {
    href: '/coaches',
    title: 'Coaches',
    description: 'Browse and book a demo',
    section: 'journey',
    icon: { ios: 'person.2.fill', android: 'group', web: 'group' },
  },
  {
    href: '/classes',
    title: 'My Classes',
    description: 'Upcoming, past, and cancelled',
    section: 'journey',
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  },
  {
    href: '/tournaments',
    title: 'Tournament Arena',
    description: 'Online and offline battles',
    section: 'journey',
    icon: { ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' },
  },
  {
    href: '/puzzles',
    title: 'Puzzle Quests',
    description: 'Weekly battle report and quests',
    section: 'journey',
    icon: { ios: 'puzzlepiece.fill', android: 'extension', web: 'extension' },
  },
  {
    href: '/refill',
    title: 'Refill Sessions',
    description: 'Buy session packs',
    section: 'treasury',
    icon: { ios: 'creditcard.fill', android: 'payments', web: 'payments' },
  },
  {
    href: '/refer',
    title: 'Refer a Friend',
    description: 'Earn CV Coins from invites',
    section: 'treasury',
    icon: { ios: 'person.badge.plus', android: 'person_add', web: 'person_add' },
  },
  {
    href: '/hall-of-fame',
    title: 'Hall of Fame',
    description: 'Certificates and medals',
    section: 'treasury',
    icon: { ios: 'medal.fill', android: 'military_tech', web: 'military_tech' },
  },
  {
    href: '/support',
    title: 'Support',
    description: 'Message us on WhatsApp',
    section: 'account',
    icon: { ios: 'questionmark.circle.fill', android: 'help', web: 'help' },
  },
  {
    href: '/profile',
    title: 'My Profile',
    description: 'Account and notifications',
    section: 'account',
    icon: { ios: 'person.crop.circle.fill', android: 'person', web: 'person' },
  },
];

export const STATION_ROUTES: Record<string, StudentNavItem['href']> = {
  coaches: '/coaches',
  tournaments: '/tournaments',
  training: '/classes',
  fame: '/hall-of-fame',
  support: '/support',
};
