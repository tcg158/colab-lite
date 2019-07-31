let express = require('express');
let app = express();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let logger = require('./logger').logger;
let fs = require('fs');
let path = require('path');
let cp = require('child_process');
let cpp = require('child-process-promise');

let pdf = require('./pdf/pdfmake');
let vfs = require('./pdf/vfs_fonts');

app.use(express.static('public'));

app.get('/handshake', (req, res) => {
    logger.warn('handshake requested');
    if(Object.values(io.sockets.sockets).map(s => s.cldata.uname).includes(req.query.uname)) {
        logger.error('handshake BAD'); return res.sendStatus(403);
    }
    logger.info('handshake GOOD'); return res.sendStatus(200);
});

function handshake(socket, next) {
    logger.info('default connection handshake: ' + JSON.stringify(socket.handshake.query.uname));
    if(socket.handshake.query && socket.handshake.query.uname && !Object.values(io.sockets.sockets).map(s => s.cldata.uname).includes(socket.handshake.query.uname)) {
        socket.cldata = {};
        socket.cldata.uname = socket.handshake.query.uname;
        next();
    } else { next(new Error()); }
}

io.use(handshake);
io.on('connection', socket => {
    logger.info('default user ' + socket.cldata.uname + ' connected!');

    socket.join('default');

    socket.emit('current-sessions', Object.values(io.nsps).filter(nsp => nsp.cldata).map(nsp => {
        return { sname: nsp.cldata.sname, owner: nsp.cldata.owner }
    }));

    socket.on('create-session', (nspId, cb) => { cb(createNsp(io, nspId, socket.cldata.uname)); });

    socket.on('disconnect', () => {
        logger.info('default user ' + socket.cldata.uname + ' disconnected!');
        socket.removeAllListeners();
    });
});

