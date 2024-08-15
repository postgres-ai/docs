import { MutableRefObject, useEffect, useRef, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { getCookie, setCookie } from '@site/src/components/BotSample/utils'

export type BotMessage = {
  id: string
  created_at: string
  parent_id: string | null
  content: string
  is_ai: boolean
  is_public: boolean
  first_name: string | null
  last_name: string | null
  display_name: string | null
  slack_profile: string | null
  user_id: string
  org_id: string
  thread_id: string
  type: 'message' | undefined
  ai_model: string
}

export type StateMessage = {
  type: 'state'
  state: string | null
  thread_id: string
}

export type StreamMessage = {
  type: 'stream'
  content: string
  ai_model: string
  thread_id: string
}

export type ErrorMessage = {
  type: 'error'
  message: string
  thread_id: string
}

export type ErrorType = {
  code?: number;
  message: string;
  errorType?: 'connection' | 'chatNotFound' | 'ratelimit';
}


type SendMessageType = {
  content: string;
  thread_id?: string | null;
  org_id?: number | null;
}

type UseBotMessages = {
  stateMessage: StateMessage | null;
  sendMessage(content: SendMessageType): void;
  messages: BotMessage[];
  error: ErrorType | ErrorMessage | null;
  loading: boolean;
  connectionStatus: ConnectionStatus;
  currentStreamMessage: StreamMessage | null
}

export enum ConnectionStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  ERROR = 'error',
  CONNECTING = 'connecting',
}

export const useBotMessages = (): UseBotMessages => {
  const { siteConfig } = useDocusaurusContext();
  const botWSUrl = siteConfig.customFields.botWSUrl;

  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorType | ErrorMessage | null>(null);
  const [stateMessage, setStateMessage] = useState<StateMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.CLOSED);
  const [currentStreamMessage, setCurrentStreamMessage] = useState<StreamMessage | null>(null)

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef<number>(1000);

  const connectWebSocket = () => {
    setConnectionStatus(ConnectionStatus.CONNECTING);
    const websocket = new WebSocket(botWSUrl as string);
    websocketRef.current = websocket;

    websocket.onopen = () => {
      setConnectionStatus(ConnectionStatus.OPEN);
      reconnectDelayRef.current = 1000;
      setError(null);
      console.log('WebSocket connection established');
    };

    websocket.onerror = (event) => {
      setError({ message: 'WebSocket connection error: attempting to reconnect', errorType: 'connection' });
      setConnectionStatus(ConnectionStatus.ERROR);
      console.error('WebSocket error:', event);
      scheduleReconnect();
    };

    websocket.onmessage = (event) => {
      const messageData: BotMessage | StateMessage | ErrorMessage | StreamMessage = JSON.parse(event.data);
      if (messageData.type === 'state') {
        setStateMessage(messageData as StateMessage);
      } else if (messageData.type === 'error') {
        if (messageData.message) {
          setError({...messageData, errorType: 'ratelimit'});
        }
        setLoading(false);
      } else if (messageData.type === 'message') {
        setMessages(prevMessages => {
          const currentMessages = [...prevMessages, messageData];
          setLoading(false);
          setError(null);
          let threadId = messageData.thread_id;
          if (threadId) {
            const duration = 60 * 60 * 1000;
            setCookie('pgai_tmp_thread_id', threadId, duration)
            setCookie('pgai_bot_messages', JSON.stringify(currentMessages), duration)
          }
          if (currentStreamMessage) setCurrentStreamMessage(null)
          return currentMessages;
        });
      } else if (messageData.type === 'stream') {
        setCurrentStreamMessage(messageData)
      }
    };

    websocket.onclose = (event) => {
      setConnectionStatus(ConnectionStatus.CLOSED);
      setLoading(false);
      console.log('WebSocket connection closed', event);
      if (event.reason !== 'Valid JWT required') {
        scheduleReconnect();
        setError({ message: 'WebSocket connection error: attempting to reconnect', errorType: 'connection' });
      } else {
        setError({ message: event.reason, errorType: 'connection' });
      }
    };
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
      reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 60000);
    }, reconnectDelayRef.current);
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [botWSUrl]);

  const sendMessage = async ({ content, thread_id, org_id = 34 }: SendMessageType) => {
    setLoading(true);
    if (error && (error as ErrorType).errorType === 'ratelimit') {
      setError(null)
    }
    if (messages.length < 2 && websocketRef.current) {
      try {
        const message = {
          content,
          type: 'message',
          ai_model: 'gcp/gemini-1.5-pro',
        } as BotMessage;
        setMessages([message]);

        websocketRef.current.send(
          JSON.stringify({
            action: 'send',
            payload: {
              content,
              thread_id,
              org_id,
              ai_model: `gcp/gemini-1.5-pro`,
            },
          })
        );
      } catch (e) {
        setError(e as ErrorType);
        setLoading(false)
      }
    }
  };

  useEffect(() => {
    const savedMessages = getCookie('pgai_bot_messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages)
      } catch (e) {
        console.error('Error parsing cookie value:', e);
      }
    }
  }, [])

  return {
    error,
    loading: isLoading,
    sendMessage,
    messages,
    stateMessage,
    connectionStatus,
    currentStreamMessage
  };
};

export const useCaret = (
  elementRef: MutableRefObject<HTMLInputElement | HTMLTextAreaElement | undefined>,
) => {
  // Keep caret position after making new line, but only after react update.
  const [nextPosition, setNextPosition] = useState<number | null>(null)

  useEffect(() => {
    if (nextPosition === null) return
    if (!elementRef.current) return

    elementRef.current.selectionStart = nextPosition
    elementRef.current.selectionEnd = nextPosition

    setNextPosition(null)
  }, [elementRef, nextPosition])

  return {
    setPosition: setNextPosition,
  }
}