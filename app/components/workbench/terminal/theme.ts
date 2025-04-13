import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--rill-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--rill-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--rill-elements-terminal-textColor'),
    background: cssVar('--rill-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--rill-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--rill-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--rill-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--rill-elements-terminal-color-black'),
    red: cssVar('--rill-elements-terminal-color-red'),
    green: cssVar('--rill-elements-terminal-color-green'),
    yellow: cssVar('--rill-elements-terminal-color-yellow'),
    blue: cssVar('--rill-elements-terminal-color-blue'),
    magenta: cssVar('--rill-elements-terminal-color-magenta'),
    cyan: cssVar('--rill-elements-terminal-color-cyan'),
    white: cssVar('--rill-elements-terminal-color-white'),
    brightBlack: cssVar('--rill-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--rill-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--rill-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--rill-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--rill-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--rill-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--rill-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--rill-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}