function createNsp(io, nspId, owner) {
    if(!Object.keys(io.nsps).includes(nspId)) {
        let nsp = io.of(nspId);
        nsp.cldata = {};
        nsp.cldata.sname = nspId;
        nsp.cldata.owner = owner;
        nsp.cldata.tasks = [];
        nsp.cldata.grades = [];
        fs.mkdirSync(path.join(__dirname, '../../dump/' + nspId + '/data'), { recursive: true });

        io.emit('new-session', { sname: nsp.cldata.sname, owner: nsp.cldata.owner });

        logger.info('created session: ' + nspId);

        nsp.use((socket, next) => {
            logger.info('nsp connection handshake: ' + JSON.stringify(socket.handshake.query.uname));
            if(socket.handshake.query && socket.handshake.query.uname) {
                socket.cldata = {};
                socket.cldata.uname = socket.handshake.query.uname;
                next();
            } else { next(new Error()); }
        });

        app.get('/' + nspId + '-grades', async (req, res) => {
            let rows = [];
            let users = Object.values(nsp.sockets).map(s => s.cldata.uname).filter(u => u !== nsp.cldata.owner);

            for(let i = 0; i < users.length; ++i) {
                let max = 0;
                let total = 0;
                rows[i] = { user: users[i], grades: [] };
                for (let j = 0; j < nsp.cldata.tasks.length; ++j) {
                    rows[i].grades.push(0);
                    max += nsp.cldata.tasks[j].maxScore;
                }

                let grades  = nsp.cldata.grades.filter(g => g.user === users[i]);

                for (let j = 0; j < grades.length; ++j) {
                    rows[i].grades[grades[j].task - 1] = grades[j].score;
                    total += grades[j].score;
                }
                rows[i].grades.push(total);
                rows[i].grades.push(((total / max) * 100.0));
            }

            let docDefinition = {
                content: [
                    {text: "Date: " + new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''), style: "header"},
                    {
                        layout: "lightHorizontalLines'", // optional"
                        table: {
                            // headers are automatically repeated if the table spans over multiple pages
                            // you can declare how many rows should be treated as headers
                            headerRows: 1,
                            widths: [],

                            body: []
                        }
                    }
                ]
            };

            docDefinition.content[1].table.widths.push("*");
            for(let i = 0; i < nsp.cldata.tasks.length + 2; ++i) { docDefinition.content[1].table.widths.push("auto"); }

            docDefinition.content[1].table.body.push([]);
            docDefinition.content[1].table.body[0].push("User");

            let max = 0;
            for(let i = 0; i < nsp.cldata.tasks.length; ++i) { docDefinition.content[1].table.body[0].push("Task " + (i + 1) + " /" + nsp.cldata.tasks[i].maxScore); max += nsp.cldata.tasks[i].maxScore; }
            docDefinition.content[1].table.body[0].push("Total /" + max);
            docDefinition.content[1].table.body[0].push("Grade %");

            for(let i = 0; i < rows.length; ++i) {
                docDefinition.content[1].table.body.push([]);
                docDefinition.content[1].table.body[i + 1].push(rows[i].user);
                for(let j = 0; j < rows[i].grades.length; ++j) {
                    docDefinition.content[1].table.body[i + 1].push(rows[i].grades[j]);
                }
            }

            pdf.vfs = vfs.pdfMake.vfs;

            let doc = pdf.createPdf(docDefinition);
            doc.getBase64(data => {
                res.writeHead(200);
                let download = Buffer.from(data, "base64");
                logger.info("sending file?");
                res.end(download);
            });

        });

        nsp.on('connection', socket => {
            logger.info('nsp user ' + socket.cldata.uname + ' connected!');

            createUserFiles(nspId, socket.cldata.uname);

            let users = Object.values(nsp.sockets).map(s => {
                return { username: s.cldata.uname, owner: s.cldata.uname === nsp.cldata.owner }
            }).filter(s => s.username !== socket.cldata.uname);

            if(socket.cldata.uname === nsp.cldata.owner) {
                socket.join('masters');
                socket.emit('current-users', users, socket.cldata.uname === nsp.cldata.owner, () => {
                    nsp.emit('user-joined', { username: socket.cldata.uname, owner: socket.cldata.uname === nsp.cldata.owner });
                });
            } else {
                socket.join('ghosts');
                socket.emit('current-users', users.filter(u => u.username === nsp.cldata.owner), socket.cldata.uname === nsp.cldata.owner, () => {
                    socket.emit('user-joined', { username: socket.cldata.uname, owner: socket.cldata.uname === nsp.cldata.owner });
                    nsp.in('masters').emit('user-joined', { username: socket.cldata.uname, owner: socket.cldata.uname === nsp.cldata.owner });
                });
            }

            socket.emit('init-file', fs.readFileSync(path.join(__dirname, '../../dump/' + nspId + '/data/' + socket.cldata.uname + '/main.cpp')).toString());
            socket.join(socket.cldata.uname);
            socket.cldata.watching = socket.cldata.uname;

            nsp.emit('init-tasks', nsp.cldata.tasks);

            socket.on('watch-user', user => {
                socket.leave(socket.cldata.uname, () => {});
                socket.join(user);
                socket.cldata.watching = user;
                let data = fs.readFileSync(path.join(__dirname, '../../dump/' + nspId + '/data/' + socket.cldata.watching + '/main.cpp')).toString();
                socket.emit('init-file', data);
            });

            socket.on('update-file', data => {
                if(socket.cldata.watching === socket.cldata.uname || socket.cldata.uname === nsp.cldata.owner) {
                    fs.writeFileSync(path.join(__dirname, '../../dump/' + nspId + '/data/' + socket.cldata.watching + '/main.cpp'), data);
                    socket.broadcast.to(socket.cldata.watching).emit('init-file', data);
                }
            });

            socket.on('create-task', tsk => {
                if(socket.cldata.uname === nsp.cldata.owner) {
                    for(let i = 0; i < tsk.cases.length; ++i) {
                        if(tsk.cases[i].weight) {
                            if(tsk.cases[i].weight !== '') { tsk.cases[i].weight = parseInt(tsk.cases[i].weight); }
                            else {
                                delete tsk.cases[i].hint;
                            }
                        }
                    }

                    let task = {};
                    task.taskId = nsp.cldata.tasks.length + 1;
                    task.name = tsk.name;
                    task.description = tsk.description;
                    task.cases = tsk.cases;
                    task.inputs = tsk.cases[0].inputs;
                    task.outputs = tsk.cases[0].outputs;

                    task.maxScore = 0;
                    for(let i = 0; i < tsk.cases.length; ++i) {
                        if(tsk.cases[i].weight) { task.maxScore += tsk.cases[i].weight; } else { task.maxScore += 1; }
                    }

                    nsp.cldata.tasks.push(task);
                    nsp.emit('init-tasks', nsp.cldata.tasks);
                }
            });

            socket.on('run-task', async (taskId, fn) => {

                let sessionPath = path.join(__dirname, '../../dump/' + nspId);
                let dataPath = path.join(sessionPath, 'data/' + socket.cldata.uname);

                let result = { score: 0.0, msgs: [] };

                let cmpResult = compile(dataPath);

                let max = 0;

                let task = nsp.cldata.tasks.filter(tsk => tsk.taskId == taskId)[0];
                for(let i = 0; i < task.cases.length; ++i) { if(task.cases[i].weight) { max += task.cases[i].weight; } else { max++; } }

                if(cmpResult['success']) {
                    for(let i = 0; i < task.cases.length; ++i) {
                        let bfr = '';
                        try {
                            let pr = cpp.spawn('./main.exe', [], {cwd: dataPath});

                            pr.childProcess.stdout.setEncoding('utf-8');
                            pr.childProcess.stdout.on('data', data => { bfr += data; logger.info(bfr); });
                            for(let j = 0; j < task.cases[i].inputs.length; ++j) { pr.childProcess.stdin.write(task.cases[i].inputs[j] + '\r\n'); }
                            pr.childProcess.stdin.end();

                            await pr;

                            logger.info(bfr);

                            let outputs = bfr.replace('\n', '').split('\r');
                            if(outputs[outputs.length - 1] === '') { outputs.pop(); }

                            logger.info(JSON.stringify(outputs));
                            logger.info(JSON.stringify(task.cases[i].outputs));

                            logger.info('compared stuff');

                            if(JSON.stringify(outputs) === JSON.stringify(task.cases[i].outputs)) {
                                if(task.cases[i].weight) { result.score += task.cases[i].weight; } else { result.score++; }
                            } else {
                                if(task.cases[i].hint) { result.msgs.push('Hint for Case #' + i + ': ' + task.cases[i].hint) }
                            }
                        } catch(e) {
                            result.msgs.push('Runtime Error for Case #' + i);
                        }
                        bfr = '';
                    }
                } else {
                    result.msgs.push(cmpResult['error']);
                }

                nsp.cldata.grades = nsp.cldata.grades.filter(g => !(g.task == taskId && g.user == socket.cldata.uname));

                let grade = {};
                grade.task = taskId;
                grade.user = socket.cldata.uname;
                grade.score = result.score;
                grade.max = max;

                nsp.cldata.grades.push(grade);

                logger.info({ taskId: taskId, score: ((result.score/max) * 100.0), msgs: result.msgs });
                fn({ taskId: taskId, score: ((result.score/max) * 100.0), msgs: result.msgs });
            });

            socket.on('run', async (inputs, fn) => {

                let sessionPath = path.join(__dirname, "../../dump/" + nspId);
                let dataPath = path.join(sessionPath, "data/" + socket.cldata.uname);

                let cmpResult = compile(dataPath);

                if(cmpResult["success"]) {
                    try {
                        let bfr = "";
                        let pr = cpp.spawn("./main.exe", [], { cwd: dataPath });

                        pr.childProcess.stdout.setEncoding("utf-8");
                        pr.childProcess.stdout.on("data", data => { bfr += data; });

                        for(let i = 0; i < inputs.length; ++i) { pr.childProcess.stdin.write(inputs[i] + "\r\n"); }
                        pr.childProcess.stdin.end();

                        await pr;

                        let outputs = bfr.replace("\n", "").split("\r");
                        if(outputs[outputs.length - 1] === "") { outputs.pop(); }

                        logger.info(outputs);
                        let rslt = { success: true, msgs: outputs };
                        logger.info(rslt);
                        fn(rslt);
                    } catch (e) {
                        let msgs = []; msgs.push(e.message);
                        let rslt = { success: true, msgs: msgs };
                        logger.error(rslt);
                        fn(rslt);
                    }
                } else {
                    let msgs = []; msgs.push(cmpResult["error"]);
                    let rslt = { success: true, msgs: msgs };
                    logger.error(rslt);
                    fn(rslt);
                }
            });

            socket.on("task-grades", (taskId, fn) => {
                let users = Object.values(nsp.sockets).map(s => s.cldata.uname);
                let grades = nsp.cldata.grades.filter(g => g.task === taskId).map(g => {
                    return { username: g.user, grade: ((g.score / g.max) * 100.0) };
                });

                for(let i = 0; i < users.length; ++i) {
                    if(!grades.map(g => g.username).includes(users[i])) {
                        grades.push({ username: users[i], grade: 0.0 })
                    }
                }
                fn(grades);
            });

            socket.on('task-data', (fn) => {
                let solved = [];
                for(let i = 0; i < nsp.cldata.tasks.length; ++i) {
                    solved.push(
                        {
                            label: nsp.cldata.tasks[i].name,
                            y: nsp.cldata.grades.filter(g => g.task == nsp.cldata.tasks[i].taskId && g.score > 0).length
                        }
                    )
                }
                console.log(nsp.cldata.grades);
                fn(solved);
            });

            socket.on('disconnect', () => {
                logger.info('nsp user ' + socket.cldata.uname + ' disconnected!');
                if(socket.cldata.uname === nsp.cldata.owner) {
                    nsp.emit('user-left', socket.cldata.uname);
                } else {
                    nsp.in('masters').emit('user-left', socket.cldata.uname);
                }
                socket.removeAllListeners();
            });
        });
        return true;
    }
    return false;
}

