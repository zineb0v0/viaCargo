from flask import Flask
app = Flask(__name__)

@app.route('/stock')
def stock():
    return "Gestion de stock"