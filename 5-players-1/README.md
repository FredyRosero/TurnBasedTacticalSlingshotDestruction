# Players

In this step we add players to the game.

## Front-end

[front](front/)

Go to <http://ec2-3-137-188-183.us-east-2.compute.amazonaws.com>

### P(rocess) M(anager) 2

```bash
npm install -g pm2
```

```bash
pm2 start 5-players-1/back/server.js --name backend-game-server
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