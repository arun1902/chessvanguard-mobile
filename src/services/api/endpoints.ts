/**
 * Every ChessVanguard V2 route reachable by the Student and Coach roles (plus
 * anonymous public routes), relative to `/api/v1`. Mirrors
 * `chessvanguard_v2_backend/src/routes/*`. Admin / SalesAgent-only routes are
 * intentionally omitted — they belong to the web admin dashboard.
 */
const seg = (value: string) => encodeURIComponent(value);

export const Endpoints = {
  auth: {
    login: '/auth/login',
    forgotPassword: '/auth/forgot-password',
    verifySetupToken: (token: string) => `/auth/verify-setup-token/${seg(token)}`,
    setupPassword: '/auth/setup-password',
  },

  public: {
    settings: '/public/settings',
    otpSend: '/public/otp/send',
    otpVerify: '/public/otp/verify',
    whatsappOtpSend: '/public/otp/whatsapp/send',
    whatsappOtpVerify: '/public/otp/whatsapp/verify',
    demoSlots: '/public/demo-slots',
    demoHold: '/public/demo-hold',
    demoPaymentSession: '/public/demo-payment-session',
    demoPaymentVerify: '/public/demo-payment-verify',
    demoStatus: (leadId: string) => `/public/demo-status/${seg(leadId)}`,
    demoByToken: (token: string) => `/public/demo/${seg(token)}`,
    demoMeetingStatus: (token: string) => `/public/demo/${seg(token)}/meeting-status`,
    demoJoin: (token: string) => `/public/demo/${seg(token)}/join`,
    demoSlotsByToken: (token: string) => `/public/demo/${seg(token)}/slots`,
    demoReschedule: (token: string) => `/public/demo/${seg(token)}/reschedule`,
    demoCancel: (token: string) => `/public/demo/${seg(token)}/cancel`,
    demoPaySession: (token: string) => `/public/demo/${seg(token)}/session`,
    demoConfirmPayment: (token: string) => `/public/demo/${seg(token)}/confirm`,
    inquiry: '/public/inquiry',
    confirmDemo: '/public/confirm-demo',
    registerStudent: '/public/register-student',
    registerCoach: '/public/register-coach',
    referralPrefill: (token: string) => `/public/referral/${seg(token)}`,
    contact: '/public/contact',
    newsletter: '/public/newsletter',
  },

  payments: {
    verifyToken: (token: string) => `/payments/verify-token/${seg(token)}`,
    selfToken: '/payments/self-token',
    generateLink: (token: string) => `/payments/generate-link/${seg(token)}`,
    checkStatus: '/payments/check-status',
    createRefillSession: '/payments/create-refill-session',
    confirmRefill: '/payments/confirm-refill',
    reconcilePending: '/payments/reconcile-pending',
  },

  platform: {
    fide: (fideId: string) => `/platform/fide/${seg(fideId)}`,
    chessCom: (username: string) => `/platform/chesscom/${seg(username)}`,
    lichess: (username: string) => `/platform/lichess/${seg(username)}`,
  },

  coaches: {
    // Public hiring funnel
    hiringStart: '/coaches/public/hiring',
    hiringVerifyOtp: '/coaches/public/hiring/verify-otp',
    hiringCheckFide: (fideId: string) => `/coaches/public/hiring/check-fide/${seg(fideId)}`,
    hiringCheckLichess: (username: string) => `/coaches/public/hiring/check-lichess/${seg(username)}`,
    hiringCheckChessCom: (username: string) => `/coaches/public/hiring/check-chesscom/${seg(username)}`,
    hiringSubmit: '/coaches/public/hiring/submit',
    profilePictureUploadUrl: '/coaches/profile-picture/upload-url',
    // Coach self-service
    myResumeUploadUrl: '/coaches/me/resume-upload-url',
    myBio: '/coaches/me/bio',
    myTimings: '/coaches/me/timings',
    myTiming: (timingId: string) => `/coaches/me/timings/${seg(timingId)}`,
    myRateConsent: '/coaches/me/rate-consent',
    myPayments: '/coaches/my/payments',
    // Shared
    list: '/coaches',
    details: (coachId: string) => `/coaches/${seg(coachId)}/details`,
    resume: (coachId: string) => `/coaches/${seg(coachId)}/resume`,
    timings: (coachId: string) => `/coaches/${seg(coachId)}/timings`,
    update: (coachId: string) => `/coaches/${seg(coachId)}`,
    // Class lifecycle (coach acts on own id)
    joinClass: (coachId: string) => `/coaches/${seg(coachId)}/join-class`,
    cancelClass: (coachId: string) => `/coaches/${seg(coachId)}/cancel-class`,
    completeClass: (coachId: string) => `/coaches/${seg(coachId)}/complete-class`,
    markNotConducted: (coachId: string) => `/coaches/${seg(coachId)}/mark-not-conducted`,
  },

  userVerification: {
    send: '/user-verification',
    confirm: '/user-verification/confirm',
    mobileContext: '/user-verification/mobile-context',
  },

  students: {
    list: '/students',
    update: (studentId: string) => `/students/${seg(studentId)}`,
    details: (studentId: string) => `/students/${seg(studentId)}/details`,
    attendance: (studentId: string) => `/students/${seg(studentId)}/attendance`,
    ledger: (studentId: string) => `/students/${seg(studentId)}/ledger`,
    classHistory: (studentId: string) => `/students/${seg(studentId)}/class-history`,
    pauseWindows: (studentId: string) => `/students/${seg(studentId)}/pause-windows`,
    resumePauseWindow: (studentId: string, pauseWindowId: string) =>
      `/students/${seg(studentId)}/pause-windows/${seg(pauseWindowId)}/resume`,
    availableCoaches: '/students/available-coaches',
    myPendingBooking: '/students/me/pending-booking',
    cancelPendingBooking: (timingId: string) => `/students/me/pending-booking/${seg(timingId)}/cancel`,
    myChildren: '/students/me/children',
    bookClass: (studentId: string) => `/students/${seg(studentId)}/book-class`,
    verifyAndConfirmBooking: (studentId: string) => `/students/${seg(studentId)}/verify-and-confirm-booking`,
    joinClass: (studentId: string) => `/students/${seg(studentId)}/join-class`,
    tournamentUpcoming: (studentId: string) => `/students/${seg(studentId)}/tournament-upcoming`,
    tournamentHistory: (studentId: string) => `/students/${seg(studentId)}/tournament-history`,
    tournamentJoin: (studentId: string) => `/students/${seg(studentId)}/tournament/join`,
    lichessUsername: (studentId: string) => `/students/${seg(studentId)}/lichess-username`,
    lichessOAuthConnect: (studentId: string) => `/students/${seg(studentId)}/lichess-oauth/connect`,
    lichessOAuthDisconnect: (studentId: string) => `/students/${seg(studentId)}/lichess-oauth/disconnect`,
    lichessOAuthStatus: (studentId: string) => `/students/${seg(studentId)}/lichess-oauth/status`,
    lichessOAuthTournamentResults: (studentId: string) =>
      `/students/${seg(studentId)}/lichess-oauth/tournament-results`,
    assignments: (studentId: string) => `/students/${seg(studentId)}/assignments`,
    activeAssignmentCheck: (studentId: string) => `/students/${seg(studentId)}/active-assignment-check`,
    quests: (studentId: string) => `/students/${seg(studentId)}/quests`,
    today: (studentId: string) => `/students/${seg(studentId)}/today`,
    weeklyReport: (studentId: string) => `/students/${seg(studentId)}/weekly-report`,
    trainingCount: (studentId: string) => `/students/${seg(studentId)}/training/count`,
  },

  referrals: {
    create: '/referrals',
    mine: '/referrals/me',
    myCoins: '/referrals/me/coins',
  },

  classes: {
    list: '/classes',
    cancel: '/classes/cancel',
    details: (classId: string) => `/classes/${seg(classId)}`,
  },

  meetings: {
    start: (timingId: string) => `/student-coach-timings/${seg(timingId)}/start-meeting`,
    markJoined: (timingId: string) => `/student-coach-timings/${seg(timingId)}/mark-joined`,
    status: (timingId: string) => `/student-coach-timings/${seg(timingId)}/meeting-status`,
  },

  tournaments: {
    physicalUpcoming: '/tournaments/physical/upcoming',
    physicalRegister: (eventId: string) => `/tournaments/physical/${seg(eventId)}/register`,
    physicalCancelRegistration: (eventId: string) => `/tournaments/physical/${seg(eventId)}/cancel-registration`,
    eventsUpcoming: '/tournaments/events/upcoming',
    createUpcoming: '/tournaments/events/create-upcoming',
    events: '/tournaments/events',
    event: (eventId: string) => `/tournaments/events/${seg(eventId)}`,
    eventParticipants: (eventId: string) => `/tournaments/events/${seg(eventId)}/participants`,
    eventAnalysis: (eventId: string) => `/tournaments/events/${seg(eventId)}/analysis`,
    participant: (participantId: string) => `/tournaments/participants/${seg(participantId)}`,
    studentUpcoming: '/tournaments/student/upcoming',
    join: (eventId: string) => `/tournaments/events/${seg(eventId)}/join`,
    helpRequest: (eventId: string) => `/tournaments/events/${seg(eventId)}/help-request`,
  },

  registrationTournaments: {
    list: '/registration-tournaments/public',
    details: (id: string) => `/registration-tournaments/public/${seg(id)}`,
    brochure: (id: string) => `/registration-tournaments/public/${seg(id)}/brochure`,
    pricePreview: (id: string) => `/registration-tournaments/public/${seg(id)}/price-preview`,
    paymentSession: (id: string) => `/registration-tournaments/public/${seg(id)}/payment-session`,
    confirmPayment: (id: string) => `/registration-tournaments/public/${seg(id)}/confirm-payment`,
    registrations: (id: string) => `/registration-tournaments/public/${seg(id)}/registrations`,
  },

  ratings: {
    submit: '/ratings',
    demoJoined: '/ratings/demo-joined',
    coach: (coachId: string) => `/ratings/coach/${seg(coachId)}`,
  },

  blogs: {
    bySlug: (slug: string) => `/blogs/${seg(slug)}`,
  },

  actions: {
    next: '/actions/next',
    complete: '/actions/complete',
    skip: '/actions/skip',
  },

  leads: {
    meetingStatus: (leadId: string) => `/leads/${seg(leadId)}/meeting-status`,
    startDemo: (leadId: string) => `/leads/${seg(leadId)}/start-demo`,
  },

  remarks: {
    list: (entityType: string, entityId: string) => `/remarks/${seg(entityType)}/${seg(entityId)}`,
  },

  dashboard: {
    stats: '/dashboard/stats',
  },

  puzzles: {
    list: '/puzzles',
    byId: (puzzleId: string) => `/puzzles/${seg(puzzleId)}`,
    trainingAttempt: '/puzzles/training/attempt',
    trainingCount: '/puzzles/training/count',
  },

  themes: {
    list: '/themes',
    create: '/themes',
    puzzlesForSelection: (themeId: string) => `/themes/${seg(themeId)}/puzzles/select`,
    addPuzzles: (themeId: string) => `/themes/${seg(themeId)}/puzzles`,
  },

  assignments: {
    create: '/assignments',
    batch: (batchId: string) => `/assignments/batch/${seg(batchId)}`,
    attempt: (assignmentRowId: string) => `/assignments/${seg(assignmentRowId)}/attempt`,
  },

  pricingPlans: {
    list: '/pricing-plans',
  },

  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    markRead: (notificationId: string) => `/notifications/${seg(notificationId)}/read`,
    markAllRead: '/notifications/read-all',
    remove: (notificationId: string) => `/notifications/${seg(notificationId)}`,
    preferences: '/notifications/preferences',
    resetPreferences: '/notifications/preferences/reset',
  },
} as const;
