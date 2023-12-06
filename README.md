# btl2_database
1. Cài các package cần thiết: express, body-parser, express-handlebars, method-override,
   moment, moment-timezone, msnodesqlv8, mssql, nodemon
2. Cấu hình file connect.js trước khi chạy
   var config = {
      server:"{your-server-name}",
      user:"{your-username}",
      password:"{your-password}",
      database:"{your-dtb-name, at here, it's BTL_Cinema}",
      driver:"msnodesqlv8"
    };
