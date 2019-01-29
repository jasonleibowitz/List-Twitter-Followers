const fs = require('fs');
const axios = require('axios');
const Converter = require('json2csv').Parser;
const inquirer = require('inquirer');
const { Base64 } = require('js-base64');
require('dotenv').config();

const questions = [{
  type: 'input',
  name: 'username',
  message: 'What username do you want a list of followers for?',
}];

// Authenticate Client and get Bearer
async function getToken() {
  try {
    const { data } = await axios({
      url: 'https://api.twitter.com/oauth2/token?grant_type=client_credentials',
      method: 'post',
      headers: {
        Authorization: 'Basic ' + Base64.encode(`${process.env.CLIENT_KEY}:${process.env.CLIENT_SECRET}`),
      },
    });
    return data.access_token
  } catch (err) {
    throw(err);
  }
}

// Convert Friends JSON to CSV File
function convertFriendsToCSV(friends) {
  const parsedFriends = friends.map(friend => ({ name: friend.name, screenName: friend.screen_name, description: friend.description }));
  const parser = new Converter({ fields: ['name', 'screenName', 'description'] });
  return parser.parse(parsedFriends);
}

function saveCSVToFile(filename, data) {
  fs.writeFile(filename, data, 'utf8', function(err) {
    if (err) {
      throw (err);
    }
  })
}

async function getFriends(accessToken, username, cursor) {
  try {
    const { data } = await axios({
      url: `https://api.twitter.com/1.1/friends/list.json`,
      params: {
        cursor: cursor,
        screen_name: username,
        count: 200,
        skip_status: true,
        skip_user_entities: true,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
    });
    return data;
  } catch (err) {
    throw (err);
  }
}

async function main() {
  let friends = [];
  let cursor = -1;

  try {
    const { username } = await inquirer.prompt(questions);
    const accessToken = await getToken();

    // For info about cursor, see https://developer.twitter.com/en/docs/basics/cursoring
    while (cursor !== 0) {
      const { users, next_cursor } = await getFriends(accessToken, username, cursor);
      friends = friends.concat(users);
      cursor = next_cursor;
    }

    await saveCSVToFile(`./${username}-following.csv`, convertFriendsToCSV(friends));
    console.log(`Success! Saved ${friends.length} Twitter followers to ./${username}-following.csv`);
  } catch (err) {
    console.log('/// Main Error', err);
  }
}

main();
