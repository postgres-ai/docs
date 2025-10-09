import React from 'react';
import {useBlogPost} from '@docusaurus/theme-common/internal';
import BlogPostItem from '@theme-original/BlogPostItem';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import type {Props} from '@theme/BlogPostItem';

export default function BlogPostItemWrapper(props: Props): JSX.Element {
  const {metadata, assets, isBlogPostPage} = useBlogPost();
  const {frontMatter} = metadata;
  const coverImage = assets.image ?? frontMatter.image;

  if (!isBlogPostPage) {
    // For blog listing pages, use the original component (no cover images)
    return <BlogPostItem {...props} />;
  }

  // For individual blog post pages, add cover image after header
  return (
    <article itemProp="blogPost" itemScope itemType="http://schema.org/BlogPosting">
      <BlogPostItemHeader />
      
      {/* Display cover image after title and author */}
      {coverImage && (
        <div style={{
          marginBottom: '2rem',
          textAlign: 'center' as const,
        }}>
          <img
            src={coverImage}
            alt={metadata.title}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
            loading="eager"
          />
        </div>
      )}
      
      <BlogPostItemContent>{props.children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </article>
  );
}