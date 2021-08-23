import express from "express";
import morgan from "morgan";
import session from "express-session"
import flash from "express-flash";
import MongoStore  from "connect-mongo"
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRounter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

const app = express();
const logger = morgan("dev");

app.use(flash())
app.set("view engine", "pug")
app.set("views", process.cwd() + "/src/views")
app.use(logger);
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(
    session({
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    })
);
app.use(localsMiddleware)
app.use("/uploads", express.static("uploads"))  //외부에 있는 폴더를 서버에 공개하도록 express를 통해 연결시키는 역할
app.use("/static", express.static("assets"))  //app.use("/경로명", express.static("폴더명")) => 경로에 들어가면 폴더를 볼 수 있음.
app.use("/", rootRouter)
app.use("/users", userRounter)
app.use("/videos", videoRouter)
app.use("/api", apiRouter)

export default app