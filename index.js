const express = require('express');
const bodyParser = require('body-parser');
const {conn, sql} = require('./connect');

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/view'));//thu muc view
//xem phim dang co
app.get('/phim', async (req,res) => {
  var pool = await conn;
  var sqlString = "SELECT * FROM Phim";
  return await pool.request().query(sqlString, (err,data) => {
    res.send({result: data.recordset});
  });
});

app.get('/phim/:id', async (req,res) => {
  var pool = await conn;
  var sqlString = `SELECT * FROM Phim WHERE Maphim = ${req.params.id}`;
  return await pool.request().query(sqlString, (err,data) => {
    if (data.recordset.length > 0){
      res.send({result: data.recordset[0]});
    }
    else {
      res.send({result: null});
    }
  });
});
//tai len phim moi
app.post('/phim/post', async (req,res) => {
  var pool = await conn;
  var sqlString = "INSERT INTO Phim(Maphim,Tenphim) VALUES(@Maphim, @Tenphim)";
  return await pool.request()
  .input("Maphim",sql.VARCHAR,req.body.Maphim)
  .input("Tenphim",sql.VARCHAR,req.body.Tenphim)
  .query(sqlString, (err,data) => {
    res.send({result:req.body});
  });
});
//edit phim
app.put('/phim/edit',async (req,res) => {
  var pool = await conn;
  var sqlString = "UPDATE Phim SET Tenphim = @Tenphim, Daodien = @Daodien WHERE Maphim = @Maphim";
  return await pool.request()
  .input("Maphim",sql.VARCHAR,req.body.Maphim)
  .input("Tenphim",sql.VARCHAR,req.body.Tenphim)
  .input("Daodien",sql.VARCHAR,req.body.Daodien)
  .query(sqlString, (err,data) => {
    res.send({result:req.body});
  });
})
//xoa
app.delete('/phim/delete/:id', async (req,res) => {
  var pool = await conn;
  var sqlString = `DELETE FROM Phim WHERE Maphim = ${req.params.id}`;
  return await pool.request().query(sqlString, (err,data) => {
    if (!err){
      res.send("xoa thanh cong!!!");
    }
    else {
      res.send("co loi xay ra!!!");
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/view' + '/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});