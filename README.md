# ca-dmv
![License](https://img.shields.io/github/license/rjindael/ca-dmv) ![Star](https://img.shields.io/github/stars/rjindael/ca-dmv?style=social)

Bot that randomly posts [23,463 personalized license plate applications the California DMV received from 2015-2016](https://github.com/veltman/ca-license-plates) to [Twitter](https://twitter.com/ca_dmv_bot) every so often.

Watch it live on Twitter [@ca_dmv_bot](https://twitter.com/ca_dmv_bot).

## Data

The data ca-dmv uses is sourced from [@veltman/ca-license-plates](https://github.com/veltman/ca-license-plates), which states;
- 23,463 personalized license plate applications that the [California DMV](https://dmv.ca.gov) received from 2015 through 2016
- These aren't **all** applications reviewed by the DMV during that timeframe; only applications that were flagged for additional review by the Review Committee
- Compiled from 458 Excel workbooks that the DMV prepared for someone else's public records request

## Notes

- Uses Discord to manually approve licenses (to ensure no obscene content gets posted that would break Twitter ToS)
- Posts plates to Twitter every hour or so; this is contingent on approval timeline
- Uses GraphicsMagick (fork of ImageMagick) to generate license plate images
- Does not include review reason codes for brevity purposes
- Made on a slow weekend; only ephemeral logging exists and there is little-to-no error checking

## Credits

Special thanks to Noah Veltman ([@veltman](https://github.com/veltman)) for the application dataset and to Kay ([@zyrnwtf](https://twitter.com/zyrnwtf)) for teaching me the ins and outs of the Twitter API.


## License

ca-dmv is licensed under the MIT license. A copy of it [has been included](https://github.com/rjindael/ca-dmv/blob/trunk/LICENSE) with ca-dmv.