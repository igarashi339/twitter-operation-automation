import { FormatDate, GetFunctionInfo, GetNGWordList } from "./Utilities"
import { GetAllData, AddData } from "./SpreadSheatHandler"
import { GetUserInfo, SearchRecentTweetsWithoutRetweets, FollowUser } from "./TwitterHandler"

export function ExecFollow() {
  try {
    ExecFollowImpl()
  } catch (e) {
    console.log(e.message)
  }
}

function ExecFollowImpl() {
  // フォローの設定を取得する
  const { isOn, rows } = GetFunctionInfo("フォロー")

  // 全体設定でフォロー機能がOFFになっている場合は何もしないで終了する
  if (!isOn) {
    return
  }

  // NGワードのリストを取得
  const ngWordList = GetNGWordList()

  // 各行に対してフォローを実行する
  rows.forEach(({ isValid, query, count }) => {
    // アクティブ時間でなければ何もしないで終了する(未入力チェックも行う)
    if (!isValid) {
      return
    }

    // キーワードをツイートしている人を取得する
    const tweets = SearchRecentTweetsWithoutRetweets(query)

    // 対象外のツイートを取り除く
    const filteredTweets = FilterRecentTweets(tweets)

    // ツイートからユーザ情報にする
    const userInfo = ConvertRecentTweetsToUserInfo(filteredTweets)

    // NG情報を含んでいるユーザを排除する
    const okUserInfo = FilterNgUserInfo(userInfo, ngWordList)

    // フォロー返しをしてくれそうな人に絞って、ついでに1回あたりの実行数に絞る
    const shouldFollowUsers = okUserInfo.filter(user => ShouldFollow(user)).slice(0, count)

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
 * ・一度フォローしたことがあるユーザ
 */
function FilterRecentTweets(recentTweets) {
  // スプレッドシートに書いてある人(一度フォローした人)を除く
  const followedUsers = GetFollowedUsers()
  const tweets = recentTweets.filter(({ authorId }) => !followedUsers.some(({ userId }) => userId == authorId))

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

/**
 * ユーザ名、およびプロフィールにNGワードを含むユーザを除去する。
 */
function FilterNgUserInfo(userInfo, ngWordList) {
  const filterNGUser = (user, ngWordList) => {
    for (const ngWord of ngWordList) {
      if (user.name.indexOf(ngWord) !== -1) {
        return false
      }
      if (user.description.indexOf(ngWord) !== -1) {
        return false
      }
    }
    return true
  }
  return userInfo.filter(user => filterNGUser(user, ngWordList))
}