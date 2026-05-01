from flask import Flask , render_template, url_for, request, redirect, session
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.secret_key = "your_secret_key"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app) 

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(200), nullable=False)
    lastName = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    dob = db.Column(db.Date, nullable=False)


@app.route('/')
def home():
    if 'user_id' in session:
        return render_template("index.html")
    else:
         return redirect(url_for('login'))

@app.route("/login", methods=['GET', 'POST'])
def login():
     if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        user = User.query.filter_by(email=email).first()

        if user and user.password == password:   # replace with hash check later
            session['user_id'] = user.id
            return redirect(url_for('home'))

        return "Invalid credentials"
     return render_template("login.html")

@app.route("/signup")
def signup():
    return render_template("signup.html")

@app.route("/reset")
def reset():
    return render_template("reset.html")

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))

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
