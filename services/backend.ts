import { User, Organization, Employee, Team, TeamMember, AuditLog, AuthResponse, EmployeeWithTeams, TeamWithMembers } from '../types';

// --- DATABASE SIMULATION ---
// We use localStorage to persist data across reloads, mimicking a real DB.
// Keys are prefixed with 'nexushr_'

const STORAGE_KEYS = {
  USERS: 'nexushr_users',
  ORGS: 'nexushr_orgs',
  EMPLOYEES: 'nexushr_employees',
  TEAMS: 'nexushr_teams',
  TEAM_MEMBERS: 'nexushr_team_members',
  LOGS: 'nexushr_logs',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const getCurrentTimestamp = () => new Date().toISOString();

// Load data helper
const load = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Save data helper
const save = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- LOGGING SERVICE ---
const createLog = async (orgId: string, userId: string, action: string, details: string) => {
  const logs = load<AuditLog>(STORAGE_KEYS.LOGS);
  const users = load<User>(STORAGE_KEYS.USERS);
  const user = users.find(u => u.id === userId);

  const newLog: AuditLog = {
    id: generateId(),
    orgId,
    userId,
    userName: user?.name || 'Unknown',
    action,
    details,
    timestamp: getCurrentTimestamp(),
  };

  logs.unshift(newLog); // Add to beginning
  save(STORAGE_KEYS.LOGS, logs);
};

// --- AUTH SERVICES ---

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  await delay(600); // Simulate network latency
  const users = load<User & { passwordHash: string }>(STORAGE_KEYS.USERS);
  // In a real app, we would hash the password. Here we just check string equality for simulation.
  const user = users.find(u => u.email === email && u.passwordHash === password);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Log the login action
  await createLog(user.orgId, user.id, 'LOGIN', 'User logged in');

  return {
    user: { id: user.id, email: user.email, name: user.name, orgId: user.orgId },
    token: `mock-jwt-token-${user.id}`,
  };
};

export const register = async (name: string, email: string, password: string, orgName: string): Promise<AuthResponse> => {
  await delay(800);
  const users = load<User>(STORAGE_KEYS.USERS);
  const orgs = load<Organization>(STORAGE_KEYS.ORGS);

  if (users.some(u => u.email === email)) {
    throw new Error('User already exists');
  }

  const orgId = generateId();
  const newOrg: Organization = { id: orgId, name: orgName };
  orgs.push(newOrg);

  const userId = generateId();
  const newUser = {
    id: userId,
    email,
    passwordHash: password,
    name,
    orgId,
  };
  users.push(newUser);

  save(STORAGE_KEYS.ORGS, orgs);
  save(STORAGE_KEYS.USERS, users);

  // Log creation implicitly via initial login log
  await createLog(orgId, userId, 'REGISTER', `Organization '${orgName}' created`);

  return {
    user: { id: userId, email: email, name: name, orgId },
    token: `mock-jwt-token-${userId}`,
  };
};

export const logout = async (userId: string, orgId: string) => {
    await createLog(orgId, userId, 'LOGOUT', 'User logged out');
};

// --- EMPLOYEE SERVICES ---

export const getEmployees = async (orgId: string): Promise<EmployeeWithTeams[]> => {
  await delay(400);
  const employees = load<Employee>(STORAGE_KEYS.EMPLOYEES).filter(e => e.orgId === orgId);
  const teams = load<Team>(STORAGE_KEYS.TEAMS);
  const members = load<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);

  return employees.map(emp => {
    const empTeamIds = members.filter(m => m.employeeId === emp.id).map(m => m.teamId);
    const empTeams = teams.filter(t => empTeamIds.includes(t.id));
    return { ...emp, teams: empTeams };
  });
};

export const createEmployee = async (currentUser: User, data: Omit<Employee, 'id' | 'orgId' | 'createdAt'>) => {
  await delay(500);
  const employees = load<Employee>(STORAGE_KEYS.EMPLOYEES);
  const newEmp: Employee = {
    id: generateId(),
    orgId: currentUser.orgId,
    createdAt: getCurrentTimestamp(),
    ...data,
  };
  employees.push(newEmp);
  save(STORAGE_KEYS.EMPLOYEES, employees);
  await createLog(currentUser.orgId, currentUser.id, 'CREATE_EMPLOYEE', `Added employee: ${data.name}`);
  return newEmp;
};

