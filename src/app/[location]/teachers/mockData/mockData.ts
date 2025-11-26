import { TeacherRow } from "../teachers.api";
import {
  TeacherAddress,
  TeacherBasicDetails,
  TeacherEmail,
  TeacherPhone,
} from "../types";

// Mock data for teachers listing - matches the API response structure
export const mockTeachersData: TeacherRow[] = [
  { userId: 1, isActive: true, firstName: "tes123", lastName: "12345", email: "1@example.com", phoneNumber: "(553) 900-0000" },
  { userId: 2, isActive: false, firstName: "Sushanthi", lastName: "Aloysius", email: "sushanthi_aloysius@example.com", phoneNumber: "" },
  { userId: 3, isActive: true, firstName: "Sanjay", lastName: "Bansali", email: "sanjay_bansali@example.com", phoneNumber: "" },
  { userId: 4, isActive: true, firstName: "Daniel", lastName: "Clain", email: "danielc@example.com", phoneNumber: "" },
  { userId: 5, isActive: false, firstName: "Michael", lastName: "DeFrancesco", email: "mike.defrancesco@example.com", phoneNumber: "" },
  { userId: 6, isActive: true, firstName: "John", lastName: "Fedrick", email: "stewartcopeland@example.com", phoneNumber: "" },
  { userId: 7, isActive: true, firstName: "Alexander", lastName: "Hamilton", email: "youngscrappy&hungry@example.com", phoneNumber: "(123) 645-8682" },
  { userId: 8, isActive: false, firstName: "Salma", lastName: "hasan", email: "salman@example.com", phoneNumber: "" },
  { userId: 9, isActive: false, firstName: "Ridhan", lastName: "James", email: "ridhan_james@example.com", phoneNumber: "" },
  { userId: 10, isActive: true, firstName: "Kirushan", lastName: "James", email: "kirushan_james@example.com", phoneNumber: "" },
  { userId: 11, isActive: false, firstName: "Rithu", lastName: "James", email: "rithu_james@example.com", phoneNumber: "" },
  { userId: 12, isActive: true, firstName: "Fedrick", lastName: "John", email: "fedrick_john@example.com", phoneNumber: "" },
  { userId: 13, isActive: true, firstName: "Elton", lastName: "John", email: "lightspeedguru@example.com", phoneNumber: "" },
  { userId: 14, isActive: false, firstName: "Rose", lastName: "Jones", email: "", phoneNumber: "" },
  { userId: 15, isActive: true, firstName: "Thomas", lastName: "karenshia", email: "karen1@example.com", phoneNumber: "" },
  { userId: 16, isActive: true, firstName: "Amy", lastName: "Macaluso", email: "guzmac_9@example.com", phoneNumber: "(416) 662-4252" },
  { userId: 17, isActive: false, firstName: "Antoneyo kuthrose", lastName: "markus Jr", email: "", phoneNumber: "" },
  { userId: 18, isActive: true, firstName: "Frank", lastName: "Philcoli", email: "philcoli@example.com", phoneNumber: "(888) 888-8888" },
  { userId: 19, isActive: true, firstName: "Harsitha", lastName: "Ragav", email: "harsitha_ragav@example.com", phoneNumber: "" },
  { userId: 20, isActive: true, firstName: "Sushana", lastName: "Reshith", email: "sushana_reshith@example.com", phoneNumber: "" },
  { userId: 21, isActive: false, firstName: "Art", lastName: "Tatum", email: "art.tatum@example.com", phoneNumber: "(555) 123-4567" },
  { userId: 22, isActive: true, firstName: "Sarah", lastName: "Connor", email: "sarah.connor@example.com", phoneNumber: "(555) 987-6543" },
  { userId: 23, isActive: true, firstName: "John", lastName: "Doe", email: "john.doe@example.com", phoneNumber: "(555) 456-7890" },
  { userId: 24, isActive: false, firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phoneNumber: "(555) 321-0987" },
  { userId: 25, isActive: true, firstName: "Bob", lastName: "Johnson", email: "bob.johnson@example.com", phoneNumber: "(555) 654-3210" },
  { userId: 26, isActive: true, firstName: "Alice", lastName: "Brown", email: "alice.brown@example.com", phoneNumber: "(555) 789-0123" },
  { userId: 27, isActive: false, firstName: "Charlie", lastName: "Wilson", email: "charlie.wilson@example.com", phoneNumber: "(555) 012-3456" },
  { userId: 28, isActive: true, firstName: "Diana", lastName: "Davis", email: "diana.davis@example.com", phoneNumber: "(555) 345-6789" },
  { userId: 29, isActive: true, firstName: "Edward", lastName: "Miller", email: "edward.miller@example.com", phoneNumber: "(555) 678-9012" },
  { userId: 30, isActive: false, firstName: "Fiona", lastName: "Garcia", email: "fiona.garcia@example.com", phoneNumber: "(555) 901-2345" },
  { userId: 31, isActive: true, firstName: "George", lastName: "Martinez", email: "george.martinez@example.com", phoneNumber: "(555) 234-5678" },
  { userId: 32, isActive: true, firstName: "Helen", lastName: "Anderson", email: "helen.anderson@example.com", phoneNumber: "(555) 567-8901" },
  { userId: 33, isActive: false, firstName: "Ivan", lastName: "Taylor", email: "ivan.taylor@example.com", phoneNumber: "(555) 890-1234" },
  { userId: 34, isActive: true, firstName: "Julia", lastName: "Thomas", email: "julia.thomas@example.com", phoneNumber: "(555) 123-4567" }
];

// Mock data for teacher details
export const MOCK_DETAILS: TeacherBasicDetails = {
  firstName: "tes123",
  lastName: "12345",
  role: "Teacher",
  birthDate: "1992-01-17",
};

export const MOCK_EMAILS: TeacherEmail[] = [
  {
    id: "1",
    label: "Work",
    email: "1@example.com",
    note: "",
    isPrimary: true,
  },
  {
    id: "2",
    label: "Home",
    email: "123@example.com",
    note: "test note",
    isPrimary: false,
  },
];

export const MOCK_PHONES: TeacherPhone[] = [
  {
    id: "1",
    label: "Home",
    number: "(553) 900-0000",
    extension: "7544",
    note: "test",
  },
];

export const MOCK_ADDRESSES: TeacherAddress[] = [
  {
    id: "1",
    label: "Home",
    address: "3207 Bunkerhill Place",
    city: "Burlington",
    cityId: 1,
    provinceId: 1,
    countryId: 1,
    postalCode: "L7P 0A1",
    province: "Ontario",
    country: "Canada",
    note: "",
    isPrimary: true,
  },
];

