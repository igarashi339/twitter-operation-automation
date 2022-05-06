import { LikeTweet, SearchRecentTweetsWithoutRetweets } from "./TwitterHandler"
import { GetFunctionInfo, GetNGWordList } from "./Utilities"

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

  // NGワードのリストを取得
  const ngWordList = GetNGWordList()

  // 各行に対していいねを実行する
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
    const likeTargetTweetList = ngWordFilteredTweets.slice(0, count)

    // 取得したツイートをいいねする
    for (const { tweetId } of likeTargetTweetList) {
      LikeTweet(tweetId)
    }
  })
}

/**
 * ツイート本文にNGワードを含むツイートを除外する。
 */
function FilterNgTweet(tweets, ngWordList) {
  console.log(tweets)
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