from flask import Blueprint, jsonify, request, current_app
from markupsafe import escape

from ..entities.task import Task, TaskDTOSchema, TaskDTOUpdateSchema
from ..entities.entity import db

from ..utils.background_task_queue import taskQueue


api_bp = Blueprint('api', __name__)

def emit_socket_event(action, data, notification, app):
    with app.app_context():
        socket = app.extensions.get('socketio')

        socket.emit(
            action,
            {
                'data': data,
                'notification': notification
            }
        )

@api_bp.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()

    try:
        validated_task = TaskDTOSchema().load(data)
    except:
        return jsonify({ 'message': 'Invalid data' }), 400

    new_task = Task(
        validated_task['title'],
        validated_task['completed'],
        validated_task['due_date']
    )

    db.session.add(new_task)
    db.session.commit()

    taskQueue.add_task(
        emit_socket_event,
        'add',
        new_task.to_dict(),
        f'New Task with title {validated_task['title']} created',
        current_app._get_current_object()
    )

    return jsonify({ 'message': 'Task created' }), 201

@api_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()

    try:
        validated_task = TaskDTOUpdateSchema().load({ **data, 'id': task_id })
    except:
        return jsonify({ 'message': 'Missing required fields' }), 400

    taskQuery = Task.query.filter_by(id=validated_task['id'])

    if not taskQuery.first():
        return jsonify({ 'message': 'Task not found' }), 404
    
    updated_task = {
        'title': validated_task['title'],
        'completed': validated_task['completed'],
        'due_date': validated_task['due_date']
    }
    
    taskQuery.update(updated_task)

    db.session.commit()

    taskQueue.add_task(
        emit_socket_event,
        'update',
        {
            **updated_task,
            'id': validated_task['id'],
            'due_date': validated_task['due_date'].strftime('%Y-%m-%d')
        },
        f'{validated_task['title']} updated',
        current_app._get_current_object()
    )

    return jsonify({ 'message': 'Task updated' }), 200

@api_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    validated_id = escape(task_id)

    if not validated_id:
        return jsonify({ 'message': 'Missing required fields' }), 400
    
    Task.query.filter_by(id=validated_id).delete()

    db.session.commit()

    taskQueue.add_task(
        emit_socket_event,
        'delete',
        {
            'id': int(validated_id)
        },
        f'Task {validated_id} deleted',
        current_app._get_current_object()
    )

    return jsonify({ 'message': 'Task deleted' }), 204
