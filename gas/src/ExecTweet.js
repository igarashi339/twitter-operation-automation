import { GetAllData } from "./SpreadSheatHandler"
import { CreateTweet, CreateReplyTweet } from "./TwitterHandler"
import { GetCommonSetting } from "./Utilities"

export function ExecTweet() {
  try {
    ExecTweetImpl()
  } catch(e) {
    console.log(e.message)
  }
}

function ExecTweetImpl() {
  // 全体設定でツイート機能がOFFになっている場合は何もしないで終了する
  if (GetCommonSetting("ツイート") == "OFF") {
    return
  }

  // ツイートする
  const rows = GetAllData("ツイートグループ")
  const targetGroups = rows.filter(row => IsTargetGroup(row))
  targetGroups.forEach(group => {
    const targetTweets = GetTargetTweets(group)
    switch (group[1]) {
      case "ランダム":
        TweetRandom(targetTweets)
        break
      case "上から順に":
        TweetInOrder(targetTweets)
        break
      case "スレッド":
        TweetThread(targetTweets)
        break
    }
  })
}

/**
 * ツイート対象のグループか判断する
 */
function IsTargetGroup(group) {

  // 入力チェック
  // グループID、ツイート順序、曜日のうち、どれか一つでもに入力のものがあれば対象外とする
  if (group.slice(0, 3).includes("")) {
    return false
  }

  const today = GetCurrentDateForExecTweet()

  // 曜日チェック
  if (!dayOfWeekMaster[group[2]].includes(today.dayOfWeek)) {
    // 祝日の考慮
    if (today.isHoliday) {
      if (!group[2] == "土日祝") {
        return false
      }
    }
    else {
      return false
    }
  }

  // 時間チェック
  if (!group.slice(3).includes(today.time)) {
    return false
  }

  return true
}

/**
 * ツイート対象のグループに所属するツイートを取得する
 */
function GetTargetTweets(group) {
  const rows = GetAllData("ツイート")
  // ONかつツイートが空白でないかつツイート対象のグループに属している
  return rows.filter(row => row[0] == "ON" && row[1] != "" && row.slice(3).includes(group[0]))
}


/**
 * ツイート順序がランダムのときのツイート
 */
function TweetRandom(tweets) {
  let rest = [...tweets]
  const tmp = [...Array(tweets.length)].map(() => {
    const index = Math.floor(Math.random() * rest.length)
    const tweet = rest.splice(index, 1)
    const text = tweet.flat()[1]
    CreateTweet(text)
  })
}

/**
 * ツイート順序が上から順にのときのツイート
 */
function TweetInOrder(tweets) {
  tweets.forEach(tweet => {
    const text = tweet[1]
    CreateTweet(text)
  })
}

/**
 * ツイート順序がスレッドの時のツイート
 */
function TweetThread(tweets) {
  let tweetId
  tweets.forEach(tweet => {
    const text = tweet[1]
    tweetId = CreateReplyTweet(text, tweetId)
  })
}

/**
 * 現在日時を取得する
 */
function GetCurrentDateForExecTweet() {
  const date = new Date()
  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()]
  const time = date.getHours() + "時"

  // 祝日かどうかを判定する
  const id = "ja.japanese#holiday@group.v.calendar.google.com"
  const calendar = CalendarApp.getCalendarById(id);
  const events = calendar.getEventsForDay(date);
  const isHoliday = events.length > 0 ? true : false

  return {
    dayOfWeek,
    time,
    isHoliday
  }
}

/**
 * 曜日チェック用データ
 */
const dayOfWeekMaster = {
  "すべて": ["月", "火", "水", "木", "金", "土", "日"],
  "平日": ["月", "火", "水", "木", "金"],
  "土日祝": ["土", "日"],
  "月": ["月"],
  "火": ["火"],
  "水": ["水"],
  "木": ["木"],
  "金": ["金"],
  "土": ["土"],
  "日": ["日"]
}