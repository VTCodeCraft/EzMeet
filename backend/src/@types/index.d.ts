declare global {
  namespace Express {
    interface User {
      id: string;
    }

    // Populated by the Clerk `requireAuth` middleware (was previously provided
    // by @types/passport).
    interface Request {
      user?: User;
    }
  }
}

export {};