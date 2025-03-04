# Monolithic PoC

## Run it!
Because this is plain HTML, CSS, and JavaScript, you can preview the app on Github Pages. But you can run it locally too with a docker container `nginx:alpine`. 

We need to run the command `nginx -g daemon off;` in `nginx:alpine` to keep the container running and most importantly, we mount this actual directory to the container.

First start the Docker Desktop
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

Then run the following commands in PowerShell to start the container

```powershell
cd monolithic-poc
docker run -d -p 8080:80 -v "$(pwd):/usr/share/nginx/html" nginx:alpine sh -c "nginx -g 'daemon off;'"
```

Then go to `http://localhost:8080` in your browser.
