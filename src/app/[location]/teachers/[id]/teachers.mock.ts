import { mockTeachersData } from '../mockData/mockData';
import type { TeacherInfo } from './teachers-details.interface';
import type { TeacherEmail, TeacherPhone, TeacherAddress } from '../types';

// Generate mock emails based on teacher data
const generateMockEmails = (teacherId: number, email: string): TeacherEmail[] => {
  if (!email) return [];
  
  return [
    {
      id: `${teacherId}-email-1`,
      label: 'Work',
      email: email,
      note: '',
      isPrimary: true,
    },
  ];
};

// Generate mock phones based on teacher data
const generateMockPhones = (teacherId: number, phone: string): TeacherPhone[] => {
  if (!phone) return [];
  
  return [
    {
      id: `${teacherId}-phone-1`,
      label: 'Home',
      number: phone,
      extension: '',
      note: '',
    },
  ];
};

// Generate mock addresses
const generateMockAddresses = (teacherId: number): TeacherAddress[] => {
  return [
    {
      id: `${teacherId}-address-1`,
      label: 'Home',
      address: '3207 Bunkerhill Place',
      city: 'Burlington',
      cityId: 1,
      provinceId: 1,
      countryId: 1,
      postalCode: 'L7P 0A1',
      province: 'Ontario',
      country: 'Canada',
      note: '',
      isPrimary: true,
    },
  ];
};

export const fetchTeacherInfo = async (id: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  const teacherId = parseInt(id, 10);
  
  // Find teacher in mock data
  const teacher = mockTeachersData.find((t) => t.id === teacherId);
  
  if (!teacher) {
    throw new Error(`Teacher with id ${id} not found`);
  }

  // Generate dynamic mock data based on the teacher
  const emails = generateMockEmails(teacherId, teacher.email);
  const phones = generateMockPhones(teacherId, teacher.phone);
  const addresses = generateMockAddresses(teacherId);

  // Generate a birth date (just for demo purposes, using a pattern based on ID)
  const birthYear = 1990 + (teacherId % 20);
  const birthMonth = String((teacherId % 12) + 1).padStart(2, '0');
  const birthDay = String((teacherId % 28) + 1).padStart(2, '0');
  const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

  return {
    success: true,
    data: {
      profile: {
        name: `${teacher.firstName} ${teacher.lastName}`,
        role: 'Teacher',
        birthDate: birthDate,
        picture: undefined,
      },
      email: emails,
      phone: phones,
      addresses: addresses,
    } as TeacherInfo,
    message: 'Teacher info retrieved successfully',
  };
};

