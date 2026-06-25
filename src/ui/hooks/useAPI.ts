import type { CircusAPI } from '../../preload'

declare global {
  interface Window {
    circus: CircusAPI
  }
}

export const api = window.circus
