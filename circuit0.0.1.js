require('events').EventEmitter.prototype._maxListeners = 100;
const Discord = require('discord.js');
const bot = new Discord.Client();
const m = require("./m.json");
const now = require("performance-now");
const prettyBytes = require("pretty-bytes");
var prefix = "?";
var version = "0.0.1";
let evalstream = false;
function msToTime(duration) {
    var milliseconds = parseInt((bot.uptime%1000)/100), seconds = parseInt((bot.uptime/1000)%60), minutes = parseInt((bot.uptime/(1000*60))%60), hours = parseInt((bot.uptime/(1000*60*60))%24), days = parseInt((bot.uptime/(1000*60*60*24))%31);
    days = (days < 10) ? "0" + days : days;
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return days + ":" + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
bot.on('ready', (g,m) => {
  console.log("Bot online. Ready at " + bot.readyAt + ". Version " + version + ". Prefix " + prefix + ".");
  bot.user.setStatus("online");
  bot.user.setGame(prefix + "help");
});
bot.on("disconnect", () => {
  console.log("Bot was disconnected from Discord on " + new Date() + "!");
});
bot.on("reconnecting", () => {
  console.log("Bot reconnected to Discord on " + new Date() + "!");
});
process.on("unhandledRejection", err => {
  console.log("Unhandled Promise Rejection Warning. \n" + err.stack);
});
bot.on('message', message => {
  if (message.content.startsWith(prefix + "eval")) {
    if (message.author.bot) return;
    if (message.author.id === m.id) {
      let content = message.content.split(" ").slice(1).join(' ');
      let result = new Promise((resolve, reject) => resolve(eval(content)));
      return result.then(check => {
        if (check.includes(bot.token)) check = check.replace(bot.token, "Error: Output contained bot token.");
        return message.channel.sendCode("js", "Input: " + content + "\n" + "Output: " + check);
      }).catch(error => {
        console.error(error);
      });
    }
  } else if (message.content === prefix + "ping") {
    var start = now();
    message.channel.sendMessage("Checking Ping...").then(message => {
      var end = now();
      message.edit(`Pong! The message took ${(end - start).toFixed(2)} milliseconds to be processed and returned. The bot's ping is currently ${(bot.ping).toFixed(0)}.`);
    });
  } else if (message.content === prefix + 'help') {
      message.channel.sendMessage(" ", {
        embed: {
          color: 3447003,
          author: {
            name: 'Help',
            icon_url: bot.user.avatarURL
          },
          title: 'Help Message',
          description: 'List of commands for the bot.',
          fields: [{
              name: 'help',
              value: 'Returns this message'
            },
            {
              name: 'deletemsgs',
              value: 'Deletes a specified number of messages.'
            },
            {
              name: 'kick',
              value: 'Kicks the first mentioned user.'
            },
            {
              name: 'ban',
              value: 'Bans the first mentioned user.'
            },
            {
              name: "eval",
              value: "Developer only."
            },
            {
              name: "setstatus",
              value: "Sets the status of the bot. (Online, Idle, DND, Invisible)"
            },
            {
              name: "ping",
              value: "Returns how long the command took to execute."
            },
            {
              name: "info",
              value: "General information about the bot and server."
            },
            {
              name: "shutdown",
              value: "Shuts down the bot. Developer Only."
            },
            {
              name: "restart",
              value: "Restarts the bot. Developer Only."
            },
            {
              name: "Are you having problems?",
              value: "Join the [support server](https://discord.io/therabots)!"
            }
          ],
          timestamp: new Date(),
          footer: {
            icon_url: bot.user.avatarURL,
            text: 'Command List'
          }
        }
      });
    } else if (message.content.startsWith(prefix + 'deletemsgs')) {
        if (message.member.hasPermission('MANAGE_MESSAGES')) {
          var args = message.content.split(" ").slice(1);
            let numberinit = parseInt(args[0]);
            let number = numberinit++;
              message.channel.bulkDelete(numberinit).then(number => {
                message.channel.sendMessage('Deleted ' + (numberinit - 1) + " messages.")
              });
        }
      } else if (message.content === prefix + "info") {
          if (!message.guild) return;
          message.channel.sendMessage(" ", {
            embed: {
              color: 3447003,
              author: {
                name: 'Bot Information',
                icon_url: bot.user.avatarURL
              },
              title: 'Memory Usage',
              description: `Using ${prettyBytes(process.memoryUsage().rss)}`,
              fields: [{
                name: "Total Members",
                value: `This server has ${message.guild.memberCount} members.`
              },
              {
                name: "Ready Time",
                value: `${bot.readyAt}`
              },
              {
                name: "Uptime",
                value: msToTime()
              },
            ],
              timestamp: new Date(),
              footer: {
                icon_url: bot.user.avatarURL,
                text: 'Information Details'
              }
            }
          });
        } else if (message.content.startsWith(prefix + "kick")) {
            if (!message.guild) return;
            if (message.member.hasPermission('KICK_MEMBERS')) {
              var kicked = message.mentions.users.first();
              if (message.guild.member(kicked).kickable === true) {
                message.guild.member(kicked).kick().then(kicked => {
                  message.channel.sendMessage('Kicked ' + kicked.displayName + "!");
                });
              } else message.channel.sendMessage('I cannot kick this member.');
            }
          } else if (message.content.startsWith(prefix + 'ban')) {
              if (!message.guild) return;
              if (message.member.hasPermission('BAN_MEMBERS')) {
               if (message.content.startsWith(prefix + 'ban')) {
                var banned = message.mentions.users.first();
                if (message.guild.member(banned).bannable === true) {
                  message.guild.member(banned).ban().then(banned => {
                    message.channel.sendMessage('Banned ' + banned.displayName + "!");
                });
              } else message.channel.sendMessage("I cannot ban this member.");
            }
          }
        } else if (message.content.startsWith(prefix + 'setstatus')) {
          if (message.author.id === m.id) {
            var args = message.content.split(' ').slice(1);
              let status = args[0]
                bot.user.setStatus(status)
                  if (status === 'dnd') {
                    message.channel.sendMessage('Bot set to Do Not Disturb.');
                  }
                  if (status === 'online') {
                    message.channel.sendMessage('Bot has been set to Online.');
                  }
                  if (status === 'idle') {
                    message.channel.sendMessage('Bot has been set to Idle.');
                  }
                  if (status === 'invisible') {
                    bot.users.get(message.author.id).sendMessage('Bot has been set to Invisible.');
                  }
          }
        } else if (message.content === prefix + "shutdown") {
          if (message.author.id === m.id) {
            bot.destroy();
          }
        } else if (message.content === prefix + "restart") {
          if (message.author.id === m.id) {
            var rstart = now();
            bot.destroy();
            bot.login(m.token).then(smessage => {
              var rend = now();
              message.channel.sendMessage(`Restart took ${(rend - rstart).toFixed(0)} milliseconds.`)
            });
          }
        }
});
bot.on("message", message => {
  if (!message.guild) return;
    if (message.content === prefix + "evalenable" && !evalstream) {
        if (message.member.id === m.id) {
          evalstream = true;
          message.channel.sendMessage("Stream started.");
        }
    }
    if (message.content === prefix + "evaldisable" && evalstream) {
        if (message.member.id === m.id) {
          evalstream = false;
          message.channel.sendMessage("Stream stopped.");
    }
}});
bot.login(m.token);
