# Repo name

[![CLA assistant](https://cla-assistant.io/readme/badge/meshtastic/node-red-contrib-meshtastic)](https://cla-assistant.io/meshtastic/node-red-contrib-meshtastic)
[![Fiscal Contributors](https://opencollective.com/meshtastic/tiers/badge.svg?label=Fiscal%20Contributors&color=deeppink)](https://opencollective.com/meshtastic/)
[![Vercel](https://img.shields.io/static/v1?label=Powered%20by&message=Vercel&style=flat&logo=vercel&color=000000)](https://vercel.com?utm_source=meshtastic&utm_campaign=oss)

## Overview

A Node-RED node for decoding Meshtastic Protobufs

## Stats

![Alt](https://repobeats.axiom.co/api/embed/d5286c92852b6f1e335de09d76bb22ec5305bbc0.svg "Repobeats analytics image")

## Installation & Usage

```shell
pnpm i
pnpm build
```

## Updating from version 1.x.x to version 2.2.15 or newer

The data structures have changed in versions 2.2.15 from the data in versions 1.x.x. 

Message payloads from version 2 have the following data structure, where `decoded` is the transmitted message:

```
{
  "packet": {
    "from": 1234567890,
    "to": 9876543210,
    "channel": 0,
    "decoded": {
      "portnum": 5,
      "payload": {
        "errorReason": 0
      },
      "wantResponse": false,
      "dest": 0,
      "source": 0,
      "requestId": 2345678,
      "replyId": 0,
      "emoji": 0
    },
    "id": 56789012,
    "rxTime": 45678901,
    "rxSnr": 0,
    "hopLimit": 3,
    "wantAck": false,
    "priority": 120,
    "rxRssi": 0,
    "delayed": 0
  },
  "channelId": "LongFast",
  "gatewayId": "!abcd1234"
}
```

Note that `packet.payloadVariant` is no longer available. Decoded payloads are now available in `packet.decoded`, which retains the same data as `payloadVariant` in a different structure
