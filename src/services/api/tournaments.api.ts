import { http } from '@/services/api/client';
import { Endpoints } from '@/services/api/endpoints';
import type {
  ApiRecord,
  CreateTournamentEventPayload,
  PricePreviewPayload,
  RegisterPhysicalTournamentPayload,
  RegistrationPaymentSession,
  RegistrationSubmissionPayload,
  UpdateTournamentEventPayload,
} from '@/services/api/types';

const E = Endpoints.tournaments;

export const tournamentsApi = {
  // --- Physical (student) ---
  listPhysicalUpcoming: () => http.get<ApiRecord>(E.physicalUpcoming),
  registerPhysical: (eventId: string, payload: RegisterPhysicalTournamentPayload) =>
    http.post<ApiRecord>(E.physicalRegister(eventId), payload),
  cancelPhysicalRegistration: (eventId: string) => http.post<ApiRecord>(E.physicalCancelRegistration(eventId)),

  // --- Online (student) ---
  getStudentUpcoming: () => http.get<ApiRecord>(E.studentUpcoming),
  join: (eventId: string) => http.post<ApiRecord>(E.join(eventId)),
  requestHelp: (eventId: string) => http.post<ApiRecord>(E.helpRequest(eventId)),

  // --- Online (coach) ---
  listUpcoming: () => http.get<ApiRecord>(E.eventsUpcoming),
  createUpcoming: (coachId: string) => http.post<ApiRecord>(E.createUpcoming, { coachId }),
  createEvent: (payload: CreateTournamentEventPayload) => http.post<ApiRecord>(E.events, payload),
  updateEvent: (eventId: string, payload: UpdateTournamentEventPayload) =>
    http.patch<ApiRecord>(E.event(eventId), payload),
  getParticipants: (eventId: string) => http.get<ApiRecord>(E.eventParticipants(eventId)),
  getAnalysis: (eventId: string) => http.get<ApiRecord>(E.eventAnalysis(eventId)),

  // --- Shared ---
  getParticipant: (participantId: string) => http.get<ApiRecord>(E.participant(participantId)),
};

const R = Endpoints.registrationTournaments;

/** Paid registration tournaments (brochure, categories, discounts). */
export const registrationTournamentsApi = {
  list: () => http.get<ApiRecord>(R.list),
  getById: (id: string) => http.get<ApiRecord>(R.details(id)),
  getBrochureUrl: (id: string) => http.get<ApiRecord>(R.brochure(id)),
  previewPrice: (id: string, payload: PricePreviewPayload) => http.post<ApiRecord>(R.pricePreview(id), payload),
  createPaymentSession: (id: string, payload: RegistrationSubmissionPayload) =>
    http.post<RegistrationPaymentSession>(R.paymentSession(id), payload),
  confirmPayment: (id: string, paymentsSessionId: string) =>
    http.post<ApiRecord>(R.confirmPayment(id), { payments_session_id: paymentsSessionId }),
  /** Free registrations (no payment step). */
  submitRegistration: (id: string, payload: RegistrationSubmissionPayload) =>
    http.post<ApiRecord>(R.registrations(id), payload),
};
