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

@app.route("/findUser")
def findUser():
    return render_template("findUser.html", users=[], query="")

@app.route('/search')
def search_users():
    query = request.args.get('query', '')
    
    # This line searches the database for usernames that 'contain' the query
    # .all() gives us a list of every user object that matches
    results = User.query.filter(User.username.contains(query)).all()
    
    return render_template("findUser.html", users=results, query=query)

@app.route("/profile/<username>")
def view_profile(username):
    # Fetch the specific user from the database by their username
    user_to_view = User.query.filter_by(username=username).first_or_404()
    
    # Render a profile page (you can use your existing profile.html or a new one)
    return render_template("profile.html", user=user_to_view)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
