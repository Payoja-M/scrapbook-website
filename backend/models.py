from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, default=datetime.utcnow)
    description = db.Column(db.Text, nullable=False)
    image_filename = db.Column(db.String(120), nullable=True)

    def to_dict(self):
        return{
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d'),
            'description': self.description,
            'image_url': f'/static/uploads/{self.image_filename}' if self.image_filename else None
        }