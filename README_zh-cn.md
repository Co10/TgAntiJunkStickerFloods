# TGAntiStickersFlood

[English](README.md) | [简体中文](README_zh-cn.md)

## 简介

用 Node.js 写的 Telegram Bot。

此 Bot 用于检测群聊中的贴纸刷屏行为，并自动删除已发送的贴纸消息。同时还可自定义哪些贴纸或 GIF 会被自动删除。

需要授予**删除消息的权限**。

## 用法

1. Git clone 此仓库
2. 运行 `npm i` 安装依赖库
3. 编辑 `config.js` ，具体见[下方](#配置)
4. 运行 `node index.js` 

## 配置

| 关键字        | 值的类型 | 含义                                                         |
| ------------- | -------- | ------------------------------------------------------------ |
| `botToken`    | 字符串   | Telegram Bot Token                                           |
| `allowGroups` | 负数数组 | 允许机器人运行的群组ID ([获取 Group ID 的方法](https://stackoverflow.com/a/72649378)). 空数组表示允许在所有群组下运行 |
| `thresholds`  | 整数     | 特定时间内允许发送的贴纸数量（若超过，最新的贴纸消息会被删除），默认为 `3`, 最小为 `1`, 最大为 `20 `. |
| `gap`         | 整数     | 达到允许发送的贴纸消息数的时间限制（倒计时），单位是秒；若达到消息数的限制，此用户新的贴纸消息将会触发倒计时的刷新（从头计时）。默认值是 `30` 秒, 最小值是 `5` 秒, 最大值是 `7200` 秒（2小时）. |
| `includeGIFs` | 布尔     | 是否将 GIF 计入检测                                          |
| `debug`       | 布尔     | 调试模式下可用于私聊此 bot                                   |

## 如何将贴纸加入黑名单

1. 将 bot 加入群聊，并授予删除消息的权限
2. `@` 这个 bot (`@bot_username`), 使用以下指令告诉它接下来怎么做(中间要加个空格，别忘了):
   - `/add`: 将贴纸加入黑名单的前奏 
     如果 `@bot_username /add` 这条消息回复了一条贴纸消息，这张贴纸将被加入黑名单
     如果 `@bot_username /add` 只是简单的发送了，随后再发送一条贴纸消息，此贴纸就会被加入黑名单
   - `/undo`: 撤回上述 `/add` 的第二个情况的操作，并不是把贴纸从黑名单中移除的意思
   - `/clear`: 清空黑名单
3. 当群成员发送已加入黑名单的贴纸时，此条贴纸消息会被自动删除

## To do

挺多……

