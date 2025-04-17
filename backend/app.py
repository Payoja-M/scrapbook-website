from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime
from models import db, Entry  # import your model
from sqlalchemy import func

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
        entries = Entry.query.filter(func.date(Entry.date) == date_str).order_by(Entry.date.desc()).all()
    else:
        entries = Entry.query.order_by(Entry.date.desc()).all()
    return jsonify([entry.to_dict() for entry in entries])

@app.route('/entries/dates')
def get_entry_dates():
    dates = db.session.query(func.date(Entry.date)).distinct().all()
    return jsonify([str(date[0]) for date in dates])

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

    entry = Entry(
    description=description,
    date=date,
    image_filename=filename,
    x=100,
    y=100,
    width=200,
    height=200,
    captionX=100,
    captionY=320,
    captionWidth=180,
    captionHeight=60
)
    db.session.add(entry)
    db.session.commit()

    return jsonify(entry.to_dict()), 201

from models import Entry
# -----------------------------
# Initialize the DB (only once)
# -----------------------------
@app.cli.command('init-db')
def init_db():
    db.create_all()
    print('Database initialized ✅')

@app.route('/entries/<int:id>', methods=['PATCH'])
def update_entry(id):
    entry = Entry.query.get_or_404(id)
    data = request.get_json()

    for field in [
        "x", "y", "width", "height",
        "captionX", "captionY", "captionWidth", "captionHeight"
    ]:
        if field in data:
            setattr(entry, field, data[field])

    db.session.commit()
    return jsonify(entry.to_dict())

@app.route('/entries/<int:id>', methods=['DELETE'])
def delete_entry(id):
    entry = Entry.query.get_or_404(id)

    # Delete uploaded image file if it exists
    if entry.image_filename:
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], entry.image_filename)
        if os.path.exists(image_path):
            os.remove(image_path)

    db.session.delete(entry)
    db.session.commit()
    return jsonify({'message': 'Entry deleted'}), 200


# -----------------------------
# Run app
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True)
    
