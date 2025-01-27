const { randomNumber } = require("../utils");
const { randomAnime, randomPokemon } = require("./random");
const { addCommand, listCommands, removeCommand } = require("./autocmd");
const { help } = require("./help");
const { postSketchDaily, scheduleWeeklyGesture } = require("./draw");
const { searchAnimeImg } = require("./anisearch");
const fetch = require("node-fetch");
const Discord = require("discord.js");

const { dog_token, cat_token, prefix } = require("../../config.json");
const {
  serverStatus,
  startPalServer,
  stopPalServer,
  zerotierIp,
  KillCommand,
  updatePalServer,
} = require("./server");

const createCommands = (message) => {
  //API for animal facts
  const animal_fact = (command) => {
    fetch(
      `https://cat-fact.herokuapp.com/facts/random?animal_type=${command}&amount=1`
    )
      .then((response) => response.json())
      .then((data) => {
        message.channel.send(data.text);
      });
  };

  //API for animal imgs
  const animal_img = (animal, token) => {
    fetch(`https://api.the${animal}api.com/v1/images/search?api_key=${token}`)
      .then((response) => response.json())
      .then((data) => {
        message.channel.send(data[0].url);
        // if (Object.keys(data[0].breeds).length !== 0) {
        //     message.channel.send(
        //         `This ${animal} breed is called: **${data[0].breeds[0].name}**`
        //     );
        // }
      });
  };
  //If !me command is called
  const about_user = () => {
    message.channel.send(
      `${String.fromCodePoint(0x1f440)} Your Username is: **${
        message.author.username
      }** \n${String.fromCodePoint(0x1f194)} Your ID is: **${
        message.author.id
      }**`
    );
  };

  const get_avatar = () => {
    const tagged_user_id = message.mentions.users.toJSON()[0].id;
    const tagged_user_avatar = message.mentions.users.toJSON()[0].avatar;
    const tagged_user = message.mentions.users.first();
    return message.channel.send(
      `Here is your image from ${tagged_user} https://cdn.discordapp.com/avatars/${tagged_user_id}/${tagged_user_avatar}.png`
    );
  };

  const createHelp = (key, cmds) => {
    console.log(cmds);
    return new Discord.MessageEmbed()
      .setColor("4169E1")
      .setTitle(
        `${String.fromCodePoint(commands[key].icon)} List of ${key} commands`
      )
      .setDescription(
        Object.keys(cmds)
          .map((cmd) => {
            return `\`${prefix}${key} ${cmd}\` ${cmds[cmd]}`;
          })
          .join("\n")
      );
  };

  const commands = {
    help: {
      _: help,
    },
    cat: {
      fact: () => animal_fact("cat"),
      img: () => animal_img("cat", cat_token),
      icon: 0x1f63a,
      help: (runner) =>
        runner.send(
          createHelp("cat", {
            img: "for a random cat image",
            fact: "for a random cat fact",
          })
        ),
    },
    dog: {
      fact: () => animal_fact("dog"),
      img: () => animal_img("dog", dog_token),
      icon: 0x1f436,
      help: (runner) =>
        runner.send(
          createHelp("dog", {
            img: "for a random dog image",
            fact: "for a random dog fact",
          })
        ),
    },
    me: {
      _: about_user,
      icon: 0x1f194,
      help: (runner) =>
        runner.send(
          createHelp("me", {
            "": "for \n [_Your Username_] and [_Your unique ID from Discord_]",
          })
        ),
    },
    avatar: {
      icon: 0x1f5bc,
      help: (runner) =>
        runner.send(
          createHelp("avatar", {
            "@[insertUsername]": "to get the avatar of the tagged user",
          })
        ),
      at: () => get_avatar(),
    },
    // draw: {
    //     icon: 0x270f,
    //     daily: postSketchDaily,
    //     weeklyGesture: scheduleWeeklyGesture,
    //     help: runner =>
    //         runner.send(createHelp("draw", {
    //             daily: "to get current SketchDaily topic",
    //             'weeklyGesture [channelId] [dayOfWeek|6(Saturday)] [time|20:00]': 'schedule weekly gesture session for the next week',
    //         })),
    // },
    random: {
      icon: 0x2753,
      coin: (r) =>
        randomNumber(0, 1) === 0 ? r.send("Head") : r.send("Tails"),
      number: (r, min, max) => r.send(randomNumber(min || 0, max || 1)),
      anime: randomAnime,
      pokemon: randomPokemon,
      help: (runner) =>
        runner.send(
          createHelp("random", {
            coin: "to flip a coin",
            "number [min|0] [max|1]": "to get a random number between range",
            "anime (character?) [amount:1-5]":
              "for a random anime or character",
            "pokemon [amount:1-5]": "for random pokemons",
          })
        ),
    },
    autocmd: {
      icon: 0x1f5d8,
      list: listCommands,
      add: addCommand,
      remove: removeCommand,
      help: (runner) =>
        runner.send(
          createHelp("autocmd", {
            list: "to list all active auto commands",
            "add [cron] [cmd]": "to add a auto command",
            "remove [id]": "to remove a auto command by id",
          })
        ),
    },
    kill: {
      icon: 0x274c,
      _: (r) => {
        r.send('I killed myself');
        throw new KillCommand("I killed myself");
      },
      help: (runner) =>
        runner.send(
          createHelp("kill", {
            "": "to kill me in case I do something stupid",
          })
        ),
    },
    anisearch: {
      icon: 0x1f50d,
      img: searchAnimeImg,
      help: (runner) =>
        runner.send(
          createHelp("anisearch", {
            "": "`[url]` to reverse search an anime with an image",
          })
        ),
    },
    server: {
      icon: 0x1f5a5,
      _: (r, ...args) => serverStatus(r, ...args),
      startPal: (r, ...args) => startPalServer(r, ...args),
      stopPal: (r) => stopPalServer(r),
      updatePal: (r) => updatePalServer(r),
      ip: (r) => zerotierIp(r),
      help: (runner) =>
        runner.send(
          createHelp("server", {
            "": "Check the status of the server",
            ip: "Print server ip for zerotier",
            'startPal [true|false]': "Start PalServer with or without auto update",
            stopPal: "Stop PalServer",
            updatePal: "Update PalServer through steam",
          })
        ),
    },
  };

  return commands;
};

module.exports = {
  createCommands,
};
