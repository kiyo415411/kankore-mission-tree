# Language Selection

-   [English](./README.md) (Original)
-   [繁體中文](./readme-langauge/README-zh-TW.md) (Traditional Chinese)
-   [日本語](./readme-langauge/README-ja.md) (Japanese)

---

# Kankore Mission Tree/Map

Kankore Mission Tree/Map allows admirals to view their current missions, click to flip and record task completion, and track mission status via the `f` parameter in the URL.

## Modes

-   **Admin Mode**: Activated if the URL contains `/admin/`.
-   **User Mode**: Default mode when `/admin/` is not present in the URL.

## General Features

-   Quick view and navigation through a small window.
-   Function bar located at the bottom left:
    1. **Zoom In**: Magnify the current view.
    2. **Zoom Out**: Reduce the current view.
    3. **Fit All Nodes**: Adjust the view to fit all nodes within the current viewport.

## Admin Mode Features

In Admin Mode, the following operations are available:

-   **Undo Operation**:
    -   `Ctrl`/`Cmd` + `Z`: Revert to the previous operation.
    -   `Ctrl`/`Cmd` + `Shift` + `Z`: Redo the reverted operation.
-   **Delete Connections**:

    -   Hover over a connection to reveal a delete button.
    -   Press `Backspace` or `Delete` after selecting a connection to remove it.

-   **Move Nodes**: Freely reposition nodes as needed.

-   **Import CSV**: Replace the existing mission tree with data from a CSV file.
-   **Export JSON**: Generate a JSON file to overwrite the existing mission tree in the project.

## CSV Structure

The CSV file used for importing tasks should follow this structure:

-   **id**: Node identifier.
-   **label**: Task name.
-   **bgColor**: Node color.
-   **isLocked**: If the node already exists, lock its original position.
-   **target_n**: Child node identifiers.
-   **target_n_path**: Connection method for the link (currently supports `bottom` to `top` (`bt`) and `right` to `left` (`rl`)).

### Example CSV

```
id,label,bgColor,isLocked,target_1,target_1_path,target_2,target_2_path
A1,はじめての「編成」！,#769FCD,1,A2,bt,,
A2,「駆逐隊」を編成せよ！,#769FCD,0,A3,bt,,
A3,「水雷戦隊」を編成せよ！,#769FCD,0,A4,bt,A5,bt
```

# Development

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run deploy`

Deploys the application to GitHub Pages.

This command first runs `npm run build` to build the application, then uses the gh-pages package to push the built files to the gh-pages branch of your GitHub repository.

Make sure you have correctly configured your GitHub repository and the homepage field in your package.json file before running this command.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
