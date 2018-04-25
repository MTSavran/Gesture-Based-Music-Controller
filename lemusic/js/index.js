console.clear();
var slider = document.getElementById("slider");
slider.innerHTML = slider.value; // Display the default slider value

var statusMessage = document.getElementById('status');

var player = document.getElementById('player');

var distanceFromTop = player.getBoundingClientRect().top;
var desiredOffsetFromTop = 90; //90 px, which is 1.5 times the height of the info bar. 
player.style.transform = translateObjectPixels(0,-distanceFromTop + desiredOffsetFromTop);


var controlPanel = document.getElementById('control-panel');
var controlPanelRect = controlPanel.getBoundingClientRect();

playerBoard.get('ships').forEach(function(ship,i,j){
	ship.attributes.screenPosition[0] = controlPanelRect.x -10;
	ship.attributes.startPosition[0] = controlPanelRect.x -10;
	ship.attributes.screenPosition[1] = controlPanelRect.y + 0.2*controlPanelRect.height + (i+2)*100;
	ship.attributes.startPosition[1] = controlPanelRect.y + 0.2*controlPanelRect.height + (i+2)*100;

});

function translateObjectPixels(x,y) {
	return "translate(" + x +"px, " + y + "px)";
}

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    slider.innerHTML = this.value;
    newVolume = this.value/100;
    audio.volume = newVolume;
}
class musicPlayer {
	constructor() {
		this.play = this.play.bind(this);
		this.next = this.next.bind(this);
		this.prev = this.prev.bind(this);
		this.playBtn = document.getElementById('play');
		this.nextBtn = document.getElementById('next');
		this.prevBtn = document.getElementById('prev');
		this.playBtn.addEventListener('click', this.play);
		this.nextBtn.addEventListener('click',this.next);
		this.prevBtn.addEventListener('click',this.prev);
		this.controlPanel = document.getElementById('control-panel');
		this.infoBar = document.getElementById('info');	
	}

	play() {
		let controlPanelObj = this.controlPanel,
		infoBarObj = this.infoBar
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
					return element !== "active" ? infoBarObj.classList.add('active') : 		infoBarObj.classList.remove('active');
			});

	}

	next() {
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
		let controlPanelObj = this.controlPanel,
		infoBarObj = this.infoBar
		Array.from(controlPanelObj.classList).find(function(element){
					return element !== "active" ? controlPanelObj.classList.add('active') : controlPanelObj.classList.remove('active');
			});
		
		Array.from(infoBarObj.classList).find(function(element){
					return element !== "active" ? infoBarObj.classList.add('active') : 	infoBarObj.classList.remove('active');
			});
		this.play();
	}

	prev() {
		songIndex = Math.max(0,songIndex - 1);
		audio.src = songRoot + songList[songIndex];
		let controlPanelObj = this.controlPanel,
		infoBarObj = this.infoBar
		Array.from(controlPanelObj.classList).find(function(element){
					return element !== "active" ? controlPanelObj.classList.add('active') : controlPanelObj.classList.remove('active');
			});
		
		Array.from(infoBarObj.classList).find(function(element){
					return element !== "active" ? infoBarObj.classList.add('active') : 	infoBarObj.classList.remove('active');
			});
		this.play();
	}
}

const newMusicplayer = new musicPlayer();