import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to a default location or show a location selection page
  // For now, redirect to a default location
  redirect('/training-location/dashboard');
}
