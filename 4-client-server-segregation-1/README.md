# Client-Server Segregation
## Front-end

```powershell
python -m http.server
```

```bash
sudo netstat -tulnp | grep :80
sudo netstat -tulnp | grep :443
```

## Back-end
```bash
npm start
```

```bash
sudo netstat -tulnp | grep :3000
sudo netstat -tulnp | grep :3443
```

## AWS EC2
### Connect to EC2
```bash
ssh -i "game_backend.pem" ec2-user@ec2-3-137-188-183.us-east-2.compute.amazonaws.com
```

### Ngix to git directory

```bash
git clone https://github.com/FredyRosero/TurnBasedTacticalSlingshotDestruction.git
sudo chmod 711 $HOME
sudo chmod -R o+r TurnBasedTacticalSlingshotDestruction
sudo chown -R ec2-user:nginx TurnBasedTacticalSlingshotDestruction
ls -al TurnBasedTacticalSlingshotDestruction
```

```bash
sudo mv /usr/share/nginx/html /usr/share/nginx/html_backup
sudo ln -s "$HOME/TurnBasedTacticalSlingshotDestruction/5-client-server-segregation-1/front" "/usr/share/nginx/html"
ls -al /usr/share/nginx/html
rm /usr/share/nginx/html
```
Go to <http://ec2-3-137-188-183.us-east-2.compute.amazonaws.com>

### HTTP over TLS
```bash
mkdir /etc/ssl/private
mkdir /etc/ssl/certs
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt
ls /etc/ssl/*/selfsigned.* -al
sudo chmod o+r /etc/ssl/private/selfsigned.key
sudo chmod o+r /etc/ssl/certs/selfsigned.crt
```

```bash
SSL_PATH="/etc/ssl"
```

```powershell
mkdir $HOME\ssl\private
mkdir $HOME\ssl\certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
  -keyout $HOME\ssl\private\selfsigned.key `
  -out $HOME\ssl\certs\selfsigned.crt
ls $HOME\ssl\*\*.*
$env:SSL_PATH="$HOME\ssl"
```

en `server.js` añadir:
```javascript
const options = {
  key: fs.readFileSync(`${ssl_path}/private/selfsigned.key`),
  cert: fs.readFileSync(`${ssl_path}/certs/selfsigned.crt`)
};
```


en `/etc/nginx/nginx.conf` añadir:
```nginx

    server {
        listen       443 ssl;
        listen       [::]:443 ssl;
        http2        on;
        server_name  _;
        root         /usr/share/nginx/html;

        ssl_certificate     /etc/ssl/certs/selfsigned.crt;
        ssl_certificate_key /etc/ssl/private/selfsigned.key;
        ssl_session_cache shared:SSL:1m;
        ssl_session_timeout  10m;
        ssl_ciphers PROFILE=SYSTEM;
        ssl_prefer_server_ciphers on;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        error_page 404 /404.html;
        location = /404.html {
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
        }
    }
```

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

### P(rocess) M(anager) 2

```bash
npm install -g pm2
```

```bash
pm2 start server.js --name backend-game-server
```

```bash
pm2 list
```

```bash
pm2 restart backend-game-server
pm2 stop backend-game-server
pm2 delete backend-game-server
pm2 monit
```