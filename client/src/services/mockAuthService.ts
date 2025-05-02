// Mock user data
interface MockUser {
  id: string;
  name: string;
  email: string;
}

class MockAuthService {
  private static instance: MockAuthService;
  private currentUser: MockUser | null = null;

  private constructor() {}

  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  // Mock login that always succeeds
  async login(): Promise<MockUser> {
    this.currentUser = {
      id: 'mock-user-1',
      name: 'Test Player',
      email: 'test@example.com'
    };
    return this.currentUser;
  }

  // Get current user
  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  // Mock logout
  logout(): void {
    this.currentUser = null;
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const mockAuthService = MockAuthService.getInstance();