# ca-dmv-bot

[![License](https://img.shields.io/github/license/rjindael/ca-dmv-bot)](https://github.com/rjindael/ca-dmv-bot/blob/trunk/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/ca_dmv_bot2?style=social)](https://twitter.com/ca_dmv_bot2)
[![Mastodon](https://img.shields.io/mastodon/follow/109343781423154931?domain=https%3A%2F%2Fbotsin.space&style=social)](https://botsin.space/@ca_dmv_bot)
[![Tumblr](https://img.shields.io/twitter/follow/ca-dmv-bot?logo=tumblr&style=social)](https://www.tumblr.com/ca-dmv-bot)
[![Bluesky](https://img.shields.io/twitter/follow/ca-dmv-bot.bsky.social?logo=bluesky&style=social)](https://bsky.app/profile/ca-dmv-bot.bsky.social)
[![Star](https://img.shields.io/github/stars/rjindael/ca-dmv-bot?style=social)](https://github.com/rjindael/ca-dmv-bot/stargazers)

Social media bot that randomly posts [35,509 personalized license plate applications the California DMV received from 2015-2017](https://github.com/21five/ca-license-plates).

Watch it live on the following platforms:

- Twitter: [@ca_dmv_bot2](https://twitter.com/ca_dmv_bot2)
- Mastodon: [@ca_dmv_bot@botsin.space](https://botsin.space/@ca_dmv_bot)
- Tumblr: [@ca-dmv-bot](https://www.tumblr.com/ca-dmv-bot)
- Bluesky: [@ca-dmv-bot.bsky.social](https://bsky.app/profile/ca-dmv-bot.bsky.social)

## Data

The data ca-dmv-bot uses is sourced from [@21five/ca-license-plates](https://github.com/21five/ca-license-plates), which states;

- 35,509 personalized license plate applications that the [California DMV](https://dmv.ca.gov) received from 2015 through 2017
- These aren't **all** applications reviewed by the DMV during that timeframe; only applications that were flagged for additional review by the Review Committee
- Compiled from 623 Excel workbooks that the DMV prepared for a public records request

## Notes

- Uses Discord to manually approve plates (to ensure no obscene content gets posted, such as slurs)
- Uses GraphicsMagick (fork of ImageMagick) to generate images
- Does not include review reason codes for brevity purposes
- Made on a slow weekend; only ephemeral logging exists and there is little-to-no error checking

## Thanks

- Noah Veltman ([@veltman](https://github.com/veltman)), 21five ([@21five_public](https://twitter.com/21five_public)) - Compiling the data that ca-dmv-bot uses
- Dylan ([@brickdylanfake](https://twitter.com/brickdylanfake)) - Creating a custom font for the bot to use as well as making the profile picture and banner

## License

ca-dmv-bot is licensed under the [MIT license](https://github.com/rjindael/ca-dmv-bot/blob/trunk/LICENSE). A copy of it has been included with ca-dmv-bot.

ca-dmv-bot uses the [Cascadia Code](https://github.com/microsoft/cascadia-code) font, a project licensed under the SIL Open Font License (OFL).
