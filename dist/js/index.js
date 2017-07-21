"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var waitSeconds = function waitSeconds(time) {
  return new _promise2.default(function (resolve, reject) {
    console.log("doing");
    return setTimeout(function () {
      resolve();
    }, time);
  });
};

(async function () {
  console.log("start");
  await waitSeconds(3000);
  console.log("end");
})();
"use strict";

var waitSeconds = function waitSeconds() {
  // alert("all2.js");
};

waitSeconds();