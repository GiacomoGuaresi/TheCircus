import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import { logger } from './utils/logger'
import { ConfigManager } from './services/configManager'
import { FileManager } from './services/fileManager'
import { CharacterAnalyzer } from './services/characterAnalyzer'
import { DiaryManager } from './services/diaryManager'
import { ScenarioGenerator } from './services/scenarioGenerator'
import { PromptEngineer } from './services/promptEngineer'
import { AIImageService } from './services/ai/AIImageService'
import { LLMService } from './services/ai/LLMService'
import { DesktopService } from './services/desktopService'
import { Generator } from './core/generator'
import { Scheduler } from './core/scheduler'
import { registerIPCHandlers } from './ipc/handlers'
import { IPC } from './ipc/channels'

dotenv.config()

export interface AppServices {
  configManager: ConfigManager
  fileManager: FileManager
  characterAnalyzer: CharacterAnalyzer
  diaryManager: DiaryManager
  aiImageService: AIImageService
  llmService: LLMService
  desktopService: DesktopService
  generator: Generator
  scheduler: Scheduler
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

async function bootstrap(): Promise<AppServices> {
  const ROOT_DIR = app.isPackaged ? path.dirname(app.getPath('exe')) : process.cwd()
  const configManager = new ConfigManager(ROOT_DIR)
  const config = await configManager.load()

  logger.init(config.log_level, config.data_dir)
  logger.info('The Circus: booting up')

  const fileManager = new FileManager(config.data_dir)
  await fileManager.ensureDirs()

  const characterAnalyzer = new CharacterAnalyzer(fileManager)
  const diaryManager = new DiaryManager(fileManager)
  const aiImageService = new AIImageService(config.ai_image)
  const llmService = new LLMService(config.ai_llm)
  const desktopService = new DesktopService()
  const scenarioGenerator = new ScenarioGenerator(llmService, characterAnalyzer)
  const promptEngineer = new PromptEngineer(llmService)

  const generator = new Generator(
    characterAnalyzer,
    diaryManager,
    scenarioGenerator,
    promptEngineer,
    aiImageService,
    desktopService,
    config
  )

  const scheduler = new Scheduler(
    config.generation.interval_hours,
    config.timezone,
    () => generator.generate()
  )

  return { configManager, fileManager, characterAnalyzer, diaryManager, aiImageService, llmService, desktopService, generator, scheduler }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#1a1a2e',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow?.hide()
  })
}

function setupTray(scheduler: Scheduler): void {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('The Circus')

  const updateMenu = (): void => {
    const menu = Menu.buildFromTemplate([
      { label: 'Open The Circus', click: () => mainWindow?.show() },
      { type: 'separator' },
      {
        label: scheduler.isRunning() ? 'Pause Auto-Generation' : 'Resume Auto-Generation',
        click: () => {
          if (scheduler.isRunning()) scheduler.stop()
          else scheduler.start()
          updateMenu()
        }
      },
      {
        label: 'Generate Now',
        click: () => {
          scheduler.trigger()
        }
      },
      { type: 'separator' },
      { label: 'Quit', click: () => { app.exit(0) } }
    ])
    tray?.setContextMenu(menu)
  }

  updateMenu()
  scheduler.on('tick-complete', updateMenu)
  scheduler.on('tick-error', updateMenu)
}

function forwardSchedulerEvents(scheduler: Scheduler, win: BrowserWindow): void {
  scheduler.on('tick-start', () => win.webContents.send(IPC.SCHEDULER_TICK_START))
  scheduler.on('tick-complete', (log) => win.webContents.send(IPC.SCHEDULER_TICK_COMPLETE, log))
  scheduler.on('tick-error', (log) => win.webContents.send(IPC.SCHEDULER_TICK_ERROR, log))
}

app.whenReady().then(async () => {
  const services = await bootstrap()

  registerIPCHandlers(services as AppServices & { fileManager: FileManager })
  createWindow()
  setupTray(services.scheduler)

  if (mainWindow) {
    forwardSchedulerEvents(services.scheduler, mainWindow)
  }

  services.scheduler.start()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    else mainWindow?.show()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  mainWindow?.removeAllListeners('close')
})
