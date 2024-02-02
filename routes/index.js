
var express = require('express');
var router = express.Router();
const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const database = path.join(__dirname, "/basededatos", "basededatos.db");
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const db = new sqlite3.Database(database, (err) => {
  if (err) return err;
});
require('dotenv').config()
/*
const img = "CREATE TABLE images (id INTEGER PRIMARY KEY AUTOINCREMENT,producto_id INTEGER NOT NULL,url TEXT NOT NULL,destacado BOOLEAN NOT NULL,FOREIGN KEY (producto_id) REFERENCES products (id));"
const category = "CREATE TABLE categorys (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre VARCHAR(200) NOT NULL);";
const product = "CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre VARCHAR(200) NOT NULL,codigo INT(100) NOT NULL,precio NUMERIC NOT NULL,estado TEXT NOT NULL,envio TEXT NOT NULL,descripcion TEXT NOT NULL,categoria_id INTEGER NOT NULL,FOREIGN KEY (categoria_id) REFERENCES categorys (id))";
const calificacion = "CREATE TABLE calificacion (producto_id INTEGER NOT NULL,user_id INTEGER NOT NULL,rating INTEGER NOT NULL)"
const Cart = "CREATE TABLE ventas(cliente_id TEXT NOT NULL,producto_id TEXT NOT NULL, cantidad TEXT NOT NULL,total_pagado TEXT NOT NULL,fecha TEXT NOT NULL,ip_cliente VARCHAR(255),FOREIGN KEY (cliente_id) REFERENCES clientes(id),FOREIGN KEY (producto_id) REFERENCES productos(id));"

db.run(calificacion, err => {
  err ? err : console.log('calificacion')
})
db.run(Cart, err => {
  err ? err : console.log('calificacion')
})



db.run(category, (err) => {
  db.run(img, (err) => {
    db.run(product, (err) => {
      if (err) {
        console.log(err)
      }
    })
  })
})
*/


/*Vista interfaz administrativa*/
router.get("/adminInterface", (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, product) => {
    db.all(`SELECT * FROM categorys`, [], (err, category) => {
      db.all(`SELECT * FROM images`, [], (err, img) => {
        res.render('admin', {
          Product: product,
          Productcategory: category,
          Productimg: img
        })
      })
    })
  })
})

router.get('/deleteProduct/:id', (req, res) => {
  const sqlQuery = "DELETE FROM products WHERE id = ?";
  db.run(sqlQuery, req.params.id, (err, row) => {
    err ? err : res.redirect('/adminInterface')
  })
})






router.get('/addProduct', (req, res) => {
  db.all(`SELECT * FROM categorys`, [], (err, category) => {
    res.render('addProduct', {
      Productcategory: category
    })
  })
})
router.post('/addProduct', (req, res) => {
  const destacado = 1;
  const { name, code, price, estado, envio, description, idCategory } = req.body;
  console.log(idCategory)
  db.run(`INSERT INTO products(nombre,codigo,precio,estado,envio,descripcion,categoria_id)
  VALUES (?,?,?,?,?,?,?)`, [name, code, price, estado, envio, description, idCategory], (err) => {
    console.log(err);
    db.run(`INSERT INTO images (producto_id,url,destacado) VALUES (?,?,?)`, ['', 'https://upload.wikimedia.org/wikipedia/commons/0/0a/No-image-available.png', destacado], (err) => {
      err ? console.log(err) : res.redirect('/adminInterface');
    })
  })
})

router.get("/addCategory", (req, res) => {
  db.all(`SELECT * FROM categorys`, [], (err, category) => {
    res.render("addCategory", {
      Productcategory: category
    })
  })
})


router.post("/addCategory", (req, res) => {
  const { categoryProduct } = req.body;
  db.run(`INSERT INTO categorys (nombre) VALUES (?);`, [categoryProduct], (err) => {
    err ? console.log(err) : res.redirect('/adminInterface')
  })
})



router.get("/editCategory", (req, res) => {
  db.all(`SELECT * FROM categorys`, [], (err, categoryView) => {
    res.render('editCategory', {
      Productcategory: categoryView
    })
  })
})


router.post("/editCategory/:id", (req, res) => {
  const { id } = req.params;
  db.run(`UPDATE categorys SET nombre = ? WHERE id = ?`, [req.body.categoryProduct, id], (err) => {
    err ? console.log(err) : res.redirect('/adminInterface')
  })
})




