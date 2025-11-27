
from flask import Flask
from routes.routes_bnb import solution_bp

app = Flask(__name__)

# Routes
app.register_blueprint(solution_bp)

if __name__ == "__main__":
    app.run(debug=True)
