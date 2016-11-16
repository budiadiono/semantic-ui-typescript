var _ = require('lodash')
var utils = require('./utils')
let _behaviors = require('../maps/behaviors.json')


module.exports = function (c) {
	let behaviors = _behaviors[c]
  _.each(behaviors, function (cb) {

    // build params
    let params = cb.name.match(/\((.+?)\)/)
    if (params && params.length) {
      cb.name = cb.name.substr(0, cb.name.length - params[0].length)
      cb.params = utils.stringToParams(params[1])
    }
  })
  return behaviors
}
