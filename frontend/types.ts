

export enum UserRole {
  GUEST = 'GUEST',
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  avatarUrl?: string;
}

export interface MedicalRecord {
  id: string;
  fileName: string;
  uploadDate: string;
  ipfsCid: string;
  txHash: string;
  fileSize: string;
}

export interface AccessRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialization?: string;
  purpose: string;
  status: 'PENDING' | 'GRANTED' | 'REJECTED';
  timestamp: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SystemEvent {
  id: string;
  type: 'UPLOAD' | 'ACCESS_GRANT' | 'CONSENSUS' | 'NODE_SYNC';
  title: string;
  description: string;
  lamportClock: number;
  nodeId: string;
  timestamp: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  email: string;
}

export type AppPath = 
  | '/'
  | '/patient/login'
  | '/patient/signup'
  | '/patient/dashboard'
  | '/patient/upload'
  | '/patient/records'
  | '/patient/requests'
  | '/patient/settings'
  | '/patient/profile'
  | '/doctor/login'
  | '/doctor/signup'
  | '/doctor/dashboard'
  | '/doctor/request'
  | '/doctor/granted'
  | '/doctor/settings'
  | '/doctor/profile'
  | '/blockchain/verification'
  | '/system/monitor';
