from app import app, db
from sqlalchemy import text

with app.app_context():
    with db.engine.connect() as conn:
        conn.execute(text("ALTER TABLE entry ADD COLUMN hidden_from_board BOOLEAN DEFAULT 0;"))
        print("✅ Column 'hidden_from_board' added!")
