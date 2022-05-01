import { GetCommonSetting } from "./Utilities"
import { GetSelfFollowing, GetSelfFollower, UnfollowUser } from "./TwitterHandler"
import { GetAllData } from "./SpreadSheatHandler"

export function ExecUnfollow() {
  try {
    ExecUnfollowImpl()
  } catch(e) {
    console.log(e.message)
  }
}

function ExecUnfollowImpl() {
  // 全体設定でアンフォロー機能がOFFになっている場合は何もしないで終了する
  if (GetCommonSetting("アンフォロー") == "OFF") {
    return
  }

  // フォロバされていないユーザのIDを取得
  const following = GetSelfFollowing()
  const follower = GetSelfFollower()
  const notFollowBackedUsers = following.filter(x => !follower.includes(x))

  // 一定以上前にフォローされたユーザをアンフォローする
  const unfollowTargetDate = 7
  const allFollowingData = GetAllData("【編集禁止】フォロー済ユーザ")
  const todayObj = new Date()
  const followingDataDict = allFollowingData.reduce(
    (acc, cur) => {
      acc[cur[0]] = cur[1]
      return acc
    }, {}
  )
  for (const userId of notFollowBackedUsers) {
    const userIdStr = String(userId)

    // スプレッドシートに記載のないユーザはスキップ
    if ( !(userIdStr in followingDataDict)) {
      continue
    }
    const dateObj = Date.parse(followingDataDict[userIdStr])
    const diffMilliSec = todayObj - dateObj
    const diffDate = parseInt(diffMilliSec / 1000 / 60 / 60 / 24);
    if (diffDate >= unfollowTargetDate) {
      UnfollowUser(userId)
    }
  }
}