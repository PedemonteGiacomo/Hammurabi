# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Enable Windows support for long paths system-wide 
**Windows 10 and Later**
1. Open a PowerShell window and run `gpedit.msc`.
2. Navigate to `Local Computer Policy > Computer Configuration > Administrative Templates > System > Filesystem`.
3. Enable the setting `Enable Win32 long paths` (double click, then check radio button beside `Enabled` and click `Apply`).

## Available Scripts

In the `hammurabi-ui` directory, run:

### `npm install &&  npm install @craco/craco --save && npm install path-browserify && npm start`

This will install the necessary dependencies and run the app in development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

---

# Containerization

In the `hammurabi-ui` folder run this command to build the image:

    docker build -t hammurabi-ui-prod .

# New dependencies, new version

    npm install \
        @chakra-ui/react@^2.8.1 \
        @chakra-ui/theme-tools@^2.0.0 \
        @emotion/react \
        @emotion/styled \
        framer-motion \
        react-responsive \
        react-device-detect \
        react-icons \
        ajv@6.12.6 -D \
        --legacy-peer-deps
