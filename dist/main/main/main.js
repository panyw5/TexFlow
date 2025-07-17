"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.application = void 0;
const electron_1 = require("electron");
const path = __importStar(require("path"));
const constants_1 = require("../shared/constants");
const menu_1 = require("./menu");
const ipc_handlers_1 = require("./ipc-handlers");
class Application {
    constructor() {
        this.mainWindow = null;
        this.setupApp();
    }
    setupApp() {
        // Handle app ready
        electron_1.app.whenReady().then(() => {
            this.createWindow();
            this.setupMenu();
            (0, ipc_handlers_1.setupIpcHandlers)();
            electron_1.app.on('activate', () => {
                if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });
        });
        // Handle window closed
        electron_1.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                electron_1.app.quit();
            }
        });
        // Security: Prevent new window creation
        electron_1.app.on('web-contents-created', (_, contents) => {
            contents.setWindowOpenHandler(({ url }) => {
                console.log('Blocked new window creation to:', url);
                return { action: 'deny' };
            });
        });
    }
    createWindow() {
        // Create the browser window
        this.mainWindow = new electron_1.BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            titleBarStyle: 'hiddenInset',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, '../preload/preload.js'),
            },
            show: false, // Don't show until ready
        });
        // Load the app
        if (constants_1.isDev) {
            this.mainWindow.loadURL('http://localhost:3000');
            this.mainWindow.webContents.openDevTools();
        }
        else {
            this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
        }
        // Show window when ready
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow?.show();
        });
        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
    }
    setupMenu() {
        const menu = (0, menu_1.createMenu)();
        electron_1.Menu.setApplicationMenu(menu);
    }
    getMainWindow() {
        return this.mainWindow;
    }
}
// Create app instance
const application = new Application();
exports.application = application;
