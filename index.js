const config = require("./key.json");
const tmi = require('tmi.js');
const twitchchannel = '' // 'Twitch Channel'
const options = {
    options: {
        debug: true,
    },
    connection: {
        cluster: 'aws',
        reconnect: true,
    },
    identity: {
        username: '', // 'Twitch Bot Username'
        password: config.twitchtoken,
    },
    channels: [twitchchannel],
};
var Twitter = require('twitter');
const TwitterClient = new Twitter({
    consumer_key: config.apikey,
    consumer_secret: config.apisecretkey,
    access_token_key: config.accesstoken,
    access_token_secret: config.accesstokensecret
});
var twittermod = require('./modules/twitter.js'); 
const { Client, Discord, Activity } = require ('discord.js');
const  DClient  = new Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});
const client = new tmi.client(options);
var isLive, isAlreadyLive, hasAnnounced = false;
var streamCount = 0;
var streamerID = ''; // Owner ID Goes Here
var announcementChannelID = ''; // Announcement Channel ID [Discord]
var debugChannelID = ''; // Log Channel ID [Discord]
var mysql = require('mysql');
var pool = mysql.createPool({ // MYSQL Details
    host: "", // IP
    user: "", // Username
    password: "", // Password
    database: "" // Database
});
var BotPrefix = `!`; //Bot Prefix
var customcmd = [];
var customresp = [];
var customfilter = [];
var userException = [];
var quotes = new Array();

//===============================================================================================================

var express = require('express');
var bodyParser = require("body-parser");
const { render } = require("ejs");
app = express(),
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({ extended: false }));
port = process.env.PORT || 3000;
app.listen(port);
console.log('Started API Server on ' + port)


app.get('/api/quotes', function(req, res) {
    pool.query(`SELECT * from quotes`, (err, result) => {
        if (err) throw err;
        // console.log(result)
        res.json({data: result});
    });
    
});

app.get('/api/commands', function(req, res) {
    pool.query(`SELECT * from commands`, (err, result) => {
        if (err) throw err;
        res.json({data: result});
    });
});

app.get('/', (req, res) => { res.render("login") }); //Home Page
app.get('/index', (req, res) => { res.render("index", {botname: options.identity.username, streamername: twitchchannel, alreadyLive: isAlreadyLive}) }); //Home Page
app.get("/filter", (req, res) => { 
    // console.log(customfilter)
    res.render('filter', {filterwords:customfilter});
 }); 
app.get("/commands", (req, res) => {
    res.render('commands', {commands:customcmd, commandsresponse:customresp});
});
app.get("/quotes", (req, res) => {
    getQuotesFromDB();
    // console.log(quotes);
    res.render('quotes', {quotes: quotes})
})

app.post("/loginRequest", (req, res) => { // changes require the button to be pressed twice and I don't see why.
// console.log(req.body.tweetMessage);
let m = req.body.password;
if (m != undefined) {
    if (m == "lmao") {
        res.redirect('/index');
    } else {
        res.redirect('/');    
    }
} else {
    res.redirect('/');
}
});

app.post("/postTweet", (req, res) => { // changes require the button to be pressed twice and I don't see why.
    // console.log(req.body.tweetMessage);
    let m = req.body.tweetMessage;
    if (m.length > 0) {
        twittermod.sendTestTweet(m);
        res.redirect('index');
    } else {
        res.redirect('index');
    }
});

app.post("/addToFilter", (req, res) => {
    let w = req.body.naughtyword
    if (w.length > 0 ) {
        addToFilter(w.toLowerCase());
        res.redirect('filter');
    } else {
        res.redirect('filter');
    }
});

app.post("/delFromFilter", (req, res) => {
    let w = req.body.naughtyword
    if (w.length > 0 ) {
        deleteFromFilter(w.toLowerCase());
        res.redirect('filter');
    } else {
        res.redirect('filter');
    }
});

app.post("/addCommand", (req, res) => {
    let c = req.body.command
    let r = req.body.response
    if (c.length > 0) {
    var invcommand = c.toLowerCase();
    var sqlcommand = `INSERT INTO commands (command, response) VALUES ("${invcommand}", "${r}")`;
    pool.getConnection(function(err, connection){
        if (err) throw err;
        connection.query(sqlcommand, function (err, result){
            if (err) throw err;
            });
        });
        getCommandsFromDB();
        res.redirect('commands');
    } else {
        res.redirect('commands');
    }
    })

