"use strict";
const http = require('http');
const express = require('express');
const cors = require('cors');
const mongo = require('mongodb');
const bodyParser = require('body-parser');
const fs = require("fs");
const PORT = process.env.PORT || 1337;
let mongoClient = mongo.MongoClient;
const CONNECTIONSTRING = process.env.MONGODB_URI || "mongodb+srv://MarcellinoDemis:p4ssW0rd@cluster0.j5izu.mongodb.net/test?authSource=admin&replicaSet=atlas-11xy39-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";
const CONNECTIONOPTION = { useNewUrlParser: true, useUnifiedTopology: true };
const DB_NAME = "DBrilieviperizie";
const app = express()
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const TTL_Token = 300;
const privateKey = fs.readFileSync("keys/privateKey.pem", "utf8");
const certificate = fs.readFileSync("keys/certificate.pem", "utf8");
const credentials = { "key": privateKey, "cert": certificate };
const server = http.createServer(credentials, app);
let paginaErrore = "";
let appUsername = "";
let codice = "";

server.listen(PORT, function () {
    console.log('Server listening on port ' + PORT);
    init();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.set('json spaces', 4);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

function init(req, res) {
    fs.readFile("./static/error.html", function (err, data) {
        if (!err)
            paginaErrore = data.toString();
        else
            paginaErrore = "<h1>Risorsa non trovata</h1>"
    });

    app.response.log = function (message) {
        console.log("Errore: " + message);
    }
}

/*********************** MIDDLEWARE ROUTES *********************** */

// log della richiesta
app.use("/", function (req, res, next) {
    console.log(" --------> " + req.method + " : " + req.originalUrl);
    next();
});

app.get("/", function (req, res, next) {
    controllaToken(req, res, next);
});

app.get("/index.html", function (req, res, next) {
    controllaToken(req, res, next);
});

//route relativa alle risorse statiche
app.use("/", express.static("./static"))


//routes di lettura dei parametri post
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// log dei parametri
app.use("/", function (req, res, next) {
    if (Object.keys(req.query).length > 0)
        console.log("parametri GET: " + JSON.stringify(req.query))
    if (Object.keys(req.body).length > 0)
        console.log("parametri BODY: " + JSON.stringify(req.body))
    next();
})

/**********************Middleware specifico relativo a JWT ********************************** */
app.post('/api/login', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DB_NAME);
            const collection = db.collection("Admin");

            let username = req.body.username;
            collection.findOne({ "username": username }, function (err, dbUser) {
                if (err)
                    res.status(500).send("Internal Error in Query Execution").log(err.message);
                else {
                    if (dbUser == null)
                        res.status(401).send("Username e/o Password non validi");
                    else {
                        bcrypt.compare(req.body.password, dbUser.password, function (err, ok) {
                            if (err)
                                res.status(500).send("Internal Error in bcrypt compare").log(err.message);
                            else {
                                if (!ok)
                                    res.status(401).send("Username e/o Password non validi");
                                else {
                                    let token = createToken(dbUser);
                                    writeCookie(res, token);
                                    res.send({ "ris": "ok" });
                                }
                            }
                        });
                    }
                }
                client.close();
            })
        }
    });
});

app.post('/api/loginCordova', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DB_NAME);
            const collection = db.collection("Utenti");

            let username = req.body.username;

            collection.findOne({ "username": username }, function (err, dbUser) {
                if (err)
                    res.status(500).send("Internal Error in Query Execution").log(err.message);
                else {
                    if (dbUser == null)
                        res.status(401).send("Username inesistente");
                    else {
                        let token = createToken(dbUser);
                        writeCookie(res, token);
                        appUsername = username;
                        codice = dbUser.codUtente;
                        res.send({ "ris": "ok" });
                    }
                }
                client.close();
            })
        }
    });
});

app.post('/api/logout', function (req, res, next) {
    res.clearCookie("token");
    res.send({ "ris": "ok" });
});

