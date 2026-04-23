from flask import Flask , render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app) 


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
