// GAME SETUP
var initialState = SKIPSETUP ? "playing" : "setup";
var gameState = new GameState({state: initialState});
var cpuBoard = new Board({autoDeploy: true, name: "cpu"});
var playerBoard = new Board({autoDeploy: SKIPSETUP, name: "player"});
var cursor = new Cursor();



// UI SETUP
setupUserInterface();

// selectedTile: The tile that the player is currently hovering above
var selectedTile = false;

// grabbedShip/Offset: The ship and offset if player is currently manipulating a ship
var grabbedShip = false;
var grabbedOffset = [0, 0];

// isGrabbing: Is the player's hand currently in a grabbing pose
var isGrabbing = false;
var consecutiveMisses = 0;
var shipCounter = 0;

var grabThreshold = 0.9;
var velocityThreshold = 130;
var yDispThreshold = 110;
var prevYPos = null;
var prevXPos = null;

//2 HAND VARIABLES
var CLOSE_ENOUGH_Z = 100;
var leftHandPrevX = null;
var rightHandPrevX = null; 
var VEL_THRESH_FULL = 300;
var X_CHANGE = 20;
var shuffleOn = false;
var shuffleTimerStart = new Date();
var shuffleTimerEnd = null;

var VEL_Y_THRESH = 550;
var gesturesActive = true;


var audio = document.createElement('audio');
var songRoot = 'songs/';
var artistList = ['Ivan Dorn', 'Darius', 'Feder'];
var songList = ['bigudi.mp3','alicia.mp3','goodbye.mp3'];
var artWorkList = ['bigudi.png','alicia.png','goodbye.png'];

// var url = 'songs/bigudi.mp3';
var songIndex = 0;
audio.style.display = "none";
audio.src = songRoot + songList[songIndex];
audio.volume = 0.6;

function playSound(){
	audio.onended = function() {
		playNextSong();
	}
  var controlPanelObj = document.getElementById('control-panel');
  var infoBarObj = document.getElementById('info');
  Array.from(controlPanelObj.classList).find(function(element){
    if (element !== "active"){
      audio.play();
      controlPanelObj.classList.add('active');
      var songName = songList[songIndex];
      var artistName = artistList[songIndex];
      var artWorkFile = artWorkList[songIndex];
      document.getElementById('name').innerHTML = songName;
      document.getElementById('artist').innerHTML = artistName;
      $('head').append('<style>.player .control-panel .album-art::before{background-image: url("artworks/' + artWorkFile +'");}</style>');
    }
    else {
      audio.pause();
      controlPanelObj.classList.remove('active');
    }});
  
  Array.from(infoBarObj.classList).find(function(element){
        return element !== "active" ? infoBarObj.classList.add('active') :    infoBarObj.classList.remove('active');
    });
}

function volumeUp(){
	audio.volume = Math.min(1,audio.volume + 0.2); //Cap the volume upper bound to 1 
  var slider = document.getElementById("slider");
  slider.value = (audio.volume)*100;
}

function volumeDown(){
	audio.volume = Math.max(0,audio.volume - 0.2); //Cap the volume lower bound to 0
  var slider = document.getElementById("slider");
  slider.value = (audio.volume)*100;
  if (audio.volume==0) {
    console.log("Volume 0 now");
    generateSpeech("Muted");
  }
} 



function playNextSong(){
  if (!shuffleOn) {
	songIndex = songIndex + 1;
	songIndex = songIndex % songList.length;
  }
  else {
    var randomIndex = Math.floor(Math.random() * songList.length);
    songIndex = randomIndex;
  }
  audio.src = songRoot + songList[songIndex];
	console.log('new audio src is: ' + audio.src);
  var controlPanelObj = document.getElementById('control-panel');
  var infoBarObj = document.getElementById('info');
  Array.from(controlPanelObj.classList).find(function(element){
          return element !== "active" ? controlPanelObj.classList.add('active') : controlPanelObj.classList.remove('active');
      });
  Array.from(infoBarObj.classList).find(function(element){
          return element !== "active" ? infoBarObj.classList.add('active') :  infoBarObj.classList.remove('active');
      });
	playSound();
}

