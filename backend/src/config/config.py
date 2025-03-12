from dotenv import load_dotenv
import os


load_dotenv('.env')

class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class ProdConfig(Config):
    TESTING = False
    DEBUG = False

class DevConfig(Config):
    TESTING = True
    DEBUG = False

class StageConfig(Config):
    TESTING = False
    DEBUG = True

config_mapping = {
    'development': DevConfig,
    'staging': StageConfig,
    'production': ProdConfig
}
