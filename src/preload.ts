import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from './ipc/channels'

// Type-safe bridge between renderer and main process
const api = {
  generate: () => ipcRenderer.invoke(IPC.GENERATE),

  scheduler: {
    start: () => ipcRenderer.invoke(IPC.SCHEDULER_START),
    stop: () => ipcRenderer.invoke(IPC.SCHEDULER_STOP),
    status: () => ipcRenderer.invoke(IPC.SCHEDULER_STATUS),
    onTickStart: (cb: () => void) => {
      ipcRenderer.on(IPC.SCHEDULER_TICK_START, cb)
      return () => ipcRenderer.removeListener(IPC.SCHEDULER_TICK_START, cb)
    },
    onTickComplete: (cb: (log: unknown) => void) => {
      ipcRenderer.on(IPC.SCHEDULER_TICK_COMPLETE, (_e, log) => cb(log))
      return () => ipcRenderer.removeListener(IPC.SCHEDULER_TICK_COMPLETE, () => {})
    },
    onTickError: (cb: (log: unknown) => void) => {
      ipcRenderer.on(IPC.SCHEDULER_TICK_ERROR, (_e, log) => cb(log))
      return () => ipcRenderer.removeListener(IPC.SCHEDULER_TICK_ERROR, () => {})
    }
  },

  characters: {
    list: () => ipcRenderer.invoke(IPC.CHARACTERS_LIST),
    get: (id: string) => ipcRenderer.invoke(IPC.CHARACTER_GET, id),
    save: (character: unknown) => ipcRenderer.invoke(IPC.CHARACTER_SAVE, character),
    delete: (id: string) => ipcRenderer.invoke(IPC.CHARACTER_DELETE, id)
  },

  diary: {
    recent: (days?: number) => ipcRenderer.invoke(IPC.DIARY_RECENT, days),
    search: (query: string) => ipcRenderer.invoke(IPC.DIARY_SEARCH, query),
    index: () => ipcRenderer.invoke(IPC.DIARY_INDEX)
  },

  config: {
    get: () => ipcRenderer.invoke(IPC.CONFIG_GET),
    save: (config: unknown) => ipcRenderer.invoke(IPC.CONFIG_SAVE, config),
    reset: () => ipcRenderer.invoke(IPC.CONFIG_RESET)
  },

  status: {
    aiImage: () => ipcRenderer.invoke(IPC.STATUS_AI_IMAGE),
    aiLLM: () => ipcRenderer.invoke(IPC.STATUS_AI_LLM),
    desktop: () => ipcRenderer.invoke(IPC.STATUS_DESKTOP)
  },

  app: {
    version: () => ipcRenderer.invoke(IPC.APP_VERSION),
    openDataDir: () => ipcRenderer.invoke(IPC.OPEN_DATA_DIR)
  }
}

contextBridge.exposeInMainWorld('circus', api)

export type CircusAPI = typeof api
