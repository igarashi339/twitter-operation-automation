import { Retweet, SearchRecentTweetsWithoutRetweets } from "./TwitterHandler"
import { GetFunctionInfo, GetNGWordList } from "./Utilities"

export function ExecRetweet() {
  try {
    ExecRetweetImpl()
  } catch (e) {
    console.log(e)
  }
}

function ExecRetweetImpl() {
  // リツイートの設定を取得する
  const { isOn, rows } = GetFunctionInfo("リツイート")

  // 全体設定でリツイート機能がOFFになっている場合は何もしないで終了する
  if (!isOn) {
    return
  }

  // NGワードのリストを取得
  const ngWordList = GetNGWordList()

  // 各行に対してリツイートを実行する
  rows.forEach(({ isValid, query, count }) => {
    // アクティブ時間でなければ何もしないで終了する(未入力チェックも行う)
    if (!isValid) {
      return
    }

    // キーワードをツイートしている人を取得する
    const tweets = SearchRecentTweetsWithoutRetweets(query)

    // NGキーワードを含んでいるツイートを除外
    const ngWordFilteredTweets = FilterNgTweet(tweets, ngWordList)

    // 1回あたりの実行数に絞る
    const retweetTargetTweetList = ngWordFilteredTweets.slice(0, count)

    // 取得したツイートをリツイートする
    for (const { tweetId } of retweetTargetTweetList) {
      Retweet(tweetId)
    }
  })
}

/**
 * ツイート本文にNGワードを含むツイートを除外する。
 */
 function FilterNgTweet(tweets, ngWordList) {
  const filterNgTweet = (tweet, ngWordList) => {
    for (const ngWord of ngWordList) {
      if (tweet.text.indexOf(ngWord) != -1) {
        return false
      }
    }
    return true
  }
  return tweets.filter(tweet => filterNgTweet(tweet, ngWordList))
}