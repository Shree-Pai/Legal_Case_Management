from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Admin(db.Model):
    __tablename__ = 'admin'
    admin_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    
    def __repr__(self):
        return f'<Admin {self.name}>'
    
    def check_password(self, password):
        return check_password_hash(self.password, password)

class Lawyer(db.Model):
    __tablename__ = 'lawyers'

    lawyer_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    experience_years = db.Column(db.Integer, nullable=False)
    cases_won = db.Column(db.Integer, nullable=False)
    cases_lost = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(15), nullable=True)
    address = db.Column(db.Text, nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    specialization = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f"<Lawyer {self.name}>"

class Client(db.Model):
    __tablename__ = 'clients'

    client_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255))
    phone = db.Column(db.String(15))
    address = db.Column(db.Text)
    lawyer_id = db.Column(db.Integer, db.ForeignKey('lawyers.lawyer_id'))

    lawyer = db.relationship('Lawyer', backref=db.backref('clients', lazy=True))

    def __repr__(self):
        return f"<Client {self.name}>"

class Case(db.Model):
    __tablename__ = 'cases'

    case_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum('Open', 'In Progress', 'Closed', 'Under Review', 'Awaiting Judgment', name='case_status'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.client_id'))
    lawyer_id = db.Column(db.Integer, db.ForeignKey('lawyers.lawyer_id'))

    client = db.relationship('Client', backref=db.backref('cases', lazy=True))
    lawyer = db.relationship('Lawyer', backref=db.backref('cases', lazy=True))

    def __repr__(self):
        return f"<Case {self.title}>"

class Appointment(db.Model):
    __tablename__ = 'appointments'

    appointment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.client_id', ondelete="CASCADE"), nullable=False)
    lawyer_id = db.Column(db.Integer, db.ForeignKey('lawyers.lawyer_id', ondelete="CASCADE"), nullable=False)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.case_id', ondelete="CASCADE"), nullable=True)
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    appointment_status = db.Column(db.Enum('Scheduled', 'Completed', 'Cancelled', name='appointment_status'), default='Scheduled')

    client = db.relationship('Client', backref='appointments', lazy=True)
    lawyer = db.relationship('Lawyer', backref='appointments', lazy=True)
    case = db.relationship('Case', backref='appointments', lazy=True)

    def __repr__(self):
        return f'<Appointment {self.appointment_id}>'



