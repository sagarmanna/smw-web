import { TeacherRow } from "../teachers.api";
import {
  TeacherAddress,
  TeacherBasicDetails,
  TeacherEmail,
  TeacherPhone,
  TeacherQualification,
} from "../types";

// Mock data for teachers listing - matches the data shown in the UI image
export const mockTeachersData: TeacherRow[] = [
  { id: 1, firstName: "tes123", lastName: "12345", email: "1@example.com", phone: "(553) 900-0000", status: "active" },
  { id: 2, firstName: "Sushanthi", lastName: "Aloysius", email: "sushanthi_aloysius@example.com", phone: "", status: "inactive" },
  { id: 3, firstName: "Sanjay", lastName: "Bansali", email: "sanjay_bansali@example.com", phone: "", status: "active" },
  { id: 4, firstName: "Daniel", lastName: "Clain", email: "danielc@example.com", phone: "", status: "active" },
  { id: 5, firstName: "Michael", lastName: "DeFrancesco", email: "mike.defrancesco@example.com", phone: "", status: "inactive" },
  { id: 6, firstName: "John", lastName: "Fedrick", email: "stewartcopeland@example.com", phone: "", status: "active" },
  { id: 7, firstName: "Alexander", lastName: "Hamilton", email: "youngscrappy&hungry@example.com", phone: "(123) 645-8682", status: "active" },
  { id: 8, firstName: "Salma", lastName: "hasan", email: "salman@example.com", phone: "", status: "inactive" },
  { id: 9, firstName: "Ridhan", lastName: "James", email: "ridhan_james@example.com", phone: "", status: "inactive" },
  { id: 10, firstName: "Kirushan", lastName: "James", email: "kirushan_james@example.com", phone: "", status: "active" },
  { id: 11, firstName: "Rithu", lastName: "James", email: "rithu_james@example.com", phone: "", status: "inactive" },
  { id: 12, firstName: "Fedrick", lastName: "John", email: "fedrick_john@example.com", phone: "", status: "active" },
  { id: 13, firstName: "Elton", lastName: "John", email: "lightspeedguru@example.com", phone: "", status: "active" },
  { id: 14, firstName: "Rose", lastName: "Jones", email: "", phone: "", status: "inactive" },
  { id: 15, firstName: "Thomas", lastName: "karenshia", email: "karen1@example.com", phone: "", status: "active" },
  { id: 16, firstName: "Amy", lastName: "Macaluso", email: "guzmac_9@example.com", phone: "(416) 662-4252", status: "active" },
  { id: 17, firstName: "Antoneyo kuthrose", lastName: "markus Jr", email: "", phone: "", status: "inactive" },
  { id: 18, firstName: "Frank", lastName: "Philcoli", email: "philcoli@example.com", phone: "(888) 888-8888", status: "active" },
  { id: 19, firstName: "Harsitha", lastName: "Ragav", email: "harsitha_ragav@example.com", phone: "", status: "active" },
  { id: 20, firstName: "Sushana", lastName: "Reshith", email: "sushana_reshith@example.com", phone: "", status: "active" },
  { id: 21, firstName: "Art", lastName: "Tatum", email: "art.tatum@example.com", phone: "(555) 123-4567", status: "inactive" },
  { id: 22, firstName: "Sarah", lastName: "Connor", email: "sarah.connor@example.com", phone: "(555) 987-6543", status: "active" },
  { id: 23, firstName: "John", lastName: "Doe", email: "john.doe@example.com", phone: "(555) 456-7890", status: "active" },
  { id: 24, firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phone: "(555) 321-0987", status: "inactive" },
  { id: 25, firstName: "Bob", lastName: "Johnson", email: "bob.johnson@example.com", phone: "(555) 654-3210", status: "active" },
  { id: 26, firstName: "Alice", lastName: "Brown", email: "alice.brown@example.com", phone: "(555) 789-0123", status: "active" },
  { id: 27, firstName: "Charlie", lastName: "Wilson", email: "charlie.wilson@example.com", phone: "(555) 012-3456", status: "inactive" },
  { id: 28, firstName: "Diana", lastName: "Davis", email: "diana.davis@example.com", phone: "(555) 345-6789", status: "active" },
  { id: 29, firstName: "Edward", lastName: "Miller", email: "edward.miller@example.com", phone: "(555) 678-9012", status: "active" },
  { id: 30, firstName: "Fiona", lastName: "Garcia", email: "fiona.garcia@example.com", phone: "(555) 901-2345", status: "inactive" },
  { id: 31, firstName: "George", lastName: "Martinez", email: "george.martinez@example.com", phone: "(555) 234-5678", status: "active" },
  { id: 32, firstName: "Helen", lastName: "Anderson", email: "helen.anderson@example.com", phone: "(555) 567-8901", status: "active" },
  { id: 33, firstName: "Ivan", lastName: "Taylor", email: "ivan.taylor@example.com", phone: "(555) 890-1234", status: "inactive" },
  { id: 34, firstName: "Julia", lastName: "Thomas", email: "julia.thomas@example.com", phone: "(555) 123-4567", status: "active" }
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

export const MOCK_PRIVATE_QUALIFICATIONS: TeacherQualification[] = [
  { id: 1, name: "Test65", rate: 10.0 },
  { id: 2, name: "test72.5", rate: 10.0 },
  { id: 3, name: "Instrument", rate: 20.0 },
  { id: 4, name: "xClarinet", rate: 36.0 },
  { id: 5, name: "xPiano Contemporary", rate: 10.0 },
  { id: 6, name: "xGuitar Core", rate: 10.0 },
  { id: 7, name: "xGuitar Contemporary", rate: 10.0 },
  { id: 8, name: "xGuitar Hybrid", rate: 10.0 },
  { id: 9, name: "xPiano Hybrid" },
  { id: 10, name: "40th Anniversary Vocal", rate: 25.0 },
  { id: 11, name: "Rami Test Program", rate: 30.0 },
];

export const MOCK_GROUP_QUALIFICATIONS: TeacherQualification[] = [
  { id: 12, name: "Rami Group Program", rate: 20.0 },
];
