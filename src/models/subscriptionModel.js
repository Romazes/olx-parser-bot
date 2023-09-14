const subscriptions = {};

export function createNewSubscription(userId, searchKeyWords) {
  if (subscriptions[userId]) {
    subscriptions[userId].searchKeyWords.push(searchKeyWords);
  } else {
    subscriptions[userId] = { searchKeyWords: [searchKeyWords] };
  }
}

export function getListSubscriptionByUserId(userId) {
  return subscriptions[userId]?.searchKeyWords;
}

export function getSubscriptionByUserIdAndIndex(userId, index) {
  return subscriptions[userId]?.searchKeyWords[index];
}

export function deleteSubscriptionByUserIdAndIndex(userId, index) {
  if (
    subscriptions.hasOwnProperty(userId) &&
    subscriptions[userId].hasOwnProperty("searchKeyWords") &&
    index < subscriptions[userId].searchKeyWords.length
  ) {
    subscriptions[userId].searchKeyWords.splice(index, 1);
    return true;
  }
  return false;
}
