import { UserSettings } from './types';

export const IDLE_TIMEOUT_SECONDS = 5 * 60; // VVSG Requirement: 2–5 minutes
export const IDLE_RESET_TIMEOUT_SECONDS = 45; // VVSG Requirement: 20–45 seconds
export const RECENT_PRINT_EXPIRATION_SECONDS = 1 * 60; // 1 minute
export const CARD_LONG_VALUE_WRITE_DELAY = 1000;
export const BALLOT_PRINTING_TIMEOUT_SECONDS = 5;
export const BALLOT_INSTRUCTIONS_TIMEOUT_SECONDS = 30;
export const REPORT_PRINTING_TIMEOUT_SECONDS = 4;
export const CHECK_ICON = '✓';
export const FONT_SIZES = [22, 28, 36, 48];
export const DEFAULT_FONT_SIZE = 1;
export const LARGE_DISPLAY_FONT_SIZE = 3;
export const TEXT_SIZE = 1;
export const WRITE_IN_CANDIDATE_MAX_LENGTH = 40;
export const QUIT_KIOSK_IDLE_SECONDS = 5 * 60; // 5 minutes
export const SECURITY_PIN_LENGTH = 6;
export const DEFAULT_USER_SETTINGS: UserSettings = {
  textSize: TEXT_SIZE,
  showSettingsModal: false,
};
