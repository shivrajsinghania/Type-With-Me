import os
from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def init_db():
	conn = sqlite3.connect("database.db")
	cursor = conn.cursor()
	
	cursor.execute("""
	CREATE TABLE IF NOT EXISTS results(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	wpm INTEGER,
	accuracy INTEGER,
	time INTEGER,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)
	""")
	conn.commit()
	conn.close()
init_db()
	

@app.route("/save_result", methods=["POST"])
def save_result():
	data = request.json
	
	wpm = data.get("wpm")
	accuracy = data.get("accuracy")
	time_taken = data.get("time")
	
	conn = sqlite3.connect("database.db")
	cursor = conn.cursor()
	
	cursor.execute("""
	INSERT INTO results(wpm, accuracy, time) VALUES (?, ?, ?)
	""", (wpm, accuracy, time_taken))
	conn.commit()
	conn.close()
	return jsonify({"STATUS": "SAVED!"})
		
@app.route("/")
def home():
	return render_template("typing_home.html")
	
@app.route("/last_result")
def last_result():
	conn = sqlite3.connect("database.db")
	cursor = conn.cursor()
	
	cursor.execute("SELECT wpm, accuracy FROM results ORDER BY id DESC LIMIT 1 OFFSET 1")
	last = cursor.fetchone()
	
	conn.close()
	
	if last:
		return jsonify({"wpm": last[0], "accuracy": last[1]})
	else:
		return jsonify({"wpm": None, "accuracy": None})

port = int(os.environ.get("PORT", 5000))

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=port)