app.post("/delCommand", (req, res) => {
    let c = req.body.command
    console.log(c);
    if (c.length > 0) {
        var invcommand = c.toLowerCase();
        var sqlcommand = `DELETE FROM commands WHERE command = "${c}"`;
        pool.getConnection(function(err, connection){
            if (err) throw err;
            connection.query(sqlcommand, function (err, result){
                if (err) throw err;
                });
            });
            getCommandsFromDB(); // Doesn't automatically do this. but it does work
            res.redirect('commands');
        } else {
            res.redirect('commands');
        }
})

app.post("/addQuote", (req, res) => {
    console.log(req.body.quote, req.body.author);
    var sqlcommand = `INSERT INTO quotes (quote, author) VALUES ("${req.body.quote}", "${req.body.author}")`;
    pool.getConnection(function(err, connection){
        if (err) throw err;
        connection.query(sqlcommand, function (err, result){
            if (err) throw err;
            });
    });
    res.redirect("/quotes");
})

app.post("/delQuote", (req, res) => {
        pool.getConnection(function(err, connection){
            connection.query(`DELETE FROM quotes WHERE ID=${req.body.quoteid}`, function (err, result){
                if (err) throw err;
                if (result.affectedRows != 0){
                    console.log(`Delete quote #${req.body.quoteid}`);
                    connection.release()
                } else {
                    connection.release()
                }
            })
        })
        res.redirect('quotes');
    })

app.post("/toggleStatus", (req, res) => {
    getToggled();
    res.redirect('index');
})
//===============================================================================================================

var title;
var game;
var promotionalmessages = [
    `Thanks for watching! If you're enjoying the stream don't forget to follow!`,
    `Hey! we have a discord! Check it out @ https://discord.gg/DThdkMV`,
];



// con.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected to MYSQL ;)");
// });

client.connect();
client.on('connected', (address, port) => {
    client.action(twitchchannel, 'is connected!');
    timedPromotions(7200) 
    getCommandsFromDB();
    getFilterFromDB();
});

DClient.login(config.discordtoken);
DClient.on('ready', () => {
    console.log('Ready to go on discord');
    const channel = DClient.channels.cache.get(debugChannelID);
    channel.send("We're online and ready to rumble");
    DClient.user.setActivity("the game that is life.");
});

DClient.on('messageReactionAdd', async (messageReaction, user) => { // Add Role Per Reaction Message
    if (!user.bot) {
        if (messageReaction.emoji.name === "awaThonk"){
        if (messageReaction.message.id === "514269741544898573") { // Specific ID Message
            const myRole = messageReaction.message.guild.roles.cache.find(r => r.name === "Stream Notify");
            const member = messageReaction.message.guild.member(user);
            const channel = DClient.channels.cache.get(debugChannelID);
            await member.roles.add(myRole);
            channel.send(`${user.username} has signed up for notifications`);
        }
    }
}
});

DClient.on('messageReactionRemove', async (messageReaction, user) => { // Remove Role Per Reaction Message
    if (!user.bot){
        if (messageReaction.emoji.name === "awaThonk"){
        if (messageReaction.message.id === "514269741544898573") {
            const myRole = messageReaction.message.guild.roles.cache.find(r => r.name === "Stream Notify");
            const member = messageReaction.message.guild.member(user);
            const channel = DClient.channels.cache.get(debugChannelID);
            await member.roles.remove(myRole);
            channel.send(`${user.username} has been removed from notification`);
        }
    }
}
});

async function actualnotif(streamtitle, streamgame){
    const channel = DClient.channels.cache.get(announcementChannelID);
            const twitchEmbed = {
                author: {
                    name: '', // Embed Name
                    icon_url: '' // Embed Thumbnail
                },
                title: `${streamtitle}`,
                description: `Playing: ${streamgame}`,
                image: {
                    url: '' // Image Link
                },
                timestamp: new Date(),
                fields: [
                    {
                        name: 'Watch Now!',
                        value: '[Click Here]()', // Content Link goes within the brackets
                        inline: true,
                    }
                ],
                footer: {
                    text: '' // Footer Message
                }
            };
        if ((isLive !== false) && (isAlreadyLive !== true)) {
            isAlreadyLive = true;
            await channel.send({ embed: twitchEmbed});
            await channel.send('<@&ROLENUMBER>'); // Notification Role Mention
        }
}

