from mangum import Mangum
from main import app

handler = Mangum(app=app, log_level="debug")