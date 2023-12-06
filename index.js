const express = require('express');
const bodyParser = require('body-parser');
const { conn, sql } = require('./connect');
const handlebars = require('express-handlebars');
const moment = require('moment-timezone');
const app = express();
const methodOverride = require('method-override');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

app.engine('hbs', handlebars.engine({
  extname: '.hbs',
  helpers: {
    formatDate: function (date) {
      // Use moment to format the date
      return moment(date).format('MMMM D, YYYY');
    },
    formatTime: function (time) {
      var formatedTime = moment(time).tz("Asia/Ho_Chi_Minh").format('HH:mm:ss');
      const timeArray = formatedTime.split(':');

      // Lấy giá trị xx từ mảng và chuyển đổi thành số nguyên
      let hours = parseInt(timeArray[0], 10);

      //   +16
      hours += 16;

      // Đảm bảo rằng giá trị không âm
      if (hours < 0) {
        hours = 0;
      }

      // Chuyển đổi giờ thành chuỗi và đảm bảo rằng nó có hai chữ số
      const updatedHours = hours.toString().padStart(2, '0');

      // Tạo chuỗi mới với giá trị xx đã cập nhật
      const updatedString = `${updatedHours}:${timeArray[1]}:${timeArray[2]}`;
      return updatedString;
    }
  },
}));
app.set('view engine', 'hbs');
app.set('views', './views'); //set view for APP

//----------------[GET] - '/'
app.get('/', async (req, res) => {
  res.render('main-app');
});

app.get('/home', async (req,res) => {
  try {
    // Use the connection pool to query the database
    const pool = await conn;
    const result = await pool.request().query('SELECT * FROM Tai_khoan_online'); // Replace 'YourTableName' with your actual table name
    const data = result.recordset;

    // Render the 'index' view and pass the data to it
    res.render('home', { data });
  } catch (err) {
    console.error('Error querying SQL Server:', err);
    res.status(500).send('Internal Server Error');
  }
})

//----------------[GET] - '/'
app.get('/edit/:id', async (req, res) => {
  const pool = await conn;
  const result = await pool.request().query(`SELECT * FROM Tai_khoan_online WHERE Mataikhoan = ${req.params.id}`); // Replace 'YourTableName' with your actual table name
  const tk = result.recordset[0];
  console.log(tk);
  // Render the 'index' view and pass the data to it
  res.render('edit', { tk });
  // res.json(tk);
})

app.get('/delete/:id', async (req, res) => {
  const pool = await conn;
  const result = await pool.request().query(`SELECT * FROM Tai_khoan_online WHERE Mataikhoan = ${req.params.id}`); // Replace 'YourTableName' with your actual table name
  const tk = result.recordset[0];
  console.log(tk);
  // Render the 'index' view and pass the data to it
  res.render('delete', { tk });
  // res.json(tk);
})

app.get('/add', async (req, res) => {
  res.render('add');
  // res.json(tk);
})

app.get('/search/start', async (req, res) => {
  const pool = await conn;
  const result = await pool.request().query(`SELECT * FROM Suat_chieu`); // Replace 'YourTableName' with your actual table name
  const sc = result.recordset;
  console.log(sc);
  // Render the 'index' view and pass the data to it
  const pool1 = await conn;
  const result1 = await pool1.request().query(`SELECT * FROM Rap_phim`); // Replace 'YourTableName' with your actual table name
  const rp = result1.recordset;
  res.render('search-start',{sc,rp});
})

app.get('/search/ans', async (req, res) => {
  console.log(req.query);
  const { Marap, Ngaychieu } = req.query;
  const pool1 = await conn;
  const result1 = await pool1.request().query(`SELECT * FROM Rap_phim`); // Replace 'YourTableName' with your actual table name
  const rp = result1.recordset;
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      request.query(`EXEC Tim_Suat_Chieu @RapPhimId = '${Marap}',
      @NgaychieuString = '${Ngaychieu}';`, (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`Tìm thành công`);
          console.log(data.recordset);
          const sc_data = data.recordset;
          res.render('search-ans', { sc_data, rp });
        }
      })
    })
})

app.get('/income', async(req,res) => {
  const pool = await conn;
  const result = await pool.request().query(`SELECT * FROM Phim`); 
  const phim = result.recordset;
  res.render('income',{phim});
})

app.get('/income/detail', async(req,res) => {
  console.log(req.query);
  const { Maphim } = req.query;
  const pool = await conn;
  const result = await pool.request().query(`SELECT * FROM Phim`); 
  const phim = result.recordset;
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      request.query(`SELECT * FROM TinhDoanhThuTheoPhim('${Maphim}')`, (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`Tính doanh thu thành công`);
          console.log(data.recordset);
          const income = data.recordset;
          res.render('income', { income, phim });
        }
      })
    })
})

app.get('/checkaccount', async (req,res) => {
  res.render('checkaccount');
})

app.get('/checkaccount/detail', async (req,res) => {
  console.log(req.query);
  let year = req.query.year;
  const pool = await conn;
  const result = await pool.request().query(`EXEC GetUserAccountInfoAfter @Year = '${year}'`);
  const acc = result.recordset;
  res.render('checkaccount',{acc, year});
})

app.put('/update', async (req, res) => {
  console.log(req.body);
  const { Mataikhoan, Tentaikhoan, Loaitaikhoan, Matkhau, NgayLapTK, Makhachhang, Manhanvien } = req.body;
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      request.input('Mataikhoan', sql.CHAR(6), Mataikhoan);
      request.input('Tentaikhoan', sql.VARCHAR(255), Tentaikhoan);
      request.input('Loaitaikhoan', sql.VARCHAR(255), Loaitaikhoan);
      request.input('Matkhau', sql.VARCHAR(255), Matkhau);
      request.input('NgaylapTKString', sql.VARCHAR(10), NgayLapTK);
      request.input('Makhachhang', sql.CHAR(9), Makhachhang);

      request.execute('SuaThongTinTaiKhoan', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`sua thanh cong tai khoan: ${Mataikhoan}`);
          res.render('backtohomepage');
        }
      })
    })
})

app.delete('/deleteEnd/:id', async (req, res) => {
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      request.input('Mataikhoan', sql.CHAR(6), req.params.id);
      request.execute('XoaTaiKhoan', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`Xoa thanh cong tai khoan co id: ${req.params.id}`);
          res.render('backtohomepage');
        }
      })

    })
})

app.post('/add', async (req, res) => {
  console.log(req.body);
  const { Mataikhoan, Tentaikhoan, Loaitaikhoan, Matkhau, NgayLapTK, Makhachhang } = req.body;
  conn
    .then(pool => {
      const request = new sql.Request(pool);
      request.input('Mataikhoan', sql.CHAR(6), Mataikhoan);
      request.input('Tentaikhoan', sql.VARCHAR(255), Tentaikhoan);
      request.input('Loaitaikhoan', sql.VARCHAR(255), Loaitaikhoan);
      request.input('Matkhau', sql.VARCHAR(255), Matkhau);
      request.input('NgaylapTKString', sql.VARCHAR(10), NgayLapTK);
      request.input('Makhachhang', sql.CHAR(9), Makhachhang);

      request.execute('ThemTaiKhoanOnline', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }
        else {
          console.log(`them thanh cong tai khoan: ${Mataikhoan}`);
          res.render('backtohomepage');
        }
      })
    })
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});