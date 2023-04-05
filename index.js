const { Telegraf } = require("telegraf");
const { config } = require("./config.js");
const { MsgManager } = require("./manager.js");
const MIN_BAN_TIME = 5;
const MAX_BAN_TIME = 7200;
const DEFAULT_BAN_TIME = 30;
if (typeof config.botToken !== "string" || config.botToken.length <= 0) {
  console.error("Invalid telegram bot token");
}

let allowGroups = config.allowGroups;
if (Array.isArray(allowGroups)) {
  try {
    allowGroups.map((a) => parseInt(a));
  } catch (error) {
    console.error("Pasting allow groups error: ", error);
  }
} else {
  allowGroups = [];
}

(function () {
  const bot = new Telegraf(config.botToken);
  const managers = {};

  let banTime = config.gap || DEFAULT_BAN_TIME;
  if (banTime < MIN_BAN_TIME) {
    banTime = MIN_BAN_TIME;
  } else if (banTime > MAX_BAN_TIME) {
    banTime = MAX_BAN_TIME;
  }
  const showBanTime = convertSeconds(banTime);

  bot.on("message", (ctx) => {
    try {
      const message = ctx.message;
      const chatId = message.chat.id;
      const chatType = message.chat.type;
      let debug = config.debug && chatType === "private";
      let isGroup = ["group", "supergroup"].indexOf(chatType) >= 0;
      /* if it's target group */
      if (
        (isGroup &&
          (allowGroups.length === 0 || allowGroups.indexOf(chatId) >= 0)) ||
        debug
      ) {
        /* check if the message is GIF */
        let isGIF = GIFMessage(message);

        if (message.text || message.sticker || isGIF) {
          if (!(chatId in managers)) {
            managers[chatId] = new MsgManager(config.thresholds, config.gap);
          }
          const manager = managers[chatId];
          const from = message.from;
          const userId = from.id;
          const userName = from.first_name || from.last_name || from.username;

          /* detect text to do actions */
          if (message.text) {
            let msg = message.text.toLowerCase();
            if (msg.includes(`@${bot.botInfo.username}`)) {
              if (debug) {
                reactToCommand();
              } else {
                /* check member permission */
                ctx.telegram.getChatMember(chatId, userId).then((member) => {
                  if (
                    member &&
                    member.status &&
                    ["creator", "administrator"].indexOf(member.status) >= 0
                  ) {
                    reactToCommand();
                  }
                });
              }

              function reactToCommand() {
                /* if it's reply */
                if (message.reply_to_message) {
                  let rpl = message.reply_to_message;
                  if (rpl.sticker || GIFMessage(rpl)) {
                    let sid = getFileId(rpl);
                    banSticker(sid);
                  }
                } else {
                  let cmd = msg.split(" ")[1];
                  if (cmd && cmd.length > 0 && cmd[0] === "/") {
                    cmd = cmd.slice(1);
                    if (["add", "undo", "clear"].indexOf(cmd) >= 0) {
                      manager.config(userId, cmd);
                    }
                  }
                }
              }
            }
          }

          if (message.sticker || isGIF) {
            let sid = getFileId(message);

            /* if adding stickers */
            if (manager.checkAdd(userId)) {
              banSticker(sid);
              manager.revokeAdd(userId);
            } else if (manager.checkBannedSticker(sid)) {
              /* delete banned sticker */
              try {
                ctx.deleteMessage();
              } catch (error) {}
            } else {
              /* sticker flood detection */
              if (
                (message.sticker || (config.includeGIFs && isGIF)) &&
                manager.check(userId)
              ) {
                ctx
                  .deleteMessage()
                  .then(() => {
                    ctx
                      .reply(informMessage(userId, userName), {
                        parse_mode: "HTML",
                        // reply_to_message_id: ctx.message.message_id,
                      })
                      .then((sentMsg) => {
                        let sentId = sentMsg.message_id;
                        let msgTimeout = setTimeout(() => {
                          manager.updateReply(userId, null);
                          deleteMessage(ctx, sentId);
                        }, banTime * 1000);

                        let oldMsg = manager.updateReply(userId, {
                          id: sentId,
                          timeout: msgTimeout,
                        });
                        if (oldMsg !== null) {
                          deleteMessage(ctx, oldMsg.id);
                          try {
                            clearTimeout(oldMsg.timeout);
                          } catch (error) {}
                        }
                      });
                  })
                  .catch((e) => {
                    console.error(e);
                  });
              }
            }
          }

          function banSticker(sid) {
            if (!manager.checkBannedSticker(sid)) {
              manager.banSticker(sid);
              try {
                ctx.reply("👌", {
                  reply_to_message_id: message.message_id,
                });
              } catch (error) {}
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  bot.launch({
    allowedUpdates: ["message", "edited_message"],
  });

  function deleteMessage(ctx, messageId, cb, ecb) {
    try {
      ctx
        .deleteMessage(messageId)
        .then((a) => {
          typeof cb === "function" && cb(a);
        })
        .catch((e) => {
          console.error(e);
          typeof ecb === "function" && ecb(e);
        });
    } catch (error) {}
  }

  function informMessage(userId, userName) {
    let mention = `<a href="tg://user?id=${userId}">${userName}</a>`;
    let mentionMsg =
      mention +
      ` Please wait <b>${showBanTime}</b> before sending another sticker.`;
    return mentionMsg;
  }

  function convertSeconds(seconds) {
    seconds = parseInt(seconds);
    if (seconds >= 0) {
      if (seconds <= 120) {
        return seconds.toString() + "s";
      } else if (seconds < 60 * 60) {
        return Math.round(seconds / 60).toString() + "min";
      } else {
        return Math.round(seconds / 3600).toString() + "h";
      }
    }
    return "N/A";
  }

  function GIFMessage(message) {
    return (
      message &&
      message.document &&
      ["video/mp4", "image/gif"].indexOf(message.document.mime_type) >= 0
    );
  }

  function getFileId(message) {
    if (message) {
      let sid;
      if (message.sticker) {
        sid = message.sticker.file_unique_id;
      } else if (GIFMessage(message)) {
        sid = message.document.file_unique_id;
      }
      return sid;
    }
  }
})();
