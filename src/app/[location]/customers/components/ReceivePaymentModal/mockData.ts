// mockData.ts
import { CreditItem, GroupLessonItem } from './types';

export const createMockGroupLessons = (): GroupLessonItem[] => [
  {
    id: '1',
    selected: true,
    date: 'Oct 25, 2025 @ 2:00 PM',
    dueDate: 'Sep 15, 2025',
    student: '456 234',
    program: 'Guitar Ensemble',
    teacher: 'Django Reinhardt',
    amount: 45.00,
    balance: 45.00,
    payment: '45.00',
  },
  {
    id: '2',
    selected: true,
    date: 'Nov 01, 2025 @ 2:00 PM',
    dueDate: 'Oct 15, 2025',
    student: '456 234',
    program: 'Guitar Ensemble',
    teacher: 'Django Reinhardt',
    amount: 45.00,
    balance: 45.00,
    payment: '45.00',
  },
  {
    id: '3',
    selected: true,
    date: 'Nov 08, 2025 @ 2:00 PM',
    dueDate: 'Oct 15, 2025',
    student: '456 234',
    program: 'Guitar Ensemble',
    teacher: 'Django Reinhardt',
    amount: 45.00,
    balance: 45.00,
    payment: '45.00',
  },
  {
    id: '4',
    selected: true,
    date: 'Nov 15, 2025 @ 2:00 PM',
    dueDate: 'Oct 15, 2025',
    student: '456 234',
    program: 'Guitar Ensemble',
    teacher: 'Django Reinhardt',
    amount: 45.00,
    balance: 45.00,
    payment: '45.00',
  },
];

export const createMockCredits = (): CreditItem[] => [
  {
    id: '1',
    selected: true,
    type: 'Invoice Credit',
    reference: 'I-92454',
    amount: 1000.0,
    payment: '1000',
  },
];