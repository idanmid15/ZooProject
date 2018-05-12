const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();
const users = {}; // Usernames -> Passwords
const departments = {};
const cookieSet = new Set(); // Unique IDs
const cookieToIdMap = {};
const departmentsNames = ["Mammals", "Birds", "Fish", "Reptiles", "Amphibians", "Arthropods"];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/public',express.static(path.join(__dirname, 'public')));
app.use('/protected',authHandler);
app.use('/protected',express.static(path.join(__dirname, 'protected')));

function User(firstName, lastName, id, department, password, isManager) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.id = id;
    this.department = department;
    this.shareDepartments = [];
    this.password = password;
    this.isManager = isManager;
    this.todoLists = {};
}

function TodoList(name, backgroundColor) {
    this.name = name;
    this.backgroundColor = backgroundColor;
    this.items = [];
}

function Animal(name, species, gender, age, additionalData, department) {
    this.name = name;
    this.species = species;
    this.gender = gender;
    this.age = age;
    this.additionalData = additionalData;
    this.department = department;
}

function authHandler(req, res, next) {
    if (req.cookies && req.cookies['UID'] && cookieSet.has(req.cookies['UID'])) {
        const id = cookieToIdMap[req.cookies['UID']];
        assignCookie(res, id);
        cookieSet.delete(req.cookies['UID']); // delete cookie uid from cookie set
        next();
        cookieToIdMap[req.cookies['UID']] = undefined; // delete cookie from cookieToUid map.
    } else
        res.status(403).end();
}

function isManager(id){
    const isManager = users[id].isManager;
    return (!(isManager === false || isManager === 'false'));
}

app.get('/public/hello.html', function (req,res) {
    res.sendFile('/public/login.html', {root: __dirname });
});

