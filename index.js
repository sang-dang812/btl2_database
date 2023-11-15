const express = require('express');
const bodyParser = require('body-parser');
const {conn, sql} = require('./connect');

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/view'));//thu muc view
//xem tai khoan dang co
app.get('/tkonline/view', async (req,res) => {
  var pool = await conn;
  var sqlString = "SELECT * FROM Tai_khoan_online";
  return await pool.request().query(sqlString, (err,data) => {
    res.send({result: data.recordset});
  });
});
//xem tai khoan dang co = id
app.get('/tkonline/view/:id', async (req,res) => {
  var pool = await conn;
  var sqlString = `SELECT * FROM Tai_khoan_online WHERE Mataikhoan = ${req.params.id}`;
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
app.post('/tkonline/post', async (req,res) => {
  const { Mataikhoan, Tentaikhoan, Loaitaikhoan, Matkhau, NgaylapTKString, Makhachhang, Manhanvien } = req.body;
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      request.input('Mataikhoan', sql.CHAR(6), Mataikhoan);
      request.input('Tentaikhoan', sql.VARCHAR(255), Tentaikhoan);
      request.input('Loaitaikhoan', sql.VARCHAR(255), Loaitaikhoan);
      request.input('Matkhau', sql.VARCHAR(255), Matkhau);
      request.input('NgaylapTKString', sql.VARCHAR(10), NgaylapTKString);
      request.input('Makhachhang', sql.CHAR(9), Makhachhang);
      request.input('Manhanvien', sql.CHAR(6), Manhanvien);

      request.execute('ThemTaiKhoanOnline',(err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(result.recordsets);
          res.status(200).send('Procedure executed successfully');
        }
      })
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});
//xoa phim
app.delete('/tkonline/delete/:id', async(req,res) => {
  var pool = await conn;
  var sqlString = `DELETE FROM Tai_khoan_online WHERE Mataikhoan = ${req.params.id}`;
  return await pool.request().query(sqlString, (err,data) => {
    if (!err){
      res.send('Xoa thanh cong!!');
    }
    else {
      res.send('Xoa thai bai, co loi xay ra!');
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