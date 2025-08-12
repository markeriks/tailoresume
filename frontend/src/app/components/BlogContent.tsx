// components/BlogContent.tsx
import { MDXRemote } from 'next-mdx-remote/rsc';
import { BlogPost } from '@/lib/types';

interface BlogContentProps {
  post: BlogPost;
}

const mdxComponents = {
  h1: (props: any) => (
    <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-6 first:mt-0" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4 first:mt-0" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3 first:mt-0" {...props} />
  ),
  h4: (props: any) => (
    <h4 className="text-lg font-medium text-gray-900 mt-4 mb-2 first:mt-0" {...props} />
  ),
  p: (props: any) => (
    <p className="mb-6 leading-relaxed text-gray-700 text-lg" {...props} />
  ),
  ul: (props: any) => (
    <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700 text-lg" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700 text-lg" {...props} />
  ),
  li: (props: any) => (
    <li className="leading-relaxed" {...props} />
  ),
  blockquote: (props: any) => (
    <blockquote className="border-l-4 border-blue-500 pl-6 py-2 mb-6 italic text-gray-600 bg-gray-50 rounded-r" {...props} />
  ),
  pre: (props: any) => (
    <pre className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto mb-6 text-sm leading-relaxed" {...props} />
  ),
  code: ({ className, children, ...props }: any) => {
    // If it's inline code (no className indicates it's not in a pre block)
    if (!className) {
      return (
        <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    // If it's a code block (has className from syntax highlighting)
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  a: (props: any) => (
    <a className="text-blue-600 hover:text-blue-800 underline font-medium" {...props} />
  ),
  strong: (props: any) => (
    <strong className="font-semibold text-gray-900" {...props} />
  ),
  em: (props: any) => (
    <em className="italic" {...props} />
  ),
  hr: (props: any) => (
    <hr className="border-t border-gray-300 my-8" {...props} />
  ),
  img: (props: any) => (
    <img className="rounded-lg shadow-md mb-6 w-full" {...props} />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full divide-y divide-gray-200" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
  ),
  td: (props: any) => (
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" {...props} />
  ),
};

export function BlogContent({ post }: BlogContentProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6 text-sm">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>•</span>
          <span>By {post.author}</span>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed mb-6">{post.description}</p>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>
      
      <div className="max-w-none">
        <MDXRemote 
          source={post.content || ''} 
          components={mdxComponents}
        />
      </div>
    </article>
  );
}