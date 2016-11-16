console.log('Build refs...')

var node_xj = require('xls-to-json')
var beautify = require('js-beautify').js_beautify
var jsonfile = require('jsonfile')
var _ = require('lodash')

var sheets = ['behaviors', 'types', 'settings', 'allSettings', 'guess', 'callbacks']

function parse (sheet) {
	console.log('parsing ' + sheet + '...')
  node_xj({
    input: './refs/docs.xlsx',
    output: null, // output json file
    sheet: sheet // specific sheetname 
  }, function (err, result) {
    if (err) {
      console.error(err)
    } else {
      var json = result[0].module === undefined ? result : _.groupBy(result, 'module')
      jsonfile.writeFile('./maps/' + sheet + '.json', json, {spaces: 2}, function (err) {
        if (err)
          console.error(err)
        else
          console.log('done parsing ' + sheet)
      })
    }
  })
}

_.each(sheets, function (sheet) {
	parse(sheet)
})