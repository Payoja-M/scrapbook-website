from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# models.py
# models.py
class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text)
    image_filename = db.Column(db.String(255))
    date = db.Column(db.DateTime)

    # image position & size
    x = db.Column(db.Integer, nullable=True, default=0)
    y = db.Column(db.Integer, nullable=True, default=0)
    width = db.Column(db.Integer, nullable=True, default=200)
    height = db.Column(db.Integer, nullable=True, default=200)

    # caption position & size
    captionX = db.Column(db.Integer, nullable=True, default=0)
    captionY = db.Column(db.Integer, nullable=True, default=0)
    captionWidth = db.Column(db.Integer, nullable=True, default=160)
    captionHeight = db.Column(db.Integer, nullable=True, default=40)

    def to_dict(self):
        return {
            "id": self.id,
            "description": self.description,
            "image_url": f"/static/uploads/{self.image_filename}" if self.image_filename else None,
            "date": self.date.strftime('%Y-%m-%d') if self.date else None,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "captionX": self.captionX,
            "captionY": self.captionY,
            "captionWidth": self.captionWidth,
            "captionHeight": self.captionHeight,
        }
