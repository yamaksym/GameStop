import os
import sqlite3

def init_db():
    db_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(db_dir, 'gamestop.db')
    schema_path = os.path.join(db_dir, 'schema.sql')
    seed_path = os.path.join(db_dir, 'seed.sql')

    print(f"Initializing database at: {db_path}")

    # Remove existing database if any to ensure clean init
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print("Removed existing database file to ensure a clean state.")
        except Exception as e:
            print(f"Note: Couldn't remove existing database file ({e}). Overwrite attempt...")

    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Read and execute schema
    if os.path.exists(schema_path):
        print("Applying schema.sql...")
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        cursor.executescript(schema_sql)
        print("Schema applied successfully.")
    else:
        print("Error: schema.sql not found!")
        conn.close()
        return

    # Read and execute seed data
    if os.path.exists(seed_path):
        print("Applying seed.sql...")
        with open(seed_path, 'r', encoding='utf-8') as f:
            seed_sql = f.read()
        cursor.executescript(seed_sql)
        print("Seed data applied successfully.")
    else:
        print("Error: seed.sql not found!")
        conn.close()
        return

    # Commit changes and close
    conn.commit()
    conn.close()
    print("Database successfully initialized!")

if __name__ == '__main__':
    init_db()