router.get("/addImage/:id", (req, res) => {
  const id = req.params.id;
  db.all(`SELECT * FROM categorys`, [], (err, category) => {
    db.all(`SELECT * FROM products WHERE id = ?`, id, (err, product) => {
      console.log(product);
      res.render("addImage", {
        Productcategory: category,
        idProduct: product
      })
    })
  })
})

router.post("/addImage/:id", (req, res) => {
  const destacado = 1;
  const img = req.body.imgProduct;
  const { id } = req.params;
  db.run(`UPDATE images SET producto_id = ?, url = ?, destacado = ? WHERE ( id = ?)`, [id, img, destacado, id], (err) => {
    if (err) {
      console.log(err)
    } else {
      res.redirect('/adminInterface');
    }
  })
})

router.get('/editProduct/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM products WHERE id = ?`, id, (err, idProduct) => {
    db.all(`SELECT * FROM categorys`, [], (err, rowCategory) => {
      res.render('editProduct', {
        Products: idProduct,
        Productcategory: rowCategory
      })
    })
  })
})

router.post('/editProduct/:id', (req, res) => {
  const { id } = req.params;
  const { name, code, price, estado, envio, description, idCategory } = req.body;
  console.log(description)
  db.run(`UPDATE products SET nombre = ?, codigo = ?, precio = ?, estado = ?, envio = ?, descripcion = ?, categoria_id = ? WHERE (id = ?)`,
    [name, code, price, estado, envio, description, idCategory, id], (err) => {
      err ? console.log(err) : res.redirect('/admin');
    })
})

router.get('/admin', (req, res) => {
  res.render('indexLogin.ejs')
})

router.post("/login", (req, res) => {
  const { user, password } = req.body;
  if (user == process.env.USER && password == process.env.USER_PASSWORD) {
    res.redirect('/adminInterface');
  } else {
    res.redirect('/')
  }
})


router.get("/", (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, queryProduct) => {
    db.all(`SELECT * FROM categorys`, [], (err, queryCategory) => {
      db.all(`SELECT * FROM images`, [], (err, queryImg) => {
        res.render('index', {
          Product: queryProduct,
          Productcategory: queryCategory,
          Productimg: queryImg
        })
      })
    })
  })
})


router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, queryProduct) => {
    db.all(`SELECT * FROM categorys`, [], (err, queryCategory) => {
      db.get(`SELECT * FROM images WHERE producto_id = ?`, [id], (err, queryImg) => {
        res.render('searchProduct', {
          Product: queryProduct,
          Productcategory: queryCategory,
          Productimg: queryImg
        })
      })
    })
  })
})



router.get('/categoryid/:id', (req, res) => {
  const { id } = req.params;
  const sqlCategory = "SELECT * FROM categorys"
  const sqlQuery = "SELECT products.*, images.url FROM products LEFT JOIN images ON products.id = images.producto_id WHERE products.categoria_id = ?";
  db.all(sqlQuery, id, (err, product) => {
    db.all(sqlCategory, [], (err, category) => {
      res.render('index', {
        Product: product,
        Productcategory: category,
        Productimg: product
      })
    })
  })
})


router.post('/filtro', (req, res) => {
  const { name, estado, envio } = req.body;
  const sqlQuery = "SELECT products.*, images.url FROM products LEFT JOIN images ON products.id = images.producto_id WHERE products.nombre = ? OR products.estado = ? OR products.envio = ?"
  const sqlCategory = "SELECT * FROM categorys";
  db.all(sqlQuery, [name, estado, envio], (err, product) => {
    console.log(product)
    db.all(sqlCategory, [], (err, category) => {
      res.render('index', {
        Product: product,
        Productcategory: category,
        Productimg: product
      })
    })
  })
})


router.post("/login", (req, res) => {
  const { user, password } = req.body;
  if (user == process.env.USER && password == process.env.USER_PASSWORD) {
    res.redirect('/admin');
  } else {
    res.redirect('/');
  }
})


/*Task3 coding*/

rutaProtegida = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      if (tokenAuthorized) {
        return next();
      }
      req.user = row.id;
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    res.redirect("/client/logincliente");
  }
};

rutaProtegidaLogin = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      if (tokenAuthorized) {
        res.redirect("/");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/");
    }
  } else {
    return next();
  }
};

router.get('/client/logincliente', (req, res) => {
  res.render('clientLogin.ejs');
})

router.get('/client/registercliente', (req, res) => {
  res.render('clientRegister', {
    recaptcha: process.env.PUBLIC
  });
})

