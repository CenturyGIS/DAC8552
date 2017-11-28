import { Gpio } from 'onoff';
import spi from 'spi-device';
import Promise from 'bluebird';
import Definitions from './definitions';

export class DAC8552 {

  /**
   * constructor - DAC8552
   *
   * @param  {object} config
   * @param  {number} [config.spiFrequency=976563] SPI clock rate (hZ).
   * @param  {number} [config.spiMode=1] SPI Mode
   * @return {DAC8552}
   */
  constructor(config) {

    const self = this;

    self.spiChannel = config.spiChannel;
    self.csPin = config.csPin;

    if (typeof config.spiChannel !== 'number') {
      throw new Error('SPI Channel not specified. Use config.spiChannel.');
    }
    if (!config.csPin) {
      throw new Error('Chip Select pin not specified. Use config.csPin.');
    }

    self.chipSelect = new Gpio(self.csPin, 'out');

    const defaults = {
      spiFrequency: 976563,
      spiMode: 1,
    };

    const conf = Object.assign({}, defaults, config);

    // TODO: add way to set these options as well
    const spiDeviceOpts = {
      mode: spi.MODE1,
      maxSpeedHz: conf.spiFrequency,
      noChipSelect: true,
    };

    this.device = spi.openSync(0, conf.spiChannel, spiDeviceOpts);
    this.device = Promise.promisifyAll(this.device);

    self.chipSelect.writeSync(1);
  }


  /**
   * _chipRelease - Private chip release
   *
   * @return {Promise}
   */
  _chipRelease() {
    return new Promise(resolve => this.chipSelect.write(1, resolve));
  }


  /**
   * _chipSelect - Private chip select
   *
   * @return {Promise}
   */
  _chipSelect() {
    return new Promise(resolve => this.chipSelect.write(0, resolve));
  }


  /**
   * reset - Reset DAC
   *
   * @return {Promise}  description
   */
  reset() {

    const s = this;

    return s._chipSelect()
      .then(() => {

        const message = [{
          sendBuffer: Buffer.from([0, 0, 0]),
          byteLength: 3,
          // receiveBuffer: new Buffer(3),
          // speedHz: 20000,
          // chipSelectChange: true,
          microSecondDelay: 2500,
        }];

        return this.device.transferAsync(message);
      })
      .catch((err) => {
        if (err) {
          console.error('error', err);
        }
      })
      .then(() => s._chipRelease());
  }

  sendValue(channel, value) {

    const s = this;
    return s._chipSelect()
      .then(() => {

        let firstByte;
        if (channel === 0) {
          firstByte = Definitions.DAC0;
        } else if (channel === 1) {
          firstByte = Definitions.DAC1 | 4;
        } else {
          throw new Error('invalid DAC channel specified (must be 0 or 1)');
        }

        const message = [{
          sendBuffer: Buffer.from([firstByte, value >> 8, value & 0xFF]),
          byteLength: 3,
          // speedHz: 20000,
          microSecondDelay: 25,
        }];

        return this.device.transferAsync(message);
      })
      .catch((err) => {
        if (err) {
          console.error('error', err);
        }
      })
      .then(() => s._chipRelease());
  }
}
