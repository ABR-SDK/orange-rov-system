$(function(){

	var Pilot = function(cockpit) {
		var rov = this;
		rov.cockpit = cockpit;
		
		rov.powers = [0.12,0.25,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0];
		
		rov.power = 0.25;
		//default to mid power
		rov.vtrim = 0;
		//default to no trim
		rov.ttrim = 0;
		rov.tilt = 0;
		rov.light = 0;
		rov.sendToROVEnabled = true;
		rov.positions = {
		  throttle: 0,
		  yaw: 0,
		  lift: 0,
		  pitch: 0,
		  roll: 0
		};
		rov.sendUpdateEnabled = true;
		var SAMPLE_PERIOD = 1000 / CONFIG.sample_freq;
		//ms
		var trimHeld = false;
		rov.priorControls = {};
		
		setInterval(function () {
		  rov.sendPilotingData();
		}, SAMPLE_PERIOD);

		
		return rov;
	};
	
	Pilot.prototype.setupControl = function setupControl() {
		var rov = this;
		console.log("setup control");

		rov.cockpit.controller.bind('float','mousedown',function() {
			rov.cockpit.emit('rovpilot.setLift', -1);
		});
		rov.cockpit.controller.bind('float','mouseup',function() {
			rov.cockpit.emit('rovpilot.setLift', 0);
		});
		rov.cockpit.controller.bind('ahead','mousedown',function() {
			rov.cockpit.emit('rovpilot.setThrottle', 1);
		});
		rov.cockpit.controller.bind('ahead','mouseup',function() {
			rov.cockpit.emit('rovpilot.setThrottle', 0);
		});
		rov.cockpit.controller.bind('dive','mousedown',function() {
			rov.cockpit.emit('rovpilot.setLift', 1);
		});
		rov.cockpit.controller.bind('dive','mouseup',function() {
			rov.cockpit.emit('rovpilot.setLift', 0);
		});
		rov.cockpit.controller.bind('left','mousedown',function() {
			rov.cockpit.emit('rovpilot.setYaw', -1);
		});
		rov.cockpit.controller.bind('left','mouseup',function() {
			rov.cockpit.emit('rovpilot.setYaw', 0);
		});
		rov.cockpit.controller.bind('back','mousedown',function() {
			rov.cockpit.emit('rovpilot.setThrottle', -1);
		});
		rov.cockpit.controller.bind('back','mouseup',function() {
			rov.cockpit.emit('rovpilot.setThrottle', 0);
		});
		rov.cockpit.controller.bind('right','mousedown',function() {
			rov.cockpit.emit('rovpilot.setYaw', 1);
		});
		rov.cockpit.controller.bind('right','mouseup',function() {
			rov.cockpit.emit('rovpilot.setYaw', 0);
		});
		rov.cockpit.controller.bind('cameraLeft','click',function() {
			rov.cockpit.emit('rovpilot.adjustCameraTilt', -0.1);
		});
		rov.cockpit.controller.bind('cameraRight','click',function() {
			rov.cockpit.emit('rovpilot.adjustCameraTilt', 0.1);
		});
		rov.cockpit.controller.bind('cameraReset','click',function() {
			rov.cockpit.emit('rovpilot.setCameraTilt', 0);
		});
		rov.cockpit.controller.attach('light','afterSetValue',function(v) {
			rov.cockpit.emit('rovpilot.adjustLights', parseFloat(v));
			console.log("light set value:" + parseFloat(v));
		});
		rov.cockpit.controller.attach('shift','afterSetLevel',function(v) {		
			rov.power = rov.powers[v];
			console.log("shift set rov poower level:" + rov.power);
		});
	} 
	
	//This pattern will hook events in the cockpit and pull them all back
	//so that the reference to this instance is available for further processing
	Pilot.prototype.listen = function listen() {
		var rov = this;
		
		console.log("pilot listen");

		rov.cockpit.socket.on('status', function (data) {
		  rov.UpdateStatusIndicators(data);
		});
		rov.cockpit.on('gamepad.connected', function () {
		  //rov.bindingModel.gamepadDisconnected(false);
		});
		rov.cockpit.on('gamepad.disconnected', function () {
		  //rov.bindingModel.gamepadDisconnected(true);
		});
		rov.cockpit.on('rovpilot.setThrottle', function (v) {
		  rov.setThrottle(v);
		});
		rov.cockpit.on('rovpilot.setYaw', function (v) {
		  rov.setYaw(v);
		});
		rov.cockpit.on('rovpilot.setLift', function (v) {
		  rov.setLift(v);
		});
		rov.cockpit.on('rovpilot.setPitch', function (v) {
		  rov.setPitch(v);
		});
		rov.cockpit.on('rovpilot.setPitchControl', function (v) {
		  rov.setPitchControl(v);
		});
		rov.cockpit.on('rovpilot.setRoll', function (v) {
		  rov.setRoll(v);
		});
		rov.cockpit.on('rovpilot.setRollControl', function (v) {
		  rov.setRollControl(v);
		});
		rov.cockpit.on('rovpilot.setPortElevonControl', function (v) {
		  rov.setPortElevonControl(v);
		});
		rov.cockpit.on('rovpilot.setStartboardElevonControl', function (v) {
		  rov.setStartboardElevonControl(v);
		});
		rov.cockpit.on('rovpilot.powerLevel', function (v) {
		  rov.powerLevel(v);
		});
		rov.cockpit.on('rovpilot.adjustCameraTilt', function (v) {
		  rov.adjustCameraTilt(v);
		});
		rov.cockpit.on('rovpilot.setCameraTilt', function (v) {
		  rov.setCameraTilt(v);
		});
		rov.cockpit.on('rovpilot.adjustLights', function (v) {
		  rov.adjustLights(v);
		});
		rov.cockpit.on('rovpilot.toggleLasers', function (v) {
		  rov.toggleLasers();
		});
		rov.cockpit.on('rovpilot.toggleLights', function (v) {
		  rov.toggleLights();
		});
		rov.cockpit.on('rovpilot.powerOnESCs', function () {
		  rov.powerOnESCs();
		});
		rov.cockpit.on('rovpilot.powerOffESCs', function () {
		  rov.powerOffESCs();
		});
		rov.cockpit.on('rovpilot.toggleholdHeading', function () {
		  rov.toggleholdHeading();
		});
		rov.cockpit.on('rovpilot.toggleholdDepth', function () {
		  rov.toggleholdDepth();
		});
		rov.cockpit.on('rovpilot.manualMotorThrottle', function (p, v, s) {
		  rov.manualMotorThrottle(p, v, s);
		});
		rov.cockpit.on('rovpilot.disable', function () {
		  rov.disablePilot();
		});
		rov.cockpit.on('rovpilot.enable', function () {
		  rov.enablePilot();
		});

		rov.setupControl();
	};	
	
	var lastSentManualThrottle = {
		port: 0,
		vertical: 0,
		starbord: 0
	};
	
	Pilot.prototype.disablePilot = function disablePilot() {
		this.sendToROVEnabled = false;
		console.log('disabled rov pilot.');
	};
	
	Pilot.prototype.enablePilot = function enablePilot() {
		this.sendToROVEnabled = true;
		console.log('enabled rov pilot.');
	};
	
	Pilot.prototype.manualMotorThrottle = function manualMotorThrottle(port, vertical, starbord) {
		var maxdiff = 0;
		maxdiff = Math.max(maxdiff, Math.abs(port - lastSentManualThrottle.port));
		maxdiff = Math.max(maxdiff, Math.abs(vertical - lastSentManualThrottle.vertical));
		maxdiff = Math.max(maxdiff, Math.abs(starbord - lastSentManualThrottle.starbord));
		if (vertical < 0)
		  vertical = vertical * 2;
		//make up for async props
		if (maxdiff > 0.001) {
		  this.cockpit.socket.emit('motor_test', {
			port: -port * this.power,
			starbord: -starbord * this.power,
			vertical: vertical * this.power
		  });
		  lastSentManualThrottle.port = port;
		  lastSentManualThrottle.vertical = vertical;
		  lastSentManualThrottle.starbord = starbord;
		}
	};
	
	Pilot.prototype.setCameraTilt = function setCameraTilt(value) {
		this.tilt = value;
		if (this.tilt > 1)
		  this.tilt = 1;
		if (this.tilt < -1)
		  this.tilt = -1;

		this.cockpit.controller.invoke('cameraAngle','draw',60 * this.tilt);

		this.cockpit.socket.emit('tilt_update', this.tilt);
	};
	
	Pilot.prototype.adjustCameraTilt = function adjustCameraTilt(value) {
		this.tilt += value;
		this.setCameraTilt(this.tilt);
	};
	
	Pilot.prototype.setLights = function setLights(value) {
		this.light = value;
		if (this.light > 1)
		  this.light = 1;
		if (this.light < 0)
		  this.light = 0;
		this.cockpit.socket.emit('brightness_update', this.light);
	};
	
	Pilot.prototype.adjustLights = function adjustLights(value) {
		if (this.light === 0 && value < 0) {
		  //this code rounds the horn so to speak by jumping from zero to max and vise versa
		  this.light = 0;  //disabled the round the horn feature
		} else if (this.light == 1 && value > 0) {
		  this.light = 1;  //disabled the round the horn feature
		} else {
		  this.light += value;
		}
		this.setLights(this.light);
	};
	
	Pilot.prototype.toggleLasers = function toggleLasers() {
		this.cockpit.socket.emit('laser_update');
	};
	
	Pilot.prototype.toggleLights = function toggleLights() {
		if (this.light > 0) {
		  this.setLights(0);
		} else {
		  this.setLights(1);
		}
	};
	
	Pilot.prototype.toggleholdHeading = function toggleholdHeading() {
		this.cockpit.socket.emit('holdHeading_toggle');
	};
	
	Pilot.prototype.toggleholdDepth = function toggleholdDepth() {
		this.cockpit.socket.emit('holdDepth_toggle');
	};
	
	Pilot.prototype.powerOnESCs = function powerOnESCs() {
		this.cockpit.socket.emit('escs_poweron');
	};
	
	Pilot.prototype.powerOffESCs = function powerOffESCs() {
		this.cockpit.socket.emit('escs_poweroff');
	};
	
	Pilot.prototype.setThrottle = function setThrottle(value) {
		this.positions.throttle = value;
		if (value === 0)
		  this.positions.throttle = this.ttrim;
	};
		
	Pilot.prototype.setLift = function setLift(value) {
		this.positions.lift = value;
		if (value === 0)
		  this.positions.lift = this.vtrim;
		
	};
	
	Pilot.prototype.setYaw = function setYaw(value) {
		this.positions.yaw = value;
	};
	
	Pilot.prototype.setPitchControl = function setPitchControl(value) {
		this.positions.pitch = value;
	};
	
	Pilot.prototype.setRollControl = function setRollControl(value) {
		this.positions.roll = value;
	};
	
	Pilot.prototype.sendPilotingData = function sendPilotingData() {
		var positions = this.positions;
		var updateRequired = false;
		//Only send if there is a change
		var controls = {};
		controls.throttle = positions.throttle * this.power;
		controls.yaw = positions.yaw * this.power * 1.5;
		controls.yaw = Math.min(Math.max(controls.yaw, -1), 1);
		controls.lift = positions.lift * this.power;
		controls.pitch = positions.pitch;
		controls.roll = positions.roll;
		for (var i in positions) {
		  if (controls[i] != this.priorControls[i]) {
			updateRequired = true;
		  }
		}
		if (this.sendUpdateEnabled && updateRequired || this.sendToROVEnabled === false) {
		  if (this.sendToROVEnabled) {
		//        this.cockpit.socket.emit('control_update', controls);
			for(var control in controls){
			  if(controls[control] != this.priorControls[control]){
				this.cockpit.socket.emit(control, controls[control]);
			  }
			}
		  }
		  this.cockpit.emit('rovpilot.control_update', controls);
		  this.priorControls = controls;
		}
	};
	
	Pilot.prototype.UpdateStatusIndicators = function(status) {
		var rov = this;
		if ('targetDepth' in status) {
		  //rov.bindingModel.depthHoldEnabled(status.targetDepth != DISABLED);
		}
		if ('targetHeading' in status) {
		  //rov.bindingModel.headingHoldEnabled(status.targetHeading != DISABLED);
		}
		if ('claser' in status) {
		  //rov.bindingModel.lasersEnabled(status.claser == 255);
		}
	};

	window.Cockpit.plugins.push(Pilot);

});
