import { CountText } from "./Utilities"

export function WriteWordCount(e) {

  // 編集されたシート名を取得する
  const sheet = e.source.getActiveSheet()
  const sheetName = sheet.getName()

  // 編集されたシートがツイートでないなら何もしない
  if (sheetName != "ツイート") {
    return
  }

  // 編集された範囲を取得する
  const { columnStart, columnEnd, rowStart, rowEnd } = e.range

  for (let i = rowStart; i <= rowEnd; i++) {
    for (let j = columnStart; j <= columnEnd; j++) {
      // ツイート本文列が編集されていた場合、文字カウント列に文字数を記載する
      if (j == 2) {
        const text = sheet.getRange(i, j).getValue()
        const count = CountText(text)

        // ツイート本文があれば文字数をセットし、なければ空をセット(削除)する
        sheet.getRange(i, j + 1).setValue(count ? count : '')
      }
    }
  }
}