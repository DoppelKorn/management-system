const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = 3000;
const mysql = require("mysql");
const path = require("path");
const formidable = require('formidable');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(express.static(path.join(__dirname,'..', 'frontend')));


//zugriffsdaten für die Datenbank
let con = mysql.createConnection({
    connectionLimit: 100,
    host: "",
    user: "",
    password: "",
    database: "",
    dateStrings: true
});


//stellt die Verbindung zur Datenbank here
con.connect(function (err) {
    if (err) throw err;
    console.log("Verbunden mit Datenbank!");
});


//Server starten
server.listen(port, (err) => {
    if (err) {
        throw err;
    }
    console.log("Server listen on Port: " + port);
});




/**
 * Holt alle einträge aus der Datenbank. Anschließend wird das Datum von jedem Eintrag mit dem aktuellen Datum verglichen.
 * Wenn das Datum eines Eintrages schon abgelaufen ist, wird der Eintrag mit der entsprechenden ID gelöscht. Wenn ein Eintrag gelöscht wurde und "deleted = true" ist,
 * werden erneut alle Einträge abgefragt und diese übermittelt. Wenn kein eintrag gelöscht wurde, werden die ursprünglichen Daten von der
 * ersten Abfrage übermittelt.
 */
app.get('/calendarLoad', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Einträge von der Schnittstelle laden
    con.query("SELECT * FROM calendar", function (err, result) {
        if (err) throw err;
        console.log(result.length + " Entries loaded. ");
        if (result[0] === null) {
            console.log("No Entries available...");
            res.end();
        } else {
            let nowDate = new Date();
            let date = nowDate.getFullYear()+'-'+("0" + (nowDate.getMonth()+1)).slice(-2)+'-'+("0" + nowDate.getDate()).slice(-2);
            let deleted = false;
            for(let i = 0; i < result.length; i++){
                if(result[i].date < date){
                    deleteEntry(result[i].id, 'calendar');
                    deleted = true
                }
            }

            if(deleted === true){
                con.query("SELECT * FROM calendar", function (err, result) {
                    if (err) throw err;
                    res.json(result);
                });
            }else{
                res.json(result);
            }

            res.end();
        }
    });
});


/**
 * Updated einen Eintrag in der Datenbank, mit den übergeben bekommenen Daten.
 */
app.post('/calendarUpdate', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Eintrag von der Schnittstelle updaten
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => {
        let parsedData = JSON.parse(data);
        let sql = "UPDATE calendar SET description = ?, date = ?, invitedusers = ?, startTime = ?, endTime = ? WHERE id = ?";
        con.query(sql, [parsedData.description, parsedData.date, parsedData.invitedusers, parsedData.startTime, parsedData.endTime, parsedData.id], function (err, result) {
            if (err) throw err;
            console.log(result.affectedRows + " entry updated with id " + parsedData.id);
        });
       });
    res.send(true);
    res.end;
});


/**
 * Löscht einen Eintrag aus der Datenbank, welcher die übergeben bekommene ID hat
 */
app.post('/calendarDelete', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Eintrage von der Schnittstelle löschen
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => {
        console.log("Request send on: " + req.url);
        deleteEntry(data, 'calendar');
    });
    res.send(true);
    res.end();
});


/**
 * Erstellt einen neuen Eintrag in der Datenbank, mit den übergeben bekommenen Daten
 */
app.post('/calendarInsert', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Eintrage zu der Schnittstelle hinzufügen
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => {
        let parsedData = JSON.parse(data);
        var sql = "INSERT INTO calendar (description, date, invitedusers, startTime, endTime) VALUES (?, ?, ?, ?, ?)";
        con.query(sql, [parsedData.description, parsedData.date, parsedData.invitedusers, parsedData.startTime, parsedData.endTime],function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    });
    res.send(true);
    res.end();
});

app.get('/todoListsLoad', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Einträge von der Schnittstelle laden
    con.query("SELECT * FROM todo_lists", function (err, result) {
        if (err) throw err;
        console.log(result.length + " Entries loaded. ");
        if (result[0] === null) {
            console.log("No Entries available...");
            res.end();
        } else {
            res.json(result);
            res.end();
        }
    });
});

app.get('/todosLoad/:todoListId', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Einträge von der Schnittstelle laden
    con.query(`SELECT * FROM todos WHERE todo_lists_id LIKE ${req.params.todoListId}`, function (err, result) {
        if (err) throw err;
        console.log(result.length + " Entries loaded. ");
        if (result[0] === null) {
            console.log("No Entries available...");
            res.end();
        } else {
            res.json(result);
            res.end();
        }
    });
});

/**
 * Erstellt einen neuen Eintrag in der Datenbank, mit den übergeben bekommenen Daten
 */
app.post('/todoInsert', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Eintrage zu der Schnittstelle hinzufügen
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => {
        let parsedData = JSON.parse(data);
        var sql = "INSERT INTO todos (description, duedate, priority, active, todo_lists_id) VALUES (?, ?, ?, 1, ?)";
        con.query(sql, [parsedData.description, parsedData.dueDate, parsedData.priority, parsedData.todoListsId],function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    });
    res.send(true);
    res.end();
});

/**
 * Erstellt einen neuen Eintrag in der Datenbank, mit den übergeben bekommenen Daten
 */
