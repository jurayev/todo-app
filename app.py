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
    list_id = db.Column(db.Integer, db.ForeignKey('todo_lists.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=False)

    def __repr__(self):
        return f'< Todo {self.id}: {self.description} >'


class TodoList(db.Model):
    __tablename__ = 'todo_lists'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    completed = db.Column(db.Boolean, nullable=False, default=False)
    todos = db.relationship('Todo', backref=db.backref('todo_list', cascade='all, delete'), lazy=True)

    def __repr__(self):
        return f'< Todo List {self.id}: {self.name} >'


def all_completed(list_id):
    todos_per_list = Todo.query.filter_by(list_id=list_id)
    total_todos = todos_per_list.count()
    total_completed = todos_per_list.filter_by(completed=True).count()
    return total_completed == total_todos
    
    
# --- Controllers --- #
@app.route('/lists/<list_id>/todos/create', methods=['POST'])
def create_todo(list_id):
    error = False
    body = {}
    try:
        description = request.get_json()['description']
        todo = Todo(description=description, list_id=list_id)
        db.session.add(todo)
        db.session.commit()
        body['id'] = todo.id
        body['description'] = todo.description
        body['completed'] = todo.completed
        body['list_id'] = todo.list_id
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
        body['are_all_completed'] = all_completed(todo.list_id)
        body['list_id'] = todo.list_id
        todo_list = TodoList.query.get(body['list_id'])
        if body['are_all_completed']:
            todo_list.completed = True
        else:
            todo_list.completed = False    
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


@app.route('/lists/create', methods=['POST'])
def create_list():
    error = False
    body = {}
    try:
        name = request.get_json()['name']
        todo_list = TodoList(name=name)
        db.session.add(todo_list)
        db.session.commit()
        body['name'] = todo_list.name
        body['id'] = todo_list.id
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
    

@app.route('/lists/<id>/delete', methods=['DELETE'])
def delete_list(id):
    error = False
    try:
        TodoList.query.filter_by(id=id).delete()
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


@app.route('/lists/<id>/mark-completed', methods=['POST'])
def complete_list(id):
    error = False
    body = {'todos': []}
    try:
        completed = request.get_json()['completed']
        todo_list = TodoList.query.get(id)
        todo_list.completed = completed
        todos = Todo.query.filter_by(list_id=id).all()
        for todo in todos:
            todo.completed = completed
            body['todos'].append(todo.id)
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


@app.route('/lists/<list_id>')
def get_list_todos(list_id):
    return render_template('index.html',
                           lists=TodoList.query.order_by('id').all(),
                           active_list=TodoList.query.get(list_id),
                           todos=Todo.query.filter_by(list_id=list_id).order_by('id').all(),
                           count_lists=TodoList.query.count())



@app.route('/')
def index():
    list = TodoList.query.first()
    list_id = list.id if list else 1
    return redirect(url_for('get_list_todos', list_id=list_id))


if __name__ == '__main__':
    app.run(debug=True)
