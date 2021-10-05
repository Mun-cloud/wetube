import {createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg"
const startBtn = document.getElementById("startBtn")
const video = document.getElementById("preview")

let stream
let recorder
let videoFile

const handleDownload = async () => {

    const ffmpeg = createFFmpeg({log:true})
    await ffmpeg.load() //자바스크립트가 아닌 다른 소프트웨어를 사용하는 것이므로 await 해줘야 함.

    ffmpeg.FS("writeFile", "recording.webm", await fetchFile(videoFile)) // FS파일시스템. 생성, 파일명, 데이터

    await ffmpeg.run("-i", "recording.webm", "-r", "60", "output.mp4") // ffmpeg로 run 실행. 명령어 다양함. 가상 공간에 있는 recording.webm 파일을 -i로 인풋 받아 output.mp4로 출력함. 초당 60프레임으로.

    const a = document.createElement("a")
    a.href = videoFile
    a.download = "MyRecording.mp4" //a에 download라는 속성을 추가시키면 클릭시 다운을 시켜줌
    document.body.appendChild(a)
    a.click()
}

const handleStop = () => {
    startBtn.innerText = "Download Recording"
    startBtn.removeEventListener("click", handleStop)
    startBtn.addEventListener("click", handleDownload)
    recorder.stop()
}

const handleStart = () => {
    startBtn.innerText = "Stop Recording"
    startBtn.removeEventListener("click", handleStart)
    startBtn.addEventListener("click", handleStop)
    recorder = new MediaRecorder(stream, {MimeType:"video/mp4"})
    recorder.ondataavailable = (event) => {
        videoFile = URL.createObjectURL(event.data)
        video.srcObject = null
        video.src = videoFile
        video.loop = true
        video.play()
    }
    recorder.start()
}

const init = async () => {
    stream = await navigator.mediaDevices.getUserMedia({audio:false, video:true})
    video.srcObject = stream
    video.play()
}

init()

startBtn.addEventListener("click", handleStart)