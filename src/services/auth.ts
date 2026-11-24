export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterStudentCredentials = {
  email: string;
  password: string;
};

export type RegisterCoachCredentials = {
  email: string;
  password: string;
};

/**
 * ChessVanguard login API stub.
 * Replace the body with the real backend request when auth is wired up.
 */
export async function loginRequest(_credentials: LoginCredentials): Promise<void> {
  // Keep a short delay so the loading indicator is visible during integration testing.
  await new Promise((resolve) => setTimeout(resolve, 600));

  // No fake credentials — ready for ChessVanguard backend integration.
  throw new Error('Authentication API is not connected yet.');
}

/**
 * ChessVanguard student registration API stub.
 * Replace the body with the real backend request when auth is wired up.
 */
export async function registerStudentRequest(
  _credentials: RegisterStudentCredentials,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // No fake registration — ready for ChessVanguard backend integration.
  throw new Error('Registration API is not connected yet.');
}

/**
 * ChessVanguard coach registration API stub.
 * Replace the body with the real backend request when auth is wired up.
 */
export async function registerCoachRequest(
  _credentials: RegisterCoachCredentials,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // No fake registration — ready for ChessVanguard backend integration.
  throw new Error('Coach registration API is not connected yet.');
}
