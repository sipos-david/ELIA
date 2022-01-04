# E.L.I.A.
<p align="center"><img height=100 src="doc/resources/elia-logo.png?raw=true"/></p>
<p align="center">
  <strong>Experimental Listening Information Android </strong>
</p>

---

## Description

This is a hobby project of mine. The goal is to make multiple projects, and integrate everything into one, just for fun. Ideally all functions should be available in every client, but certain client specific functions are welcomed to make E.L.I.A. more usable (e.g.: Discord music playing).

Every project should contain an interaction with a user, so overall all the projects as a whole make E.L.I.A.

To read more about certain parts of E.L.I.A. read the respective README files in the subfolders.
 
## Structure

| Codebase         |    Description    |
| :--------------- | :---------------: |
| [comet](discord) | Discord.js client |

## Branches

TODO

## Contributions

E.L.I.A. is open to contributions, but I recommend creating an issue or replying in a comment to let me know what you are working on first that way we don't overwrite each other.

## How to run locally

Because E.L.I.A. is a multiple projects combined, optimally, you should run all the projects to make it run E.L.I.A. In practice you need to run the systems that needed for the current part you're working on.

## Trivia

Folders are named after [galaxies](https://en.wikipedia.org/wiki/List_of_galaxies)

# E.L.I.A. - Discord client

A Discord bot using Discord.js, written in TypeScript

## Current features
- Music playing
- Playing sound effects
- Message deletion
- Creating polls

## How to contribute

The features are being planned in [this](https://github.com/xShipi/ELIA/projects/1) board. Pick a task or write an idea and start working.

## How to run
- Fill the token paramater in the [config file](src/config.json) with a valid Discord Token.
- run `npm run start` if you want to run it for a while or `npm run deploy` if you have [pm2](https://pm2.keymetrics.io/) installed and want to run it 24/7