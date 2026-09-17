from flask import Flask, Response, abort, redirect, render_template, send_from_directory, url_for

app = Flask(__name__)

PROJECT_DESTINATIONS = {
    "block-gtq-webgpu": "https://github.com/amw720386/block-gqt-webgpu",
    "brushai": "https://github.com/amw720386",
    "internflow": "https://github.com/amw720386/InternFlow",
    "a-dollar-through-the-2000s": "https://adtt2s.ahamedwajibu.com",
}


@app.route("/")
def main():
    return render_template("index.html")


@app.route("/resume")
def resume():
    return send_from_directory(
        "static/assets", "Resume.pdf", mimetype="application/pdf", as_attachment=False
    )


@app.route("/projects/<slug>")
def project(slug):
    destination = PROJECT_DESTINATIONS.get(slug)
    if destination is None:
        abort(404)
    return redirect(destination, code=301)


@app.route("/sitemap.xml")
def sitemap():
    xml = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.ahamedwajibu.com/</loc></url>
</urlset>'''
    return Response(xml, mimetype="application/xml")


@app.route("/robots.txt")
def robots():
    return Response(
        "User-agent: *\nAllow: /\nSitemap: https://www.ahamedwajibu.com/sitemap.xml\n",
        mimetype="text/plain",
    )


@app.route("/favicon.ico")
def favicon():
    return redirect(url_for("static", filename="logo.svg"), code=302)


@app.errorhandler(404)
def page_not_found(error):
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

