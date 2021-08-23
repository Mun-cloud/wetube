const video = document.querySelector("video")
const playBtn = document.getElementById("play")
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute")
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume")
const currentime = document.getElementById("currenTime")
const totalTime = document.getElementById("totalTime")
const timeline = document.getElementById("timeline")
const fullScreenBtn = document.getElementById("fullScreen")
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer")
const videoControls = document.getElementById("videoControls")

let controlsMovementTimeout = null
let constrolsTimeout = null
let volumeValue = 0.5
video.volume = volumeValue

const formatTime = (seconds) => new Date(seconds*1000).toISOString().substr(14, 5)

const handlePlayClick = (e) => {
    if(video.paused){
        video.play()
    } else {
        video.pause()
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
}

const handleMute = (e) => {
    if(video.muted) {
        video.muted = false
    } else {
        video.muted = true
    }
    muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumeValue
}

const handleVolumeChange = (event) => {
    const { target: { value } } = event
    if(video.muted) {
        video.muted = false
        muteBtn.innerText = "Mute"
    } 
    volumeValue = value
    video.volume = value
}

const handleLoadedMetadata = () => {
    totalTime.innerText = formatTime(Math.floor(video.duration))
    timeline.max = Math.floor(video.duration)
}

const handleTimeUpdate = () => {
    currentime.innerText = formatTime(Math.floor(video.currentTime))
    timeline.value = Math.floor(video.currentTime)
}

const handleTimeLineChange = (event) => {
    const {target: {value}} = event
    video.currentTime = value
}

const handlefullScreen = () => {
    const fullscreen = document.fullscreenElement
    if(fullscreen){
        document.exitFullscreen()
        fullScreenIcon.classList = "fas fa-expand";
    } else {
        videoContainer.requestFullscreen()
        fullScreenIcon.classList = "fas fa-compress";
    }
}

const hideControls = () => videoControls.classList.remove("showing")

const handleMouseMove = () => {
    if(constrolsTimeout) {
        clearTimeout(constrolsTimeout)
        constrolsTimeout = null
    }
    if(controlsMovementTimeout) {
        clearTimeout(controlsMovementTimeout)
        controlsMovementTimeout = null
    }
    videoControls.classList.add("showing")
    controlsMovementTimeout = setTimeout(hideControls, 3000)
}

const handleMouseLeave = () => {
    constrolsTimeout = setTimeout(hideControls, 3000)
}

const handleEnded = () => {
    const {id} = videoContainer.dataset
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    })
}

playBtn.addEventListener("click", handlePlayClick)
muteBtn.addEventListener("click", handleMute)
volumeRange.addEventListener("input",handleVolumeChange)
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate)
video.addEventListener("ended", handleEnded)
timeline.addEventListener("input", handleTimeLineChange)
fullScreenBtn.addEventListener("click", handlefullScreen)
videoContainer.addEventListener("mousemove", handleMouseMove)
videoContainer.addEventListener("mouseleave", handleMouseLeave)