DClient.on('presenceUpdate', async (oldMember, newMember) => { //Checks for status updates.
    if ((newMember.userID == streamerID) && (newMember.activities.find(activity => activity.type === 'STREAMING'))) {
    // -----------------------------------------------------------------------------------------------------------------------------
        title = newMember.activities.find(activity => activity.type === 'STREAMING').details;
        game = newMember.activities.find(activity => activity.type === 'STREAMING').state;
    // ----------------------------------------------------------------------------------------------------------------------------- 
        isLive = true;
        currentGame = game;
        // actualnotif(title, game);
        if (!hasAnnounced) {
            announceToTwitchCheck(game);
        }
        //fakenotif(title, game); // -- Testing Purposes
    
    }else if ((newMember.userID == streamerID) && (!newMember.activities.find(activity => activity.type === 'STREAMING'))) { // Cry some more
        isLive = false;
        return;
    }

    
});

DClient.on('message', message => {
    if (message.author.bot) return;

    for (var x in customfilter) {
        msg = message.content.toLowerCase();
        if(msg.includes(customfilter[x])) { // To thawrt those no good users
        // console.log("VIOLATION");
        message.delete({})
        .then((data) => {
            message.reply(`you can't say that here!`);
        }).catch((err) => {
            //
        });
        }
    }

    if(message.content.startsWith(BotPrefix)) {  // Command handler for DISCORD
        const args = message.content.slice(1).split(' ');
        const commandName = args.shift().toLowerCase();

        if (commandName === `addfilter`) {
            if (message.author.id == streamerID) {
                if (args[0] != undefined) {
                addToFilter(args[0]);
                message.channel.send("Added To Blacklist");
            }
            }
        }

        if (commandName === `delfilter`) {
            if (message.author.id == streamerID) {
                if (args[0] != undefined) {
                    deleteFromFilter(args[0]);
                    message.channel.send("Removed From Blacklist");
                }
            }
        }

        if (commandName === `ban`) {
            if (message.author.id == streamerID) {
                    const user = message.mentions.users.first();;
                    if (user) {
                        const member = message.guild.members.resolve(user);
                        if (member) {
                            message.delete();
                            member.ban({ reason: `This person was banned via !ban`}).then(() => {
                                message.channel.send(`Successfully banned ${user.tag}`);
                            })
                            .catch(err => {
                                message.channel.send(`An Error Occured`);
                                console.error(err);
                            });
                        } else {
                            message.channel.send(`This user isn't in this server!`);
                        } } else {
                            message.delete();
                            message.channel.send(`You didn't mention the user to ban!`);
                        }
                    }
                }
        

        if (commandName === `kick`) {
            if (message.author.id == streamerID) {
                    const user = message.mentions.users.first();;
                    if (user) {
                        const member = message.guild.members.resolve(user);
                        if (member) {
                            member.kick().then(() => {
                                message.delete();
                                message.channel.send(`Successfully kicked ${user.tag}`);
                            })
                            .catch(err => {
                                message.channel.send(`An Error Occured`);
                                console.error(err);
                            });
                        } else {
                            message.channel.send(`This user isn't in this server!`);
                        } } else {
                            message.delete();
                            message.channel.send(`You didn't mention the user to kick!`);
                        }
                    }
                }
            

}

});

client.on('message', onMessageHandler);

client.on('cheer', (channel, userstate, message) => {
    client.say(twitchchannel, `${userstate["display-name"]} just cheered ${userstate.bits} bit(s). Thank you so much!`);
});

client.on('subgift', (channel, username, streakMonths, recipient, userstate) => {
    let senderCount = userstate["msg-param-sender-count"]
    client.say(twitchchannel, `Daaaaamn ${username}, you've given a total of ${senderCount} subs. Thank you so much!`);
});

