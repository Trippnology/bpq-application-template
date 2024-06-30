# bpq-application-template

This repo is intended to provide a basic template for developing simple [NodeJS](https://nodejs.org/en) based applications and services for use with the [BPQ](https://www.cantab.net/users/john.wiseman/Documents/) packet radio program.

## Installation

Either clone/download the whole repo, or just copy one of the starter files to begin your project.

-   `readline.mjs` shows how to take direct text input from the user and act on it.

## Usage

### Running your app

While developing, you will be making lots of changes, so rather that just running your app with `node ./myapp.mjs`, use [nodemon](https://www.npmjs.com/package/nodemon) which will automatically reload when your file changes:

```
npm i -g nodemon
nodemon ./myapp.mjs
```

Once you are happy and want to run your app more permanently, use [pm2](https://www.npmjs.com/package/pm2):

```
npm i -g pm2
pm2 start ./myapp.mjs --name my-bpq-app
```

PM2 will store logs from your app and restart it if it crashes.

### Integrating your app with BPQ

In your `BPQ32.cfg` file, within the definition of your telnet port, set the local TCP port that your app will listen on using the `CMDPORT` option:

```
PORT
 PORTNUM=1 ; You may use a different port number, just make a note of it and adjust the application setup below
 ID=Telnet Server (internal only)
 DRIVER=Telnet
 CONFIG
  LOGGING=1
  DisconnectOnClose=1
  TCPPORT=8010
  FBBPORT=8011 6300
  HTTPPORT=9123
  CMDPORT 63000 63001 63002 ; Here we have 3 ports specified for different apps
  LOGINPROMPT=user:
  PASSWORDPROMPT=password:
  MAXSESSIONS=10
  CTEXT=Welcome to M7GMT's Telnet Server\nPress ? For list of commands \n\n
ENDPORT
```

Under the applications section, configure the app to use one of the ports you set in `CMDPORT`:

```
APPLICATION 1,BBS,,M7GMT-1,GMTBBS,255 ; Existing app with callsign, alias, and quality
APPLICATION 2,CHAT,,M7GMT-3,GMTCHT,255 ; Existing app with callsign, alias, and quality
APPLICATION 3,MYAPP,C 1 HOST 2 S
```

The format is as follows:

```
APPLICATION n,CMD,New Command,Call,Alias,Quality

n Application Number. You can define up to 32.
CMD The command the user types
New Command (optional) The Node command to be run
Call (optional) The call which directly invokes CMD
Alias and Quality (optional) If specified, causes an entry for Call and Alias to be added to your NODES table with the specified Quality.
```

To break this down further, our BPQ telnet port is configured as port 1, and we want to use the 3rd port specified under `CMDPORT` for our app, so `C 1 HOST 2 S` means "When a user types the `MYAPP` command, connect to BPQ port 1, which in turn connects to TCP port 63002" (the `CMDPORT` list is zero indexed). The "S" on the end means "Don't completely disconnect the user when they're done, just return them to the node".

Adding callsign, alias, and quality is optional. For most apps, you probably won't need these, unless you want to make your app directly available to the rest of the packet network (these enable direct connections without going via your node first).

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature develop`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

TODO: Write history

## Credits

Developed by Rik M7GMT  
Thanks to Martin M5MSX for explaining how to wire up custom applications.

## License

MIT
