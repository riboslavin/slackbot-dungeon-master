var request = require('request');
var fs = require('fs');

module.exports = function (req, res, next) {
  // constants
  var command = "Derfin"; //default command lists Derfin's spells
  var output = "Character or spell not found.";
  var obj = JSON.parse(fs.readFileSync('spellbook.json', 'utf8'));
  var botPayload = {};

  if (req.body.text) {
    // regex match
    matches = req.body.text.match(/^([a-zA-Z\s]{1,})$/);

    //convert captures to variables
    if (matches && matches[1]) {
      command = matches[1];
    } else {
      // send error message back to user if input is bad
      return res.status(200).send('Enter a single character name or spell name, case-sensitive.');
    }
  }
  
  //define individual command behavior
  switch (command) {
    case "Derfin":
      output = "";
      for (var level in obj.spellbook.Derfin) {
        output += "Level " + level + ":\n";
        output += obj.spellbook.Derfin.One;
        //for (var spell in obj.spellbook.Derfin[level]) {
        //  output += spell + "\n";
        //}
      }
      break;
    case "Jack":
      output = "";
      for (var level in obj.spellbook.Jack) {
        output += "Level " + level + ":\n";
        for (var spell in obj.spellbook.Jack[level]) {
          output += spell + "\n";
        }
      }
      break;
    case "Tor":
      output = "";
      for (var level in obj.spellbook.Tor) {
        output += "Level " + level + ":\n";
        for (var spell in obj.spellbook.Tor[level]) {
          output += spell + "\n";
        }
      }
      break;
  }

  // write response message and add to payload
  botPayload.text = req.body.user_name + ' requested \"' + command + '\":\n' + output;

  botPayload.username = 'spellbot';
  botPayload.channel = req.body.channel_id;
  botPayload.icon_emoji = ':fireworks:';

  // send dice roll
  send(botPayload, function (error, status, body) {
    if (error) {
      return next(error);

    } else if (status !== 200) {
      // inform user that our Incoming WebHook failed
      return next(new Error('Incoming WebHook: ' + status + ' ' + body));

    } else {
      return res.status(200).end();
    }
  });
}

function send (payload, callback) {
  var path = process.env.INCOMING_WEBHOOK_PATH;
  var uri = 'https://hooks.slack.com/services' + path;

  request({
    uri: uri,
    method: 'POST',
    body: JSON.stringify(payload)
  }, function (error, response, body) {
    if (error) {
      return callback(error);
    }

    callback(null, response.statusCode, body);
  });
}