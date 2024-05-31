from flask import Flask, render_template
import preprocess_data
import requests

app = Flask(__name__)
east = preprocess_data.CoordinateGroup("east")
@app.route("/")
def main():
    return render_template("index.html")

@app.route("/cracin_search", methods=["POST"])
def cracin_search():
    results = east.get_route()
    print(results)
    if results["code"] == "Ok":
        return results
    return ''

@app.route("/heatmap", methods=["POST"])
def heatmap():
    print(east.get_normalized_weights())
    return east.get_normalized_weights()