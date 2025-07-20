from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def main():
    return render_template('index.html')

@app.route("/Stuff")
def stuff():
    return render_template('stuff.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)