function createUserFiles(sessionId, username) {
    if(!fs.existsSync(path.join(__dirname, '../../dump/' + sessionId + '/data/' + username))) {
        fs.mkdirSync(path.join(__dirname, '../../dump/' + sessionId + '/data/' + username), { recursive: true });
        fs.writeFileSync(path.join(__dirname, '../../dump/' + sessionId + '/data/' + username + '/main.cpp'), '');
        fs.writeFileSync(path.join(__dirname, '../../dump/' + sessionId + '/data/' + username + '/compile_commands.json'), JSON.stringify([
            {
                directory: path.join(__dirname, '../../dump/' + sessionId + '/data/' + username),
                command: 'clang++ --target=x86_64-w64-mingw32 -o main.exe main.cpp',
                file: 'main.cpp'
            }
        ], null, 4))
    }
}

function compile(dataPath) {
    let result = { success: true };

    let compileCmd = JSON.parse(fs.readFileSync(path.join(dataPath, '/compile_commands.json'), { encoding: 'utf8'}))[0].command.replace('-c', '');
    try { cp.execSync(compileCmd, { cwd: dataPath } );
    } catch (e) {
        result.success = false;
        result['error'] = e.message;
    }
    return result;
}

let PORT = process.env.PORT || 4213;
http.listen(PORT, () => {
    logger.info('Listening on: ' + PORT);
});