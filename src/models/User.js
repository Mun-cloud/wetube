import bcrypt from "bcrypt"
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    avatarUrl: String,
    socialOnly:{type:Boolean, default:false},
    username: {type: String, required: true, unique: true},
    password: {type: String },
    email: { type: String, required: true, unique: true},
    location: String,
    comments: [{type:mongoose.Schema.Types.ObjectId, required: true, ref:"Comment"}],
    videos: [{type:mongoose.Schema.Types.ObjectId, ref:"Video"}]
})

userSchema.pre("save", async function() {   //this는 컨트롤러 상에서 선언한 user를 대체함.
    if(this.isModified("password")){        // isModified 변경사항이 있는지를 boolean으로 도출. ("password")라 함은
        this.password = await bcrypt.hash(this.password, 5)                     //user.password의 변경사항을 검토
    }
})

const User = mongoose.model("User", userSchema)

export default User