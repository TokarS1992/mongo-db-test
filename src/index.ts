import express, { Express } from 'express';
import dotenv from 'dotenv';
import {useExpressServer} from 'routing-controllers';
import {create} from 'express-handlebars';
import {start} from "./db/db.connection";
import httpContext from 'express-http-context';
import bodyParser from 'body-parser';
import path from 'path';
import * as controllers from './controllers';
import * as middlewares from './middlewares';
import * as interceptors from './interceptors';
import {expressServerOptions} from './server.config';

dotenv.config();
const app = express();

(async () => {
    await start();
    const port = process.env.PORT || 3001;
    const expressHbs = create({
        defaultLayout: 'main',
        extname: 'hbs'
    });

    app.engine('hbs', expressHbs.engine);
    app.set('view engine', 'hbs');
    app.set('views', 'views');
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(httpContext.middleware);

    useExpressServer<Express>(app, {
        ...expressServerOptions,
        controllers: [
            controllers.TemplateControllerTmp,
            controllers.UserControllerTmp,
            controllers.TodoControllerTmp,
        ],
        middlewares: [
            middlewares.LogBeforeMiddleware,
            middlewares.LogAfterMiddleware,
            middlewares.GlobalErrorMiddleware,
        ],
        interceptors: [
            interceptors.GlobalInterceptor,
        ],
    }).listen(port, () => console.log(`Running on port ${port}`));
})();

