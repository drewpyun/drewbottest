const { REST } = require('@discordjs/rest');
const fs = require('fs')
const token = process.env['token']
const rest = new REST({ version: '9' }).setToken(token);

const configCacheKey = '/home/ubuntu/config.json';

function addProfanity(profanity) {
    const rawConfig = fs.readFileSync('config.json')
    const config = JSON.parse(rawConfig);
    const filters = config.FILTER_LIST
    const profanityArray = profanity.split(";").filter(profanity => profanity.length > 0)
    
    const newFilters = [...filters, ...profanityArray]
    const newConfig = {
      ...config,
      FILTER_LIST: newFilters
    }
    fs.writeFile('config.json', JSON.stringify(newConfig), 'utf8', (err) => {
      if (err) return console.log(err)

      delete require.cache[configCacheKey]
    })
}

function removeProfanity(unBannedWord) {
   const rawConfig = fs.readFileSync('config.json')
    const config = JSON.parse(rawConfig);
    const filters = config.FILTER_LIST;

    const updatedFilters = filters.filter((bannedWord) => bannedWord !== unBannedWord)

    const newConfig = {
      ...config,    
      FILTER_LIST: updatedFilters
    }
    
    fs.writeFile('config.json', JSON.stringify(newConfig), 'utf8', (err) => {
      if (err) return console.log(err)

      delete require.cache[configCacheKey]
    })
};

function detectProfanity(message, blackListedWords, regexCheck) {
  const violatedRegexCheck = message.match(regexCheck);
  while(violatedRegexCheck == !null) {
    if (violatedRegexCheck.length() > 0) {
      return violatedRegexCheck.join('; ')
    }
  }
  return blackListedWords.find(word => message.toLowerCase().includes(word))
}

module.exports.addProfanity = addProfanity
module.exports.removeProfanity = removeProfanity
module.exports.detectProfanity = detectProfanity


// todo embed, reaction logging

// 