function playPrevSong(){
	songIndex = Math.max(0,songIndex - 1);
	audio.src = songRoot + songList[songIndex];
	console.log('new audio src is: ' + audio.src);
  var controlPanelObj = document.getElementById('control-panel');
  var infoBarObj = document.getElementById('info');
  Array.from(controlPanelObj.classList).find(function(element){
          return element !== "active" ? controlPanelObj.classList.add('active') : controlPanelObj.classList.remove('active');
      });
  Array.from(infoBarObj.classList).find(function(element){
          return element !== "active" ? infoBarObj.classList.add('active') :  infoBarObj.classList.remove('active');
      });
	playSound();
}

function intersectsControlPanel() {
  var cursorX = cursor.attributes.screenPosition[0];
  var cursorY = cursor.attributes.screenPosition[1];
  var insideRectangle = cursorX > controlPanelRect.x && (cursorX < controlPanelRect.x + controlPanelRect.width) && cursorY > controlPanelRect.y && (cursorY < controlPanelRect.y + controlPanelRect.height);
  return insideRectangle;
}


var isCurrentlyPlaying = false;
var startTime, endTime; 

var nPStartTime, nPEndTime; 

var swipeStart = new Date();
var swipeEnd; 

// MAIN GAME LOOP
// Called every time the Leap provides a new frame of data

