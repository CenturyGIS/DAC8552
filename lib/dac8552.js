'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DAC8552 = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _onoff = require('onoff');

var _spiDevice = require('spi-device');

var _spiDevice2 = _interopRequireDefault(_spiDevice);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _definitions = require('./definitions');

var _definitions2 = _interopRequireDefault(_definitions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DAC8552 = exports.DAC8552 = function () {

  /**
   * constructor - DAC8552
   *
   * @param  {object} config
   * @param  {number} [config.spiFrequency=976563] SPI clock rate (hZ).
   * @param  {number} [config.spiMode=1] SPI Mode
   * @return {DAC8552}
   */
  function DAC8552(config) {
    _classCallCheck(this, DAC8552);

    var self = this;

    self.spiChannel = config.spiChannel;
    self.csPin = config.csPin;

    if (typeof config.spiChannel !== 'number') {
      throw new Error('SPI Channel not specified. Use config.spiChannel.');
    }
    if (!config.csPin) {
      throw new Error('Chip Select pin not specified. Use config.csPin.');
    }

    self.chipSelect = new _onoff.Gpio(self.csPin, 'out');
    // self.chipSelect = Promise.promisifyAll(chipSelect);
    var ads = new _onoff.Gpio(22, 'out');

    var defaults = {
      spiFrequency: 976563,
      spiMode: 1
    };

    var conf = Object.assign({}, defaults, config);

    // TODO: add way to set these options as well
    var spiDeviceOpts = {
      mode: _spiDevice2.default.MODE1,
      maxSpeedHz: conf.spiFrequency,
      noChipSelect: true
    };

    this.device = _spiDevice2.default.openSync(0, conf.spiChannel, spiDeviceOpts);
    this.device = _bluebird2.default.promisifyAll(this.device);

    self.chipSelect.writeSync(1);
    ads.writeSync(1);
  }

  _createClass(DAC8552, [{
    key: '_chipRelease',
    value: function _chipRelease() {
      var _this = this;

      return new _bluebird2.default(function (resolve) {
        return _this.chipSelect.write(1, resolve);
      });
    }
  }, {
    key: '_chipSelect',
    value: function _chipSelect() {
      var _this2 = this;

      return new _bluebird2.default(function (resolve) {
        return _this2.chipSelect.write(0, resolve);
      });
    }
  }, {
    key: 'reset',
    value: function reset() {
      var _this3 = this;

      var s = this;

      return s._chipSelect().then(function () {

        var message = [{
          sendBuffer: Buffer.from([0, 0, 0]),
          byteLength: 3,
          // receiveBuffer: new Buffer(3),
          speedHz: 20000,
          // chipSelectChange: true,
          microSecondDelay: 2500
        }];

        return _this3.device.transferAsync(message);
      }).catch(function (err) {
        if (err) {
          console.error('error', err);
        }
      }).then(function () {
        return s._chipRelease();
      });
    }
  }, {
    key: 'sendValue',
    value: function sendValue(channel, value) {
      var _this4 = this;

      var s = this;
      return s._chipSelect().then(function () {

        var firstByte = void 0;
        if (channel === 0) {
          firstByte = _definitions2.default.DAC0;
        } else if (channel === 1) {
          firstByte = _definitions2.default.DAC1 | 4;
        } else {
          throw new Error('invalid DAC channel specified (must be 0 or 1)');
        }

        var message = [{
          sendBuffer: Buffer.from([firstByte, value >> 8, value & 0xFF]),
          byteLength: 3,
          speedHz: 20000,
          microSecondDelay: 25
        }];

        return _this4.device.transferAsync(message);
      }).catch(function (err) {
        if (err) {
          console.error('error', err);
        }
      }).then(function () {
        return s._chipRelease();
      });
    }
  }]);

  return DAC8552;
}();