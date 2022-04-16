import { GetOnOffSetting } from "./Utilities"

export function ExecUnfollow() {
  // 全体設定でアンフォロー機能がOFFになっている場合は何もしないで終了する
  if (GetOnOffSetting("アンフォロー") == "OFF") {
    return
  }

}