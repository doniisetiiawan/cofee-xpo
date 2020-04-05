import express from 'express';
import bodyParser from 'body-parser';

import confignjjry from './config';
import modelscuqyh from './src/models';
import routes from './src/routes';
import mailercpxje from './src/mailer';

const app = express();
const port = 3000;

const config = confignjjry(app.get('env'));
const models = modelscuqyh(config.dbUrl);
const mailer = mailercpxje(config.email, models);

app.set('models', models);
app.set('mailer', mailer);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => res.send('Hello World!'));
app.use(routes(models));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

export default app;
