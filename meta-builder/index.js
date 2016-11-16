var _ = require('lodash')
var buildCallback = require('./buildCallback')
var buildBehavior = require('./buildBehavior')
var buildSettings = require('./buildSettings')
var utils = require('./utils')


module.exports = function (c) {
  return {
    build: function () {
      var component = {}
      component.name = c
      component.callbacks = buildCallback(c)
      component.settings = buildSettings(c)
      component.behaviors = buildBehavior(c)

      return assignProps(c, component)
    }
  }
}

function assignProps (name, component) {

  require('../node_modules/semantic-ui/dist/components/' + name + '.js')
  let fnSettings = window.$.fn[name].settings
  let fnSettingKeys = _.keys(fnSettings)
  let logs = []

  // add callbacks into to settings
  _.each(component.callbacks, function (c) {
    let cb = _.cloneDeep(c)
    cb.category = 'Callback'
    cb.isFunction = true
    component.settings.push(cb)
  })

  let componentSettingKeys = _.map(component.settings, function (s) { return s.name })

  // get unregistered / un-documented settings keys
  let unregisteredSettingKeys = _.filter(fnSettingKeys, function (k) { return componentSettingKeys.indexOf(k) < 0 })

  // get valid setting keys by validate it against real component object 
  let invalidSettingKeys = _.filter(componentSettingKeys, function (k) { return fnSettingKeys.indexOf(k) < 0 })

  // might have unresolved default value, but should be not
  let unresolvedDefaultValues = []

  // only use valid settings 
  component.settings = _.filter(component.settings, function (s) {
    return invalidSettingKeys.indexOf(s.name) < 0
  })

  // add unregistered/un-documented settings
  _.each(unregisteredSettingKeys, function(k){
    component.settings.push({
      name: k,
      module: name,
      category: '!!UN-DOCUMENTED!!',
      description: 'No documentation',
      type: 'any'
    })
  })

  // assign setting default values
  _.each(component.settings, function (s) {
    let fnSetVal = fnSettings[s.name]
    if (fnSetVal) {
      if (utils.isDom(fnSetVal)) {
        s.default = 'HTMLElement'
      } else if (_.isObject(fnSetVal)) {
        try {
          s.default = JSON.stringify(fnSetVal)
        } catch (error) {
          unresolvedDefaultValues.push(s.name)
        }
      } else {
        s.default = fnSetVal
      }
    }
  })

  

  return {
    component: component,
    log: {
      component: name,
      errors: {
        'Invalid Setting Keys': invalidSettingKeys,
        'Unregistered Setting Keys': unregisteredSettingKeys,
        'Unresolved Default Values': unresolvedDefaultValues
      }
    }
  }
}
