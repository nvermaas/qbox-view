## MyEnergy View

Note: this is the frontend for the MyEnergy project.
It talks through a ReST API with the MyEnergy Server, which in turn gets its information from a Domoticz database.


### Option 1 - full install on express server

- pro's: it is all contained to your Pi (very safe)
- con's: you have to update and build manually with a 'git pull'. Only local access (unless you 'port forward' your router).

This will download, build and deploy the application and all its dependencies locally.
Node.js needs to be downloaded and installed first, because the application will use ``npm`` as package manager to install dependencies and build the application.
And it will use the node.js express webserver to run the application on port 5050 (the default port 5000 is already taken by Qserver).

This can all be done on the Raspberry Pi, but you could also choose to do it all one your windows machine and only move the compiled application to the Pi and serve it there.
Then only the last steps would be done on the Pi, which you could also do as Option 3.

Install node.js
```
  * wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-armv6l.tar.gz
  * tar -xzf node-v8.9.0-linux-armv6l.tar.gz
  * cd node-v8.9.0-linux-armv6l/
  * sudo cp -R * /usr/local/
  * npm -v
  * sudo npm install -g serve

```

Install QboxView
```
  * mkdir QboxView
  * cd QboxView
  * git clone https://github.com/nvermaas/qbox-view.git
  * cd qbox-view
  * npm install
  * npm run build
  * nohup serve -s build -p 5050 &
```

Access QboxView from: http://192.168.178.64:5050/


## Option 2 - run on uilennest website (easiest option)

- pro's: easy. You will always have the latest version.
- con's: dependency on my webserver, which I only guarantee for the current test phase.

You can run the deployed version from your browser: http://uilennest.net/QboxViewPublic

In that case you will need to enable CORS headers on your Qservice so that the frontend can reach the backend.
Although the QboxView web application is served from uilennest, it would still only work from inside your network because that is where the backend is.

To allow CORS headers, log in to your Raspberry Pi and edit ``/home/pi/qservice/appsettings.json``.
Sometimes this is not considered safe. You could also just allow 'uilennest.net' and 'localhost'.

```
  "AllowedHosts": "*",
  "CorsPolicy": {
    "AllowedOrigins": ["*"],
    "Methods": ["GET"]
  }
```

To be able to run QboxView on the webserver we must use a different port, like 81.
Change the nginx configuration accordingly by adding the following part to ``/etc/nginx/sites-enabled/default``

```
server {
        listen 81;
        listen [::]:81;

        server_name _;

        root /var/www/html;
        index index.html;
}
```

Now ''var/www/html'' will be served by Nginx.

### Install QboxView

   * copy the static directory to /var/www/html/static
   * copy the the contents of the 'build' directory to /var/www/html/qbox-view

   Now your local link should work, like this: http://192.168.178.64:81/qbox-view/

-----

## Configuration of QboxView
The first time you start QboxView you will need to give it the IP of the Qserver (the IP of the Raspberry Pi, and the serial nubmer of your Qbox.
You can also enter your gas- and electricity price so that QboxView can calculated the correct costs.
Do this by clicking on the configuraton button.

<p align="center">
  <img src="https://github.com/nvermaas/qbox-view/blob/master/images/qboxview_config.png"/>
</p>

<p align="center">
  <img src="https://github.com/nvermaas/qbox-view/blob/master/images/qboxview_netto_stroom.png"/>
</p>




-----



This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
