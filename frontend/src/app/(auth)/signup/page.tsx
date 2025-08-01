export const metadata = {
  title: 'Sign Up - TailoResume',
  description: 'Create an account to start tailoring your resume instantly.',
  themeColor: '#ffffff',
  openGraph: {
    title: 'Sign Up - TailoResume',
    description: 'Create an account to start tailoring your resume instantly.',
    url: 'https://yourdomain.com/signup',
    siteName: 'TailoResume',
    locale: 'en_US',
    type: 'website',
  },
};


import Signup from "./Signup";

export default function SignUpPage() {
  return (
    <Signup />
  );
}