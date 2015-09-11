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
      lowerCommand = command.toLowerCase();
    } else {
      // send error message back to user if input is bad
      return res.status(200).send('Enter a single character name or spell name, case-insensitive.');
    }
  }
  
  //define individual command behavior
  switch (lowerCommand) {
    case "derfin":
      output += "*Level 0:*\n";
      output += obj.spellbook.Derfin.Zero + "\n";
      //characterOutput("Derfin");
      break;
    case "jack":
      characterOutput("Jack");
      break;
    case "tor":
      characterOutput("Tor");
      break;
    case "eldritch blast":
      spellOutput("Tor", "Zero", "Eldritch Blast");
      break;
  }

  function spellOutput(character, level, spell) {
    output = "";
    output += '*' + spell + '*:\n';
    for (var key in obj.spellbook[character][level][spell]) {
      output += '*' + key + '*: ' + obj.spellbook[character][level][spell][key] + '\n';
    }
  }

  function characterOutput(character) {
    output = "";
    for (var level in obj.spellbook[character]) {
      output += "*Level " + level + ":*\n";
      for (var spell in obj.spellbook[character][level]) {
        output += spell + "\n";
      }
    }
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