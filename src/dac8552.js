import wpi from 'wiring-pi';
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

    if (!config.spiChannel) {
      throw new Error('SPI Channel not specified. Use config.spiChannel.');
    }
    if (!config.csPin) {
      throw new Error('Chip Select pin not specified. Use config.csPin.');
    }

    wpi.wiringPiSetupPhys();
    wpi.pinMode(self.csPin, wpi.OUTPUT);
    wpi.digitalWrite(self.csPin, wpi.HIGH);

    const defaults = {
      spiFrequency: 976563,
      spiMode: 1,
    };

    const conf = Object.assign({}, defaults, config);

    const fd = wpi.wiringPiSPISetupMode(self.spiChannel, conf.spiFrequency, conf.spiMode);
    if (!fd) {
      throw new Error('Could not access SPI device file');
    }
  }

  _chipRelease() {
    if (this.csPin) {
      wpi.digitalWrite(this.csPin, wpi.HIGH);
    }
  }

  _chipSelect() {
    if (this.csPin) {
      wpi.digitalWrite(this.csPin, wpi.LOW);
    }
  }

  sendValue(channel, value) {
    this._chipSelect();

    const firstByte;
    if (channel === 0) {
      firstByte = Definitions.DAC0
    } else if (channel === 1) {
      firstByte = Definitions.DAC1;
    } else {
      throw new Error('invalid DAC channel specified (must be 0 or 1)');
    }

    wpi.wiringPiSPIDataRW(this.spiChannel, Buffer.from([firstByte]));
    wpi.wiringPiSPIDataRW(this.spiChannel, Buffer.from([value >> 8]));
    wpi.wiringPiSPIDataRW(this.spiChannel, Buffer.from([value & 0xFF]));
    this._chipRelease();
  }
}
