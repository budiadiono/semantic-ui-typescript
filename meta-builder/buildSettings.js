let _settings = require('../maps/settings.json')
let _allSettings = require('../maps/allSettings.json')
var _ = require('lodash')
var utils = require('./utils')

module.exports = function (c) {
  let allSettings = _.concat(_settings[c], _allSettings)
  let settings = _.filter(allSettings, function (s) {		return s !== undefined	})

  _.each(settings, function (s) {

    // build params
    let params = s.name.match(/\((.+?)\)/)
    if (params && params.length) {
      s.name = s.name.substr(0, s.name.length - params[0].length)
      s.params = utils.stringToParams(params[1])
    }

		// set setting type
		s.type = utils.resolveType(s.name, s.default, s.values)
    if (s.type.startsWith('Function')) {
      s.isFunction = true
    }

    // fix error setting name
    if (s.name === 'errors') s.name = 'error'

  })

  return settings
}
