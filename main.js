const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tabs = [];
let activeTab = null;
const TABBAR_WIDTH = 120; // vertical sidebar width

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, "spring.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile("index.html");

  // Resize handling
  mainWindow.on("resize", () => {
    if (activeTab !== null) {
      const bounds = mainWindow.getContentBounds();
      tabs[activeTab].setBounds({
        x: TABBAR_WIDTH,
        y: 30, // leave space for address bar
        width: bounds.width - TABBAR_WIDTH,
        height: bounds.height - 30
      });
    }
  });

  // First tab
  createTab("https://google.com");
}

function createTab(url = "https://google.com") {
  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false
    }
  });

  tabs.push(view);
  switchTab(tabs.length - 1);

  view.webContents.loadURL(url);
}

function switchTab(index) {
  if (activeTab !== null) {
    mainWindow.removeBrowserView(tabs[activeTab]);
  }

  activeTab = index;
  mainWindow.addBrowserView(tabs[index]);

  const bounds = mainWindow.getContentBounds();
  tabs[index].setBounds({
    x: TABBAR_WIDTH,
    y: 30, // leave space for address bar
    width: bounds.width - TABBAR_WIDTH,
    height: bounds.height - 30
  });

  tabs[index].setAutoResize({ width: true, height: true });
}

// IPC messages from renderer
ipcMain.on("new-tab", (event, url = "https://google.com") => {
  createTab(url);
});

ipcMain.on("switch-tab", (event, index) => {
  if (tabs[index]) switchTab(index);
});

ipcMain.on("navigate-tab", (event, { index, url }) => {
  if (tabs[index]) tabs[index].webContents.loadURL(url);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
