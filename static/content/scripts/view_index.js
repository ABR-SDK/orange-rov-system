//This is the support file for the /views/index.ejs
$(function () {
  
   window.iosocket = null;

  if (window.io == undefined) {
    console.warn && console.warn("! detected no socket found !");
    var mysocket = function () {
    };
    mysocket.prototype.emit = function (x) {
      console.log(x);
    };
    mysocket.prototype.emit = function (x, y) {
      console.log(x);
      console.log(y);
    };
    simevents = {};
    mysocket.prototype.on = function (x, y) {
      console.log('registering ' + x);
      if (simevents[x] == undefined) {
        simevents[x] = [];
      }
      simevents[x].push(y);
    };
    var io = new mysocket();
    window.iosocket = new mysocket();
    CONFIG = {};
    CONFIG.sample_freq = 20;
  } else {
    window.iosocket = window.io.connect();
  }
  
  	setupFrameHandling(window.iosocket);
	var cockpit = new Cockpit(window.iosocket,$controller);


   //plugin hooks
});

var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6

if( isChrome === true ) {
	// The next session draws the video img to a canvas which is then managed by the GPU
	// and is much faster than the browser painting the img tag.
	var canvas = document.getElementById('video-canvas');
	var srcImg = document.getElementById('video');
	var videocontainer = $('#video-container');
	var newCanvas, newImg;
	setInterval(function () {
  		var width = videocontainer.innerWidth();
 		var height = videocontainer.innerHeight();
  		canvas.width = width;
  		canvas.height = height;
 	 	var ctx = canvas.getContext('2d');
 		ctx.fillRect(0, 0, canvas.width, canvas.height);
  		var proportionalHeight = width * srcImg.height / srcImg.width;
 		ctx.drawImage(srcImg, 0, (canvas.height - proportionalHeight) / 2, width, proportionalHeight);
	}, 64);  //only need to redraw at the framerate of source video
}

if( isFirefox === true ) {
	$('#video').removeClass("hidden");
}
