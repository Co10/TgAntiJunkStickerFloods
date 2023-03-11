exports.config = {
  /* Your bot token here */
  botToken: "",
  /*
    Allow the bot to run in the specific groups by group id
    The group id starts with "-100".
    Leave it empty to allow all.
  */
  allowGroups: [],
  /*
    How many stickers are allowed to send in a specific time.
    Default: 3, Minimum: 1, Maximum: 20
  */
  thresholds: 3,
  /*
    Stickers detection time range, within which when a user reaches
    the thresholds, when a sticker is sent, it'll be deleted.
    Default: 30 seconds, Minimum: 5 seconds, Maximum: 7200 seconds
  */
  gap: 30,
  /* whether GIFs are included */
  includeGIFs: true,
};
