import Video from "../models/Video"
import Comment from "../models/Comment"
import User from "../models/User"

export const home = async (req, res) => {
    try {
        const videos = await Video.find({})
            .sort({ createdAt: "desc" })
            .populate("owner");
        return res.render("home", {pageTitle: "Home", videos})
    } catch {
        return res.render("server-error")
    }
}
export const watch = async(req, res) => {
    const { id } = req.params
    const video = await Video.findById(id).populate("owner").populate("comments") //populate는 Schema에서 reference로 User가 Video에 입력된 것을 
                                                        //앎으로 역으로 찾아가 해당하는 User를 찾고 video.onwer에 User의 정보를 넣는다.
    if(video){
        return res.render("watch", {pageTitle: video.title, video})
    }
    return res.render("404", {pageTitle:"Video not found."})
}
export const getEdit = async(req, res) => {
    const { id } = req.params
    const {user: {_id}} = req.session
    const video = await Video.findById(id);
    if (!video) {
        return res.status(404).render("404", {pageTitle: "Video not found."})
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/")
    }
    return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
}
export const postEdit = async(req, res) => {
    const { id } = req.params
    const { title, description, hashtags } = req.body
    const {user: {_id}} = req.session
    const video = await Video.exists({_id: id});
    if (!video) {
        return res.status(404).render("404", {pageTitle: "Video not found."})
    }
    if(String(video.owner) !== String(_id)){
        req.flash("error", "Not authorized")
        return res.status(403).redirect("/")
    }
    await Video.findByIdAndUpdate(id, {
        title, description, hashtags : hashtags.split(",").map((word) => word.startsWith("#") ? word : `#${word}`)
    }) 
    return res.redirect(`/videos/${id}`)
}

export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle: "Upload Video"})
}

export const postUpload = async (req, res) => {
    const {
        body: {title, description, hashtags},
        file: { path: fileUrl },
        session: { user: {_id}},
    } = req
    try {
        const newVideo = await Video.create({
          title,
          description,
          fileUrl,
          owner:_id,
          hashtags: Video.formatHashtags(hashtags)
        });
        const user = await User.findById(_id)
        user.videos.push(newVideo._id)
        user.save()
        return res.redirect("/");
    } catch (error) {
        return res.status(400).render("upload", {
          pageTitle: "Upload Video",
          errorMessage: error._message,
        });
    }
}

export const deleteVideo = async(req, res) => {
    const { id } = req.params
    const {user: {_id}} = req.session
    const video = await findById("id")
    if (!video) {
        return res.status(404).render("404", {pageTitle: "Video not found."})
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/")
    }
    await Video.findByIdAndDelete(id)
    return res.redirect("/")
}

export const search = async(req, res) => {
    const { keyword } = req.query
    let videos = []
    if(keyword){
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i")
            },
        }).populate("owner");
    }
    return res.render("search", {pageTitle:"Search", videos})
}

export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404)   //stauts는 render하기 전에 사용하는 코드. 렌더를 하지 않을 땐 sendStatus를 사용
    }
    video.meta.views = video.meta.views + 1
    await video.save()
    return res.sendStatus(200)
}

export const createComment = async (req, res) => {
    const {session: {user}, body: {text}, params: {id}} = req
    const video = await Video.findById(id)

    if(!video){
        return res.sendStatus(200)
    }
    const comment= await Comment.create({
        text,
        owner: user._id,
        video: id,
    })
    video.comments.push(comment._id)
    video.save()
    return res.sendStatus(201)
}