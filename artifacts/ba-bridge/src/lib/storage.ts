export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // stored as-is (mock only)
};

export type Users = User[];

export type TechnicalBRD = {
  missingRequirements: string[];
  recommendations: string[];
  technicalOverview: string;
  functionalSpecification: { module: string; description: string; details: string[] }[];
  nonFunctionalSpecification: { category: string; requirement: string; metric: string }[];
  databaseTables: { name: string; description: string; fields: string }[];
  apis: { method: string; endpoint: string; description: string }[];
  userStories: { epic: string; stories: string[] }[];
  acceptanceCriteria: { feature: string; criteria: string[] }[];
};

export type BRD = {
  id: string;          // UUID
  userId: string;      // matches current user id
  projectName: string;
  projectDescription: string;
  businessGoals: string;
  stakeholders: string;
  functionalRequirements: string;
  nonFunctionalRequirements: string;
  businessRules: string;
  notes: string;
  status: 'draft' | 'generating' | 'generated';
  technicalBRD?: TechnicalBRD;  // populated after AI generation
  createdAt: string;   // ISO date string
  updatedAt: string;   // ISO date string
};

const USERS_KEY = 'ba_bridge_users';
const CURRENT_USER_KEY = 'ba_bridge_user';
const BRDS_KEY = 'ba_bridge_brds';

export const storage = {
  getUsers: (): Users => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveUsers: (users: Users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },
  
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },
  
  getBRDs: (): BRD[] => {
    const data = localStorage.getItem(BRDS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveBRDs: (brds: BRD[]) => {
    localStorage.setItem(BRDS_KEY, JSON.stringify(brds));
  },
  
  getUserBRDs: (userId: string): BRD[] => {
    return storage.getBRDs().filter((brd) => brd.userId === userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  
  getBRDById: (id: string): BRD | undefined => {
    return storage.getBRDs().find((brd) => brd.id === id);
  },
  
  saveBRD: (brd: BRD) => {
    const brds = storage.getBRDs();
    const existingIndex = brds.findIndex((b) => b.id === brd.id);
    if (existingIndex >= 0) {
      brds[existingIndex] = brd;
    } else {
      brds.push(brd);
    }
    storage.saveBRDs(brds);
  },
  
  deleteBRD: (id: string) => {
    const brds = storage.getBRDs().filter((b) => b.id !== id);
    storage.saveBRDs(brds);
  }
};
