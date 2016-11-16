var _ = require('lodash')
let _translates = require('./translates')
let _guess = require('../maps/guess.json')

module.exports = {
  guess: function (key, by) {
    let self = this
    let type = by == 'value' ? key : 'any'
    let guessed = _.find(_guess, function (g) {
      return g.target.trim().toLowerCase() == key.trim().toLowerCase() && g.by == by
    })

    if (guessed)
      type = guessed.value

    return this.translate(type)
  },

  translate: function (key) {
    if (!key) return 'any'
    key = key.trim()
    if (key.indexOf(',') > -1)
      // return "'" +  _.map(key.split(','), function (k) { return k.trim() }).join(' | ') + "'"
      return _.map(key.split(','), function (k) { return k.trim() }).join(' | ')

    return _translates[key.toLowerCase()] || key
  },

  stringToParams: function (paramStr) {
    let self = this
    let params = {}
    _.each(paramStr.split(','), function (v) {
      var name = v.trim(), type = undefined
      if (name.indexOf(':') > -1) {
        let prms = name.split(':')
        name = prms[0]
        type = prms[1]
      }
      
      params[name] = {
        type: self.resolveType(name, null, type)
      }
    })
    return params
  },

  resolveType(name, value, possibleValues) {
    let type = undefined
    if (possibleValues) type = this.translate(possibleValues)
    if (type === undefined && name) type = this.guess(name, 'name')
    if (type === undefined && value) type = this.guess(value, 'value')
    if (type === undefined) type = 'any'

    return type
  },

  isDom: function (val) {
    return _.isElement(val) || (val.$ && val.window)
  }

}
