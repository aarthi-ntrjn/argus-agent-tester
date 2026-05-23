const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

function timestamp(): string {
  return new Date().toISOString().substring(11, 19);
}

export const log = {
  info: (msg: string) => console.log(`${GRAY}${timestamp()}${RESET} ${CYAN}info${RESET}  ${msg}`),
  success: (msg: string) => console.log(`${GRAY}${timestamp()}${RESET} ${GREEN}${BOLD}ok${RESET}    ${msg}`),
  warn: (msg: string) => console.log(`${GRAY}${timestamp()}${RESET} ${YELLOW}warn${RESET}  ${msg}`),
  error: (msg: string) => console.error(`${GRAY}${timestamp()}${RESET} ${RED}error${RESET} ${msg}`),
  step: (msg: string) => console.log(`\n${BOLD}${msg}${RESET}`),
};
