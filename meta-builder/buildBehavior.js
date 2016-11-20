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

  // TODO: should we implement http://legacy.semantic-ui.com/module.html#/behavior ?

  if (!behaviors) behaviors = []
  if (!_.find(behaviors, function (cb) {
      return cb.name === 'destroy'
    })) {
    behaviors.push({
      'description': 'Removes all changes to the page made by initialization',
      'module': c.module,
      'name': 'destroy'
    })
  }

  return behaviors
}
