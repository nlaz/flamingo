const axios = require("axios");
const qs = require("querystring");

const token = process.env.SLACK_ACCESS_TOKEN;

const MESSAGE_COLOR = "#6ECADC";
const FEEDBACK_LINK = "https://goo.gl/forms/IY9t25qqNWYLgW9u2";
const FOOTER_ICON =
  "https://avatars.slack-edge.com/2018-12-11/502563278519_39d786b2bb6ef9fbab5a_96.png";
const DEFAULT_ATTENDING_MSG = ":see_no_evil: _No one is attending yet._";

/* Attachments helpers */
const getInviteAttachments = (channelId, title, attending, emoji) => [
  {
    text: `You're invited to:\n *${title}*`,
    color: MESSAGE_COLOR,
  },
  {
    fallback: "You are unable to RSVP.",
    color: MESSAGE_COLOR,
    callback_id: "event_rsvp",
    actions: [
      {
        name: "yes",
        type: "button",
        text: `${emoji} I'll be there`,
        value: "yes",
      },
    ],
  },
  {
    fallback: "No one is attending at the moment.",
    color: MESSAGE_COLOR,
    title: "Attending",
    text: attending.map(el => `<@${el}>`).join(" "),
  },
  {
    text: "",
    color: MESSAGE_COLOR,
    footer: `Felix    <${FEEDBACK_LINK}|Feedback>`,
    footer_icon: FOOTER_ICON,
  },
];

const getUpdatedAttachments = (original_attachments, attending) => [
  original_attachments[0],
  original_attachments[1],
  {
    fallback: "No one is attending at the moment.",
    color: "#6dc9da",
    title: "Attending",
    text: attending || DEFAULT_ATTENDING_MSG,
  },
  original_attachments[3],
];

const getCalendarAttachments = gcalLink => [
  {
    fallback: gcalLink,
    color: "#6dc9da",
    actions: [
      {
        type: "button",
        text: "Add to calendar",
        url: gcalLink,
      },
    ],
  },
];

/* Api request functions */
module.exports.fetchPermalink = (channelId, messageTs) => {
  const body = { token, channel: channelId, message_ts: messageTs };
  return axios.get("https://slack.com/api/chat.getPermalink?" + qs.stringify(body));
};

module.exports.createUsageMessage = (userId, channelId) => {
  const text =
    "To create an invitation, try to formatting your message like this: \n `/flamingo happy hour next week on wednesday 5pm-6pm`";
  const body = { token, text, channel: channelId, as_user: true, user: userId };
  return axios.post("https://slack.com/api/chat.postEphemeral", qs.stringify(body));
};

module.exports.createCalendarMessage = (channel, userId, gcalLink) => {
  const text = "*Sweet you’re in!* Add it to your calendar:";
  const attachments = JSON.stringify(getCalendarAttachments(gcalLink));
  const body = { token, channel, text, attachments, user: userId, as_user: true };
  return axios.post("https://slack.com/api/chat.postEphemeral", qs.stringify(body));
};

module.exports.createInviteMessage = (channelId, title, attending, emoji) => {
  const attachments = JSON.stringify(getInviteAttachments(channelId, title, attending, emoji));
  const body = { token, attachments, channel: channelId, as_user: true };
  return axios.post("https://slack.com/api/chat.postMessage", qs.stringify(body));
};

module.exports.updateInviteMessage = (channel, attending, messageTs, original_attachments) => {
  const attachments = JSON.stringify(getUpdatedAttachments(original_attachments, attending));
  const body = { token, channel, attachments, as_user: true, ts: messageTs };
  return axios.post("https://slack.com/api/chat.update", qs.stringify(body));
};

module.exports.deleteMessage = (channel, userId, messageTs) => {
  const body = { token, channel, as_user: true, user: userId, ts: messageTs };
  return axios.post("https://slack.com/api/chat.delete", qs.stringify(body));
};

module.exports.createCancellationMessage = (channel, userId, text) => {
  const body = { token, channel, as_user: true, user: userId, text };
  return axios.post("https://slack.com/api/chat.postEphemeral", qs.stringify(body));
};
