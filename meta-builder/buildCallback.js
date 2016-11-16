var _ = require('lodash')
var utils = require('./utils')
let _callbacks = require('../maps/callbacks.json')


module.exports = function (c) {
	let callbacks = _callbacks[c]
  _.each(callbacks, function (cb) {

    // build params
    let params = cb.name.match(/\((.+?)\)/)
    if (params && params.length) {
      cb.name = cb.name.substr(0, cb.name.length - params[0].length)
      cb.params = utils.stringToParams(params[1])
      
      // callback type is always any
      cb.type = 'any'
    }
  })
  return callbacks
}