router.post('/client/logincliente', (req, res) => {
  const { user, password } = req.body;
  db.get(`SELECT * FROM clientes WHERE usuario = ? AND pass = ?`, [user, password], (err, row) => {
    if (row) {
      const id = row.id;
      const token = jwt.sign({ id: id }, 'token');
      res.cookie("jwt", token);
      res.redirect('/');
    }
    else {
      console.log('Datos incorrectos');
      res.redirect('/logincliente');
    }
  })
})




router.post('/client/registercliente', async (req, res) => {
  const user = req.body.user;
  const pass = req.body.password;
  const nameClient = user;
  const direccion = req.body.direccion
  const secretkey = "6LeDoU0pAAAAAIBcBUhaf8sIyoF2RJojZ-blAmTI";
  const gRecaptchaResponse = req.body['g-recaptcha-response'];
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretkey}&response=${gRecaptchaResponse}`, {
    method: 'POST',
  });
  const captcha = await response.json();

  if (captcha.success) {
    db.get(`SELECT * FROM clientes WHERE usuario = ?`, [user], (err, row) => {
      if (row) {
        res.redirect('/registerclient')
      } else {
        db.get(`INSERT INTO clientes(nombreCliente,direccion,usuario,pass) VALUES(?,?,?,?)`, [nameClient, direccion, user, pass], (err, rows) => {
          if (err) {
            console.log(err)
          } else {
            res.redirect('/client/logincliente')
          }
        })
      }
    })
  } else {
    res.status(500).send('¡No se verifico el captcha!');
  }

})

router.post('/client/carrito/:id', rutaProtegida, (req, res) => {
  const id = req.params.id;
  const cantidad = req.body.cantidad;
  const total = req.body.precio;
  const totalapagar = cantidad * total
  const query = "SELECT * FROM products WHERE id = ?";
  db.get(query, [id], (err, product) => {
    console.log(product)
    db.get(`SELECT * FROM images WHERE producto_id = ?`, id, (err, img) => {
      res.render('purchase', {
        Product: product,
        Productimg: img,
        Cantidad: cantidad,
        Total: totalapagar
      })
    }
    )
  })
})


router.post('/client/carrito/buy/:id', async (req, res) => {
  const id = req.params.id;
  const tarjeta = req.body.tarjeta;
  const cvv = req.body.cvv;
  const fecha = req.body.fecha;
  const totalpagado = req.body.totalpagado;
  const cant = req.body.cantidad;
  const año = fecha.split('-')[0];
  const mes = fecha.split('-')[1];
  const fechaC = new Date();
  const fechaHoy = fechaC.toString();
  const ipClient = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
  try {
    const response = await fetch('https://fakepayment.onrender.com/payments', {

      method: 'POST',
      headers: {
        'Authorization': `Bearer ` + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJkYXRlIjoiMjAyNC0wMS0xMVQwNDowNTo0MC43MDVaIiwiaWF0IjoxNzA0OTQ1OTQwfQ.MOCuZ-BwithneB0N1hVRAhjo11My5iWyUcu6oKvd7ZQ',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: totalpagado,
        "card-number": tarjeta,
        cvv: cvv,
        "expiration-month": mes,
        "expiration-year": año,
        "full-name": "APPROVED",
        currency: "USD",
        description: "Transaction Successfull",
        reference: "payment_id:30"
      })
    });
    const data = await response.json();
    if (data.success == true) {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      const client_id = tokenAuthorized.id;
      db.run(`INSERT INTO ventas(cliente_id,producto_id,cantidad,total_pagado,fecha,ip_cliente) VALUES(?,?,?,?,?,?)`, [client_id, id, cant, totalpagado, fechaHoy, ipClient], (err, row) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/');
        }
      })
    }

  } catch (error) {
    console.log(error)
  }
})



router.get('/data/clients', (req, res) => {
  db.all(`SELECT * FROM categorys`, [], (err, categorys) => {
    db.all(`SELECT products.*, clientes.*, ventas.total_pagado, ventas.cantidad FROM products JOIN ventas ON products.id = ventas.producto_id JOIN clientes ON clientes.id = ventas.cliente_id;`, (err, query) => {
      if (err) {
        console.log(err)
      } else {
        res.render('clients', {
          Product: query,
          Productcategory: categorys,
        })
      }
    })
  })
});

router.get('/client/logout', async (req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/client/logincliente");
});





module.exports = router;