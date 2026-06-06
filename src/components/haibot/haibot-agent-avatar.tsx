import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import { HAIBOT_AGENT_AVATAR, HAIBOT_AGENT_AVATAR_ALT } from '@/data/haibot-agent';
import { cn } from '@/lib/utils';

interface HaibotAgentAvatarProps {
  size?: 'sm' | 'lg';
  showWhatsAppBadge?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'size-10',
  lg: 'size-14',
} as const;

const badgeSizeClasses = {
  sm: 'size-4 [&_svg]:scale-75',
  lg: 'size-5',
} as const;

export function HaibotAgentAvatar({
  size = 'sm',
  showWhatsAppBadge = false,
  className,
}: HaibotAgentAvatarProps) {
  return (
    <span
      className={cn('relative inline-flex shrink-0', sizeClasses[size], className)}
    >
      <img
        src={HAIBOT_AGENT_AVATAR}
        alt={HAIBOT_AGENT_AVATAR_ALT}
        className="size-full rounded-full border-2 border-white/90 object-cover object-[center_15%] shadow-sm"
        loading="lazy"
      />
      {showWhatsAppBadge ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-[#25d366] text-white ring-2 ring-[#075e54]',
            badgeSizeClasses[size],
          )}
        >
          <Icon path={mdiWhatsapp} size={0.55} />
        </span>
      ) : null}
    </span>
  );
}
