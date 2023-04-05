const MIN_THRESHOLDS = 1;
const MAX_THRESHOLDS = 20;
const DEFAULT_THRESHOLDS = 3;
const MIN_GAP = 5;
const MAX_GAP = 7200;
const DEFAULT_GAP = 30;

const MILLION_SECONDS = 1000;

class MsgManager {
  constructor(thresholds, gap) {
    this.thresholds = parseInt(thresholds) || DEFAULT_THRESHOLDS;
    if (this.thresholds < MIN_THRESHOLDS) {
      this.thresholds = MIN_THRESHOLDS;
    } else if (this.thresholds > MAX_THRESHOLDS) {
      this.thresholds = MAX_THRESHOLDS;
    }

    this.gap = parseInt(gap) || DEFAULT_GAP;
    if (this.gap < MIN_GAP) {
      this.gap = MIN_GAP;
    } else if (this.gap > MAX_GAP) {
      this.gap = MAX_GAP;
    }

    this.list = {};
    this.userAction = {};
    this.bannedStickers = new Set();
  }
  check(userId) {
    if (userId in this.list) {
      if (this.list[userId].count >= this.thresholds) {
        if (Date.now() - this.list[userId].time < this.gap * MILLION_SECONDS) {
          this.list[userId].time = Date.now();
          return true;
        } else {
          this.list[userId].count = 1;
          return false;
        }
      } else {
        this.list[userId].time = Date.now();
        if (Date.now() - this.list[userId].time < this.gap * MILLION_SECONDS) {
          this.list[userId].count += 1;
        } else {
          this.list[userId].count = 1;
        }
        return false;
      }
    } else {
      this.add(userId);
      return false;
    }
  }
  add(userId) {
    if (userId in this.list) {
      this.list[userId].time = new Date().getTime();
      this.list[userId].count = 1;
    } else {
      this.list[userId] = {
        time: new Date().getTime(),
        count: 1,
      };
    }
  }
  clear() {
    for (const prop of Object.getOwnPropertyNames(this.list)) {
      delete this.list[prop];
    }
  }
  updateReply(userId, newMsg) {
    let oldMsg = null;
    if (userId in this.list) {
      if ("lastMsg" in this.list[userId]) {
        oldMsg = this.list[userId].lastMsg;
      }
      this.list[userId].lastMsg = newMsg;
    }
    return oldMsg;
  }

  config(userId, action) {
    if (!(userId in this.userAction)) {
      this.userAction[userId] = {};
    }
    if (action === "add") {
      this.userAction[userId].add = true;
    } else if (action === "undo") {
      this.userAction[userId].add = false;
    } else if (action === "clear") {
      this.bannedStickers.clear();
    }
  }
  checkAdd(userId) {
    return this.userAction[userId] && this.userAction[userId].add;
  }
  revokeAdd(userId) {
    if (this.userAction[userId]) {
      this.userAction[userId].add = false;
    }
  }
  banSticker(sid) {
    this.bannedStickers.add(sid);
  }
  checkBannedSticker(sid) {
    return this.bannedStickers.has(sid);
  }
}

exports.MsgManager = MsgManager;
