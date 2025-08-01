export const metadata = {
  title: 'Login - TailoResume',
  description: 'Sign in to TailoResume to tailor your resume instantly.',
  themeColor: '#ffffff',
  openGraph: {
    title: 'Login - TailoResume',
    description: 'Sign in to TailoResume to tailor your resume instantly.',
    url: 'https://yourdomain.com/login',
    siteName: 'TailoResume',
    locale: 'en_US',
    type: 'website',
  },
};

import Login from './Login';

export default function Page() {
  return <Login />;
}
