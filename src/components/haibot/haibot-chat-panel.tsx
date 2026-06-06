import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Send, X } from 'lucide-react';

import { HaibotAgentAvatar } from '@/components/haibot/haibot-agent-avatar';
import {
  createHaibotMessage,
  getHaibotAssistantReply,
  type HaibotChatMessage,
} from '@/lib/haibot-assistant';
import { HAIBOT_WELCOME_MESSAGE } from '@/lib/haibot-messages';
import { cn } from '@/lib/utils';

function HaibotTypingBubble() {
  return (
    <div className="mr-auto flex max-w-[85%] flex-col gap-1">
      <div className="rounded-lg rounded-tl-sm bg-white px-3 py-2.5 shadow-sm">
        <div className="flex items-center gap-1" aria-hidden="true">
          <span className="size-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
          <span className="size-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
          <span className="size-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
        </div>
      </div>
      <span className="sr-only">Haibot está escribiendo</span>
    </div>
  );
}

function ChatBubble({ message }: { message: HaibotChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn('flex max-w-[88%] flex-col gap-0.5', isUser ? 'ml-auto items-end' : 'mr-auto items-start')}
    >
      <div
        className={cn(
          'whitespace-pre-wrap px-3 py-2 text-[0.8125rem] leading-relaxed shadow-sm',
          isUser
            ? 'rounded-lg rounded-tr-sm bg-[#d9fdd3] text-[#111b21]'
            : 'rounded-lg rounded-tl-sm bg-white text-[#111b21]',
        )}
      >
        {message.content}
      </div>
      <time
        className="px-1 text-[0.65rem] text-[#667781]"
        dateTime={message.time}
      >
        {message.time}
      </time>
    </div>
  );
}

interface HaibotChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function HaibotChatPanel({ open, onClose }: HaibotChatPanelProps) {
  const formId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<HaibotChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMessages([createHaibotMessage('assistant', HAIBOT_WELCOME_MESSAGE)]);
    setDraft('');
    setIsThinking(false);
  }, [open]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isThinking, open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isThinking) return;

    setDraft('');
    setMessages((prev) => [...prev, createHaibotMessage('user', text)]);
    setIsThinking(true);

    window.setTimeout(() => {
      setMessages((prev) => [...prev, createHaibotMessage('assistant', getHaibotAssistantReply(text))]);
      setIsThinking(false);
    }, 550);
  };

  if (!open) return null;

  return (
    <section
      aria-label="Chat con Haibot"
      className="flex h-[min(70vh,32rem)] w-[min(calc(100vw-2rem),22rem)] flex-col overflow-hidden rounded-2xl bg-[#efeae2] shadow-[0_12px_40px_rgba(15,23,42,0.22)]"
    >
      <header className="flex shrink-0 items-center gap-3 bg-[#075e54] px-3 py-3 text-white">
        <HaibotAgentAvatar size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Haibot</p>
          <p className="truncate text-xs text-white/80">
            {isThinking ? 'escribiendo…' : 'en línea · asistente HaiStore'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Cerrar chat con Haibot"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.04) 1px, transparent 0)',
          backgroundSize: '12px 12px',
        }}
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isThinking ? <HaibotTypingBubble /> : null}
      </div>

      <div className="shrink-0 bg-[#f0f2f5] px-2 pb-2 pt-2">
        <form id={formId} onSubmit={handleSubmit} className="flex items-end gap-2">
          <label htmlFor={`${formId}-input`} className="sr-only">
            Escribe un mensaje
          </label>
          <textarea
            id={`${formId}-input`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Mensaje"
            rows={1}
            disabled={isThinking}
            className="max-h-24 min-h-10 flex-1 resize-none rounded-3xl border-0 bg-white px-4 py-2.5 text-sm text-[#111b21] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] disabled:opacity-60"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isThinking}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#075e54] text-white transition-colors hover:bg-[#128c7e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#075e54] focus-visible:ring-offset-2 disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send className="size-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
