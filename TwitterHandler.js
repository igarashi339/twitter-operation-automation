function Test() {
  CreateTweet("サンプルツイート")
}

/**
 * ツイートを投稿する。
 */
function CreateTweet(tweetText){
  const endpoint = "https://api.twitter.com/2/tweets";
  const secrets = GetSecretsFromSpreadSheet()
  const service = GetService(secrets);
  const message = {
    text: tweetText
  }
  const options = {
    "method": "post",
    "muteHttpExceptions" : true,
    'contentType': 'application/json',
    'payload': JSON.stringify(message)
  }
  const response = JSON.parse(service.fetch(endpoint, options));
  console.log(response)
}
 
/**
 * スプレッドシートから下記を取得してdictで返す。
 * API Key
 * API Key Secret
 * Access Token
 * Access Token Secret
 */
function GetSecretsFromSpreadSheet() {
  const sheetName = "TwitterAPIキー"
  const allData = GetAllData(sheetName)
  return {
    "apiKey": allData[0][0],
    "apiKeySecret": allData[0][1],
    "accessToken": allData[0][2],
    "accessTokenSecret": allData[0][3]
  }
}

/**
 * サービスを取得する。
 * ref: https://github.com/googleworkspace/apps-script-oauth1/blob/master/samples/Semantics3.gs
 */
function GetService(secrets) {
  return OAuth1.createService('Semantics3')
      .setConsumerKey(secrets["apiKey"])
      .setConsumerSecret(secrets["apiKeySecret"])
      .setAccessToken(secrets["accessToken"], secrets["accessTokenSecret"]);
}
