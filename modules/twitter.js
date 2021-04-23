const config = require("../key.json");
var Twitter = require('twitter');
const TwitterClient = new Twitter({
    consumer_key: config.apikey,
    consumer_secret: config.apisecretkey,
    access_token_key: config.accesstoken,
    access_token_secret: config.accesstokensecret
});

function sendTestTweet(tweetString){
    TwitterClient.post('statuses/update', {status: `${tweetString}`},  function(error, tweet, response) { // Twitter Integration
        if(error) throw error;
    });
}

module.exports.sendTestTweet = sendTestTweet;