export const metadata = {
  title: 'Dashboard - TailoResume',
  description: 'Manage and tailor your resumes quickly with TailoResume dashboard.',
  themeColor: '#ffffff',
  openGraph: {
    title: 'Dashboard - TailoResume',
    description: 'Manage and tailor your resumes quickly with TailoResume dashboard.',
    url: 'https://tailoresume.com/dashboard',
    siteName: 'TailoResume',
    locale: 'en_US',
    type: 'website',
  },
};

import RequireAuth from '@/app/components/RequireAuth';
import DashboardWrapper from './DashboardWrapper';


export default function DashboardPage() {
  
  return (
    <RequireAuth>
      <DashboardWrapper />
    </RequireAuth>
  );
}