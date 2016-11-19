var _ = require('lodash')
var _types = require('../maps/types.json')
var utils = require('../meta-builder/utils')
var beautify = require('js-beautify').js_beautify

module.exports = function (components) {
  var modules = [], jqueries = [], types = [], _allTypes = []

  var tsUtils = {
    field: function (setting) {
      return '\r\n' + setting.name + '?: ' + setting.type
    },

    func: function (setting) {
      var cb = '\r\n' + setting.name + '?('
      var params = []
      if (setting.params) {
        _.each(setting.params, function (prm, k) {
          params.push(k + ': ' + prm.type)
        })

        cb += params.join(', ')
      }

      return cb + ')'
    },

    comment: function (setting) {
      var cmt = '\r\n/**'

      if (_.isString(setting)) {
        cmt += '\r\n * ' + setting
      } else {
        cmt += '\r\n * ' + setting.description
        if (setting.category) {
          cmt += '\r\n * '
          cmt += '\r\n * Category: ' + setting.category
        }
        if (!setting.isDummy)
          cmt += '\r\n * '

        if (setting.params) {
          _.each(setting.params, function (prm, k) {
            cmt += '\r\n * @param {' + prm.type + '} ' + k
          })
        }

        if (setting.default) {
          cmt += '\r\n * @default ' + setting.default
        }

        if (setting.type) {
          if (setting.isFunction)
            cmt += '\r\n * @returns {' + this.fixType(setting.type) + '}'
          else
            cmt += '\r\n * @type {' + this.fixType(setting.type) + '}'
        }

        if (!setting.isDummy)
          cmt += '\r\n * @memberOf SemanticUI.' + this.pascalize(setting.module) + '.Settings'
      }
      return cmt + '\r\n */'
    },

    fixType: function (type) {
      if (!type) return 'any'
      if (type.indexOf('|') > -1) return type

      var matchType = _.find(_allTypes, function (t) {
        return t.endsWith(type)
      })

      if (matchType) {
        return 'SemanticUI.' + matchType
      }

      return type
    },

    wrap: function (key, contents) {
      return key + ' {\r\n' + contents + '\r\n\r\n}\r\n'
    },

    wrapNamespace: function (key, contents) {
      return this.wrap('namespace ' + this.pascalize(key), contents)
    },

    wrapInterface: function (key, contents) {
      return this.wrap('interface ' + this.pascalize(key), contents)
    },

    pascalize: function (moduleName) {
      return _.upperFirst(moduleName)
    }
  }

  return {
    build: function (done) {
      buildTypes()

      _.each(components, function (c) { 
        buildSettings(c)
        buildBehaviors(c)
      })

      var moduleStr = 'declare ' + tsUtils.wrapNamespace('SemanticUI', modules.join('\r\n\r\n'))
      var jqueryStr = tsUtils.wrapInterface('JQuery', jqueries.join('\r\n\r\n'))

      var contents = beautify(moduleStr + jqueryStr, { indent_size: 2 })
      if (done) done(header() + contents)      
    }

  }

  function header() {
    let pkg = require('../node_modules/semantic-ui/package.json')
    return `// Type definitions for ${pkg.name} ${pkg.version}
// Project: ${pkg.homepage}
// Definitions by: Budi Adiono <https://github.com/budiadiono/>
// Definitions: https://github.com/budiadiono/semantic-ui-typescript

`
  }

  function buildTypes () {
    var str = ''

    _.each(_types, function (values, k) {
      _.each(values, function (t) {
        var key = utils.translate(k + '.' + t.name)
        str += '\r\ntype ' + key + '= ' + t.value
        _allTypes.push(key)
      })
    })

    modules.push(str)
  }

  function buildSettings (component) {
    var str = ''
    _.each(component.settings, function (s) {
      str += '\r\n'
      str += tsUtils.comment(s)
      str += s.category === 'Callback' || s.isFunction ? tsUtils.func(s) : tsUtils.field(s)
    })

    str = tsUtils.wrapInterface('Settings', str)

    str += '\r\ntype SettingNames = '
    str += buildDummy(component.settings)
    _allTypes.push(tsUtils.pascalize(component.name) + '.SettingNames')

    if (component.behaviors && component.behaviors.length) {
      str += '\r\n\r\ntype BehaviorNames = '
      str += buildDummy(component.behaviors)
      _allTypes.push(tsUtils.pascalize(component.name) + '.BehaviorNames')
    }

    modules.push(tsUtils.wrapNamespace(component.name, str))
  }

  function buildDummy (sets) {
    var str = ''
    _.each(sets, function (b) {
      b.isDummy = true
      str += '\r\n\t' + tsUtils.comment(b)
      str += '\r\n\t' + "'" + b.name + "' | "
    })
    return str.substr(0, str.length - 2)
  }

  function buildBehaviors (component) {
    var str = ''

    if (component.behaviors && component.behaviors.length) {
      let name = 'SemanticUI.' + tsUtils.pascalize(component.name)

      str += '\r\n//' + component.name
      str += '\r\n' + tsUtils.comment('Initialize ' + name)
      str += '\r\n' + component.name + '(param?: ' + name + '.Settings): JQuery'

      str += '\r\n' + tsUtils.comment('Change ' + name + ' settings')
      str += '\r\n' + component.name + "(param: 'setting', settingName: " + name + '.SettingNames, value?: any): JQuery'

      _.each(component.behaviors, function (b) {
        str += '\r\n' + tsUtils.comment(b)
        str += '\r\n' + component.name + '(param: ' + "'" + b.name + "'"

        if (b.params) {
          str += ', '
          var prms = []
          _.each(b.params, function (p, k) {
            prms.push(k + ': ' + tsUtils.fixType(p.type))
          })
          str += prms.join(', ')
        }

        str += '): any'
      })

      jqueries.push(str)
    }
  }
}
