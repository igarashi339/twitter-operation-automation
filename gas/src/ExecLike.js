import { LikeTweet, SearchRecentTweetsWithoutRetweets } from "./TwitterHandler"
import { GetFunctionInfo } from "./Utilities"

export function ExecLike() {
  try {
    ExecLikeImpl()
  } catch (e) {
    console.log(e.message)
  }
}

function ExecLikeImpl() {
  // いいねの設定を取得する
  const { isOn, rows } = GetFunctionInfo("いいね")

  // 全体設定でいいね機能がOFFになっている場合は何もしないで終了する
  if (!isOn) {
    return
  }

  // 各行に対していいねを実行する
  rows.forEach(({ isValid, query, count }) => {
    // アクティブ時間でなければ何もしないで終了する(未入力チェックも行う)
    if (!isValid) {
      return
    }

    // キーワードをツイートしている人を取得する
    const tweets = SearchRecentTweetsWithoutRetweets(query)

    // 1回あたりの実行数に絞る
    const likeTargetTweetList = tweets.slice(0, count)

    // 取得したツイートをいいねする
    for (const { tweetId } of likeTargetTweetList) {
      LikeTweet(tweetId)
    }
  })
}