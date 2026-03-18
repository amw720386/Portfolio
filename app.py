from flask import Flask, render_template, send_file

app = Flask(__name__)

@app.route("/")
def main():
    return render_template('index.html')

@app.route("/resume")
def resume():
    return send_file('static/assets/Resume.pdf', mimetype='application/pdf')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)

