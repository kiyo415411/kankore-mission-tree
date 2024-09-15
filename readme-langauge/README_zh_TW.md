# 語言選擇

-   [English](./README.md) (原始)
-   [繁體中文](./readme-langauge/README-zh-TW.md) (繁體中文)
-   [日本語](./readme-langauge/README-ja.md) (日文)

---

# 艦これ任務樹/地圖

**艦これ任務樹/地圖** 允許提督查看當前的任務，點擊以翻轉和記錄任務完成情況，並通過 URL 中的 `f` 參數跟踪任務狀態。

## 模式

-   **管理模式**：當 URL 包含 `/admin/` 時啟用。
-   **用戶模式**：默認模式，URL 中不包含 `/admin/`。

## 一般功能

-   透過小窗口快速查看和導航。
-   位於左下角的功能欄：
    1. **放大**：放大當前視圖。
    2. **縮小**：縮小當前視圖。
    3. **適應所有節點**：調整視圖以適應當前視口中的所有節點。

## 管理模式功能

在管理模式中，提供以下操作：

-   **撤銷操作**：
    -   `Ctrl`/`Cmd` + `Z`：恢復到上一步操作。
    -   `Ctrl`/`Cmd` + `Shift` + `Z`：重做已撤銷的操作。
-   **刪除連接**：
    -   懸停在連接上以顯示刪除按鈕。
    -   選擇連接後按 `Backspace` 或 `Delete` 以移除它。
-   **移動節點**：根據需要自由調整節點位置。
-   **導入 CSV**：用 CSV 文件中的數據替換現有的任務樹。
-   **導出 JSON**：生成 JSON 文件以覆蓋項目中的現有任務樹。

## CSV 結構

用於導入任務的 CSV 文件應遵循以下結構：

-   **id**：節點標識符。
-   **label**：任務名稱。
-   **bgColor**：節點顏色。
-   **isLocked**：如果節點已存在，鎖定其原始位置。
-   **target_n**：子節點標識符。
-   **target_n_path**：連接方法（目前支持 `bottom` 到 `top` (`bt`) 和 `right` 到 `left` (`rl`)）。

### 示例 CSV

```
id,label,bgColor,isLocked,target_1,target_1_path,target_2,target_2_path
A1,はじめての「編成」！,#769FCD,1,A2,bt,,
A2,「駆逐隊」を編成せよ！,#769FCD,0,A3,bt,,
A3,「水雷戦隊」を編成せよ！,#769FCD,0,A4,bt,A5,bt
```

# 開發

## 使用 Create React App 開始

此項目使用 [Create React App](https://github.com/facebook/create-react-app) 進行引導。

## 可用的腳本

在項目目錄中，您可以運行：

### `npm start`

在開發模式下運行應用。\
打開 [http://localhost:3000](http://localhost:3000) 以在瀏覽器中查看它。

如果您進行了編輯，頁面將重新加載。\
您還將在控制台中看到任何 lint 錯誤。

### `npm run deploy`

將應用程序部署到 GitHub Pages。

此命令首先運行 `npm run build` 以構建應用程序，然後使用 gh-pages 包將構建的文件推送到 GitHub 存儲庫的 gh-pages 分支。

在運行此命令之前，請確保您已正確配置 GitHub 存儲庫和 package.json 文件中的 homepage 字段。

## 瞭解更多

您可以在 [Create React App 文檔](https://facebook.github.io/create-react-app/docs/getting-started) 中了解更多信息。

要學習 React，請查看 [React 文檔](https://reactjs.org/)。
