import { GetAllData } from "./SpreadSheatHandler"
import { SearchRecentTweets, Retweet } from "./TwitterHandler"

export function ExecRetweet() {
  try {
    ExecRetweetImpl()
  } catch(e) {
    console.log(e)
  }
}

function ExecRetweetImpl() {
  const retweetSetting = GetRetweetInfoFromShreadSheet()

  // リツイート機能がOFFなら何もしない
  if (retweetSetting["retweetOn"] == "OFF") {
    return
  }

  // リツイート機能のアクティブ時間外なら何もしない
  if (!IsRetweetTargetTime(retweetSetting)) {
    return
  }

  // リツイート対象のツイートを取得する（リツイートは除外）
  const queryStr = GetRetweetTargetTweetQuery(retweetSetting)
  const retweetCandidateTweetList = SearchRecentTweets(queryStr)
  const retweetExcludeTweetList = retweetCandidateTweetList.filter(tweetInfo => tweetInfo["referenced_tweets"] == undefined)
  const retweetTargetTweetList = retweetExcludeTweetList.slice(0, retweetSetting["retweetNumPerExec"])

  // 取得したツイートをリツイートする
  for (const targetTweet of retweetTargetTweetList) {
    Retweet(targetTweet["tweetId"])
  }
}

/**
 * スプレッドシートからリツイート関連の設定を取得する。
 */
function GetRetweetInfoFromShreadSheet() {
  const overhaulSetting = GetAllData("全体設定")
  const retweetOn = overhaulSetting[9][1]
  const retweetSetting = GetAllData("いいね・リツイート・フォロー")
  return {
    "retweetOn": retweetOn,
    "startTimeStr": retweetSetting[1][1],
    "endTimeStr": retweetSetting[1][2],
    "retweetNumPerExec": retweetSetting[1][3],
    "keywordList": retweetSetting[1].slice(4, 9)
  }
}

/**
 * 現在時刻とリツイート機能有効時刻を比較し、リツイートすべき時刻ならtrueを返す。
 */
function IsRetweetTargetTime(retweetSetting) {
  const currentDate = new Date()
  const currentHour = currentDate.getHours()
  const startTime = Number(retweetSetting["startTimeStr"].replace("時", ""))
  const endTime = Number(retweetSetting["endTimeStr"].replace("時", ""))
  return startTime <= currentHour && currentHour <= endTime
}

/**
 * リツイート対象のツイートの検索クエリを返す。
 */
function GetRetweetTargetTweetQuery(retweetSetting) {
  const blankExcludedList = retweetSetting["keywordList"].filter(keyword => keyword != "")
  const queryStr = blankExcludedList.join(" OR ")
  return queryStr
}