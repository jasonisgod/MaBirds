from flask import Flask, render_template, send_from_directory

app = Flask(__name__, template_folder='.', static_folder='.')
 
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:path>')
def file(path):
    print(path)
    return send_from_directory('.', path)

if __name__=='__main__':
    app.run(host = "0.0.0.0", debug = True)
