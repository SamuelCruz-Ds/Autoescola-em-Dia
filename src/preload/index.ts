import { contextBridge, ipcRenderer } from 'electron'
import { CHANNEL, type Bridge } from '../shared/bridge'

const api: Bridge = { request: (command, input) => ipcRenderer.invoke(CHANNEL, command, input) }
contextBridge.exposeInMainWorld('autoescola', api)
