import {
  TeacherBasicDetails,
  TeacherEmail,
  TeacherPhone,
  TeacherAddress,
  TeacherQualification,
} from '../types';

export interface TeacherProfile {
  name: string;
  role: string;
  birthDate?: string;
  picture?: string;
}

export interface TeacherInfo {
  profile: TeacherProfile;
  email: TeacherEmail[];
  phone: TeacherPhone[];
  addresses: TeacherAddress[];
  privateQualifications: TeacherQualification[];
  groupQualifications: TeacherQualification[];
}

