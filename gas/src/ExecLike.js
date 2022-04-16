import { GetAllData } from "./SpreadSheatHandler"
import { SearchRecentTweets, LikeTweet } from "./TwitterHandler"

export function ExecLike() {
  const likeSetting = GetLikeInfoFromShreadSheet()

  // いいね機能がOFFなら何もしない
  if (likeSetting["likeOn"] == "OFF") {
    return
  }

  // いいね機能のアクティブ時間外なら何もしない
  if (!IsLikeTargetTime(likeSetting)) {
    return
  }

  // いいね対象のツイートを取得する（リツイートは除外）
  const queryStr = GetLikeTargetTweetQuery(likeSetting)
  const likeCandidateTweetList = SearchRecentTweets(queryStr)
  const retweetExcludeTweetList = likeCandidateTweetList.filter(tweetInfo => tweetInfo["referenced_tweets"] == undefined)
  const likeTargetTweetList = retweetExcludeTweetList.slice(0, likeSetting["likeNumPerExec"])

  // 取得したツイートをいいねする
  for (const targetTweet of likeTargetTweetList) {
    LikeTweet(targetTweet["tweetId"])
  }
}

/**
 * スプレッドシートからいいね関連の設定を取得する。
 */
function GetLikeInfoFromShreadSheet() {
  const overhaulSetting = GetAllData("全体設定")
  const likeOn = overhaulSetting[8][1]
  const likeSetting = GetAllData("いいね・リツイート・フォロー")
  return {
    "likeOn": likeOn,
    "startTimeStr": likeSetting[0][1],
    "endTimeStr": likeSetting[0][2],
    "likeNumPerExec": likeSetting[0][3],
    "keywordList": likeSetting[0].slice(4, 9)
  }
}

/**
 * 現在時刻といいね機能有効時刻を比較し、いいねすべき時刻ならtrueを返す。
 */
function IsLikeTargetTime(likeSetting) {
  const currentDate = new Date()
  const currentHour = currentDate.getHours()
  const startTime = Number(likeSetting["startTimeStr"].replace("時", ""))
  const endTime = Number(likeSetting["endTimeStr"].replace("時", ""))
  return startTime <= currentHour && currentHour <= endTime
}

/**
 * いいね対象のツイートの検索クエリを返す。
 */
function GetLikeTargetTweetQuery(likeSetting) {
  const blankExcludedList = likeSetting["keywordList"].filter(keyword => keyword != "")
  const queryStr = blankExcludedList.join(" OR ")
  return queryStr
}