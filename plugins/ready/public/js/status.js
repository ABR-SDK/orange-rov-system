(function(window,$,undefined) {

	var StatusDisplay = function StatusDisplay(cockpit) {
		var self = this;
		self.cockpit = cockpit;

		self.FPSMeter = function FPSMeter(controller) {
			var _self = this;
			var _interval;
			var _fpscount = 1000;
			var _lastPingTime = 0;

			_self.tickStart = function tickStart() {
				if(_lastPingTime === 0) {
					_lastPingTime = new Date().getTime();
				}else
					_fpscount = 1000;
			};

			_self.tick = function tick() {
				_fpscount = (new Date().getTime()) - _lastPingTime;
				_lastPingTime = 0;
			};

			_self.start = function start() {
				_interval = setInterval(function () {
					controller.invoke('connection','draw',_fpscount);
				},500);
			};

			_self.stop = function stop() {
				clearInterval(_interval);
			};

			return _self;
		}

		self.listen = function listen() {
			
			var meter = new self.FPSMeter(self.cockpit.controller);

			meter.start();

			setInterval(function() {
				var startTime = new Date().getTime();
				self.cockpit.socket.emit("ping",parseInt(startTime));

				meter.tickStart();
			},500);

			self.cockpit.socket.on("pong",function(id) {
				var endTime = new Date();
				//self.cockpit.controller.invoke('connection','draw',endTime.getTime() - id);
				meter.tick();
			});

			self.cockpit.socket.on("status",function(data) {
				
				if('vout' in data) {
					var vol = data.vout.toFixed(1);
					var q = 0;

					if(vol < 9.0) {
						q = 0;
					} else {
						q = (vol - 9) / (12.6 - 9);
					}

					self.cockpit.controller.invoke('voltage','draw',vol);
					self.cockpit.controller.invoke('power','draw',q.toFixed(1));

				}

				if('iout' in data) {
					self.cockpit.controller.invoke('galvano','draw',data.iout.toFixed(1));
				}
			});
		};

		return self;
	}

	window.Cockpit.plugins.push(StatusDisplay);

}(window,jQuery));
