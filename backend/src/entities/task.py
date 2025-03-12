from marshmallow import Schema, fields, validate
from datetime import datetime

from .entity import Entity, db


class TaskDTOSchema(Schema):
    title = fields.Str(required=True)
    completed = fields.Bool(required=True)
    due_date = fields.DateTime(format='%Y-%m-%d', required=True, validate=validate.Range(min=datetime.now()))

class TaskDTOUpdateSchema(TaskDTOSchema):
    id = fields.Int(required=True)

class Task(Entity):
    __tablename__ = 'Task'

    title = db.Column(db.String(128), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    due_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, title, completed, due_date):
        super().__init__()

        self.title = title
        self.completed = completed
        self.due_date = due_date

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "due_date": self.due_date.strftime('%Y-%m-%d'),
            "completed": self.completed
        }