export const updateEmployee = async (currentUser: User, empId: string, data: Partial<Employee>) => {
  await delay(400);
  const employees = load<Employee>(STORAGE_KEYS.EMPLOYEES);
  const idx = employees.findIndex(e => e.id === empId);
  if (idx === -1) throw new Error('Employee not found');

  employees[idx] = { ...employees[idx], ...data };
  save(STORAGE_KEYS.EMPLOYEES, employees);
  await createLog(currentUser.orgId, currentUser.id, 'UPDATE_EMPLOYEE', `Updated employee: ${employees[idx].name}`);
  return employees[idx];
};

export const deleteEmployee = async (currentUser: User, empId: string) => {
  await delay(400);
  let employees = load<Employee>(STORAGE_KEYS.EMPLOYEES);
  const emp = employees.find(e => e.id === empId);
  employees = employees.filter(e => e.id !== empId);
  save(STORAGE_KEYS.EMPLOYEES, employees);

  // Cleanup relationships
  let members = load<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);
  members = members.filter(m => m.employeeId !== empId);
  save(STORAGE_KEYS.TEAM_MEMBERS, members);

  await createLog(currentUser.orgId, currentUser.id, 'DELETE_EMPLOYEE', `Deleted employee: ${emp?.name}`);
};

// --- TEAM SERVICES ---

export const getTeams = async (orgId: string): Promise<TeamWithMembers[]> => {
  await delay(400);
  const teams = load<Team>(STORAGE_KEYS.TEAMS).filter(t => t.orgId === orgId);
  const employees = load<Employee>(STORAGE_KEYS.EMPLOYEES);
  const members = load<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);

  return teams.map(team => {
    const teamEmpIds = members.filter(m => m.teamId === team.id).map(m => m.employeeId);
    const teamEmps = employees.filter(e => teamEmpIds.includes(e.id));
    return { ...team, members: teamEmps };
  });
};

export const createTeam = async (currentUser: User, data: Omit<Team, 'id' | 'orgId' | 'createdAt'>) => {
  await delay(500);
  const teams = load<Team>(STORAGE_KEYS.TEAMS);
  const newTeam: Team = {
    id: generateId(),
    orgId: currentUser.orgId,
    createdAt: getCurrentTimestamp(),
    ...data,
  };
  teams.push(newTeam);
  save(STORAGE_KEYS.TEAMS, teams);
  await createLog(currentUser.orgId, currentUser.id, 'CREATE_TEAM', `Created team: ${data.name}`);
  return newTeam;
};

export const updateTeam = async (currentUser: User, teamId: string, data: Partial<Team>) => {
  await delay(400);
  const teams = load<Team>(STORAGE_KEYS.TEAMS);
  const idx = teams.findIndex(t => t.id === teamId);
  if (idx === -1) throw new Error('Team not found');

  teams[idx] = { ...teams[idx], ...data };
  save(STORAGE_KEYS.TEAMS, teams);
  await createLog(currentUser.orgId, currentUser.id, 'UPDATE_TEAM', `Updated team: ${teams[idx].name}`);
  return teams[idx];
};

export const deleteTeam = async (currentUser: User, teamId: string) => {
  await delay(400);
  let teams = load<Team>(STORAGE_KEYS.TEAMS);
  const team = teams.find(t => t.id === teamId);
  teams = teams.filter(t => t.id !== teamId);
  save(STORAGE_KEYS.TEAMS, teams);

  // Cleanup relationships
  let members = load<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);
  members = members.filter(m => m.teamId !== teamId);
  save(STORAGE_KEYS.TEAM_MEMBERS, members);

  await createLog(currentUser.orgId, currentUser.id, 'DELETE_TEAM', `Deleted team: ${team?.name}`);
};

// --- ASSIGNMENT SERVICES (Many-to-Many) ---

export const assignEmployeeToTeams = async (currentUser: User, empId: string, teamIds: string[]) => {
  await delay(300);
  let members = load<TeamMember>(STORAGE_KEYS.TEAM_MEMBERS);

  // Remove existing assignments for this employee
  members = members.filter(m => m.employeeId !== empId);

  // Add new assignments
  teamIds.forEach(tId => {
    members.push({ employeeId: empId, teamId: tId });
  });

  save(STORAGE_KEYS.TEAM_MEMBERS, members);

  const teams = load<Team>(STORAGE_KEYS.TEAMS);
  const teamNames = teams.filter(t => teamIds.includes(t.id)).map(t => t.name).join(', ');
  
  await createLog(
      currentUser.orgId, 
      currentUser.id, 
      'ASSIGN_TEAMS', 
      `Updated assignments for employee ${empId}. Now in: [${teamNames}]`
  );
};

// --- AUDIT LOGS ---

export const getLogs = async (orgId: string): Promise<AuditLog[]> => {
  await delay(300);
  const logs = load<AuditLog>(STORAGE_KEYS.LOGS);
  return logs.filter(l => l.orgId === orgId);
};
