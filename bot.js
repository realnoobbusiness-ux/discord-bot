require("dotenv").config();
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const YT_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UC6WhJmL5tQq7s0Q2n4G3c3A"; // RealDaslinBlox channel ID

// Fetch top Roblox shorts
async function getTopShorts() {
  try {
    const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: "#escapetsunamiforbrainrots #roblox",
        maxResults: 20,
        type: "video",
        order: "viewCount",
        key: YT_KEY
      }
    });

    return res.data.items.slice(0, 10);
  } catch (err) {
    console.error("YouTube API error:", err.response?.data || err.message);
    return [];
  }
}

// Post shorts
async function postShorts(channel) {
  const videos = await getTopShorts();

  if (videos.length === 0) {
    channel.send("⚠️ Could not fetch YouTube videos. Check your API key.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("🔥 Top 10 Roblox Shorts")
    .setColor("#FF0000")
    .setTimestamp();

  videos.forEach((v, i) => {
    embed.addFields({
      name: `${i + 1}. ${v.snippet.title}`,
      value: `https://youtube.com/watch?v=${v.id.videoId}`
    });
  });

  channel.send({ embeds: [embed] });
}

// Get channel videos from last X hours
async function getChannelViews(hours) {
  const time = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  try {
    const search = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        channelId: CHANNEL_ID,
        publishedAfter: time,
        maxResults: 50,
        type: "video",
        key: YT_KEY
      }
    });

    const ids = search.data.items.map(v => v.id.videoId).join(",");

    if (!ids) return 0;

    const stats = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        part: "statistics",
        id: ids,
        key: YT_KEY
      }
    });

    let views = 0;

    stats.data.items.forEach(v => {
      views += parseInt(v.statistics.viewCount);
    });

    return views;

  } catch (err) {
    console.error(err);
    return 0;
  }
}

client.once("ready", () => {
  console.log("Bot online!");
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg === "!trending") {
    await postShorts(message.channel);
  }

  if (msg === "!daslin1h") {
    const views = await getChannelViews(1);
    message.channel.send(`📊 RealDaslinBlox views in last **1 hour:** ${views}`);
  }

  if (msg === "!daslin24h") {
    const views = await getChannelViews(24);
    message.channel.send(`📊 RealDaslinBlox views in last **24 hours:** ${views}`);
  }

  if (msg === "!daslin48h") {
    const views = await getChannelViews(48);
    message.channel.send(`📊 RealDaslinBlox views in last **48 hours:** ${views}`);
  }
});


client.login(process.env.MTQ3OTA2MzI1MzA1MjAzNTEyNA.G9YPZ5.n1DTXV7Y1S9YyFgvhthkHSB4POwnmCturagpGE);
