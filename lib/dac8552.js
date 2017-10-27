'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DAC8552 = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wiringPi = require('wiring-pi');

var _wiringPi2 = _interopRequireDefault(_wiringPi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DAC8552 = exports.DAC8552 = function () {
  function DAC8552(config) {
    _classCallCheck(this, DAC8552);

    var self = this;

    _wiringPi2.default.wiringPiSetupPhys();
    self.spiChannel = config.spiChannel;
    self.csPin = config.csPin;
    _wiringPi2.default.pinMode(self.csPin, _wiringPi2.default.OUTPUT);
    _wiringPi2.default.digitalWrite(self.csPin, _wiringPi2.default.HIGH);
    // wpi.digitalWrite(16, wpi.HIGH);


    var defaults = {
      clkinFrequency: 30000000,
      spiFrequency: 976563,
      spiMode: 1,
      vRef: 2.5
    };

    var conf = Object.assign({}, defaults, config);

    var fd = _wiringPi2.default.wiringPiSPISetupMode(self.spiChannel, conf.spiFrequency, conf.spiMode);
    if (!fd) {
      throw new Error('Could not access SPI device file');
    }
  }

  _createClass(DAC8552, [{
    key: '_chipRelease',
    value: function _chipRelease() {
      if (this.csPin) {
        _wiringPi2.default.digitalWrite(this.csPin, _wiringPi2.default.HIGH);
      }
    }
  }, {
    key: '_chipSelect',
    value: function _chipSelect() {
      if (this.csPin) {
        _wiringPi2.default.digitalWrite(this.csPin, _wiringPi2.default.LOW);
      }
    }
  }, {
    key: 'sendValue',
    value: function sendValue(channel, value) {
      this._chipSelect();
      _wiringPi2.default.wiringPiSPIDataRW(this.spiChannel, Buffer.from([channel]));
      _wiringPi2.default.wiringPiSPIDataRW(this.spiChannel, Buffer.from([value >> 8]));
      _wiringPi2.default.wiringPiSPIDataRW(this.spiChannel, Buffer.from([value & 0xFF]));
      this._chipRelease();
    }
  }]);

  return DAC8552;
}();