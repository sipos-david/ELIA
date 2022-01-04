# E.L.I.A.
<p align="center"><img height=100 src="doc/resources/elia-logo.png?raw=true"/></p>
<p align="center">
  <strong>Experimental Listening Information Android </strong>
</p>

---

## Description
A Discord bot using Discord.js, written in TypeScript.

Current features are: music playing, playing sound effects, message deletion, creating polls.

## How to run
First fill the parameters in the [config file](src/config.json).

Depending on what you want, at this point you can run it yourself, with Node.js(at least v16.6) or you can create a Docker image, which can be deployed on a cloud provider.

### Locally
Fill the [.env](.env) file with:
  ```properties
  DISCORD_TOKEN=<Your token here>
  ```
If you want to run it: 
  ```Shell
   npm run start
  ```

### Docker
In the project directory run:
  ```Shell
   docker build .
  ```
Then you can run the image with:
  ```Shell
   docker run <Image name here>
  ```

## How to contribute
E.L.I.A. is open to contributions, just create an issue and let me know what you are working on.

The features are being planned in [this](https://github.com/xShipi/ELIA/projects/1) board, so to get stared pick a task or write an idea and start coding. 
 