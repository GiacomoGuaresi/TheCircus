import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '@utils/logger'
import { CircusError } from '@utils/errorHandler'
import type { ServiceStatus } from '@models/types'

const execAsync = promisify(exec)

export class DesktopService {
  private platform = process.platform

  isSupported(): boolean {
    return ['darwin', 'win32', 'linux'].includes(this.platform)
  }

  async setWallpaper(imagePath: string): Promise<void> {
    const absolutePath = path.resolve(imagePath)
    logger.info(`DesktopService: setting wallpaper to ${absolutePath}`)

    if (this.platform === 'darwin') {
      await this.setWallpaperMacOS(absolutePath)
    } else if (this.platform === 'win32') {
      await this.setWallpaperWindows(absolutePath)
    } else if (this.platform === 'linux') {
      await this.setWallpaperLinux(absolutePath)
    } else {
      throw new CircusError(`Unsupported platform: ${this.platform}`, 'UNSUPPORTED_PLATFORM')
    }

    logger.info('DesktopService: wallpaper set successfully')
  }

  private async setWallpaperMacOS(imagePath: string): Promise<void> {
    // Works on all macOS versions and supports multiple desktops
    const script = `
      tell application "System Events"
        set picture of every desktop to POSIX file "${imagePath}"
      end tell
    `
    try {
      await execAsync(`osascript -e '${script}'`)
    } catch {
      // Fallback: Finder method
      const fallback = `tell application "Finder" to set desktop picture to POSIX file "${imagePath}"`
      await execAsync(`osascript -e '${fallback}'`)
    }
  }

  private async setWallpaperWindows(imagePath: string): Promise<void> {
    // Uses PowerShell SystemParametersInfo
    const script = `
      Add-Type -TypeDefinition @"
        using System;
        using System.Runtime.InteropServices;
        public class Wallpaper {
          [DllImport("user32.dll", CharSet = CharSet.Auto)]
          public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
        }
"@
      [Wallpaper]::SystemParametersInfo(20, 0, '${imagePath.replace(/\\/g, '\\\\')}', 3)
    `
    await execAsync(`powershell -Command "${script}"`)
  }

  private async setWallpaperLinux(imagePath: string): Promise<void> {
    // Try multiple desktop environments in order
    const commands = [
      `gsettings set org.gnome.desktop.background picture-uri "file://${imagePath}"`,
      `gsettings set org.gnome.desktop.background picture-uri-dark "file://${imagePath}"`,
      `feh --bg-scale "${imagePath}"`,
      `xwallpaper --zoom "${imagePath}"`
    ]

    for (const cmd of commands) {
      try {
        await execAsync(cmd)
        return
      } catch {
        // try next
      }
    }

    throw new CircusError('Could not set wallpaper on Linux', 'LINUX_WALLPAPER_ERROR')
  }

  async getStatus(): Promise<ServiceStatus> {
    return {
      available: this.isSupported(),
      provider: this.platform,
      ...(this.isSupported() ? {} : { error: `Unsupported platform: ${this.platform}` })
    }
  }
}
