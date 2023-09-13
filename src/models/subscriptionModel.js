const subscriptions = {};

export function createNewSubscription(userId, searchKeyWords) {
  if (subscriptions[userId]) {
    subscriptions[userId].searchKeyWords.push(searchKeyWords)
  } else {
    subscriptions[userId] = { searchKeyWords: [ searchKeyWords ] };
  }
}

export function getListSubscriptionByUserId(userId) {
    return subscriptions[userId]?.searchKeyWords;
}

export function getSubscriptionByUserIdAndIndex(userId, index) {
    return subscriptions[userId]?.searchKeyWords[index];
}
