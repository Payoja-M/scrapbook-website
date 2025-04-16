from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime
from models import db, Entry  # import your model

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Flask is running!"

# Configure DB & upload folder
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///scrapbook.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')

# Init database
db.init_app(app)

# Make upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# -----------------------------
# GET /entries → Get all entries
# -----------------------------
@app.route('/entries', methods=['GET'])
def get_entries():
    date_str = request.args.get('date')  # read date from ?date=YYYY-MM-DD
    if date_str:
        entries = Entry.query.filter_by(date=date_str).order_by(Entry.date.desc()).all()
    else:
        entries = Entry.query.order_by(Entry.date.desc()).all()
    return jsonify([entry.to_dict() for entry in entries])

@app.route('/entries/dates')
def get_entry_dates():
    dates = db.session.query(Entry.date).distinct().all()
    return jsonify([date[0].isoformat() for date in dates])

# -----------------------------
# POST /entries → Add a new entry
# -----------------------------
@app.route('/entries', methods=['POST'])
def add_entry():
    description = request.form.get('description')
    date_str = request.form.get('date')
    file = request.files.get('image')

    if not description:
        return jsonify({'error': 'Description is required'}), 400

    # Parse or default date
    date = datetime.strptime(date_str, '%Y-%m-%d') if date_str else datetime.utcnow()

    # Handle image upload
    filename = None
    if file:
        filename = file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    entry = Entry(description=description, date=date, image_filename=filename)
    db.session.add(entry)
    db.session.commit()

    return jsonify(entry.to_dict()), 201

# -----------------------------
# Initialize the DB (only once)
# -----------------------------
@app.cli.command('init-db')
def init_db():
    db.create_all()
    print('Database initialized ✅')

# -----------------------------
# Run app
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True)
