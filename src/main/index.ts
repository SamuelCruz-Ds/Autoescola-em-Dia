import { app, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'node:path'
import { CHANNEL } from '../shared/bridge'
import { commandRouter, type Feature } from './commands'

const features = Object.values(import.meta.glob<Feature>('./features/*.ts', {
  eager: true,
  import: 'default',
}))
const dispatch = commandRouter(features)
let window: BrowserWindow | undefined

function openWindow() {
  const next = new BrowserWindow({
    title: 'Autoescola em Dia',
    width: 1200, height: 820, minWidth: 640, minHeight: 500,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })
  window = next
  next.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  next.webContents.on('will-navigate', (event) => event.preventDefault())
  next.on('closed', () => { window = undefined })
  const devUrl = process.env.ELECTRON_RENDERER_URL
  const load = !app.isPackaged && devUrl
    ? next.loadURL(devUrl)
    : next.loadFile(join(__dirname, '../renderer/index.html'))
  void load.catch(() => console.error('Não foi possível abrir a interface.'))
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (window?.isMinimized()) window.restore()
    window?.focus()
  })
  void app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, reply) => reply(false))
    session.defaultSession.setPermissionCheckHandler(() => false)
    ipcMain.handle(CHANNEL, (event, name: unknown, input: unknown) => {
      if (event.sender !== window?.webContents || !event.senderFrame || event.senderFrame.parent) {
        return { ok: false, error: 'Origem não autorizada.' }
      }
      return dispatch(name, input)
    })
    openWindow()
    const stops = features.flatMap((feature) => feature.start ? [feature.start()] : [])
    app.once('before-quit', () => stops.forEach((stop) => stop()))
    app.on('activate', () => { if (!window) openWindow() })
  })
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
}
