const fetch = require('node-fetch');
const crypto = require('crypto');
const fs = require('fs');
const config = require("./config.json");
const pokemon = require('./pokemon.json');
const Discord = require("discord.js");
const client = new Discord.Client();

const logPath = __dirname + '\\logs';
if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}
const wStream = fs.createWriteStream('logs\\pokemons.log', {'flags': 'a'});

let logPokemon = function(msg) {
    console.log(msg);
    wStream.write(`${msg}\n`);
}

let catchPokemon = function(msg, name) {
    if (name) setTimeout(() => msg.channel.send('p!catch ' + name), config.catch_delay);
}

let notifyPokemon = function(msg, name) {
    if (name) setTimeout(() => msg.channel.send('Pokémon: ' + name), 100);
}

client.on("message", (msg) => {
    if (msg.guild && msg.author.id === '365975655608745985' && config.guild_whitelist.includes(msg.guild.id)) {
        if (Array.isArray(msg.embeds) && msg.embeds.length >= 1) {
            if (msg.embeds[0].title && ~msg.embeds[0].title.indexOf('wild pokémon has appeared')) {
                if (msg.embeds[0].image && msg.embeds[0].image.proxyURL) {
                    fetch(msg.embeds[0].image.proxyURL)
                        .then((res) => res.buffer())
                        .then(buffer => {
                            let name = pokemon[crypto.createHash('md5').update(buffer).digest('hex')];
                            if (config.pokemon_filter) {
                                if (config.pokemon_whitelist.includes(name)) {
                                    logPokemon(`A wild ${name} has appeared!`);
                                    catchPokemon(msg, name);
                                } else {
                                    logPokemon(`Pokémon not in whitelist (${name})`);
                                    notifyPokemon(msg, name);
                                }
                            } else {
                                logPokemon(`A wild ${name} has appeared!`);
                                catchPokemon(msg, name);
                            }
                            
                    }).catch(console.error);
                }
            }
        }
    }
});

client.on('ready', () => {
    console.log('Pokécatcher is ready.');
    if (config.farm) {
        setInterval(() => {
            client.channels.get(config.farm_channel).send('farm').then((msg) => msg.delete()).catch(console.error);
        }, config.farm_delay);
    }
});

client.login(config.token);
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));