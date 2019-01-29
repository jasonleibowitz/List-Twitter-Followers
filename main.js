const inquirer = require('inquirer');
const { getFollowers, getFriends, getToken } = require('./twitter-utils');
const { convertFriendsToCSV, saveCSVToFile } = require('./utils');

const questions = [{
  type: 'input',
  name: 'username',
  message: 'What username do you want a list of followers for?',
}, {
  type: 'list',
  name: 'type',
  message: 'What type of report do you want?',
  choices: [
    'Followers',
    'Following',
  ],
  filter: (val) => val.toLowerCase(),
}];

const dataTypes = {
  followers: getFollowers,
  following: getFriends,
}

async function main() {
  let friends = [];
  let cursor = -1;

  try {
    const { type, username } = await inquirer.prompt(questions);
    const accessToken = await getToken();

    // For info about cursor, see https://developer.twitter.com/en/docs/basics/cursoring
    while (cursor !== 0) {
      const { users, next_cursor } = await dataTypes[type](accessToken, username, cursor);
      friends = friends.concat(users);
      cursor = next_cursor;
    }

    await saveCSVToFile(`./${username}-${type}.csv`, convertFriendsToCSV(friends));
    console.log(`Success! Saved ${friends.length} Twitter followers to ./${username}-${type}.csv`);
  } catch (err) {
    console.log('/// Main Error', err);
  }
}

main();
