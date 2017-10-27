# DAC8552

Digital to Analog conversion with DAC8552. Tested with Raspberry Pi 3 and [Waveshare High-Precision AD/DA Board](https://www.waveshare.com/wiki/High-Precision_AD/DA_Board).

![](http://www.ti.com/graphics/folders/partimages/DAC8552.jpg)

## Usage

```js
var dacConfig = {
  csPin: 16,
  spiChannel: 1,
};

var d = new DAC8552(dacConfig);
d.sendValue(0, 0xFFFF);
```
