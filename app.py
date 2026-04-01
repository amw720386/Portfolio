import os

from flask import Flask, abort, render_template, send_file

app = Flask(__name__)


@app.route("/")
def main():
    return render_template("index.html")


@app.route("/resume")
def resume():
    path = os.path.join(app.root_path, "static", "assets", "Resume.pdf")
    if not os.path.isfile(path):
        abort(404)
    return send_file(
        path,
        mimetype="application/pdf",
        as_attachment=False,
        download_name="Resume.pdf",
        max_age=0,
        conditional=True,
    )

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000, debug=True)

