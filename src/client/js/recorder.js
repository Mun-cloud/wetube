import {createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg"
const actionBtn = document.getElementById("actionBtn")
const video = document.getElementById("preview")

let stream
let recorder
let videoFile

const files = {
    input: "recording.webm",
    output: "output.mp4",
    thumb: "thumbnail.jpg"
}

const downloadFile = (fileUrl, fileName) => {
    const a = document.createElement("a")
    a.href = fileUrl
    a.download = fileName //a에 download라는 속성을 추가시키면 클릭시 다운을 시켜줌
    document.body.appendChild(a)
    a.click()
}

const handleDownload = async () => {

    actionBtn.removeEventListener("click", handleDownload)

    actionBtn.innerText = "Transcoding..."

    actionBtn.disabled = true

    const ffmpeg = createFFmpeg({log:true})
    await ffmpeg.load() //자바스크립트가 아닌 다른 소프트웨어를 사용하는 것이므로 await 해줘야 함.

    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile)) // FS파일시스템. 생성, 파일명, 데이터

    await ffmpeg.run("-i", files.input, "-r", "60", files.output) // ffmpeg로 run 실행. 명령어 다양함. 가상 공간에 있는 recording.webm 파일을 -i로 인풋 받아 output.mp4로 출력함. 초당 60프레임으로.

    await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumb)

    const mp4File = ffmpeg.FS("readFile", files.output)
    const thumbFile = ffmpeg.FS("readFile", files.thumb)

    const mp4Blob = new Blob([mp4File.buffer], {type: "video/mp4"})
    const thumbBlob = new Blob([thumbFile.buffer], {type: "image/jpg"})

    const mp4Url = URL.createObjectURL(mp4Blob)
    const thumbUrl = URL.createObjectURL(thumbBlob)

    downloadFile(mp4Url, "MyRecording.mp4")
    downloadFile(thumbUrl, "MyThumbnail.jpg")

    ffmpeg.FS("unlink", files.input)
    ffmpeg.FS("unlink", files.output)
    ffmpeg.FS("unlink", files.thumb)

    URL.revokeObjectURL(mp4Url)
    URL.revokeObjectURL(thumbUrl)
    URL.revokeObjectURL(videoFile)

    actionBtn.disabled = false
    actionBtn.innerText = "Record Again"
    actionBtn.addEventListener("click",handleStart)
}

const handleStop = () => {
    actionBtn.innerText = "Download Recording"
    actionBtn.removeEventListener("click", handleStop)
    actionBtn.addEventListener("click", handleDownload)
    recorder.stop()
}

const handleStart = () => {
    actionBtn.innerText = "Stop Recording"
    actionBtn.removeEventListener("click", handleStart)
    actionBtn.addEventListener("click", handleStop)
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

actionBtn.addEventListener("click", handleStart)