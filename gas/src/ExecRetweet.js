import { Retweet, SearchRecentTweetsWithoutRetweets } from "./TwitterHandler"
import { GetFunctionInfo } from "./Utilities"

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

  // 各行に対してリツイートを実行する
  rows.forEach(({ isValid, query, count }) => {
    // アクティブ時間でなければ何もしないで終了する(未入力チェックも行う)
    if (!isValid) {
      return
    }

    // キーワードをツイートしている人を取得する
    const tweets = SearchRecentTweetsWithoutRetweets(query)

    // 1回あたりの実行数に絞る
    const retweetTargetTweetList = tweets.slice(0, count)

    // 取得したツイートをリツイートする
    for (const { tweetId } of retweetTargetTweetList) {
      Retweet(tweetId)
    }
  })
}