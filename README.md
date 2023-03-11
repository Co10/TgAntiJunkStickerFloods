# TGAntiStickersFlood

[English](README.md) | [简体中文](README_zh-cn.md)

## Introduction

This Telegram Bot, using Node.js, will detect a group member who might be sending stickers, which causes message flooding, and helps  you delete the stickers automatically.

It won't run properly unless it gains the permission to delete message.

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

