export interface User {
  id: string;
  email: string;
  name: string;
  orgId: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  orgId: string;
  name: string;
  jobTitle: string;
  email: string;
  createdAt: string;
}

export interface Team {
  id: string;
  orgId: string;
  name: string;
  description: string;
  createdAt: string;
}

// Junction table equivalent
export interface TeamMember {
  employeeId: string;
  teamId: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  userId: string;
  userName: string; // Denormalized for display ease
  action: string;
  details: string;
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Extended types for UI
export interface EmployeeWithTeams extends Employee {
  teams: Team[];
}

export interface TeamWithMembers extends Team {
  members: Employee[];
}