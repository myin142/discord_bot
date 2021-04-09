const Discord = require('discord.js');

const { prefix, token, dog_token, cat_token } = require('./config.json');
const fetch = require('node-fetch');
const client = new Discord.Client();



client.once('ready', () => console.log('Random bot is online'));

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    /*     if (command === 'help') {
            const help_embed = new Discord.MessageEmbed().setColor('#0099ff');
    
           channel.send(help_embed);
    
    
                    message.channel.send(`Try one of the following commands: \n\
            ${"`!me`"} Info about yourself \n\
            ${"`!ghibli help`"} Info about Ghibli movies\n\
            ${"`!avater @user`"} To get the users profile picture`);
        }; */

    if (command === 'me') {
        message.channel.send(`Your Username is: ${message.author.username} \nYour ID is: ${message.author.id}`);
    };

    if (command === 'test') {
        const first_msg = message.content;
        message.channel.send(`The first message ${first_msg}`);
    };

    if (command === 'avatar') {
        if (!message.mentions.users.size) {
            console.log(message.mentions.users.size, !message.mentions.users.size);
            return message.reply(`You need to tag someone`);
        } else {
            const tagged_user_id = message.mentions.users.toJSON()[0].id;
            const tagged_user_avatar = message.mentions.users.toJSON()[0].avatar;
            const tagged_user = message.mentions.users.first();
            console.log(!message.mentions.users.size);
            message.channel.send(`Here is your image from ${tagged_user} https://cdn.discordapp.com/avatars/${tagged_user_id}/${tagged_user_avatar}.png`);
        };
    };

    if (command === 'cat') {
        if (!args.length) {
            return message.channel.send(`Try using ${"`!cat help`"}`);
        } else if (args[0] === 'fact') {
            return fetch('https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1').then(response => response.json()).then(data => {
                message.channel.send(data.text);
            });
        } else if (args[0] === 'img') {
            return fetch(`https://api.thecatapi.com/v1/images/search?api_key=${cat_token}`).then(response => response.json()).then(data => {
                message.channel.send(data[0].url);
                if (Object.keys(data[0].breeds).length !== 0) {
                    message.channel.send(`This cat breed is called: **${data[0].breeds[0].name}**`);
                };
            });
        } else if (args[0] === 'help') {
            return message.channel.send(`${"`!cat facts`"} for random cat facts\n${"`!cat img`"} for random cat images`);
        };
        message.channel.send(`No argument for **${args[0]}**. Try using ${"`!cat help`"}`);
    };

    if (command === 'dog') {
        if (!args.length) {
            return message.channel.send(`Try using ${"`!dog help`"}`);
        } else if (args[0] === 'fact') {
            return fetch('https://cat-fact.herokuapp.com/facts/random?animal_type=dog&amount=1').then(response => response.json()).then(data => {
                message.channel.send(data.text);
            });
        } else if (args[0] === 'img') {
            return fetch(`https://api.thedogapi.com/v1/images/search?api_key=${dog_token}`).then(response => response.json()).then(data => {
                message.channel.send(data[0].url);
                if (Object.keys(data[0].breeds).length !== 0) {
                    message.channel.send(`This dog breed is called: **${data[0].breeds[0].name}**`);
                };
            });
        } else if (args[0] === 'help') {
            return message.channel.send(`${"`!dog facts`"} for random cat facts\n${"`!dog img`"} for random dog images`)
        }

        message.channel.send(`No argument for **${args[0]}**. Try using ${"`!cat help`"}`);
    };



    if (command === 'ghibli') {
        if (!args.length) {
            return message.channel.send(`Try using ${"`!ghibli help`"}`)
        } else if (args[0] === 'castle') {
            return fetch('https://ghibliapi.herokuapp.com/films').then(response => response.json()).then(data => {
                message.channel.send(data[0].title);
            });
        };

        message.channel.send(`No argument for **${args[0]}**. Try using ${"`!ghibli help`"}`);


    };

});


client.login(token);