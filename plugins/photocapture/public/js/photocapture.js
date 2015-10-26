(function(window,$,undefined) {

	var PhotoCapture = function PhotoCapture(cockpit) {
		var self = this;
		self.cockpit = cockpit;
		self.snapshots = [];

		self.listen = function listen() {
			
			self.cockpit.controller.bind("printScreen","click",function(){
				self.cockpit.socket.emit('snapshot');
			});

			self.cockpit.socket.on('photos-updated',function(data) {
				self.snapshots = data;
				console.log('log:' + self.snapshots);
			});

			self.cockpit.socket.on('photo-added',function(data) {
				self.snapshots.push(data);
				console.log('log:' + self.snapshots);
			});
		}

		return self;
	}

	window.Cockpit.plugins.push(PhotoCapture);

}(window,jQuery));
