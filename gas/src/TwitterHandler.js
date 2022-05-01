import { GetAllData } from "./SpreadSheatHandler";

export function TwitterHandlerTest() {
}

/**
 * キーワードを指定して最近投稿されたツイートをリストで取得する。リツイートは取得しない。
 * Rate Limit: 180/15[分]
 * ref: https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
 */
export function SearchRecentTweets(query) {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);

  const maxResults = 50;
  const tweetFields = "author_id,referenced_tweets"
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=${maxResults}&tweet.fields=${tweetFields}`
  const response = JSON.parse(service.fetch(url, { "method": "get" }));
  return response["data"].map(x => ({
    "tweetId": x["id"],
    "authorId": x["author_id"],
    "text": x["text"],
    "referenced_tweets": x["referenced_tweets"]
  }))
}

/**
 * SearchRecentTweetsからリツイートを取り除いたものを返してくれる。
 */
export function SearchRecentTweetsWithoutRetweets(query) {
  const recentTweets = SearchRecentTweets(query)
  return recentTweets.filter(tweet => typeof tweet.referenced_tweets === "undefined")
}

/**
 * ユーザIDを指定して当該ユーザの情報を取得する。
 * Rate Limit: 900/15[分]
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
 */
export function GetUserInfo(userId) {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);

  const userFields = "id,name,username,protected,public_metrics"
  const url = `https://api.twitter.com/2/users/${userId}?user.fields=${userFields}`
  const response = JSON.parse(service.fetch(url, { "method": "get" }));
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
 * Rate Limit: 900/15[分]
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-by
 */
export function GetUserIdByUsername(username) {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);

  const url = `https://api.twitter.com/2/users/by?usernames=${username}`
  const response = JSON.parse(service.fetch(url, { "method": "get" }));
  return response["data"][0]["id"]
}

/**
 * ユーザIDを指定してユーザをフォローする。
 * Rate Limit: 50/15[分], 400/[日]
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/post-users-source_user_id-following
 */
export function FollowUser(userId) {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);
  const selfUserId = GetUserIdByUsername(secrets["selfUserName"])

  const url = `https://api.twitter.com/2/users/${selfUserId}/following`
  const options = {
    "method": "post",
    "muteHttpExceptions": true,
    'contentType': 'application/json',
    'payload': JSON.stringify({ target_user_id: userId })
  }
  const response = JSON.parse(service.fetch(url, options));
  console.log(response)
}

/**
 * ユーザIDを指定してユーザをアンフォローする。
 * Rate Limit: 50/15[分]
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/delete-users-source_id-following
 */
export function UnfollowUser(userId) {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);
  const selfUserId = GetUserIdByUsername(secrets["selfUserName"])

  const url = `https://api.twitter.com/2/users/${selfUserId}/following/${userId}`
  const options = {
    "method": "delete",
    "muteHttpExceptions": true
  }
  const response = JSON.parse(service.fetch(url, options));
  console.log(response)
}

/**
 * ツイートIDを指定してツイートをいいねする。
 * Rate Limit: 50/15[分]
 * ref: https://developer.twitter.com/en/docs/twitter-api/tweets/likes/api-reference/post-users-id-likes
 */
export function LikeTweet(tweetId) {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);
  const selfUserId = GetUserIdByUsername(secrets["selfUserName"])

  const url = `https://api.twitter.com/2/users/${selfUserId}/likes`
  const options = {
    "method": "post",
    "muteHttpExceptions": true,
    'contentType': 'application/json',
    'payload': JSON.stringify({ tweet_id: tweetId })
  }
  const response = JSON.parse(service.fetch(url, options));
  console.log(response)
}

/**
 * ツイートIDを指定してリツイートする。
 * Rate Limit: 50/15[分]
 * ref: https://developer.twitter.com/en/docs/twitter-api/tweets/retweets/api-reference/post-users-id-retweets
 */
export function Retweet(tweetId) {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);
  const selfUserId = GetUserIdByUsername(secrets["selfUserName"])

  const url = `https://api.twitter.com/2/users/${selfUserId}/retweets`
  const options = {
    "method": "post",
    "muteHttpExceptions": true,
    'contentType': 'application/json',
    'payload': JSON.stringify({ tweet_id: tweetId })
  }
  const response = JSON.parse(service.fetch(url, options));
  console.log(response)
}

/**
 * ツイートを投稿する。また、投稿したツイートのIDを返却する。
 * Rate Limit: 200/15[分]
 * todo: 画像をツイートできるようにする。
 * ref: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
 */
export function CreateTweet(tweetText) {
  return CreateReplyTweet(tweetText, undefined)
}

/**
 * ツイートを投稿する。また、投稿したツイートのIDを返却する。
 * リプライでないツイートの場合reply_tweet_idにはundefinedを指定する。
 * Rate Limit: 200/15[分]
 * todo: 画像をツイートできるようにする。
 * ref: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
 */
export function CreateReplyTweet(tweetText, reply_tweet_id) {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);

  const endpoint = "https://api.twitter.com/2/tweets";
  var payload = {
    text: tweetText
  }
  if (reply_tweet_id != undefined) {
    payload["reply"] = { in_reply_to_tweet_id: reply_tweet_id }
  }
  const options = {
    "method": "post",
    "muteHttpExceptions": true,
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  }
  const response = JSON.parse(service.fetch(endpoint, options))
  console.log(response)
  return response["data"]["id"]
}

/**
 * 自分自身がフォローしているユーザを一覧で返す。
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-following
 * RateLimit: 15回/15分
 * note: 
 * 現状の仕様では直近でフォローした1000のみ返す。（それ以上はpaginationの考慮が必要となる。）
 * リムーブするかチェックする対象としては直近1000人で十分の想定のためこの仕様としている。
 */
export function GetSelfFollowing() {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);
  const selfUserId = GetUserIdByUsername(secrets["selfUserName"])

  const url = `https://api.twitter.com/2/users/${selfUserId}/following?max_results=1000`
  const options = {
    "method": "get",
    "muteHttpExceptions": true
  }
  const response = JSON.parse(service.fetch(url, options));
  return response.data.map(x => x.id)
}

/**
 * 自分自身のフォロワーを一覧で返す。
 * ref: https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers
 * RateLimit: 15回/15分
 */
export function GetSelfFollower() {
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);
  const selfUserId = GetUserIdByUsername(secrets["selfUserName"])

  const url = `https://api.twitter.com/2/users/${selfUserId}/followers`
  const options = {
    "method": "get",
    "muteHttpExceptions": true
  }
  const response = JSON.parse(service.fetch(url, options));
  return response.data.map(x => x.id)
}

/**
 * スプレッドシートから秘匿情報を取得してdictで返す。
 */
function GetSecretsFromSpreadSheet() {
  const sheetName = "全体設定"
  const allData = GetAllData(sheetName)
  return {
    "selfUserName": allData[0][1],
    "apiKey": allData[1][1],
    "apiKeySecret": allData[2][1],
    "accessToken": allData[3][1],
    "accessTokenSecret": allData[4][1]
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

