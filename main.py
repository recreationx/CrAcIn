from flask import Flask, render_template, request
import preprocess_data
import requests

app = Flask(__name__)
@app.route("/")
def main():
    return render_template("index.html")

@app.route("/cracin_search", methods=["POST"])
def cracin_search():
    route_password = request.form["route_pw"]
    results = preprocess_data.CoordinateGroup(route_password).get_route()
    print(results)
    if results["code"] == "Ok":
        return results
    return ''

@app.route("/heatmap", methods=["POST"])
def heatmap():
    route_password = request.form["route_pw"]
    results = preprocess_data.CoordinateGroup(route_password)
    return results.get_normalized_weights()