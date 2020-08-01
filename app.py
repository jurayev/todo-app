import sys
from flask import Flask, render_template, request, jsonify, abort, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgres://postgres:postgres@localhost:5432/todoapp'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
app.jinja_env.auto_reload = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

db = SQLAlchemy(app)
migrate = Migrate(app, db)


# --- Model --- #
class Todo(db.Model):
    __tablename__ = 'todos'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(), nullable=False)
    completed = db.Column(db.Boolean, nullable=False, default=False)

    def __repr__(self):
        return f'< Todo {self.id}: {self.description} >'


# --- Controllers --- #
@app.route('/todos/create', methods=['POST'])
def create_todo():
    error = False
    body = {}
    try:
        description = request.get_json()['description']
        todo = Todo(description=description)
        db.session.add(todo)
        db.session.commit()
        body['id'] = todo.id
        body['description'] = todo.description
        body['completed'] = todo.completed
    except:
        error = True
        db.session.rollback()
        print(sys.exc_info())
    finally:
        db.session.close()

    if error:
        abort(400)
    else:
        return jsonify(body)


@app.route("/todos/<id>/mark-completed", methods=['POST'])
def complete_todo(id):
    error = False
    body = {}
    try:
        completed = request.get_json()['completed']
        todo = Todo.query.get(id)
        todo.completed = completed
        body['completed'] = completed
        db.session.commit()
    except:
        error = True
        db.session.rollback()
        print(sys.exc_info())
    finally:
        db.session.close()

    if error:
        abort(400)
    else:
        return jsonify(body)


@app.route('/todos/<id>/delete', methods=['DELETE'])
def delete_todo(id):
    error = False
    try:
        Todo.query.filter_by(id=id).delete()
        db.session.commit()
    except:
        error = True
        db.session.rollback()
        print(sys.exc_info())
    finally:
        db.session.close()

    if error:
        abort(400)
    else:
        return jsonify({'success': True})


@app.route('/')
def index():
    return render_template('index.html', data=Todo.query.order_by(Todo.id).all())


if __name__ == '__main__':
    app.run(debug=True)
