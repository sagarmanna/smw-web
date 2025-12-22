import { PrivateLessonRow } from "../privateLessonsListing.api";
import { format, addDays } from "date-fns";

export const mockPrivateLessonData: PrivateLessonRow[] = [
  {
    id: 1,
    date: "Dec 19, 2025 @ 02:00 PM",
    student: "Joe Singh",
    program: "Piano Core",
    teacher: "Elton John",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Paid",
    price: "$29.25",
  },
  {
    id: 2,
    date: "Dec 19, 2025 @ 05:30 PM",
    student: "Ryan O'Connell",
    program: "Piano Core",
    teacher: "Elton John",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Paid",
    price: "$29.25",
  },
  {
    id: 3,
    date: "Dec 19, 2025 @ 02:00 PM",
    student: "David smith",
    program: "xPiano Contemporary",
    teacher: "Thomas karenshia",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Owing",
    price: "$27.89",
  },
  {
    id: 4,
    date: "Dec 19, 2025 @ 02:00 PM",
    student: "Jonathan Toews",
    program: "Guitar Core",
    teacher: "Art Tatum",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Paid",
    price: "$31.53",
  },
  {
    id: 5,
    date: "Dec 19, 2025 @ 04:00 PM",
    student: "Joesph John",
    program: "Drums Core",
    teacher: "Art Tatum",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Owing",
    price: "$30.55",
  },
  {
    id: 6,
    date: "Dec 19, 2025 @ 09:30 AM",
    student: "John Trial",
    program: "xPiano Core",
    teacher: "Daniel Clain",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Owing",
    price: "$27.89",
  },
  {
    id: 7,
    date: "Dec 19, 2025 @ 01:00 PM",
    student: "Julie Rockwell",
    program: "xGuitar Core",
    teacher: "le Tho",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Owing",
    price: "$27.89",
  },
  {
    id: 8,
    date: "Dec 19, 2025 @ 02:30 PM",
    student: "Kylie Johnson",
    program: "Guitar Core",
    teacher: "Alexander Hamilton",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Paid",
    price: "$31.53",
  },
  {
    id: 9,
    date: "Dec 19, 2025 @ 04:00 PM",
    student: "Mary Smith",
    program: "xPiano Core",
    teacher: "John Fedrick",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Owing",
    price: "$27.89",
  },
  {
    id: 10,
    date: "Dec 19, 2025 @ 04:30 PM",
    student: "Jack Bieber",
    program: "Guitar Core",
    teacher: "Art Tatum",
    duration: "00:30",
    online: "No",
    status: "Scheduled",
    payment: "Owing",
    price: "$31.53",
  },
  {
    id: 11,
    date: "Dec 19, 2025 @ 03:30 AM",
    student: "Venkat test student",
    program: "xGuitar Contemporary",
    teacher: "Daniel Clain",
    duration: "00:30",
    online: "Yes",
    status: "Completed",
    payment: "Owing",
    price: "$28.75",
  },
  // Add more mock data to reach 90 items
  // Include some entries with today's date
  ...Array.from({ length: 79 }, (_, i) => {
    // Mix dates: first 20 items use today's date, rest use future dates
    const today = new Date();
    const targetDate = i < 20 ? today : addDays(today, Math.floor(i / 10));
    
    // Format date as "MMM dd, yyyy"
    const dateStr = format(targetDate, "MMM d, yyyy");
    
    const hour = 9 + (i % 12);
    const minute = i % 2 === 0 ? '00' : '30';
    const ampm = i % 2 === 0 ? 'AM' : 'PM';
    
    return {
      id: 12 + i,
      date: `${dateStr} @ ${String(hour).padStart(2, '0')}:${minute} ${ampm}`,
      student: `Student ${12 + i}`,
      program: i % 3 === 0 ? "Piano Core" : i % 3 === 1 ? "Guitar Core" : "Drums Core",
      teacher: i % 4 === 0 ? "Elton John" : i % 4 === 1 ? "Art Tatum" : i % 4 === 2 ? "Daniel Clain" : "Alexander Hamilton",
      duration: "00:30",
      online: i % 5 === 0 ? "Yes" : "No",
      status: i % 7 === 0 ? "Completed" : "Scheduled",
      payment: i % 3 === 0 ? "Paid" : "Owing",
      price: `$${(25 + (i % 10)).toFixed(2)}`,
    };
  }),
];

