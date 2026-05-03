from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash 
from .models import User
from . import db
from datetime import datetime

main = Blueprint('main', __name__)



@main.route('/')
def home():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return render_template("index.html", user=user)
    else:
        #If not logged in, force them to the login page
        return redirect(url_for('main.login'))



# #If anyone needs to test the index page changes, uncomment the below code and temporarily comment the above home function to bypass login
# @main.route('/')
# def home():
#     fake_user = {
#         'firstName': 'John',
#         'lastName': 'Doe',
#         'email': 'test@example.com',
#         'id': 1,
#         'dob': '2000-01-01'
#     }
#     return render_template("index.html", user=fake_user)

@main.route("/login", methods=['GET', 'POST'])
def login():
     if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            return redirect(url_for('main.home'))
        else:
            flash ("Invalid email or password")
            return redirect(url_for('main.login'))
     return render_template("login.html")

@main.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        first_name = request.form.get('firstName')
        last_name = request.form.get("lastName")
        username = request.form.get("username")
        dob_str = request.form.get("dob")
        email = request.form.get("email")
        password = request.form.get("password")

        # Convert date string to object
        dob_obj = datetime.strptime(dob_str, '%Y-%m-%d').date()

        #Hasing Password 
        hashed_password = generate_password_hash(password)

        new_user = User(
            firstName=first_name,
            lastName=last_name,
            email=email,
            username = username,
            password=hashed_password,
            dob=dob_obj
        )

        try:
            db.session.add(new_user)
            db.session.commit()
            
            # log the user in automatically after signup
            session['user_id'] = new_user.id 
            
            # Redirect to home (index.html)
            return redirect(url_for('main.home'))
        except Exception as e:
            flash ( f"Error: {e}")
            return redirect(url_for('main.signup'))

    return render_template("signup.html")

@main.route("/reset")
def reset():
    return render_template("reset.html")

@main.route('/logout')
def logout():
    session.pop('user_id', None)
    flash("You have been logged out successfully")
    return redirect(url_for('main.login'))

@main.route("/profile/<username>")
def view_profile(username):
    # Fetch the specific user from the database by their username
    user_to_view = User.query.filter_by(username=username).first_or_404()
    
    # Render a profile page (you can use your existing profile.html or a new one)
    return render_template("profile.html", user=user_to_view)

@main.route("/profile")
def profile():
    if 'user_id' not in session:
        return redirect(url_for('main.login'))
    user = User.query.get(session['user_id'])
    return render_template("profile.html", user=user)


@main.route("/grades")
def grades():
    return render_template("grades.html")

@main.route("/findUser")
def findUser():
    return render_template("findUser.html", users=[], query="")

@main.route('/search')
def search_users():
    query = request.args.get('query', '')
    
    # This line searches the database for usernames that 'contain' the query
    # .all() gives us a list of every user object that matches
    results = User.query.filter(User.username.contains(query)).all()
    
    return render_template("findUser.html", users=results, query=query)


@main.route('/update_password', methods = ['POST'])
def update_password():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}),401
    
    data = request.get_json()
    user = User.query.get(session['user_id'])

    # Check if current password is correct
    if not check_password_hash(user.password, data['currentPassword']):
        return  jsonify({'success': False, 'error': 'Current password is incorrect'}), 400

   #Passord hashed
    user.password = generate_password_hash(data['newPassword'])
    db.session.commit()

    return jsonify({'success':True}), 200