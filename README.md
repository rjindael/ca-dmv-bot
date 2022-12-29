# ca-dmv-bot

![License](https://img.shields.io/github/license/rjindael/ca-dmv-bot) ![Star](https://img.shields.io/github/stars/rjindael/ca-dmv-bot?style=social) ![Twitter](https://img.shields.io/twitter/follow/ca_dmv_bot?style=social) ![Mastodon](https://img.shields.io/mastodon/follow/109343781423154931?domain=https%3A%2F%2Fbotsin.space&style=social)

Social media bot that randomly posts [23,463 personalized license plate applications the California DMV received from 2015-2016](https://github.com/veltman/ca-license-plates).

Watch it live on the following platforms:
- Twitter: [@ca_dmv_bot](https://twitter.com/ca_dmv_bot)
- Mastodon: [@ca_dmv_bot@botsin.space](https://botsin.space/@ca_dmv_bot)
- Tumblr: [@ca-dmv-bot](https://www.tumblr.com/ca-dmv-bot)

## Data

The data ca-dmv-bot uses is sourced from [@veltman/ca-license-plates](https://github.com/veltman/ca-license-plates), which states;

- 23,463 personalized license plate applications that the [California DMV](https://dmv.ca.gov) received from 2015 through 2016
- These aren't **all** applications reviewed by the DMV during that timeframe; only applications that were flagged for additional review by the Review Committee
- Compiled from 458 Excel workbooks that the DMV prepared for a public records request

## Notes

- Uses Discord to manually approve plates (to ensure no obscene content gets posted, such as slurs)
- Uses GraphicsMagick (fork of ImageMagick) to generate images
- Does not include review reason codes for brevity purposes
- Made on a slow weekend; only ephemeral logging exists and there is little-to-no error checking

## Thanks

- Noah Veltman ([@veltman](https://github.com/veltman)) - Compiling the data that ca-dmv-bot uses
- Dylan ([@brickdylanfake](https://twitter.com/brickdylanfake)) - Creating a custom font for the bot to use as well as making the profile picture and banner
- kay ([@zyrnwtf](https://twitter.com/zyrnwtf)), gary ([@bararectangle](https://twitter.com/bararectangle)), jerd ([@jerdftw](https://twitter.com/jerdftw)), neb ([@briwaffles](https://twitter.com/briwaffles)), zetex ([@zetexkindasucks](https://twitter.com/zetexkindasucks)) - Moderation

## License

ca-dmv-bot is licensed under the MIT license. A copy of it [has been included](https://github.com/rjindael/ca-dmv-bot/blob/trunk/LICENSE) with ca-dmv.

ca-dmv-bot uses the [Cascadia Code](https://github.com/microsoft/cascadia-code) font, a project licensed under the SIL Open Font License (OFL).