var controller = Leap.loop({enableGestures: true}, function(frame){


  if (frame.valid && frame.hands.length > 0) {
    var hand = frame.hands[0];
    var leapHandPosition = hand.screenPosition();
    var x_scale = 1.5;
    var x_offset = 100;
    var y_scale = 2.5; 
    var y_offset = 320;
    var cursorPosition = [leapHandPosition[0]*x_scale-x_offset, leapHandPosition[1]*y_scale+y_offset];
    cursor.setScreenPosition(cursorPosition);
    fingerExtensionArray = [hand.fingers[0].extended,hand.fingers[1].extended,hand.fingers[2].extended, hand.fingers[3].extended, hand.fingers[4].extended];

    //WAVING LOGIC 

    var handXVel = hand.palmVelocity[0];
    var allFingersExtended = fingerExtensionArray.every(function(element){return element == true;});
    if (allFingersExtended){
      palmZDirection = hand.palmNormal[2];
      
      if (Math.abs(palmZDirection) > 0.75 && hand.grabStrength <= 0.3) {
          console.log("Waving detected!");

        if (Math.abs(handXVel) >= velocityThreshold && Math.abs(hand.palmPosition[0] - prevXPos) >= yDispThreshold){
            prevXPos = hand.palmPosition[0];
      }
    }
    }
    //THUMBS UP/DOWN LOGIC 
    
    var thumbClosed = !fingerExtensionArray[0];
    var indexFingerClosed = !fingerExtensionArray[1];
    var thumb = hand.thumb;
    var thumbY = thumb.tipPosition[1];
    var palmY = hand.sphereCenter[1];
    var thumbLength = thumb.length;
    var thumbYDominant = Math.abs(thumb.direction[1]) > Math.abs(thumb.direction[0]);
    var onlyThumbExtended = fingerExtensionArray[0] && !fingerExtensionArray[1] && !fingerExtensionArray[2] && !fingerExtensionArray[3]  && !fingerExtensionArray[4];
    if (onlyThumbExtended && Math.abs(thumbY-palmY) >= 0.8*thumbLength && thumbYDominant) {
      if (thumbY >= palmY) {
        console.log('Thumbs up');
      }
      else {
        
        console.log('Thumbs down');
        
      }
    }

    if (frame.hands.length == 2) {
      console.log("2 HANDS");
    }

    if (frame.hands.length == 2 && Math.abs(frame.hands[0].palmPosition[2]) <= CLOSE_ENOUGH_Z && Math.abs(frame.hands[1].palmPosition[2]) <= CLOSE_ENOUGH_Z) {

      if (!shuffleOn){
      statusMessage.innerHTML = "Move 2 Hands Sideways to toggle Shuffle!";
      }
      else {
        statusMessage.innerHTML = "Shuffle On";
      }

      // console.log("2 Hands Detected In Close Proximity");
      // console.log(frame.hands[0].palmPosition[2]);
      // console.log(frame.hands[1].palmPosition[2]);
      hands = frame.hands;
      if (hands[0].palmPosition[0] < hands[1].palmPosition[0]) {
        leftHand = hands[0];
        rightHand = hands[1];
      } else {
        leftHand = hands[1];
        rightHand = hands[0];
      }

      leftHandPrevX = leftHand.palmPosition[0];
      rightHandPrevX = rightHand.palmPosition[0];

      leftHandXVel = leftHand.palmVelocity[0];
      rightHandXVel = rightHand.palmVelocity[0];
      leftHandYVel = leftHand.palmVelocity[1];
      rightHandYVel = rightHand.palmVelocity[1];


      if (leftHandYVel >= VEL_Y_THRESH && rightHandYVel <= -VEL_Y_THRESH){
        if (gesturesActive) {
        console.log("GESTURE RECOGNITION DEACTIVATED!");
        generateSpeech("Gesture Recognition Off");
        statusMessage.innerHTML = "Right fist up & left fist down to re-activate";
        gesturesActive = false;
        }
      }

      if (leftHandYVel <= -VEL_Y_THRESH && rightHandYVel >= VEL_Y_THRESH) {
        if (!gesturesActive) {
        console.log("GESTURE RECOGNITION RE-ACTIVATED!");
        generateSpeech("Gesture Recognition On");
        gesturesActive = true;
        }
      }

      if (leftHandXVel <= -VEL_THRESH_FULL && rightHandXVel >= VEL_THRESH_FULL) {
        if (!shuffleOn && gesturesActive) {
          console.log("Shuffle Activated");
          generateSpeech("Shuffle Activated");
          statusMessage.innerHTML = "Shuffle On";
          shuffleOn = true;
          shuffleTimerStart = new Date();
        }
        console.log("TWO HANDS MOVED AWAY");
      }

      else if (leftHandXVel >= VEL_THRESH_FULL && rightHandXVel <= -VEL_THRESH_FULL) {
        shuffleTimerEnd = new Date();
        var shuffleTimeDiff = (shuffleTimerEnd - shuffleTimerStart)/1000; 
        if (shuffleOn && shuffleTimeDiff > 2 && gesturesActive) {
          console.log("Shuffle Deactivated");
          generateSpeech("Shuffle Deactivated");
          statusMessage.innerHTML = "Shuffle Off";
          shuffleOn = false;
        }
        console.log("TWO HANDS MOVED TOWARDS");
      }


    }

        if (!gesturesActive) {


          // First, determine if grabbing pose or not
          var grabThreshold2 = 0.4;
          var pinchThreshold2 = 0.75;
          isGrabbing = hand.grabStrength > grabThreshold2 && hand.pinchStrength > pinchThreshold2;

          // Grabbing, but no selected ship yet. Look for one.
          // TODO: Update grabbedShip/grabbedOffset if the user is hovering over a ship
          if (!grabbedShip && isGrabbing) {
              grabData = getIntersectingShipAndOffset(cursorPosition);
              
              if (grabData !== false) {
              grabbedShip = grabData.ship;
              grabbedOffset = grabData.offset;
              }
          }

          // Has selected a ship and is still holding it
          // TODO: Move the ship
          else if (grabbedShip && isGrabbing) {
          grabbedShip.setScreenPosition([cursorPosition[0] - grabbedOffset[0], cursorPosition[1] - grabbedOffset[1]]);
          // grabbedShip.setScreenRotation(-hand.roll());
          }

          // Finished moving a ship. Release it, and try placing it.
          // TODO: Try placing the ship on the board and release the ship
          else if (grabbedShip && !isGrabbing) {
            if (intersectsControlPanel()) {
              if (isCurrentlyPlaying) {
              playSound(); //pause it to settle things out
              isCurrentlyPlaying = false;
              
              }
              console.log("WE GON' PLAY THIS SONG NOW:");
              console.log(grabbedShip.attributes.type);
              songIndex = songList.indexOf(grabbedShip.attributes.type + ".mp3");
              audio.src = songRoot + songList[songIndex];
              playSound();
              isCurrentlyPlaying = true;
            }

            else {
              console.log("DIDN'T PLACE THE SONG ON CONTROL PANEL!");
            }
          console.log(grabbedShip);
          grabbedShip.resetShip();
          console.log(intersectsControlPanel());
          grabbedShip = false;
          shipCounter += 1;
          }
  

        }








    if (gesturesActive) {

    // PLAY/PAUSE GESTURE DETECTION: MOVE FIST UP AND DOWN 
    if (frame.hands.length == 1 && hand.grabStrength >= grabThreshold && thumbClosed && indexFingerClosed) {



      var handYVel = hand.palmVelocity[1];
      var handXVel = hand.palmVelocity[0];
      var isVertical = Math.abs(handYVel) > Math.abs(handXVel);

      if (Math.abs(handYVel) >= velocityThreshold && Math.abs(hand.palmPosition[1] - prevYPos) >= yDispThreshold){

        if (handYVel > 0){
          prevYPos = hand.palmPosition[1];
          console.log("Detected a closed hand moving up");
          if (!isCurrentlyPlaying){
            statusMessage.innerHTML = "Playing! Move fist down to pause.";
            startTime = new Date();
            playSound();
            isCurrentlyPlaying = true;
        }
        }
        else {
          prevYPos = hand.palmPosition[1];
          console.log("Detected a closed hand moving down");
          endTime = new Date();
          var timeDiff = (endTime - startTime)/1000; // time difference in seconds since we played the song 

          if (isCurrentlyPlaying && timeDiff > 2){
            statusMessage.innerHTML = "Paused! Move fist up to play.";
            playSound();
            isCurrentlyPlaying = false;
        }
          
        }
      }
    }

    // if we detect leap-default gestures 
    frame.gestures.forEach(function(gesture){
        switch (gesture.type){
          case "circle":

              // console.log("Circle Gesture");
              if (gesture.state == 'stop'){
                var hand = frame.hands[0];
                var radiusThreshold = 20.0;
                var isClockwise = (gesture.normal[2] <= 0);
                var indexFingerPerformedTheCircle = hand.fingers[1].extended;
                if (indexFingerPerformedTheCircle && gesture.radius >= radiusThreshold) {
                  console.log("Index finger performed this circle!");
        
                if (isClockwise) {
                  console.log("Clockwise circle detected with index finger. Volume up!");
                  volumeUp();
                  
                }
                else{
                  console.log("Counter-clockwise circle detected with index finger. Volume down!");
                  volumeDown();
                  
                }
              }
              }
              break;
          case "keyTap":
              // console.log("Key Tap Gesture");
              break;
          case "screenTap":
              console.log("Screen Tap Gesture");
              break;
          case "swipe":
              // console.log('swipe');
              var hand = frame.hands[0];
              // console.log(hand.palmVelocity);
              if (gesture.state == 'update'){
              var xDisplacement = gesture.direction[0];
              var yDisplacement = gesture.direction[1];
              var zDisplacement = gesture.direction[2];

              dispThreshold = 0.3; 
              swipeEnd = new Date();
              timeElapsed = (swipeEnd - swipeStart)/1000;
              if (hand.palmVelocity[0] >= 220 && timeElapsed >= 1) {
                swipeStart = new Date();
                console.log("NEXT SONG");
                playNextSong();
                break;
              }
              else if (hand.palmVelocity[0] <= -800 && timeElapsed >= 1) {
                swipeStart = new Date();
                console.log("PREV SONG");
                playPrevSong();
                break;
              }
              }
              break;
        }
    });
  
  }
}
});

controller.use('screenPosition', {scale: LEAPSCALE});


