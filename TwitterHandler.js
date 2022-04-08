function Test() {
}

const secrets = GetSecretsFromSpreadSheet()
const service = GetService(secrets);
const selfUserId = GetUserIdByUsername(secrets["selfUserName"])

/**
 * キーワードを指定して最近投稿されたツイートをリストで取得する。
 * ref: https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
 */
function SearchRecentTweets(query) {
  const maxResults = 50;
  const tweetFields = "author_id"
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=${maxResults}&tweet.fields=${tweetFields}`
  const response = JSON.parse(service.fetch(url, {"method":"get"}));
  return response["data"].map(x => ({
    "tweetId": x["id"],
    "authorId": x["author_id"],
    "text": x["text"]
  }))
}

/**
 * ユーザIDを指定して当該ユーザの情報を取得する。
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
 */
function GetUserInfo(userId) {
  const userFields = "id,name,username,protected,public_metrics"
  const url = `https://api.twitter.com/2/users/${userId}?user.fields=${userFields}`
  const response = JSON.parse(service.fetch(url, {"method":"get"}));
  return {
    "userId": response["data"]["id"],
    "username": response["data"]["username"],
    "name": response["data"]["name"],
    "protected": response["data"]["protected"],
    "followersCount": response["data"]["public_metrics"]["followers_count"],
    "followingCount": response["data"]["public_metrics"]["following_count"]
  }
}

/**
 * ユーザネームを指定して当該ユーザIDを取得する。
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by
 */
function GetUserIdByUsername(username) {
  const url = `https://api.twitter.com/2/users/by?usernames=${username}`
  const response = JSON.parse(service.fetch(url, {"method":"get"}));
  return response["data"][0]["id"]
}

/**
 * ユーザIDを指定してユーザをフォローする。
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/post-users-source_user_id-following
 */
function FollowUser(userId) {
  const url = `https://api.twitter.com/2/users/${selfUserId}/following`
  const options = {
    "method": "post",
    "muteHttpExceptions" : true,
    'contentType': 'application/json',
    'payload': JSON.stringify({ target_user_id: userId })
  }
  const response = JSON.parse(service.fetch(url, options));
  console.log(response)
}

/**
 * ユーザIDを指定してユーザをアンフォローする。
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/delete-users-source_id-following
 */
function UnfollowUser(userId) {
  const url = `https://api.twitter.com/2/users/${selfUserId}/following/${userId}`
  const options = {
    "method": "delete",
    "muteHttpExceptions" : true
  }
  const response = JSON.parse(service.fetch(url, options));
  console.log(response)
}

/**
 * ツイートIDを指定してツイートをいいねする。
 * ref: https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/post-users-id-likes
 */
function LikeTweet(tweetId) {
  const url = `https://api.twitter.com/2/users/${selfUserId}/likes`
  const options = {
    "method": "post",
    "muteHttpExceptions" : true,
    'contentType': 'application/json',
    'payload': JSON.stringify({ tweet_id: tweetId })
  }
  const response = JSON.parse(service.fetch(url, options));
  console.log(response)
}

/**
 * ツイートIDを指定してリツイートする。
 * ref: https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/post-users-id-retweets
 */
function Retweet(tweetId) {
  const url = `https://api.twitter.com/2/users/${selfUserId}/retweets`
  const options = {
    "method": "post",
    "muteHttpExceptions" : true,
    'contentType': 'application/json',
    'payload': JSON.stringify({ tweet_id: tweetId })
  }
  const response = JSON.parse(service.fetch(url, options));
  console.log(response)
}

/**
 * ツイートを投稿する。また、投稿したツイートのIDを返却する。
 */
function CreateTweet(tweetText){
  const endpoint = "https://api.twitter.com/2/tweets";
  const options = {
    "method": "post",
    "muteHttpExceptions" : true,
    'contentType': 'application/json',
    'payload': JSON.stringify({ text: tweetText })
  }
  const response = JSON.parse(service.fetch(endpoint, options))
  return response["data"]["id"]
}
 
/**
 * スプレッドシートから秘匿情報を取得してdictで返す。
 */
function GetSecretsFromSpreadSheet() {
  const sheetName = "Twitter秘密情報"
  const allData = GetAllData(sheetName)
  return {
    "selfUserName": allData[0][0],
    "apiKey": allData[0][1],
    "apiKeySecret": allData[0][2],
    "accessToken": allData[0][3],
    "accessTokenSecret": allData[0][4]
  }
}

/**
 * サービスを取得する。
 * ref: https://github.com/googleworkspace/apps-script-oauth1/blob/master/samples/Semantics3.gs
 */
function GetService(secrets) {
  return OAuth1.createService('Semantics3')
      .setConsumerKey(secrets["apiKey"])
      .setConsumerSecret(secrets["apiKeySecret"])
      .setAccessToken(secrets["accessToken"], secrets["accessTokenSecret"]);
}

