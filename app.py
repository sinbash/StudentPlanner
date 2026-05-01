from flask import Flask , render_template, url_for, request, redirect, session, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.secret_key = "your_secret_key"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app) 

# 1. The Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstName = db.Column(db.String(200), nullable=False)
    lastName = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    dob = db.Column(db.Date, nullable=False)
# 2. (Build the Database)
with app.app_context():
    db.create_all()
    print("Database tables created successfully")


# 3. The Routes
@app.route('/')
def home():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return render_template("index.html", user=user)
    else:
        # If not logged in, force them to the login page
        return redirect(url_for('login'))


#If anyone needs to test the index page changes, uncomment the below code and temporarily comment the above home function to bypass login
#@app.route('/')
#def home():
    #return render_template("index.html")

@app.route("/login", methods=['GET', 'POST'])
def login():
     if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()

        if user and user.password == password:   # replace with hash check later
            session['user_id'] = user.id
            return redirect(url_for('home'))
        else:
            flash ("Invalid email or password")
            return redirect(url_for('login'))
     return render_template("login.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        first_name = request.form.get('firstName')
        last_name = request.form.get("lastName")
        dob_str = request.form.get("dob")
        email = request.form.get("email")
        password = request.form.get("password")

        # Convert date string to object
        dob_obj = datetime.strptime(dob_str, '%Y-%m-%d').date()

        new_user = User(
            firstName=first_name,
            lastName=last_name,
            email=email,
            password=password,
            dob=dob_obj
        )

        try:
            db.session.add(new_user)
            db.session.commit()
            
            # log the user in automatically after signup
            session['user_id'] = new_user.id 
            
            # Redirect to home (index.html)
            return redirect(url_for('home'))
        except Exception as e:
            return f"Error: {e}"

    return render_template("signup.html")

@app.route("/reset")
def reset():
    return render_template("reset.html")

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash("You have been logged out successfully")
    return redirect(url_for('login'))

@app.route("/profile")
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user = User.query.get(session['user_id'])
    return render_template("profile.html", user=user)


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
    app.run(debug=True)


