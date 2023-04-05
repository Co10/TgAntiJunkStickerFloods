# TGAntiStickersFlood

[English](README.md) | [简体中文](README_zh-cn.md)

## Introduction

This Telegram Bot, using Node.js, will detect a group member who might be sending stickers, which causes message flooding, and helps  you delete the stickers automatically.

Also, you can ask it to delete a certain sticker or GIF automatically when it's sent by a group member.

It won't run properly unless it gains **the permission to delete message**.

## How to use

1. Git clone the repository
2. Run `npm i` to install necessary node modules
3. Edit `config.js`. See [below](#Configuration) for details.
4. Run `node index.js` to start.

## Configuration

| key           | type of value             | meaning                                                      |
| ------------- | ------------------------- | ------------------------------------------------------------ |
| `botToken`    | string                    | Telegram Bot Token                                           |
| `allowGroups` | Array of negative numbers | Allow the bot to run in the specific groups by group id ([How to get group id](https://stackoverflow.com/a/72649378)). If it's an empty array, It means allowing the bot to run in every group. |
| `thresholds`  | number                    | How many stickers are allowed to send in a specific time. Default: `3`, Minimum: `1`, Maximum: `20 `. |
| `gap`         | number                    | Stickers will be deleted if it reaches the thresholds within `gap` time, within which it refreshes the countdown when another sticker is sent by the same user again. Default: `30` seconds, Minimum: `5` seconds, Maximum: `7200` seconds. |
| `includeGIFs` | boolean                   | Whether GIFs are included.                                   |
| `debug`       | boolean                   | When in debug mode, the bot can react to you in private chat. |

## How to ban stickers

1. Add the bot to a group chat, and grant it the permission to delete messages.
2. mention the bot (`@bot_username`), use the commands below(don't forget to add a space in between):
   - `/add`: Ready to ban a sticker or GIF. 
     When `@bot_username /add` is used to reply to a sticker or GIF, it will be  added to the black list immediately; 
     When `@bot_username /add` is just a plain message replying nothing, next time when you send a sticker or GIF, the sticker or GIF will be in the black list.
   - `/undo`: Undo the `/add` action when not replying to any stickers or GIFs. **It does not mean removing the last sticker from the black list**.
   - `/clear`: Clear the black list
3. When a member of the group sends a target sticker or GIF, it will be deleted automatically.

~~BTW, the black list is not stored locally. Every time you restart the node program, the black list is empty at first.~~

## To do

I know it's incomplete but I'm just lazy...

