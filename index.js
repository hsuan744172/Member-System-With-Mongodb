//1.準備資料庫連線
const { MongoClient, ServerApiVersion } = require("mongodb"); //載入
const uri =
  "mongodb+srv://root:hsuan744172@cluster0.duewmps.mongodb.net/?retryWrites=true&w=majority"; //連線到主機
//(通訊協定 )
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let db = null;
async function run() {
  await client.connect();
  db = await client.db("website-1");
  console.log("Database Ready");
}
run().catch(console.dir);

//2.載入exprss
const express = require("express");
const app = express(); //建立Application 物件
//設定express-session 做使用者狀態管理
const session = require("express-session");
app.use(
  session({
    secret: "abcdefg",
    resave: false,
    saveUninitialized: true,
  })
);
//設定支援取得post方法的參數
const bodyParser = require("body-parser");
const { name } = require("ejs");
app.use(bodyParser.urlencoded({ extended: true }));
//使用樣板引擎
app.set("view engine", "ejs"); //new (npm install ejs)
//處理網站的靜態檔案網址對應
app.use(express.static("public"));

function isValidEmail(email) {
  var re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
function isValidPassword(password) {
    // 密碼必須至少有六個字元，並且至少包含一個特殊字元
    var re = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return re.test(password);
}
app.post("/signup", async function (req, res) {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  //新增到資料庫
  if (isValidEmail(email) && isValidPassword(password)) {
    let collection = db.collection("member");
    let member = await collection.findOne({ email: email });
    if (member != null) {
      res.send("Failed: Repeated mail");
    } else {
      await collection.insertOne({
        name: name,
        email: email,
        password: password,
        time: Date.now(),
      });
      res.send("OK");
    }
  }
  else{
    let message = "";
    if(!isValidEmail(email)){
        message += "Invalid Email. ";
    }
    if(!isValidPassword(password)){
        message += "Invalid Password. Must be at least 6 characters and contain at least one special character.";
    }
    res.send(message);
  }
});

app.post("/signin", async function (req, res) {
  let email = req.body.email;
  let password = req.body.password;
  let collection = db.collection("member");
  let member = await collection.findOne({
    $and: [{ email: email }, { password: password }],
  });
  if (member != null) {
    req.session.member = {
      name: member.name,
      email: member.email,
    };
    res.redirect("/member");
  } else {
    req.session.member = null;
    res.redirect("/");
  }
});
app.get("/member", async function (req, res) {
    if (req.session.member) {
    let collection = db.collection("message");
    let result = await collection.find({}).sort({
      time: -1,
    });
    let data = await result.toArray();
    res.render("member.ejs", { name: req.session.member.name, data: data });
  } else {
    res.redirect("/");
  }
});
app.get("/signout", function (req, res) {
  req.session.member = null;
  res.redirect("/");
});
app.post("/deleteMessage", async function (req, res) {
  let content = req.body.content;
  let name = req.session.member.name;
  let collection = db.collection("message");
  await collection.deleteOne({
    name: name,
    content: content,
  });
  res.redirect("/member");
});

app.post("/postMessage", async function (req, res) {
  let content = req.body.content;
  let name = req.session.member.name;
  let time = Date.now();
  let collection = db.collection("message");
  await collection.insertOne({
    name: name,
    content: content,
    time: time,
  });
  res.redirect("/member");
});

//用GET方法處理來自/test的連線
app.get("/square", function (req, res) {
  //路由
  //取得網址列的參數
  let num = req.query.num;
  let exp = req.query.exp;
  let result = Math.pow(num, exp);
  res.render("test.ejs", { ans: result }); //new
});

//用GET方法動態處理來自路徑/square/數字的連線
// app.get("/square/:num", function (req, res) {//對應name參數
//     //取得路徑參數req.params.參數名稱
//     let num = req.params.num;
//     let result = num * num;
//     res.send("result is: " + result);
// })
//啟動伺服器在http://127.0.0.1:3000/路徑?參數名稱=資料&參數名稱=資料&...
app.listen(3000, function () {
  console.log("Server started");
});
