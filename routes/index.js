
var express = require('express');
var router = express.Router();
const path = require('path');
const sqlite3 = require("sqlite3").verbose();
const database = path.join(__dirname, "/basededatos", "basededatos.db");
const db = new sqlite3.Database(database, (err) => {
  if (err) return err;
});
require('dotenv').config()



const img = "CREATE TABLE images (id INTEGER PRIMARY KEY AUTOINCREMENT,producto_id INTEGER NOT NULL,url TEXT NOT NULL,destacado BOOLEAN NOT NULL,FOREIGN KEY (producto_id) REFERENCES products (id));"
const category = "CREATE TABLE categorys (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre VARCHAR(200) NOT NULL);";
const product = "CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT,nombre VARCHAR(200) NOT NULL,codigo INT(100) NOT NULL,precio NUMERIC NOT NULL,estado TEXT NOT NULL,envio TEXT NOT NULL,descripcion TEXT NOT NULL,categoria_id INTEGER NOT NULL,FOREIGN KEY (categoria_id) REFERENCES categorys (id))";
db.run(category, (err) => {
  db.run(img, (err) => {
    db.run(product, (err) => {
      if (err) {
        console.log(err)
      }
    })
  })
})


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

router.get('/deleteProduct/:id',(req,res) => {
  const sqlQuery = "DELETE FROM products WHERE id = ?";
  db.run(sqlQuery,req.params.id,(err,row) => {
    err ? err:res.redirect('/adminInterface')
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



router.get("/editCategory", (req,res) => {
  db.all(`SELECT * FROM categorys`,[],(err,categoryView) => {
    res.render('editCategory',{
      Productcategory:categoryView
    })
  })
})


router.post("/editCategory/:id",(req,res) => {
  const { id } = req.params;
  db.run(`UPDATE categorys SET nombre = ? WHERE id = ?`,[req.body.categoryProduct,id],(err) => {
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

router.post('/editProduct/:id',(req,res) => {
  const { id } = req.params;
  const { name, code, price, estado, envio, description, idCategory } = req.body;
  console.log(description)
  db.run(`UPDATE products SET nombre = ?, codigo = ?, precio = ?, estado = ?, envio = ?, descripcion = ?, categoria_id = ? WHERE (id = ?)`,
  [name, code, price, estado, envio, description, idCategory,id],(err) => {
    err ? console.log(err):res.redirect('/admin');
  })
})

router.get('/admin',(req,res) => {
  res.render('indexLogin.ejs')
})

router.post("/login",(req,res) => {
  const { user,password } = req.body;
  if(user == process.env.USER && password == process.env.USER_PASSWORD){
    res.redirect('/adminInterface');
  }else{
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


router.post('/filtro',(req,res) => {
  const { name, estado, envio } = req.body;
  const sqlQuery = "SELECT products.*, images.url FROM products LEFT JOIN images ON products.id = images.producto_id WHERE products.nombre = ? OR products.estado = ? OR products.envio = ?"
  const sqlCategory = "SELECT * FROM categorys";
  db.all(sqlQuery,[name,estado,envio],(err,product) => {
    console.log(product)
    db.all(sqlCategory,[],(err,category) => {
      res.render('index',{
        Product: product,
        Productcategory: category,
        Productimg: product
      })
    })
  })
})


router.post("/login", (req, res) => {
  const { user, password } = req.body;
  if(user == process.env.USER && password == process.env.USER_PASSWORD){
    res.redirect('/admin');
  } else {
    res.redirect('/');
  }
})


module.exports = router;