client.on('resub', (channel, username, months, message, userstate, methods) => { //Gotta wait for resubs to test this. smh
    let cumulativeMonths = userstate["msg-param-cumulative-months"];
    client.say(twitchchannel, `${userstate["display-name"]} back at it again with the sub for ${cumulativeMonths} months. Thank you!`);
});

client.on('subscription', (channel, username, method, message, userstate) => {
    client.say(twitchchannel, `Thank you for the sub ${userstate["display-name"]}!`)
});

function announceToTwitchCheck(game){
    if (streamCount < 1) {
    streamCount++
    client.say(twitchchannel, `now streaming ${game}`)
    hasAnnounced = true;
    actualnotif(title, game);
    } else {
        return;
    }
}

function randomNumberPerPromoArray(){
    var random = Math.floor(Math.random() * promotionalmessages.length);
    return random;
}

function timedPromotions(interval) {
    setInterval(function() {
        client.say(twitchchannel, promotionalmessages[randomNumberPerPromoArray()]);
    }, interval * 1000);
}

function getCommandsFromDB(){
    customcmd = [] // Dump arrays before adding the commands back to it.
    customresp = []
    pool.getConnection(function(err, connection){
        if (err) throw err;
        connection.query(`SELECT * from commands`, function (err, result){
            if (err) throw err;
            // console.log(result)
            for (var x in result){
                // console.log(result[x].command)
                customcmd.push(result[x].command)
                customresp.push(result[x].response)
            }
            client.action(twitchchannel, `loaded ${customcmd.length} commands`)
            connection.release()                
        })
    })
    return "BOT STATUS: Loaded Commands From Database";
}

exports.getCommandsFromDB = getCommandsFromDB();

function getToggled(){
    if (isAlreadyLive == true) {
        isAlreadyLive = false;
        hasAnnounced = false;
        streamCount = 0;
    } else {
        isAlreadyLive = true;
        hasAnnounced = true;
    }
    return "Status Toggled";
}

exports.getToggled = getToggled();

function getQuotesFromDB(){
    pool.getConnection(function(err, connection){
        if (err) throw err;
        connection.query(`SELECT * from quotes`, function (err, result) {
            if (err) throw err;
            for (var x in result){
                quotes.push(result[x]);
            }
            // console.log(quotes);
            connection.release();
            // quotes = localQuotes;
        })
    })
    // console.log(localQuotes)
    // console.log(quotes);
    return quotes;
}

exports.getQuotesFromDB = getQuotesFromDB();

function getFilterFromDB(){
    customfilter = []
    pool.getConnection(function(err, connection){
        if (err) throw err;
        connection.query(`SELECT * from filteredwords`, function (err, result){
            if (err) throw err;
            // console.log(result)
            for (var x in result){
                // console.log(result[x].command)
                customfilter.push(result[x].word)
            }
            client.action(twitchchannel, `loaded ${customfilter.length} naughty words`)
            connection.release()                
        })
    })
    return customfilter;
}

exports.getFilterFromDB = getFilterFromDB();

function addToFilter(word2filter){
    var keyword = word2filter.toLowerCase();
    var sqlcommand = `INSERT INTO filteredwords (word) VALUES ("${keyword}")`;
                pool.getConnection(function(err, connection){
                    if (err) throw err;
                    connection.query(sqlcommand, function (err, result){
                    if (err) throw err;
                });
                getFilterFromDB();
            })
    return "Confirmed";
}

function deleteFromFilter(word2filter){
    var keyword = word2filter.toLowerCase();
                var sqlcommand = `DELETE FROM filteredwords WHERE word="${keyword}"`;
                pool.getConnection(function(err, connection){
                    if (err) throw err;
                    connection.query(sqlcommand, function (err, result){
                    if (err) throw err;
                });
                getFilterFromDB();
            });
    return "Confirmed";
}

exports.addToFilter = addToFilter("test");
exports.deleteFromFilter = deleteFromFilter("test");

function LinkProtectionRemoval(context) {
    client.deletemessage(twitchchannel, context.id)
    .then((data) => {
        client.say(twitchchannel, ("You are not permitted to post links!"));
    }).catch((err) => {
        //catch the error
    });
}

