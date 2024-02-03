const { MongoClient, ServerApiVersion } = require('mongodb');//載入
const uri = "mongodb+srv://root:hsuan744172@cluster0.duewmps.mongodb.net/?retryWrites=true&w=majority";//連線到主機
            //(通訊協定 )
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //資料庫的基本操作
    //選擇要操作的資料庫 client.db("資料庫名稱");
    let db=client.db("website");
    //選擇要操作的集合db.collection("集合的名稱");
    let collection=db.collection("user");
    //做CRUD資料的操作:Create,Read,Update,Delete
    //新增一比會員資料
    /*每執行一次會塞一筆資料
    let result=await collection.insertOne({
        name:"ply",email:"ply@ply.com",password:"ply",level:3

    });
    console.log(result);
    */
    //新增多筆資料
    /*
    let result=await collection.insertMany([
        {name:"aaa",email:"aaa@aaa.com",password:"aaa",level:1},
        {name:"bbb",email:"bbb@bbb.com",password:"bbb",level:1},
        {name:"ccc",email:"ccc@ccc.com",password:"ccc",level:2},
        {name:"ddd",email:"ddd@ddd.com",password:"ddd",level:4},
        {name:"eee",email:"eee@eee.com",password:"eee",level:4}

    ]);
    console.log(result);
    */
    //更新一筆資料collection.updateOne(篩選條件,更新的資料);
    /*let result =await collection.updateOne({
        email:"ccc@ccc.com"
    },{
        $set:{
            name:"嘻嘻嘻"
        }
    });
    */
    //更新多筆資料
    /*
    let result=await collection.updateMany({
        level:4
    },{
        $set:{
            level:5
        }
        
    });
    */
   //刪除資料 collection.deleteOne(篩選條件); collection.deleteMany
   /*let result=await collection.deleteOne({
        email:"ddd@ddd.com"
   });
   */
   //取得一筆資料 collection.findOne(篩選條件);只會給第一個 find 很多
   //$eq,$gt,$gte,$lt,$lte
   //分頁:一頁十筆，抓第二頁
   let pageSize=10;
   let page=3;
   let result=await collection.find({
        level:{
            $gte:1
        }
   }).sort({
        level:-1//1:正向,-1:反向
   }).limit(pageSize).skip((page-1)*10);
   let data=await result.toArray();//整理資料
   console.log(data);
//    let result=await collection.findOne({
//         $and:[
//             {email:"ply@ply.com"},
//             {password:"ply"}
//         ]
//     });
//     console.log(result);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
