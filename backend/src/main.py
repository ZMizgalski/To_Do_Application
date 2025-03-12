from flask import Flask, render_template
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_limiter import Limiter
from flask_talisman import Talisman
from flask_compress import Compress
from flask_socketio import SocketIO
from flask_limiter.util import get_remote_address

from .entities.entity import db
from .entities.task import Task

from .routes.api import api_bp

from .config.config import DevConfig, Config, config_mapping

from .utils.background_task_queue import taskQueue


class Application(Flask):
    def __init__(self):
        super().__init__(
            __name__,
            static_url_path='',
            static_folder="static/browser",
            template_folder='static/browser'
        )

        self.db = db
        self.migrate = Migrate()
        self.talisman = Talisman()
        self.bcrypt = Bcrypt()
        self.csrf = CSRFProtect()
        self.socketio = SocketIO()
        self.compress = Compress()

        self.limiter = Limiter(
            key_func=get_remote_address,
            default_limits=[
                "10000 per day",
                "4000 per hour"
            ],
            storage_uri="memory://"
        )

        self.init_essentials()
        self.init_handlers()

    def init_essentials(self):
        self.config.from_object(config_mapping.get(Config.FLASK_ENV, DevConfig))

        self.limiter.init_app(self)
        self.db.init_app(self)
        self.migrate.init_app(self, self.db)
        self.bcrypt.init_app(self)
        self.compress.init_app(self)

        socket_config = {
            'ping_timeout': 5,
            'ping_interval': 10
        }

        if Config.FLASK_ENV == 'production':
            self.socketio.init_app(self, cors_allowed_origins=['domain'], **socket_config)
        else:
            self.socketio.init_app(self, cors_allowed_origins="*", **socket_config)

        if Config.FLASK_ENV == 'production' or Config.FLASK_ENV == 'staging':
            self.csrf.init_app(self)

        self.talisman.init_app(
            self,
            content_security_policy = {
                'default-src': "'self'",
                'img-src': [ "'self'", 'data:' ],
                'script-src': [ "'self'" ],
                'style-src': [ "'self'", "'unsafe-inline'" ],
                'connect-src': [ "'self'" ]
            },
            content_security_policy_nonce_in=[ 'script-src' ]
        )

        if Config.FLASK_ENV == 'development':
            CORS(
                self,
                resources={ r"/*": { "origins": "*" } },
                supports_credentials=True
            )

    def init_handlers(self):
        @self.after_request
        def _(response):
            response.set_cookie(
                'csrf_token',
                generate_csrf(),
                max_age = 3600,
                secure = Config.FLASK_ENV == 'production',
                httponly = False,
                samesite = 'Strict',
                path = '/',
            )

            return response

        @self.route("/", defaults={"path": ""})
        @self.route("/<path:path>")
        def _(**kwargs):
            return render_template('index.html')

        @self.errorhandler(404)
        def _(error):
            return render_template('index.html')

        self.register_blueprint(api_bp, url_prefix='/api')

        @self.socketio.on('connect')
        def _():
            taskQueue.add_task(self.emit_tasks, self.socketio,)

    def emit_tasks(self, socket):
        with self.app_context():
            tasks = Task.query.order_by(Task.id).all()

            socket.emit('tasks', [ task.to_dict() for task in tasks ])

app = Application()

if __name__ == '__main__':
    app.run(
        host = '0.0.0.0',
        port = 7777,
        debug = Config.FLASK_ENV != 'production'
    )