app.use("/api", function (req, res, next) {
    controllaToken(req, res, next);
});

function controllaToken(req, res, next) {
    let token = readCookie(req);
    if (token == "") {
        inviaErrore(req, res, 403, "Token mancante");
    }
    else {
        jwt.verify(token, privateKey, function (err, payload) {
            if (err) {
                inviaErrore(req, res, 403, "Token scaduto o corrotto");
            }
            else {
                let newToken = createToken(payload);
                writeCookie(res, newToken);
                req.payload = payload; //salvo il payload dentro request in modo che le api successive lo possano leggere e ricavare i dati necessari
                next();
            }
        });
    }
}

function inviaErrore(req, res, cod, errorMessage) {
    if (req.originalUrl.startsWith("/api/")) {
        res.status(cod).send(errorMessage);
    }
    else {
        res.sendFile(__dirname + "/static/login.html");
    }
}

function readCookie(req) {
    let valoreCookie = "";
    if (req.headers.cookie) {
        let cookies = req.headers.cookie.split(';');
        for (let item of cookies) {
            item = item.split('=');
            if (item[0].includes("token")) {
                valoreCookie = item[1];
                break;
            }
        }
    }
    return valoreCookie;
}

function createToken(data) {
    let json = {
        "_id": data["_id"],
        "username": data["username"],
        "iat": data["iat"] || Math.floor((Date.now() / 1000)),
        "exp": (Math.floor((Date.now() / 1000)) + TTL_Token)
    }
    let token = jwt.sign(json, privateKey);
    return token;

}

function writeCookie(res, token) {
    res.set("Set-Cookie", `token=${token};max-age=${TTL_Token};path=/;httponly=true`);
}

app.post("/api/signUp", function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al DB").log(err.message);
        else {
            let db = client.db(DB_NAME)
            let collection = db.collection("Utenti");

            let username = req.body["username"];

            collection.findOne({ "username": username }, function (err, dbUser) {
                if (err)
                    res.status(500).send("Errore find user").log(err.message);
                else {
                    if (dbUser == null)
                        res.send({ "ris": "nus" });
                    else
                        res.status(409).send("Utente già esistente");
                    client.close();
                }

            })
        }
    })
})

app.post("/api/utenti", function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al DB").log(err.message);
        else {
            let db = client.db(DB_NAME)
            let collection = db.collection("Utenti");
            collection.find({}).toArray(function (err, data) {
                if (err)
                    res.status(500).send("Errore ricerca utenti").log(err.message);
                else
                    res.send(data)
                client.close();
            })
        }
    })
})

app.post("/api/insertUser", function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al DB").log(err.message);
        else {
            let db = client.db(DB_NAME)
            let collection = db.collection("Utenti");
            console.log(req.body["codUtente"]);
            let codUtente = req.body["codUtente"];
            let username = req.body["username"];
            let surname = req.body["surname"];
            let name = req.body["name"];
            let mail = req.body["mail"];
            let dob = req.body["dob"];
            let pwd = req.body["password"];
            collection.insertOne({
                "codUtente": codUtente,
                "nome": name,
                "cognome": surname,
                "username": username,
                "password": pwd,
                "mail": mail,
                "dob": new Date(dob),
                "firstAccess": true
            }, function (err, data) {
                if (err)
                    res.status(500).send("Errore insert user").log(err.message);
                else {
                    res.send({ "ris": "ok" });
                }
                client.close();
            })
        }
    })
})

/*********************** Route specifiche ***************************** */

app.post('/api/uploadFoto', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DB_NAME);
            const collection = db.collection("Foto");

            let immagine = req.body.immagine;
            let latitudine = req.body.latitudine;
            let longitudine = req.body.longitudine;
            let dataOra = req.body.dataOra;
            let note = req.body.note;
            let noteAdmin = "";

            collection.insertOne({
                "username": appUsername,
                "codice": codice,
                "immagine": immagine,
                "latitudine": latitudine,
                "longitudine": longitudine,
                "dataOra": dataOra,
                "note": note,
                "noteAdmin": noteAdmin
            }, function (err, data) {
                if (err)
                    res.status(500).send("Errore - ").log(err.message);
                else 
                    res.send(data);
                client.close();
            })
        }
    });
});

