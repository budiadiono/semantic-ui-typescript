var _ = require('lodash')
var jsdom = require('jsdom')
var fs = require('fs')
var jquery = fs.readFileSync('./node_modules/jquery/dist/jquery.js', 'utf-8')
var tsBuilder = require('./ts/builder')
let _components = require('./components.js')
let metaBuilder = require('./meta-builder')
var LogWriter = require('log-writer')
var beautify = require('js-beautify').js_beautify

jsdom.env({
  url: 'http://bikini.bottom.com',
  src: [ jquery ],
  done: function (err, window) {
    global.jQuery = global.$ = window.jQuery
    global.window = window
    global.document = window.document

    let writer = new LogWriter('./build-%s.log')

    writer.writeln('-'.repeat(120))
    writer.writeln(Date())
    writer.writeln('-'.repeat(120))
    
    let components = {}
    _.each(_components, function (c) {
      meta = metaBuilder(c).build()
      components[c] = meta.component
      writer.writeln(beautify(JSON.stringify(meta.log)))
    })

    tsBuilder(components).build(function (contents) {
      fs.writeFileSync('./output/semantic-ui.d.ts', contents)
    })

    writer.writeln('-'.repeat(120))
    writer.end()
  }
})
