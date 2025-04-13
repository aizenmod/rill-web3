import { classNames } from '~/utils/classNames';

interface SendButtonProps {
  show?: boolean;
  isStreaming?: boolean;
  onClick?: (event: React.UIEvent) => void;
}

export function SendButton({ show = false, isStreaming = false, onClick }: SendButtonProps) {
  return (
    <button
      type="button"
      aria-label={isStreaming ? 'Stop generating' : 'Send message'}
      onClick={onClick}
      className={classNames(
        'absolute right-3 top-3 flex items-center justify-center transition-opacity duration-200',
        'w-8 h-8 rounded-full text-white bg-[var(--rill-primary)] hover:bg-[var(--rill-primary-dark)]',
        {
          'opacity-0 pointer-events-none': !show,
          'opacity-100': show,
        },
      )}
    >
      {isStreaming ? (
        <div className="i-ph:stop-fill text-lg" />
      ) : (
        <div className="i-ph:paper-plane-right-fill text-lg" />
      )}
    </button>
  );
}