function ExceptionFormattingif(user){
    var value;
    if (user.includes("@")){ //Checks and removes the mention.
        value = user.substring(1);
        console.log(`WITH AN @ = ${value}`)
        return value
    } else {
        value = user;
        return value

    }
}

function AddToExceptionWithTimeout(user) {
    // console.log(`Adding user ${user} to exception list`);
    userException.push(ExceptionFormattingif(user));
    // console.log(userException);
    client.say(twitchchannel, `${user} is now permitted to post links temporarily.`);
    setTimeout(() => {
        userException = [];
        // console.log(`Removed user from exception list`);
        // console.log(userException);
    }, 40000);
 
}

function onMessageHandler (target, context, msg, self) { 

    /*
    context IS the user
    msg IS the message
    */

    if (self) return; 

    for (var x in customfilter) {
        msg = msg.toLowerCase();
        if(msg.includes(customfilter[x])) { // To thawrt those no good users
        // console.log("VIOLATION");
        client.deletemessage(twitchchannel, context.id)
        .then((data) => {
            client.say(twitchchannel, ("Oh no! You said a naughty word"));
        }).catch((err) => {
        });
        }
    }

    if (msg.includes("https" || "http") && (!self)) {
        if (userException.length == 0) {
            LinkProtectionRemoval(context)
        } else {
        for (var x in userException) {
            if (context.username == userException[x]) {
                return;
            } else {
                LinkProtectionRemoval(context)
            }
        }
    }
        
    }

    if(msg.startsWith(BotPrefix)) {

        const args = msg.slice(1).split(' ');

        const commandName = args.shift().toLowerCase();

        
    for (var i = 0; i < customcmd.length; i++) {
            // console.log(customcmd)
        if (commandName == customcmd[i]) {
            console.log(`found command ${customcmd[i]} with response ${customresp[i]}`)
            client.say(twitchchannel, `${customresp[i]}`)
        }
    }
    if(commandName === 'echo') { 
        const result = `you said: ${args.join(' ')}`;
        console.log(result);
        client.say(twitchchannel, result);
    }
    if (commandName === 'ping') {
        client.ping()
        .then((data) => {
            // console.log(data);
            client.action(twitchchannel, `ponged @ ${data[0]*100}ms`)
        }).catch((err) => {
            //
        });
    }
    if (commandName === 'quotes') {
        pool.getConnection(function(err, connection){
            connection.query("SELECT COUNT(quote) AS quotesnum FROM quotes", function (err, result){
                console.log(count = result[0].quotesnum);
                client.action(twitchchannel, `There are ${count} quotes.`);
                connection.release();
                client.say(twitchchannel, `For the entire list of quotes please visit: https://notcreative.co.uk/quotes`)
            });
        })
       
   
        
    }
    if ((commandName === 'quote') && (args[0] === 'add')) {
        var s;
        var count;
        for (var x in args) {
            if (x != 0) { // Ignores the invoking command.
                if (x == 1) {
                    s = `${args[x]}`
                } else {
                    s += ` ${args[x]}`;
                }
            }
        }
        if (s !== undefined) {
        var sqlcommand = `INSERT INTO quotes (quote, author) VALUES ("${s}", "${context.username}")`;
        pool.getConnection(function(err, connection){
            if (err) throw err;
            connection.query(sqlcommand, function (err, result){
                if (err) throw err;
                });
                connection.query("SELECT COUNT(quote) AS quotesnum FROM quotes", function (err, result){
                    console.log(count = result[0].quotesnum);
                    client.action(twitchchannel, `added quote #${count}`);
                    connection.release();
                });
        });
    }   else {
        return;
    }
        
    }
    function isInt(str) { // Returns whether the value is an integer.
        return !isNaN(str) && Number.isInteger(parseFloat(str))
    }
    if (commandName == 'quote' && args.length <= 1) { // Quotes Module 
        if (isInt(args[0])) {
            pool.getConnection(function(err, connection){
                if (err) throw err;
                connection.query(`SELECT quote FROM quotes WHERE ID=${args[0]}`, function (err, result){
                    if (err) throw err;
                        if(result[0] === undefined){
                            connection.release();
                            return;
                        } else {
                            client.action(twitchchannel, `"${result[0].quote}"`);
                            connection.release();
                        }
                  });
            })
            
        } else {
            return;
        }
    }
    if (commandName === 'delquote' && args.length <= 1) {
        let isBroadcaster = twitchchannel === context.username;
        if(isBroadcaster){
        if (isInt(args[0])) {
            pool.getConnection(function(err, connection){
                connection.query(`DELETE FROM quotes WHERE ID=${args[0]}`, function (err, result){
                    if (err) throw err;
                    if (result.affectedRows != 0){
                        client.action(twitchchannel, `Deleted Quote`);
                        connection.release()
                    } else {
                        client.action(twitchchannel, `That quote doesn't exist (probably)`);
                        connection.release()
                    }
                })
            })
            
        }}
    }
    
    if (commandName === 'tweet') {
        let isBroadcaster = twitchchannel === context.username;
        var tweetString = '';
        if (isBroadcaster) { // Takes all the args and concatenates them into a tweetString
            for (var x in args) {
                tweetString += `${args[x]} `;  
            }
            twittermod.sendTestTweet(tweetString);
            client.action(twitchchannel, `> Tweeted 👍`)
        }
    }
    if (commandName === 'toggle') { // -- Live Status Command --
        let isBroadcaster = twitchchannel === context.username;
        if (isBroadcaster) {
            getToggled()
            client.action(twitchchannel, `Live Status: ${isAlreadyLive}`);
        } else {
        client.action(twitchchannel, "Sorry! You're not allowed to do that.");
        }
    }
    if (commandName === 'so') { // -- Shoutout Command --
        let isBroadcaster = twitchchannel === context.username;
        if (isBroadcaster) {
            var so;
            var person;
                if (msg.includes("@")){ //Checks and removes the mention.
                    person = msg.substring(4);
                    so = msg.substring(5);
                } else {
                    so = msg.substring(4);
                    person = '@'+so;
                }
                client.action(twitchchannel, `Be sure to check out my good friend: ${person} and his channel https://twitch.tv/${so}`)
            } else {
                client.action(twitchchannel, "Sorry! You're not allowed to do that. ");
            }
    }
    if (commandName === 'addcmd'){ //Add Custom Commands
        let isBroadcaster = twitchchannel === context.username;
        if (isBroadcaster) {
        // console.log(`add command here`)
        var s; //The resulting command response.
        for (var x in args) {
            if (x != 0) { 
                if (x == 1) {
                    s = `${args[x]}`
                } else {
                    s += ` ${args[x]}`;
                }
            }
        }
        if (s !== undefined) {
        var invcommand = args[0].toLowerCase();
        var sqlcommand = `INSERT INTO commands (command, response) VALUES ("${invcommand}", "${s}")`;
        pool.getConnection(function(err, connection){
            if (err) throw err;
            connection.query(sqlcommand, function (err, result){
                if (err) throw err;
                });
                connection.query("SELECT COUNT(command) AS cmdnum FROM commands", function (err, result){
                    console.log(result)
                    console.log(count = result[0].cmdnum);
                    client.action(twitchchannel, `added command #${count}: !${args[0]}`);
                    connection.release();
                });
            });
            getCommandsFromDB();
        }
        }
    }
    if (commandName === 'loadcmds'){
        let isBroadcaster = twitchchannel === context.username;
        if (isBroadcaster) {
            getCommandsFromDB();
        } else {
            client.say(twitchchannel, `Sorry, you're not allowed to use that command!`);
        }
    }
    if (commandName === 'delfilter'){
        let isBroadcaster = twitchchannel === context.username;
        if (isBroadcaster) {
            if (args[0] != undefined) {
                deleteFromFilter(args[0]);
        }
        }
    }
    if (commandName === 'addfilter'){
        let isBroadcaster = twitchchannel === context.username;
        if (isBroadcaster) {
            if (args[0] != undefined) {
                addToFilter(args[0]);
            }
        }
    }
    if (commandName === 'permit') {
        let isBroadcaster = twitchchannel === context.username;
        if (isBroadcaster) {
            if (args[0] != undefined) {
                AddToExceptionWithTimeout(args[0]);
            }
        }
    }
// END
    }
};