app.post('/todoListInsert', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Eintrage zu der Schnittstelle hinzufügen
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => {
        let parsedData = JSON.parse(data);
        var sql = "INSERT INTO todo_lists (name) VALUES (?)";
        con.query(sql, [parsedData.name],function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    });
    res.send(true);
    res.end();
});

/**
 * Bearbeitet einen Eintrag in der Datenbank, mit den übergeben bekommenen Daten
 */
app.post('/todoUpdate', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Eintrage zu der Schnittstelle hinzufügen
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => {
        let parsedData = JSON.parse(data);
        let sql = "UPDATE todos SET description = ?, duedate = ?, priority = ?, active = ? WHERE id = ?";
        con.query(sql, [parsedData.description, parsedData.dueDate, parsedData.priority, parsedData.active, parsedData.id], function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    });
    res.send(true);
    res.end();
});

/**
 * Löscht einen Eintrag in der Datenbank, mit der übergeben bekommenen Id
 */
app.post('/todoDelete/:todoId', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Einträge von der Schnittstelle laden
    deleteEntry(req.params.todoId, 'todos');
    res.send(true);
    res.end();
});

/**
 * Löscht einen Eintrag in der Datenbank, mit der übergeben bekommenen Id
 */
app.post('/todoListDelete/:todoListsId', (req, res) => {
    console.log("Request send on: " + req.url);
    //todo: Einträge von der Schnittstelle laden
    deleteEntry(req.params.todoListsId, 'todo_lists');
    res.send(true);
    res.end();
});

/**
 * Löscht den Eintrag aus der DB, welcher die entsprechende ID hat
 * --Delete hat eine eigene Funktion, da es mehrfach zum Einsatz kommt--
 *
 * @param id - ID des zu löschenden Eintrages
 */
function deleteEntry(id, table) {
    console.log("Delete Entry with id " + id);
    console.log("Delete From: " + table);
    con.query(`Delete from ${table} where id = ${id}`, function (err, result) {
        console.log(result);
    });
}


//Seite für die Kontakte anzeigen
app.get("/contacts", async (req, res) => {
            const pathToFile = path.join(__dirname,'..', "frontend", "kontakte.html");
            res.sendFile(pathToFile);
  
});



//Seite um Kontakte zu adden anzeigen
app.get('/addKontakt', async (req, res) => {
            const pathToFile = path.join(__dirname,'..', "frontend","addKontakt.html");
            res.sendFile(pathToFile);

})


//Added Kontakte in die DB. Die Daten werden übergeben
app.post('/contacts', (req, res) => {
    console.log("Request send on: " + req.url);
    res.status(200);
    const user = req.body;
    const form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.parse(req, async(err, fields, files) => {
        const form = JSON.parse(fields.form);

        var sql = `INSERT INTO contacts (description, firstname, lastname, company, phone, mail, address) VALUES (?,?,?,?,?,?,?)`;
        con.query(sql, [form.description,form.Vorname,form.name,form.Company,form.phone,form.mail,form.address], function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows );
    });

        res.json({ working: true });
        res.end();
   
    })
});


// Lade Daten
app.get("/loadContacts", async (req, res) => {
    con.query("SELECT * FROM contacts" , function (err, result) {
        if (err) {
            console.error(err.message);
        } else {
            data = JSON.stringify(result);
            res.status(200).send({contacts: data});
            console.log(`${result}`);
        }
    });
});

// Bearbeite Kontakt
app.get("/editContact/:contactId", async (req, res) => {
    const pathToFile = path.join(__dirname,'..', "frontend","kontaktBearbeiten.html");
            res.sendFile(pathToFile);

})

app.get("/loadContactToEdit/:contactId", async (req, res) => {
    con.query("SELECT * FROM contacts WHERE id=?"  , [req.params.contactId],function (err, result) {
        if (err) {
            console.error(err.message);
        } else {
            data = JSON.stringify(result);
            res.status(200).send({contacts: data});  
            
        }
    });
});

app.put("/ContactEdited", async (req, res) => {
    console.log("Request send on: " + req.url);
    res.status(200);
    const user = req.body;
    const form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.parse(req, async(err, fields, files) => {
        const form = JSON.parse(fields.form);
        var sql = `UPDATE contacts SET description = ?, firstname = ?, lastname = ?, company = ?, phone= ? ,mail = ?, address =? WHERE id = ?`;
        con.query(sql, [form.description,form.Vorname,form.name,form.Company,form.phone,form.mail,form.address,form.id], function (err, result) {
        if (err) throw err;
        console.log(result.affectedRows );
    });

        res.json({ working: true });
        res.end();
   
    })

})


// Lösche Kontakt aus der Datenbank
app.post("/deleteContact/:contactId", async (req, res) => {
    var sql = `DELETE FROM contacts WHERE id = ?`;
    con.query(sql, [req.params.contactId], function(err, result) {
        if (err) {
            throw err; 
        } else {
            res.status(200).send({msg: "Der Kontakt wurde gelöscht!"});
            console.log(`${result}`);
        }  
    }); 
});




// Lösche alle Daten aus der Datenbank
app.post("/deleteAllContacts", async (req, res) => {
    var sql = `DELETE FROM contacts`;
    con.query(sql, function(err, result) {
        if (err) {
            throw err; 
        } else {
            res.status(200).send({msg: "Kontakte wurden gelöscht!"});
            console.log(`${result}`);
        }  
    }); 
});
