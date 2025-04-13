import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { Web3Header } from '~/components/web3/Web3Header';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      className={classNames(
        'bg-[var(--rill-transparent)] border-b h-[var(--header-height)] transition-all duration-300',
        {
          'border-transparent': !chat.started,
          'border-[var(--rill-border-color)] shadow-sm': chat.started,
        },
      )}
    >
      <div className=" h-full px-4 flex justify-between items-center">
        {/* Logo section */}
        <div className="flex items-center gap-3">
          <div className="i-ph:sidebar-simple-duotone text-xl text-[var(--rill-primary)]" />
          <a href="/" className="text-2xl font-semibold flex items-center">
            <span className="w-[46px] inline-block bg-gradient-to-r from-[var(--rill-primary)] to-[var(--rill-primary-dark)] bg-clip-text text-transparent font-bold">
              Rill
            </span>
          </a>
        </div>
        
        {/* Center section - Chat description */}
        <div className="max-w-xs w-full px-4 truncate text-center text-[var(--rill-text-primary)] font-medium">
          <ClientOnly>{() => <ChatDescription />}</ClientOnly>
        </div>
        
        {/* Right section - Actions */}
        <div className="flex items-center">
          <ClientOnly>
            {() => (
              <div className="flex items-center gap-4">
                <Web3Header className="mr-2" />
                {chat.started && <HeaderActionButtons />}
              </div>
            )}
          </ClientOnly>
        </div>
      </div>
    </header>
  );
}
