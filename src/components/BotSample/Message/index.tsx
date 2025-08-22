import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  content: string | null
  canRetry?: boolean
  onRetrySendingMessage?: (content: string) => void
  isLoading?: boolean
  isCurrentStreamMessage?: boolean
  secondaryStreamBuffer?: string
};

export const Message = (props: MessageProps) => {
  const { isAi, content, canRetry, onRetrySendingMessage, isLoading, isCurrentStreamMessage, secondaryStreamBuffer = '' } = props;

  const [isSecondaryOpen, setIsSecondaryOpen] = useState<boolean>(true);
  const [smoothPrimary, setSmoothPrimary] = useState<string>('');
  const [smoothSecondary, setSmoothSecondary] = useState<string>('');
  const rafRef = useRef<number | null>(null);
  const secondaryBodyRef = useRef<HTMLDivElement | null>(null);

  const getDelta = (remaining: number) => {
    if (remaining > 200) return 24;
    if (remaining > 60) return 12;
    return 6;
  };

  const cancelRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    const targetPrimary = content || '';
    const targetSecondary = secondaryStreamBuffer || '';

    if (!isCurrentStreamMessage) {
      cancelRaf();
      setSmoothPrimary(targetPrimary);
      setSmoothSecondary(targetSecondary);
      return;
    }

    cancelRaf();
    const step = () => {
      let progressed = false;

      setSmoothPrimary((prev) => {
        const target = content || '';
        if (prev === target) return prev;
        const remaining = target.length - prev.length;
        if (remaining <= 0) return target;
        progressed = true;
        const delta = getDelta(remaining);
        return target.slice(0, Math.min(target.length, prev.length + delta));
      });

      setSmoothSecondary((prev) => {
        const target = secondaryStreamBuffer || '';
        if (prev === target) return prev;
        if (target.length < prev.length) return target; // overwrite on shrink
        const remaining = target.length - prev.length;
        if (remaining <= 0) return target;
        progressed = true;
        const delta = getDelta(remaining);
        return target.slice(0, Math.min(target.length, prev.length + delta));
      });

      if (progressed) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return cancelRaf;
  }, [isCurrentStreamMessage, content, secondaryStreamBuffer]);

  // Auto-scroll secondary panel to bottom as it streams
  useEffect(() => {
    if (!isCurrentStreamMessage) return;
    if (!secondaryBodyRef.current) return;
    const el = secondaryBodyRef.current;
    const id = requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
    return () => cancelAnimationFrame(id);
  }, [smoothSecondary, isCurrentStreamMessage, isSecondaryOpen]);

  const handleRetry = () => {
    if (onRetrySendingMessage) {
      onRetrySendingMessage(content || '')
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
            {matchMermaid && !isLoading && <Mermaid value={String(children).replace(/\n$/, '')} />}
            <CodeBlock language={language} showLineNumbers>{children}</CodeBlock>
          </>
        )
      } else {
        return <code {...props}>{children}</code>
      }
    },
  }), []);

  const secondaryMarkdown = useMemo(() => {
    if (!smoothSecondary) return '';
    const lines = smoothSecondary.split('\n').map((line) => `> ${line}`);
    return lines.join('\n');
  }, [smoothSecondary]);

  return (
    <div className={cn(styles.container, { [styles.aiMessage]: isAi })}>
      <div className={styles.heading}>
                  <span>{isAi ? 'PostgresAI' : 'You'}</span>
      </div>
      {isCurrentStreamMessage && secondaryMarkdown && (
        <div className={styles.secondaryContainer}>
          <button className={styles.secondaryHeader} onClick={() => setIsSecondaryOpen(!isSecondaryOpen)}>
            Thought process
            <span className={cn(styles.chevron, { [styles.chevronOpen]: isSecondaryOpen })}>▾</span>
          </button>
          {isSecondaryOpen && (
            <div className={styles.secondaryBody} ref={secondaryBodyRef}>
              <ReactMarkdown
                components={renderers}
                linkTarget='_blank'
                disallowedElements={disallowedHtmlTagsForMarkdown}
                unwrapDisallowed
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {secondaryMarkdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
      <div className={cn(styles.content, { [styles.loader]: isLoading })}>
        {
          (isCurrentStreamMessage ? smoothPrimary : (content || '')) &&
          <ReactMarkdown
            components={renderers}
            linkTarget='_blank'
            disallowedElements={disallowedHtmlTagsForMarkdown}
            unwrapDisallowed
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
          >
            {isCurrentStreamMessage ? smoothPrimary : (content || '')}
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