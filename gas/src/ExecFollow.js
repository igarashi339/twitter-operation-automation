import { GetOnOffSetting, GetFunctionSettings, FormatDate, IsActive } from "./Utilities"
import { GetAllData, AddData} from "./SpreadSheatHandler"
import { GetUserInfo, SearchRecentTweets, FollowUser } from "./TwitterHandler"

export function ExecFollow() {
  try {
    ExecFollowImpl()
  } catch(e) {
    console.log(e.message)
  }
}

function ExecFollowImpl() {
  // 全体設定でフォロー機能がOFFになっている場合は何もしないで終了する
  if (GetOnOffSetting("フォロー") == "OFF") {
    return
  }

  // スプレッドシートからフォロー設定を取得する
  const followSettings = GetFunctionSettings("フォロー")

  // 一応複数行あってもいいようにしておく
  followSettings.forEach(row => {
    // アクティブ時間でなければ何もしないで終了する
    if (!IsActive(row)) {
      return
    }

    // キーワードをツイートしている人を取得する
    const query = row.keywords.join(" OR ")
    const recentTweets = SearchRecentTweets(query)

    // 対象外のツイートを取り除く
    const tweets = FilterRecentTweets(recentTweets)

    // ツイートからユーザ情報にする
    const userInfo = ConvertRecentTweetsToUserInfo(tweets)

    // フォロー返しをしてくれそうな人に絞って、ついでに1回あたりの実行数に絞る
    const shouldFollowUsers = userInfo.filter(user => ShouldFollow(user)).slice(0, row.count)

    // フォローしてスプレッドシートを更新する
    shouldFollowUsers.forEach(user => {
      // フォローする
      FollowUser(user.userId)

      // スプレッドシートを更新する
      const followDate = FormatDate(new Date())
      AddData("【編集禁止】フォロー済ユーザ", [[user.userId, followDate]])
    })
  })
}

/**
 * スプレッドシートからフォロー済みユーザを取得する
 */
function GetFollowedUsers() {
  const data = GetAllData("【編集禁止】フォロー済ユーザ")
  return data.map(row => ({
    userId: row[0],
    followDate: row[1]
  }))
}

/**
 * 対象外のツイートを取り除く。取り除くのは以下
 * ・リツイート
 * ・一度フォローしたことがあるユーザ
 */
function FilterRecentTweets(recentTweets) {
  // リツイートを除く
  const withoutRetweet = recentTweets.filter(tweet => typeof tweet.referenced_tweets === "undefined")

  // スプレッドシートに書いてある人(一度フォローした人)を除く
  const followedUsers = GetFollowedUsers()
  const tweets = withoutRetweet.filter(({ authorId }) => !followedUsers.some(({ userId }) => userId == authorId))

  return tweets
}

/**
 * ツイートリストからユーザ情報に変換する
 */
function ConvertRecentTweetsToUserInfo(recentTweets) {
  return recentTweets.reduce((acc, cur) => {
    if (!acc.some(user => user.userId == cur.authorId)) {
      const info = GetUserInfo(cur.authorId)
      acc.push(info)
    }
    return acc
  }, [])
}

/**
 * フォローするべきユーザか判断する
 * ひとまずフォロー/フォロワー比で判断する
 * ゆくゆくは他の条件も足すかも
 */
function ShouldFollow({ followersCount, followingCount }) {
  return followingCount / followersCount > 0.6 ? true : false
}