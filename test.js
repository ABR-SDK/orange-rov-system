var fs = require('fs');
var path = require('path');

fs.readdir(__dirname,function(err,files){
	console.log(files);
	var filed = files.filter(function(file) {
		return fs.statSync(path.join(__dirname, file)).isDirectory();
	})
	console.log(filed);
});