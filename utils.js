const fs = require('fs');
const Converter = require('json2csv').Parser;

// Convert Friends JSON to CSV File
function convertFriendsToCSV(friends) {
  const parsedFriends = friends.map(friend => ({ name: friend.name, screenName: friend.screen_name, description: friend.description }));
  const parser = new Converter({ fields: ['name', 'screenName', 'description'] });
  return parser.parse(parsedFriends);
}

function saveCSVToFile(filename, data) {
  fs.writeFile(filename, data, 'utf8', function(err) {
    if (err) {
      throw err;
    }
  })
}

module.exports = {
  convertFriendsToCSV,
  saveCSVToFile,
};
