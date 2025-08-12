// components/BlogLayout.tsx
import  Navbar  from './Navbar';

interface BlogLayoutProps {
  children: React.ReactNode;
}

export function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mt-15">{children}</main>
    </div>
  );
}