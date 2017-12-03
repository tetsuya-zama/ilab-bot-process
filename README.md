# ilab-bot-process

## 概要

指定された複数のLambda関数を実行するLambda関数

## 関数一覧

### join.js

'functions'に指定されたLambda関数に'event'で指定されたeventを引き渡して並列実行し、全ての戻り値を配列にして返す。

ただし、errorが発生した関数やnullを返した関数の戻り値は除外する。

***event***
```json
{
  "functions":[
    "japanese-bot",
    "english-bot",
    "noreply-bot",
  ],
  "event":{
    "message":"こんにちは"
  }
}
```

***各関数の戻り値***

* japanese-bot => "こんにちは"
* english-bot => "Hello"
* noreply-bot => null

***join.jsの戻り値***
```json
[
  "こんにちは","Hello"
]
```

### prior.js

'functions'に指定されたLambda関数に'event'で指定されたeventを引き渡して並列実行し、'priority'の数値が一番小さい関数の戻り値を返す。

ただし、errorが発生した関数やnullを返した関数の戻り値は除外する。

***event***
```json
{
  "functions":[
    {"name":"news-bot","priority":1},
    {"name":"wheather-bot","priority":2},
    {"name":"conversation-bot","priority":999}
  ],
  "event":{
    "message":"今日の天気は？"
  }
}
```

***各関数の戻り値***

* news-bot => null
* wheather-bot => "晴れです!"
* conversation-bot => "天気って何？"

***prior.jsの戻り値***

```js
"晴れです!"
```

### race.js

'functions'に指定されたLambda関数に'event'で指定されたeventを引き渡して並列実行し、最も早く値を返した関数の戻り値を返す。

ただし、errorが発生した関数やnullを返した関数の戻り値は除外する。

***event***
```json
{
  "functions":[
    "slow-function",
    "error-function",
    "fast-function"
  ],
  "event":{
    "data":"someArg"
  }
}
```

***各関数の戻り値と実行時間***

* slow-function => "I'm slow." (1500ms)
* error-function => ERROR (200ms)
* fast-function => "I'm fast." (400ms)

***race.jsの戻り値***

```js
"I'm fast."
```
