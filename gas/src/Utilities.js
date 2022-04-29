import { GetAllData } from "./SpreadSheatHandler"
import twitter from "twitter-text"

/**
 * 全体設定から各機能のON/OFFを取得する
 */
export function GetOnOffSetting(key) {
  const settings = GetAllData("全体設定")
  const setting = settings.find(arr => arr[0] == key)
  return setting[1]
}

/**
 * 文字数チェック
 * npmモジュール「twitter-text」を使用する
 */
export function CountText(text) {
  return twitter.parseTweet(text).weightedLength
}

/**
 * いいね・リツイート・フォローの設定を取得する
 */
export function GetFunctionSettings(key) {
  const settings = GetAllData("いいね・リツイート・フォロー")
  const targetSettings = settings.filter(setting => setting[0] == key)
  return targetSettings.map(setting => ({
    startTime: setting[1].slice(0, -1),
    endTime: setting[2].slice(0, -1),
    count: setting[3],
    keywords: setting.slice(4).filter(keyword => keyword)
  }))
}

/**
 * いいね・リツイート・フォローの情報をいろいろ加工して返す
 */
export function GetFunctionInfo(key) {
  const onOff = GetOnOffSetting(key)
  const settings = GetFunctionSettings(key)
  const isOn = onOff == "ON"
  const rows = settings.map(setting => ({
    ...setting,
    isValid: IsValid(setting),
    query: setting.keywords.join(" OR ")
  }))
  return {
    isOn,
    rows
  }
}

/**
 * アクティブ時間かどうか判定する
 */
export function IsActive({ startTime, endTime }) {
  const currentTime = new Date().getHours()
  if (startTime <= currentTime && currentTime <= endTime) {
    return true
  }
  return false
}

/**
 * 有効かどうか判定する
 */
export function IsValid({ startTime, endTime, keywords, count }) {
  // 開始時間もしくは終了時間が未入力なら無効と判定する
  if (!startTime || !endTime) {
    return false
  }

  // アクティブ時間でなければ無効と判定する
  if (!IsActive({ startTime, endTime })) {
    return false
  }

  // キーワードが空なら無効と判定する
  if (!keywords.length) {
    return false
  }

  // 1回あたりの実行数が空なら無効と判定する
  if (!count) {
    return false
  }

  return true
}

/**
 * dateオブジェクトをYYYY-MM-DD形式にフォーマットする
 */
export function FormatDate(date) {
  const year = date.getFullYear()
  const month = ('00' + (date.getMonth() + 1)).slice(-2);
  const day = ('00' + date.getDate()).slice(-2);
  return (year + '-' + month + '-' + day);
}