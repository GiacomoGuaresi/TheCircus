import { ipcMain, shell } from 'electron'
import path from 'path'
import { IPC } from './channels'
import type { AppServices } from '../main'

export function registerIPCHandlers(services: AppServices): void {
  const { generator, scheduler, characterAnalyzer, diaryManager, configManager, aiImageService, llmService, desktopService } = services

  // Generation
  ipcMain.handle(IPC.GENERATE, async () => {
    return generator.generate()
  })

  // Scheduler
  ipcMain.handle(IPC.SCHEDULER_START, () => {
    scheduler.start()
    return { running: scheduler.isRunning(), next: scheduler.getNextExecutionTime() }
  })

  ipcMain.handle(IPC.SCHEDULER_STOP, () => {
    scheduler.stop()
    return { running: false }
  })

  ipcMain.handle(IPC.SCHEDULER_STATUS, () => ({
    running: scheduler.isRunning(),
    next: scheduler.getNextExecutionTime(),
    history: scheduler.getExecutionHistory(10)
  }))

  // Characters
  ipcMain.handle(IPC.CHARACTERS_LIST, async () => {
    return characterAnalyzer.loadAllCharacters()
  })

  ipcMain.handle(IPC.CHARACTER_GET, async (_event, id: string) => {
    return characterAnalyzer.getCharacterById(id)
  })

  ipcMain.handle(IPC.CHARACTER_SAVE, async (_event, character) => {
    await services.fileManager.saveCharacter(character)
    characterAnalyzer.invalidateCache(character.id)
    return character
  })

  ipcMain.handle(IPC.CHARACTER_DELETE, async (_event, id: string) => {
    await services.fileManager.deleteCharacter(id)
    characterAnalyzer.invalidateCache(id)
  })

  // Diary
  ipcMain.handle(IPC.DIARY_RECENT, async (_event, days = 7) => {
    return diaryManager.getRecentEntries(days)
  })

  ipcMain.handle(IPC.DIARY_SEARCH, async (_event, query: string) => {
    return diaryManager.searchEntries(query)
  })

  ipcMain.handle(IPC.DIARY_INDEX, async () => {
    return diaryManager.getIndex()
  })

  // Config
  ipcMain.handle(IPC.CONFIG_GET, () => configManager.get())

  ipcMain.handle(IPC.CONFIG_SAVE, async (_event, config) => {
    await configManager.save(config)
    generator.updateConfig(config)
    scheduler.updateInterval(config.generation.interval_hours)
    return config
  })

  ipcMain.handle(IPC.CONFIG_RESET, async () => configManager.reset())

  // Status
  ipcMain.handle(IPC.STATUS_AI_IMAGE, () => aiImageService.getStatus())
  ipcMain.handle(IPC.STATUS_AI_LLM, () => llmService.getStatus())
  ipcMain.handle(IPC.STATUS_DESKTOP, () => desktopService.getStatus())

  // App
  ipcMain.handle(IPC.APP_VERSION, () => process.env.npm_package_version ?? '0.1.0')
  ipcMain.handle(IPC.OPEN_DATA_DIR, () => {
    const dataDir = path.resolve(configManager.get().data_dir)
    shell.openPath(dataDir)
  })
}
