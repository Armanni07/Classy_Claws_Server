import mysql from "mysql2";

export const database = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "darkness",
  database: "Classy_Claws",
  waitForConnections: true,
  connectionLimit: 20, 
  queueLimit: 0, 
});


database.getConnection((err)=>{
    if(err) throw err;
    console.log("Connected to Classy Claws Database");
})