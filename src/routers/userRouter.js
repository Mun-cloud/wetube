import express from "express";
import { remove, logout, see, startGithubLogin, finishGithubLogin, getEdit, postEdit, getChangePassword, postChangePassword } from "../controllers/userController";
import { avatarUpload, protectorMiddleware, publicOnlyMiddleware,  } from "../middlewares";

const userRounter = express.Router()

userRounter.get("/logout", protectorMiddleware, logout)
userRounter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"), postEdit)
userRounter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword)
userRounter.get("/delete", remove)
userRounter.get("/github/start", publicOnlyMiddleware, startGithubLogin)
userRounter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin)

userRounter.get("/:id", see)

export default userRounter