import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { HaibotAgentAvatar } from '@/components/haibot/haibot-agent-avatar';
import { HaibotChatPanel } from '@/components/haibot/haibot-chat-panel';
import { cn } from '@/lib/utils';

export function HaibotFloatingMenu() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const closeChat = useCallback(() => setChatOpen(false), []);

  useEffect(() => {
    if (!chatOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      closeChat();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeChat();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [chatOpen, closeChat]);

  return (
    <div
      ref={panelRef}
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      <HaibotChatPanel open={chatOpen} onClose={closeChat} />

      <button
        type="button"
        onClick={() => setChatOpen((open) => !open)}
        aria-expanded={chatOpen}
        aria-haspopup="dialog"
        aria-label={chatOpen ? 'Cerrar chat con Haibot' : 'Abrir chat con Haibot'}
        className={cn(
          'relative flex size-14 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25d366] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          chatOpen
            ? 'bg-[#25d366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:bg-[#20bd5a] scale-105'
            : 'bg-transparent shadow-[0_4px_20px_rgba(37,211,102,0.45)]',
        )}
      >
        {chatOpen ? (
          <X className="size-7 text-white" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <HaibotAgentAvatar size="lg" showWhatsAppBadge className="pointer-events-none" />
        )}
      </button>
    </div>
  );
}