app.post('/register/:firstname/:lastname/:id/:department/:password/:ismanager', function (req, res) {
    const firstName = req.params.firstname;
    const lastName = req.params.lastname;
    const id = req.params.id;
    const department = req.params.department;
    const password = req.params.password;
    const isManager = req.params.ismanager;
    if (!users[id]) {
        users[id] = new User(firstName, lastName, id, department, password, isManager);
        assignCookie(res, id);
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

app.post('/login/:id/:password', function (req, res) {
    const id = req.params.id;
    const password = req.params.password;
    if (!users[id] || users[id].password !== password) {
        res.sendStatus(500);
    } else {
        assignCookie(res, id);
        res.sendStatus(200);
    }
});

app.get('/IsUserManager', authHandler, function (req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    if (!isManager(id)) {
        res.sendStatus(500);
    } else {
        res.sendStatus(200);
    }
});

app.post('/todoList/createList/:nameoflist/:backgroundcolor', authHandler, function(req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    const listName = req.params.nameoflist;
    const color = req.params.backgroundcolor;
    if (!users[id]) {
        res.sendStatus(500);
    } else {
        users[id].todoLists[listName] = new TodoList(listName, color);
        res.sendStatus(200);
    }
});

app.post('/profile/changePass/:oldpassword/:newpassword', authHandler, function(req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    const oldpass = req.params.oldpassword;
    const newpass = req.params.newpassword;
    if (!users[id] || users[id].password !== oldpass) {
        res.sendStatus(500);
    } else {
        users[id].password = newpass;
        res.sendStatus(200);
    }
});

app.post('/profile/changeDepartment/:departmentName', authHandler, function(req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    const department = req.params.departmentName;
    if (!users[id] || departmentsNames.indexOf(department) < 0) {
        res.sendStatus(500);
    } else {
        users[id].department = department;
        res.sendStatus(200);
    }
});

app.get('/profile/department', authHandler, function(req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    if (!users[id]) {
        res.sendStatus(500);
    } else {
        res.contentType('application/json');
        res.send(JSON.stringify(users[id].department));
    }
});

app.get('/todoList/:nameoflist', authHandler, function(req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    const listName = req.params.nameoflist;
    if (!users[id] || !users[id].todoLists[listName]) {
        res.sendStatus(500);
    } else {
        res.contentType('application/json');
        res.send(JSON.stringify(users[id].todoLists[listName]));
    }
});

app.post('/todoList/addItem/:nameoflist', authHandler, function(req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    const listName = req.params.nameoflist;
    if (!users[id] || !users[id].todoLists[listName] || !req.body['itemId'] ||
        itemsContain('itemId', req.body['itemId'], users[id].todoLists[listName].items)) {
        res.sendStatus(500);
    } else {
        users[id].todoLists[listName].items.push(req.body);
        res.sendStatus(200);
    }
});

app.delete('/todoList/deleteItem/:nameoflist/:itemid', authHandler, function (req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    const listName = req.params.nameoflist;
    const itemId = req.params.itemid;
    if (users[id].todoLists[listName]) {
        if (itemsContain('itemId', itemId, users[id].todoLists[listName].items)) {
            users[id].todoLists[listName].items = users[id].todoLists[listName].items.filter(obj => obj['itemId'] !== itemId);
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(500);
    }
});

app.delete('/todoList/deleteList/:nameoflist', authHandler, function (req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    const listName = req.params.nameoflist;
    if (users[id]) {
        users[id].todoLists[listName] = undefined;
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

app.delete('/deleteuser', authHandler, function (req, res) {
    const cookieId = req.cookies['UID'];
    const id = cookieToIdMap[cookieId];
    users[id] = undefined;
    deleteCookie(res, cookieId);
    res.sendStatus(200);
});

app.get('/logout', authHandler, function (req, res) {
    const cookieId = req.cookies['UID'];
    deleteCookie(res, cookieId);
    res.sendStatus(200);
});

app.get('/departments', function (req, res) {
    res.contentType('application/json');
    res.send(JSON.stringify(departments));
});

app.post('/animal/addAnimal', authHandler, function (req, res) {
    var cookieId = req.cookies['UID'];
    var id = cookieToIdMap[cookieId];
    var nameOfDepartment = users[id].department;
    var animalName = req.body['name'];
    var animalSpecies = req.body['species'];
    var animalGender = req.body['gender'];
    var animalAge = req.body['age'];
    var animalAdditionalData = req.body['additionalData'];
    var animalDepartment = req.body['animalDepartment'];
    var animal = new Animal(animalName, animalSpecies, animalGender, animalAge, animalAdditionalData, animalDepartment);

    if (animalName in departments[nameOfDepartment] || typeof animalName === 'undefined') {
        res.sendStatus(500);
    } else {
        departments[nameOfDepartment][animalName] = animal;
        res.sendStatus(200);
    }
});

app.get('/departments/allAnimals', authHandler, function (req, res) {
    var cookieId = req.cookies['UID'];
    var id = cookieToIdMap[cookieId];

    if (isManager(id)) {
        var animalsList = [];
        for (var department in departments) {
            for (var animal in departments[department]) {
                animalsList.push(departments[department][animal]);
            }
        }
        res.contentType('application/json');
        res.send(JSON.stringify(animalsList));
    } else {
        res.sendStatus(403);
    }
});

app.get('/departments/:nameOfDepartment/searchAnimal/:animalName', authHandler, function (req, res) {
    var nameOfDepartment = req.params.nameOfDepartment;
    var animalName = req.params.animalName;

    if (typeof departments[nameOfDepartment] !== 'undefined' && animalName in departments[nameOfDepartment]) {
        res.contentType('application/json');
        res.send(JSON.stringify(departments[nameOfDepartment][animalName]));
    } else {
        res.send([]);
    }
});

app.get('/departments/:nameOfDepartment/searchAttribute/:attributeName', authHandler, function (req, res) {
    var nameOfDepartment = req.params.nameOfDepartment;
    var attributeName = req.params.attributeName;
    var resultSearch = [];

    for (var animal in departments[nameOfDepartment]) {
        for (var attribute in departments[nameOfDepartment][animal]) {

            if (departments[nameOfDepartment][animal][attribute] === attributeName) {
                resultSearch.push(departments[nameOfDepartment][animal]);
                break;
            }
        }
    }

    res.contentType('application/json');
    res.send(JSON.stringify(resultSearch));
});

app.get('/departments/:nameOfDepartment/allAnimals', authHandler, function (req, res) {
    var nameOfDepartment = req.params.nameOfDepartment;
    res.contentType('application/json');
    res.send(JSON.stringify(departments[nameOfDepartment]));
});

app.delete('/departments/:nameOfDepartment', authHandler, function (req, res) {
    var nameOfDepartment = req.params.nameOfDepartment;

    if (typeof departments[nameOfDepartment] !== 'undefined') {
        departments[nameOfDepartment] = {};
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
})

app.delete('/departments/:nameOfDepartment/:animalName', authHandler, function (req, res) {
    var nameOfDepartment = req.params.nameOfDepartment;
    var animalName = req.params.animalName;

    for (var animal in departments[nameOfDepartment]) {
        if (animal === animalName) {
            delete departments[nameOfDepartment][animal];
            res.sendStatus(200);
            return;
        }
    }
    res.sendStatus(500);
})

app.get('/users', authHandler, function (req, res) {
    var cookieId = req.cookies['UID'];
    var id = cookieToIdMap[cookieId];
    var result = [];

    for (user in users) {
        if (users[user].id != id && users[user].department != users[id].department) {
            result.push(users[user].id);
        }
    }
    res.contentType('application/json');
    res.send(result);
});

//return all users who have been shared with user's department
app.get('/departments/sharedUsers', authHandler, function (req, res) {
    var cookieId = req.cookies['UID'];
    var id = cookieToIdMap[cookieId];
    var userDepartment = users[id].department;
    var sharedUsers = [];
    for (user in users) {
        if (users[user].shareDepartments[departmentsNames.indexOf(userDepartment)] == 1) {
            sharedUsers.push(users[user].id);
        }
    }

    res.contentType('application/json');
    res.send(JSON.stringify(sharedUsers));
});

app.post('/departments/shareDepartments/:userID/:nameOfDepartment', authHandler, function (req, res) {
    var userID = req.params.userID;
    var nameOfDepartment = req.params.nameOfDepartment;
    if (departmentsNames.indexOf(nameOfDepartment) > -1) {
        users[userID].shareDepartments[departmentsNames.indexOf(nameOfDepartment)] = 1;

        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

//unshare a user from a department
app.delete('/departments/shareDepartments/:userID/:nameOfDepartment', authHandler, function (req, res) {
    var userID = req.params.userID;
    var nameOfDepartment = req.params.nameOfDepartment;

    if (departmentsNames.indexOf(nameOfDepartment) > -1) {
        users[userID].shareDepartments[departmentsNames.indexOf(nameOfDepartment)] = 0;
                console.log(departmentsNames.indexOf(nameOfDepartment))
                console.log( users[userID].shareDepartments)
        res.sendStatus(200);
    } else {
        res.sendStatus(500);
    }
});

//return user's shared departments
app.get('/departments/shareDepartments', function (req, res) {
    var cookieId = req.cookies['UID'];
    var id = cookieToIdMap[cookieId];
    var departments = [];
    var departmentDisplay = users[id].shareDepartments;

    for (department in departmentDisplay) {
        if (users[id].shareDepartments[department] == 1) {
            departments.push(departmentsNames[department]);
        }
    }

    res.contentType('application/json');
    res.send(JSON.stringify(departments));
});

function deleteCookie(res, cookieId) {
    res.cookie('UID', '0', { maxAge: 500, httpOnly: true }); // Expires after half a second.
    cookieSet.delete(cookieId); // delete cookie uid from cookie set
    cookieToIdMap[cookieId] = undefined; // delete cookie from cookieToUid map.
}
function assignCookie(res, id) {
    let randomNumber = Math.random().toString();
    randomNumber = randomNumber.substring(2, randomNumber.length);
    res.cookie('UID', randomNumber, { maxAge: 60 * 60 * 1000, httpOnly: true });
    cookieSet.add(randomNumber);
    cookieToIdMap[randomNumber] = id;
}
function setDepartments() {
    for (const department in departmentsNames) {
        departments[departmentsNames[department]] = {};
    }
}
const itemsContain = function (itemField, itemValue, items) {
    return items.filter(obj => obj[itemField] === itemValue).length > 0;
};

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(8080, function () {
    setDepartments();
    console.log('Server listening on port 8080!');
});

module.exports = app;
