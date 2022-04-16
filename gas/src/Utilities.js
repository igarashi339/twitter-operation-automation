import { GetAllData } from "./SpreadSheatHandler"
import twitter from "twitter-text"
// const twitter = require('twitter-text');

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
 * いいね・リツイート・フォローの情報を取得する
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
 * アクティブ時間かどうか判定する
 */
export function IsActive({ startTime, endTime }) {
  const currentTime = new Date().getHours()
  if (startTime <= currentTime && currentTime <= endTime) {
    return true
  }
  else {
    return false
  }
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