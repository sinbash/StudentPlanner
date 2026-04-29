from flask import Flask , render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app) 

# class Todo(db.Model):
#     id = db.Coloumn(db.Integer,primery_key = True,nullable = False)
#     firstName = db.Coloumn(db.String(200), nullable = False)
#     lastName = db.Coloumn(db.String(200), nullable = False)
#     email = db.Coloumn(db.String(200), nullable = False)
#     password = db.Coloumn(db.String(200), nullable = False)
#     dob = db.Coloumn()




@app.route('/')
def home():
    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/signup")
def signup():
    return render_template("signup.html")

@app.route("/reset")
def reset():
    return render_template("reset.html")

@app.route("/profile")
def profile():
    return render_template("profile.html")


@app.route("/grades")
def grades():
    return render_template("grades.html")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
