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
      if (
        ["group", "supergroup"].indexOf(chatType) >= 0 &&
        (allowGroups.length === 0 || allowGroups.indexOf(chatId) >= 0) &&
        (message.sticker ||
          (config.includeGIFs &&
            message.document &&
            ["video/mp4", "image/gif"].indexOf(message.document.mime_type) >=
              0))
      ) {
        if (!(chatId in managers)) {
          managers[chatId] = new MsgManager(config.thresholds, config.gap);
        }
        const manager = managers[chatId];
        const from = message.from;
        const userId = from.id;
        const userName = from.first_name || from.last_name || from.username;

        if (manager.check(userId)) {
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
})();
