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

      request.execute('ThemTaiKhoanOnline',(err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`them thanh cong tai khoan: ${req.params.id}`);
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
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      request.input('Mataikhoan',sql.CHAR(6),req.params.id);
      request.execute('XoaTaiKhoan',(err,data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`Xoa thanh cong tai khoan co id: ${req.params.id}`);
          res.status(200).send('Procedure executed successfully');
        }
      })

    })
});
//edit phim
app.put('/tkonline/edit', async(req,res) => {
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

      request.execute('SuaThongTinTaiKhoan',(err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`sua thanh cong tai khoan: ${Mataikhoan}`);
          res.status(200).send('Procedure executed successfully');
        }
      })
    })
})

app.get('/sub/view', async (req,res) => {
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      sqlString = 'SELECT sc.Masuatchieu, sc.Ngaychieu, sc. Giobatdau, sc.Gioketthuc, p.Tenphim, pcp.Tenphong, rp.Tenrap FROM Suat_chieu sc JOIN Phim p ON sc.Maphim = p.Maphim JOIN Phong_chieu_phim pcp ON sc.Maphong = pcp.Maphong JOIN Rap_phim rp ON pcp.Marap = rp.Marap ORDER BY sc.Ngaychieu';
      request.query(sqlString, (err, data) => {
        res.send({result: data.recordset});
      })
    })
})

app.get('/sub/search/:id', async (req,res) => {
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      request.input('RapPhimId',sql.CHAR(4),req.params.id)
      request.execute('Tim_Suat_Chieu', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`tim suat chieu cua rap phim id: ${req.params.id}`);
          res.status(200).send({result: data.recordset});
        }
      })
    })
})

app.get('/sub/edit', async (req,res) => {
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      
    })
})

app.get('/statistics/view/:year', async(req,res) => {
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      request.input('Year', sql.CHAR(4), req.params.year);
      request.execute('GetUserAccountInfoAfter', (err,data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`running Get user account after...${req.params.year}`);
          res.status(200).send({result: data.recordset});
        }
      })
    })
})

app.get('/availableseats/view/:id', async(req,res) => {
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      sqlString = `DECLARE @Masuatchieu CHAR(6) = '${req.params.id}'
      SELECT dbo.TinhSoGheConTrong(@Masuatchieu) AS Soghecontrong, sc.Masuatchieu
      FROM Suat_chieu sc
      WHERE @Masuatchieu = sc.Masuatchieu`;
      request.query(sqlString, (err,data) => {
        res.send({result: data.recordset});
      })
    })
})



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/view' + '/index.html');
});

app.get('/sub', (req, res) => {
  res.sendFile(__dirname + '/view' + '/sub.html');
});

app.get('/statistics', (req, res) => {
  res.sendFile(__dirname + '/view' + '/statistics.html');
});

app.get('/availableseats', (req, res) => {
  res.sendFile(__dirname + '/view' + '/seat.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});