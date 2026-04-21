// Placeholder logger. Replace with a TTY-aware logger (ANSI colors, spinner
// support) once commands beyond help/version exist.

export const logger = {
  info: (msg: string) => console.log(msg),
  warn: (msg: string) => console.warn(msg),
  error: (msg: string) => console.error(msg),
};
