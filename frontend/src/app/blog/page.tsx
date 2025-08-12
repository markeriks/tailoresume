// app/blog/page.tsx

import { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BlogCard } from '@/app/components/BlogCard';
import { BlogLayout } from '@/app/components/BlogLayout';

export const metadata: Metadata = {
  title: 'Blog | TailoResume',
  description: 'Latest insights, tutorials, and updates from TailoResume.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <BlogLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the latest insights, tutorials, and updates from our team.
            Stay informed about industry trends and best practices.
          </p>
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts found.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </BlogLayout>
  );
}



