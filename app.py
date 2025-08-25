from flask import Flask, render_template, redirect

app = Flask(__name__)

@app.route("/")
def main():
    return render_template('index.html')

@app.route("/Stuff")
def stuff():
    return render_template('stuff.html')

@app.route("/puzzlegame")
def puzzlegame():
    return render_template("puzzlegame.html")

@app.route("/sudoku")
def sudoku():
    return render_template("sudoku.html")


@app.route("/RickNMorty")
def redirect_view():
    return redirect("https://rick-and-mordle.vercel.app/", code=302)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)