app.post('/api/getInformazioni', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DB_NAME);
            const collection = db.collection("Foto");

            collection.find({}).toArray(function (err, data) {
                if (err)
                    res.status(500).send("Errore - ").log(err.message);
                else
                    res.send(data);
                client.close();
            })
        }
    });
});

app.post('/api/firstAccess', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DB_NAME);
            const collection = db.collection("Utenti");

            let username = req.body.username;

            collection.findOne({ "username": username }, function (err, data) {
                if (err)
                    res.status(500).send("Internal Error in Query Execution").log(err.message);
                else {
                    if (data == null)
                        res.status(401).send("Username inesistente");
                    else {
                        res.send(data);
                    }
                    client.close();
                }
            })
        }
    });
});

app.post('/api/verificaPassword', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DB_NAME);
            const collection = db.collection("Utenti");

            collection.findOne({ "username": appUsername }, function (err, dbUser) {
                if (err)
                    res.status(500).send("Internal Error in Query Execution").log(err.message);
                else {
                    if (dbUser == null)
                        res.status(401).send("Username non valido");
                    else {
                        bcrypt.compare(req.body.password, dbUser.password, function (err, ok) {
                            if (err)
                                res.status(500).send("Internal Error in bcrypt compare").log(err.message);
                            else {
                                if (!ok)
                                    res.status(401).send("Password non valida");
                                else {
                                    res.send({ "ris": "ok" });
                                }
                            }
                        });
                    }
                }
                client.close();
            })
        }
    });
});

app.post('/api/cambiaPassword', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DB_NAME);
            const collection = db.collection("Utenti");

            let oldPassword = req.body.oldPassword;
            let newPassword = bcrypt.hashSync(req.body.newPassword, 10);

            collection.updateOne({ "username": appUsername, "password": oldPassword }, { $set: { "password": newPassword, "firstAccess": false } }, function (err, data) {
                if (err)
                    res.status(500).send("updateOne: Internal Error in Query Execution").log(err.message);
                else {
                    if (data == null)
                        res.status(401).send("Password sbagliata");
                    else
                    {
                        res.send(data);
                    }  
                }
            })
        }
    });
});

app.post('/api/getInformazioniUtenti', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DB_NAME);
            const collection = db.collection("Utenti");

            collection.find({}).toArray(function (err, data) {
                if (err)
                    res.status(500).send("Errore - ").log(err.message);
                else
                    res.send(data);
                client.close();
            })
        }
    });
});

app.post('/api/addNoteAdmin', function (req, res, next) {
    mongoClient.connect(CONNECTIONSTRING, CONNECTIONOPTION, function (err, client) {
        if (err)
            res.status(503).send("Errore di connessione al database");
        else {
            const db = client.db(DB_NAME);
            const collection = db.collection("Foto");

            let noteAdmin = req.body.noteAdmin;
            let dataOra = req.body.dataOra;

            collection.updateOne({ "dataOra": dataOra}, { $set: { "noteAdmin": noteAdmin} }, function (err, data) {
                if (err)
                    res.status(500).send("updateOne: Internal Error in Query Execution").log(err.message);
                else {
                    if (data == null)
                        res.status(401).send("Server error");
                    else
                    {
                        res.send(data);
                    }  
                }
            })
        }
    });
});

/********** Route di gestione degli errori **********/

app.use("/", function (req, res, next) {
    res.status(404);
    if (req.originalUrl.startsWith("/api/")) {
        res.json("Risorsa non trovata"); //La serializzazione viene fatta dal metodo json()
    }
    else {
        res.send(paginaErrore);
    }
});

app.use(function (err, req, res, next) {
    console.log(err.stack);
});