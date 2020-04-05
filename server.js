import express from 'express';
import bodyParser from 'body-parser';

import confignjjry from './config';
import modelscuqyh from './src/models';
import routes from './src/routes';
import mailercpxje from './src/mailer';
import taskslqbfv from './src/tasks';

const app = express();
const port = 3000;

const config = confignjjry(app.get('env'));
const models = modelscuqyh(config.dbUrl);
const mailer = mailercpxje(config.email, models);
const tasks = taskslqbfv(models, mailer);

app.set('models', models);
app.set('mailer', mailer);
app.set('tasks', tasks);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

tasks.init();

app.get('/', (req, res) => res.send('Hello World!'));
app.use(routes(models));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

export default app;
