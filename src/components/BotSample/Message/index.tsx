import React, { useMemo } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import cn from 'classnames'
import { RetryIcon } from '@site/src/icons/RetryIcon'
import { LoadingIcon } from '@site/src/icons/LoadingIcon'
import Mermaid from '@theme/Mermaid';
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

const disallowedHtmlTagsForMarkdown= [
  'script',
  'style',
  'iframe',
  'form',
  'input',
  'link',
  'meta',
  'embed',
  'object',
  'applet',
  'base',
  'frame',
  'frameset',
  'audio',
  'video',
];


type MessageProps = {
  isAi: boolean
  content: string
  canRetry?: boolean
  onRetrySendingMessage?: (content: string) => void
  isLoading?: boolean
};

export const Message = (props: MessageProps) => {
  const { isAi, content, canRetry, onRetrySendingMessage, isLoading } = props;

  const handleRetry = () => {
    if (onRetrySendingMessage) {
      onRetrySendingMessage(content)
    }
  }

  const renderers = useMemo<Components>(() => ({
    p: ({ node, ...props }) => <div {...props} />,
    img: ({ node, ...props }) => <img style={{ maxWidth: '60%' }} {...props} />,
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const matchMermaid = /language-mermaid/.test(className || '');
      const language = match ? match[1] : '';
      if (!inline) {
        return (
          <>
            {matchMermaid && <Mermaid value={String(children).replace(/\n$/, '')} />}
            <CodeBlock language={language} showLineNumbers>{children}</CodeBlock>
          </>
        )
      } else {
        return <code {...props}>{children}</code>
      }
    },
  }), []);

  return (
    <div className={cn(styles.container, { [styles.aiMessage]: isAi })}>
      <div className={styles.heading}>
        <span>{isAi ? 'Postgres.AI' : 'You'}</span>
      </div>
      <div className={cn(styles.content, { [styles.loader]: isLoading })}>
        {
          content &&
          <ReactMarkdown
            components={renderers}
            linkTarget='_blank'
            disallowedElements={disallowedHtmlTagsForMarkdown}
            unwrapDisallowed
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
          >
            {content}
          </ReactMarkdown>
        }
        {
          isLoading && <LoadingIcon />
        }
      </div>
      {canRetry && <button
        className={styles.retryButton}
        title="Try again"
        onClick={handleRetry}
      >
        <RetryIcon />
      </button>}
    </div>
  )
}