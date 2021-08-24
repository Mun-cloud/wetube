import User from "../models/User"
import fetch from "node-fetch"
import bcrypt from "bcrypt"

export const getJoin = (req, res) => res.render("join", {pageTitle: "Join"})
export const postJoin = async (req, res) => {
    const { name, password, password2, username, email, location } = req.body
    const pageTitle = "Join"
    if(password !== password2){
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage:"Password confirmation does not match."
        })        
    }
    const exists = await User.exists({$or: [{username}, {email}]})
    if(exists){
        return res.status(400).render("join", {
            pageTitle, 
            errorMessage:"This username/email is already taken."
        })
    }
    try{
        await User.create({
            name, password, username, email, location
        })
        return res.redirect("/login")
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: error._message,
        })

    }
}


export const getLogin = (req, res) => res.render("login", {pageTitle:"Login"})

export const postLogin = async(req, res) => {
    const {username, password} = req.body
    const pageTitle = "Login"
    const user = await User.findOne({username, socialOnly:false})
    if(!user){
        return res
        .status(400)
        .render("login", {
            pageTitle,
            errorMesaage:"An account with this username does not exists."
        })
    }
    const ok = await bcrypt.compare(password, user.password)
    if(!ok){
        return res
        .status(400)
        .render("login", {
            pageTitle,
            errorMessage:"Wrong password"
        })
    }
    req.session.loggedIn = true
    req.session.user = user
    res.redirect("/")
}

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize"
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope:"read:user user:email",
    }
    const params = new URLSearchParams(config).toString()
    const finalUrl = `${baseUrl}?${params}`
    return res.redirect(finalUrl)
}

export const finishGithubLogin = async(req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token"
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    }
    const params = new URLSearchParams(config).toString()
    const finalUrl = `${baseUrl}?${params}`
    const tokenRequest = await (
        await fetch(finalUrl, { //fetch는 어디선가 정보를 가져오는 기능. finalUrl에서 중괄호의 정보를 가져온다..?
            method:"POST",
            headers: {
                Accept: "application/json",
            } 
        })
    ).json() //액세스 토큰과 토큰타입, 스콥을 array한다.
    if("access_token" in tokenRequest){ //코드가 발생하면 access_token으로 바꿔준 다음 이걸로 github의 API에서 사용자 정보를 받는다.
        const { access_token } = tokenRequest       //액세스토큰이 api에서 정보를 가져올 수 있는 근거는 scope에서 요청한 코드였기 때문.
        const apiURL = "https://api.github.com/"
        const userData = await (                //각 데이터별로 각각 접근해야함.
            await fetch(`${apiURL}user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json() //api 접근. 
        const emailData = await (                //각 데이터별로 각각 접근해야함.
            await fetch(`${apiURL}user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json()
        const emailObj = emailData.find(        //find() 배열에서 조건을 만족하는 첫번째 값을 도출.
            (email) => email.primary === true && email.verified === true //email은 변수
        )
        let user = await User.findOne({ email: emailObj.email });
        if(!user){
            const user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name,
                username:userData.login,
                email:emailObj.email,
                password:"",
                socialOnly: true,
                location:userData.location,
            })
        } else {
            req.session.loggedIn = true
            req.session.user = user
            return res.redirect("/")
        }
    } else {
        return res.redirect("/login")
    }
}

export const logout = (req, res) => {
    req.session.destroy()
    req.flash("info", "Bye Bye")
    return res.redirect("/")
}

export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile"})
}
export const postEdit = async (req, res) => {
    const pageTitle = "Edit Profile"
    const {session: {user: {_id, avatarUrl}},
        body: {name, email, username, location},
        file,
    } = req
    if (username!==req.session.user.username){
        const exists = await User.exists({username})
        if(exists){
            return res.status(400).render("edit-profile", {
                pageTitle, 
                errorMessage:"This username is already taken."
            })
        }
        const updatedUser = await User.findByIdAndUpdate(_id, {
            avatarUrl:file ? file.location : avatarUrl,
            name,
            email,
            username,
            location,
        },
        {new:true})
        req.session.user = updatedUser
        return res.redirect("/users/edit")
    }
    if (email!==req.session.user.email){
        const exists = await User.exists({email})
        if(exists){
            return res.status(400).render("edit-profile", {
                pageTitle, 
                errorMessage:"This email is already taken."
            })
        }
        const updatedUser = await User.findByIdAndUpdate(_id, {
            avatarUrl:file ? file.path : avatarUrl,
            name,
            email,
            username,
            location,
        },
        {new:true})
        req.session.user = updatedUser
        return res.redirect("/users/edit")
    }
    if(email===req.session.user.email && username===req.session.user.username) {
        const updatedUser = await User.findByIdAndUpdate(_id, {
            avatarUrl:file ? file.path : avatarUrl,
            name,
            email,
            username,
            location,
        },
        {new:true})
        req.session.user = updatedUser
        return res.redirect("/users/edit")
    }
}
 
export const getChangePassword = (req, res) => {
    if (req.session.user.socialOnly === true) {
        req.flash("error", "Can't change password.")
        return res.redirect("/")
    }
    res.render("users/change-password", {pageTitle: "Change Password"})
}
export const postChangePassword = async (req, res) => {
    const {session: {user: {_id}},
        body: {oldPassword, newPassword, newPassword2}
    } = req
    const user = await User.findById(_id)
    const ok = await bcrypt.compare(oldPassword, user.password)
    if(!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password", 
            errorMessage:"The current password is incorrect."
        })
    }
    if(newPassword !== newPassword2) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password", 
            errorMessage:"Password confirmation does not match."
        })
    }
    user.password = newPassword
    await user.save()
    req.flash("info", "Password updated")
    req.session.destroy()
    return res.redirect("/users/logout")
}
3



export const remove =  (req, res) => res.send("Remove User")

export const see = async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
          path: "owner",
          model: "User",
        },
      });
    if(!user) {
        return res.status(404).render("404", {pageTitle: "User not found."})
    }
    return res.render("users/profile", {pageTitle: user.name, user})
}
