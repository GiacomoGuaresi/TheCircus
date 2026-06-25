import fs from 'fs-extra'
import path from 'path'
import { LOGS_DIR } from '@models/constants'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }

class Logger {
  private level: LogLevel = 'info'
  private logFile?: string

  init(level: LogLevel, dataDir: string): void {
    this.level = level
    const logsPath = path.join(dataDir, LOGS_DIR)
    fs.ensureDirSync(logsPath)
    const date = new Date().toISOString().split('T')[0]
    this.logFile = path.join(logsPath, `${date}.log`)
  }

  private shouldLog(level: LogLevel): boolean {
    return LEVELS[level] >= LEVELS[this.level]
  }

  private format(level: LogLevel, message: string, context?: unknown): string {
    const ts = new Date().toISOString()
    const ctx = context ? ` ${JSON.stringify(context)}` : ''
    return `[${ts}] [${level.toUpperCase()}] ${message}${ctx}`
  }

  private write(level: LogLevel, message: string, context?: unknown): void {
    if (!this.shouldLog(level)) return
    const line = this.format(level, message, context)
    const color = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' }[level]
    console.log(`${color}${line}\x1b[0m`)
    if (this.logFile) {
      fs.appendFileSync(this.logFile, line + '\n')
    }
  }

  debug(message: string, context?: unknown): void { this.write('debug', message, context) }
  info(message: string, context?: unknown): void { this.write('info', message, context) }
  warn(message: string, context?: unknown): void { this.write('warn', message, context) }
  error(message: string, context?: unknown): void { this.write('error', message, context) }
}

export const logger = new Logger()
