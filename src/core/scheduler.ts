import { EventEmitter } from 'events'
import cron from 'node-cron'
import { logger } from '@utils/logger'

export interface ScheduleLog {
  timestamp: string
  success: boolean
  duration_ms: number
  error?: string
}

export class Scheduler extends EventEmitter {
  private task?: cron.ScheduledTask
  private logs: ScheduleLog[] = []
  private running = false

  constructor(
    private intervalHours: number,
    private timezone: string,
    private onTick: () => Promise<void>
  ) {
    super()
  }

  start(): void {
    if (this.task) this.stop()

    const cronExpr = this.buildCronExpression(this.intervalHours)
    logger.info(`Scheduler: starting with expression "${cronExpr}" (timezone: ${this.timezone})`)

    this.task = cron.schedule(cronExpr, () => this.executeTick(), {
      timezone: this.timezone
    })

    this.running = true
    this.emit('started', { nextExecution: this.getNextExecutionTime() })
  }

  stop(): void {
    this.task?.stop()
    this.task = undefined
    this.running = false
    logger.info('Scheduler: stopped')
    this.emit('stopped')
  }

  async trigger(): Promise<void> {
    logger.info('Scheduler: manual trigger')
    await this.executeTick()
  }

  private async executeTick(): Promise<void> {
    const start = Date.now()
    logger.info('Scheduler: tick started')
    this.emit('tick-start')

    try {
      await this.onTick()
      const log: ScheduleLog = {
        timestamp: new Date().toISOString(),
        success: true,
        duration_ms: Date.now() - start
      }
      this.logs.unshift(log)
      this.emit('tick-complete', log)
    } catch (err) {
      const log: ScheduleLog = {
        timestamp: new Date().toISOString(),
        success: false,
        duration_ms: Date.now() - start,
        error: err instanceof Error ? err.message : String(err)
      }
      this.logs.unshift(log)
      logger.error('Scheduler: tick failed', log)
      this.emit('tick-error', log)
    }

    // Keep last 100 logs
    if (this.logs.length > 100) this.logs = this.logs.slice(0, 100)
  }

  private buildCronExpression(hours: number): string {
    if (hours >= 1 && Number.isInteger(hours)) {
      return `0 */${hours} * * *`
    }
    // Sub-hour intervals: convert to minutes
    const minutes = Math.round(hours * 60)
    return `*/${Math.max(1, minutes)} * * * *`
  }

  getNextExecutionTime(): Date | null {
    if (!this.task) return null
    // Approximate: add intervalHours to now
    const next = new Date()
    next.setHours(next.getHours() + this.intervalHours)
    return next
  }

  getExecutionHistory(limit = 50): ScheduleLog[] {
    return this.logs.slice(0, limit)
  }

  updateInterval(hours: number): void {
    this.intervalHours = hours
    if (this.running) {
      this.stop()
      this.start()
    }
  }

  isRunning(): boolean {
    return this.running
  }
}
