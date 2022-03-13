require('dotenv').config();

const Discord = require('discord.js');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { addProfanity, removeProfanity, detectProfanity } = require('./index')
//const cron = require('cron');

//env
const token = process.env['token']
const channel = process.env['channel']
const reactChannel = process.env['reactChannel']
const guild_id = process.env['guild_id']


//client stuff
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
client.on('ready', () => {
  console.log(`bot id ${client.user.id}: bot tag ${client.user.tag} ready to go!!! frog`)
})

//soft-mod stuff
client.on('messageCreate', ({ author, content, channelId, id: messageId }) => {
  if (author.bot) return false
  const { id } = author
  const {FILTER_LIST, FILTER_REGEX} = require("./config.json");
  const filterRegex = new RegExp(FILTER_REGEX, 'gi');
  //debug console output
  //console.log ('AUTHOR', author)

  if (channel==channelId) {
   if (content.match(/^(add)/gi)) {
     const userMessage = content.match(/^(add) (.+)/i)
     if (userMessage.length < 2) {
       throw new Error("requires profanity words to add")
     }
      // skip first to matches
      let [,, profanities] = userMessage
      profanities = profanities.split(";").join(";")
      addProfanity(profanities)
      return
   }

    if (content.match(/^(remove)/gi)) {
      const userMessage = content.match(/^(remove) (\w+)/i)
      if (userMessage.length < 2) {
        throw new Error("requires profanity words to remove")
      }

      // skip first 2 matches
      let [,, ...profanities] = userMessage
      profanities = profanities.join(";")
      try{
        removeProfanity(profanities)
      } catch{error} {
       // const errorEmbed = new MessageEmbed()
       // 	.setColor('#0099ff')
       //         .setTitle('error removing profanity')
       //         .setTimestamp()
       // client.channels.cache.get(channel).send(messageEmbed);
      }
      return
   }
  }

  const bannedWordUsed = detectProfanity(content, FILTER_LIST, filterRegex)
  if(bannedWordUsed) {

   // embed for soft-mod
   const messageEmbed = new MessageEmbed()
	  .setColor('#0099ff')
	  .setTitle('soft-mod')
	  .setThumbnail(author.avatarURL())
	  .addFields(
	  	{ name: 'Triggered message: ', value: content },
      { name: 'Triggered word: ', value: bannedWordUsed },
	  	{ name: 'Username: ', value: `${author.tag} <@${id}>`, inline: true },
	  	{ name: 'ID:', value: id, inline: true },
      { name: 'Message Link', value: `https://discord.com/channels/${guild_id}/${channelId}/${messageId}`, inline: false },
  	)
	  .setTimestamp()

  client.channels.cache.get(channel).send({ embeds: [messageEmbed] });
  }
})

//reaction stuff below
const reactClient = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

reactClient.on('messageReactionAdd', async (reaction, user) => {
	// When a reaction is received, check if the structure is partial
  let reactionRes;
	if (reaction.partial) {
		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
		try {
		  reactionRes = await reaction.fetch();
		} catch (error) {
			throw new Error('Something went wrong when fetching the message:', error);
		}
	}

  const reactionRef = reaction.partial ? reactionRes : reaction
  // id and username are for authors of the message
  const { id, username } = reactionRef.message.author
  const {id: emojiId, name: emojiName, animated } = reactionRef._emoji
  let linkToMyEmoji = emojiName;
  if (emojiId !== null) {
    const imgExtension = animated ? 'gif' : 'png'
    linkToMyEmoji = `https://cdn.discordapp.com/emojis/${emojiId}.${imgExtension}`
  }

  reactcontent = "";
  if (`${reaction.message.content}`== ""){
    reactcontent = "[message has no text]";
  }
  else
    reactcontent = `${reaction.message.content}`;

  let reactChannel1 = `${reaction.message.channel}`;
  reactChannelID = reactChannel1.substring(2,((reactChannel1.length)-1));

  const reactEmbed = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle('reaction-log')
      .setThumbnail(emojiId ? linkToMyEmoji : undefined)
      .addFields(
        { name: 'Reaction name', value: `${emojiName} ${emojiId}`, inline: true},
        { name: 'Message ID: ', value: `[${reactcontent}] by: ${reaction.message.author}` , inline: false },
        { name: 'Reaction user tag: ', value: `${user.tag} <@${user.id}> ${user.id}`, inline: false },
        { name: 'Message link: ', value: `https://discord.com/channels/${guild_id}/${reactChannelID}/${reaction.message.id}`, inline: false}
      )
      .setTimestamp()

  reactClient.channels.cache.get(reactChannel).send({ embeds: [reactEmbed] });

	// Now the message has been cached and is fully available
	// console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
	// The reaction is now also fully available and the properties will be reflected accurately:
  // console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
})

//manage channel below
//const channelManage = new Discord.Client();

//channelManage.once('ready', () => {
//  const guildCache = channelManage.guilds.cache
//  const guild = guildCache.entries().next().value
//  const categoryTextId = guildCache.get(guild[0]).channels.cache.entries().next().value[1].id
//  guildCache.get(guild[0]).channels.create('channel under text parent', 'text').then(channel => channel.setParent(categoryTextId))
//})

// // channelManage.on('ready', guild => {
//    console.log(channelManage.guild);
// 	 channelManage.guilds.cache.get(guild_id).channel.create('test 2', 'text')
//      .then(console.log)
//      .catch(console.error);

// // });


client.login(token);
reactClient.login(token);
//channelManage.login(token);
