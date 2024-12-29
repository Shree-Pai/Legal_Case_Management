from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from models import db, Lawyer,Client,Case,Appointment,Admin
from config import Config
import json
from werkzeug.security import generate_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required,get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
from datetime import datetime, time

app = Flask(__name__)

# Custom JSON Encoder for time objects
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()  # Convert datetime to ISO format string
        if isinstance(obj, time):
            return obj.strftime('%H:%M:%S')  # Convert time to HH:MM:SS format
        return super().default(obj)

app = Flask(__name__)
app.config.from_object(Config)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///schema.sql'  # Example database URI
app.config['JWT_SECRET_KEY'] = 'your_secret_key_here'

# Set the custom JSON encoder
app.json_encoder = CustomJSONEncoder

# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)

@app.route('/cors', methods=['GET'])
def cors_route():
    return "CORS is enabled on /cors!", 200

@app.route('/test', methods=['GET'])
def test_route():
    return "Test route working!", 200

# Rehash passwords for all lawyers in the database
def rehash_passwords():
    lawyers = Lawyer.query.all()
    for lawyer in lawyers:
        # Rehash the existing password
        new_hashed_password = generate_password_hash(lawyer.password)
        lawyer.password = new_hashed_password
        db.session.commit()
        print(f"Rehashed password for lawyer: {lawyer.name}")

# Register Route
@app.route('/admin/register', methods=['POST'])
def register_admin():
    data = request.get_json()

    # Check if the data is valid
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing required fields'}), 400

    # Check if the email already exists
    existing_admin = Admin.query.filter_by(email=data['email']).first()
    if existing_admin:
        return jsonify({'message': 'Email already exists'}), 400

    # Store the password as plain text (for demo purposes, ideally hash the password)
    new_admin = Admin(name=data['name'], email=data['email'], password=data['password'])

    try:
        db.session.add(new_admin)
        db.session.commit()
        return jsonify({'message': 'Admin registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error registering admin', 'error': str(e)}), 500

# Login Route
@app.route('/admin/login', methods=['POST'])
def login_admin():
    data = request.get_json()

    # Fetch the admin by email
    admin = Admin.query.filter_by(name=data['name']).first()
    if not admin:
        return jsonify({'message': 'Invalid name or password'}), 401

    # Check if the provided password matches the stored password
    if admin.password != data['password']:
        return jsonify({'message': 'Invalid name or password'}), 401

    # Create JWT token using the correct attribute (Admin_id in your case)
    access_token = create_access_token(identity=str(admin.admin_id))
  # admin_id should be the correct field

    return jsonify({'message': 'Login successful', 'access_token': access_token}), 200


@app.route('/admin/protected', methods=['GET'])
@jwt_required()
def protected():
    # Get the user identity (admin_id) from the JWT token
    current_admin_id = get_jwt_identity()

    # Fetch the admin data based on the current_admin_id
    admin = Admin.query.filter_by(admin_id=current_admin_id).first()

    if admin:
        return jsonify(message="You have access to your data", admin_name=admin.name), 200
    else:
        return jsonify({'message': 'Admin not found'}), 404


@app.route('/admin/logout', methods=['POST'])
@jwt_required()  # This decorator ensures that the user must be authenticated
def logout_admin():
    # You can do some actions here like blacklisting the token (if implemented)
    # For now, we just inform the user that the logout was successful
    return jsonify(message="You have been logged out successfully"), 200


# Get all lawyers
@app.route('/lawyers', methods=['GET'])
def get_lawyers():
    lawyers = Lawyer.query.all()
    lawyer_list = []
    
    for lawyer in lawyers:
        lawyer_list.append({
            'lawyer_id': lawyer.lawyer_id,
            'name': lawyer.name,
            'email': lawyer.email,
            'experience_years': lawyer.experience_years,
            'cases_won': lawyer.cases_won,
            'cases_lost': lawyer.cases_lost,
            'phone': lawyer.phone,
            'address': lawyer.address,
            'date_of_birth': lawyer.date_of_birth,
            'specialization': lawyer.specialization
        })
    
    return jsonify(lawyer_list), 200


@app.route('/lawyers', methods=['POST'])
def add_lawyer():
    try:
        # Parse input data
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No input data provided'}), 400

        # Extract lawyer data
        name = data.get('name')
        email = data.get('email')
        experience_years = data.get('experience_years')
        cases_won = data.get('cases_won')
        cases_lost = data.get('cases_lost')
        phone = data.get('phone')
        address = data.get('address')
        date_of_birth_str = data.get('date_of_birth')  # Expecting 'YYYY-MM-DD'
        specialization = data.get('specialization')

        # Validate mandatory fields
        mandatory_fields = [name, email, experience_years, cases_won, cases_lost, phone, address, date_of_birth_str, specialization]
        if not all(mandatory_fields):
            return jsonify({'message': 'All fields are required'}), 400

        # Convert the string to a Python date object
        try:
            date_of_birth = datetime.strptime(date_of_birth_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format, use YYYY-MM-DD'}), 400

        # Check if the email already exists in the database
        if Lawyer.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already exists'}), 400

        # Check if the phone number already exists (optional if phone is unique)
        if Lawyer.query.filter_by(phone=phone).first():
            return jsonify({'message': 'Phone number already exists'}), 400

        # Create a new lawyer instance
        new_lawyer = Lawyer(
            name=name,
            email=email,
            experience_years=experience_years,
            cases_won=cases_won,
            cases_lost=cases_lost,
            phone=phone,
            address=address,
            date_of_birth=date_of_birth,
            specialization=specialization
        )

        # Add lawyer to the database
        db.session.add(new_lawyer)
        db.session.commit()
        return jsonify({'message': 'Lawyer added successfully'}), 201

    except IntegrityError as e:
        db.session.rollback()
        return jsonify({'message': 'Integrity error occurred, check for duplicates or constraints', 'error': str(e)}), 500
    except Exception as e:
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500


# Update lawyer details
@app.route('/lawyers/<int:lawyer_id>', methods=['PUT'])
def update_lawyer(lawyer_id):
    data = request.get_json()

    # Find lawyer by lawyer_id
    lawyer = Lawyer.query.get(lawyer_id)
    if not lawyer:
        return jsonify({'message': 'Lawyer not found'}), 404

    # Update lawyer details
    lawyer.name = data.get('name', lawyer.name)
    lawyer.email = data.get('email', lawyer.email)
    lawyer.experience_years = data.get('experience_years', lawyer.experience_years)
    lawyer.cases_won = data.get('cases_won', lawyer.cases_won)
    lawyer.cases_lost = data.get('cases_lost', lawyer.cases_lost)
    lawyer.phone = data.get('phone', lawyer.phone)
    lawyer.address = data.get('address', lawyer.address)
    lawyer.date_of_birth = data.get('date_of_birth', lawyer.date_of_birth)
    lawyer.specialization = data.get('specialization', lawyer.specialization)

    # Commit changes to the database
    db.session.commit()

    return jsonify({'message': 'Lawyer updated successfully'}), 200

# Delete a lawyer
@app.route('/lawyers/<int:lawyer_id>', methods=['DELETE'])
def delete_lawyer(lawyer_id):
    # Find lawyer by lawyer_id
    lawyer = Lawyer.query.get(lawyer_id)
    if not lawyer:
        return jsonify({'message': 'Lawyer not found'}), 404

    # Delete the lawyer from the database
    db.session.delete(lawyer)
    db.session.commit()

    return jsonify({'message': 'Lawyer deleted successfully'}), 200


@app.route('/profile', methods=['GET'])
def get_all_lawyers():
    # Get all lawyers from the database
    lawyers = Lawyer.query.all()

    # If no lawyers are found
    if not lawyers:
        return jsonify({'message': 'No lawyers found'}), 404

    # Prepare a list of lawyer details
    lawyer_list = []
    for lawyer in lawyers:
        lawyer_list.append({
            'lawyer_id': lawyer.lawyer_id,
            'name': lawyer.name,
            'email': lawyer.email,
            'experience_years': lawyer.experience_years,
            'cases_won': lawyer.cases_won,
            'cases_lost': lawyer.cases_lost,
            'phone': lawyer.phone,
            'address': lawyer.address,
            'date_of_birth': lawyer.date_of_birth
        })

    return jsonify(lawyer_list), 200

@app.route('/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    clients_list = []
    
    for client in clients:
        clients_list.append({
            'client_id': client.client_id,
            'name': client.name,
            'email': client.email,
            'phone': client.phone,
            'address': client.address,
            'lawyer_id': client.lawyer_id
        })
    
    return jsonify(clients_list), 200

# Add a new client
@app.route('/clients', methods=['POST'])
def add_client():
    data = request.get_json()

    # Extract client data
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    address = data.get('address')
    lawyer_id = data.get('lawyer_id')

    # Create a new client instance
    new_client = Client(
        name=name,
        email=email,
        phone=phone,
        address=address,
        lawyer_id=lawyer_id
    )

    # Add client to the database
    db.session.add(new_client)
    db.session.commit()

    return jsonify({'message': 'Client added successfully'}), 201

# Update client details
@app.route('/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    data = request.get_json()

    # Find client by client_id
    client = Client.query.get(client_id)
    if not client:
        return jsonify({'message': 'Client not found'}), 404

    # Update client details
    client.name = data.get('name', client.name)
    client.email = data.get('email', client.email)
    client.phone = data.get('phone', client.phone)
    client.address = data.get('address', client.address)
    client.lawyer_id = data.get('lawyer_id', client.lawyer_id)

    # Commit changes to the database
    db.session.commit()

    return jsonify({'message': 'Client updated successfully'}), 200

# Delete a client
@app.route('/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    # Find client by client_id
    client = Client.query.get(client_id)
    if not client:
        return jsonify({'message': 'Client not found'}), 404

    # Delete the client from the database
    db.session.delete(client)
    db.session.commit()

    return jsonify({'message': 'Client deleted successfully'}), 200


@app.route('/cases', methods=['GET'])
def get_cases():
    # Fetch all cases
    cases = Case.query.all()
    cases_list = []
    
    for case in cases:
        cases_list.append({
            'case_id': case.case_id,
            'title': case.title,
            'description': case.description,
            'status': case.status,
            'client_id': case.client_id,
            'lawyer_id': case.lawyer_id
        })
    
    return jsonify(cases_list), 200

@app.route('/cases', methods=['POST'])
def add_case():
    data = request.get_json()

    # Extract case data
    title = data.get('title')
    description = data.get('description')
    status = data.get('status')
    client_id = data.get('client_id')
    lawyer_id = data.get('lawyer_id')

    # Create a new case instance
    new_case = Case(
        title=title,
        description=description,
        status=status,
        client_id=client_id,
        lawyer_id=lawyer_id
    )

    # Add case to the database
    db.session.add(new_case)
    db.session.commit()

    return jsonify({'message': 'Case added successfully'}), 201

@app.route('/cases/<int:case_id>', methods=['PUT'])
def update_case(case_id):
    data = request.get_json()

    # Find case by case_id
    case = Case.query.get(case_id)
    if not case:
        return jsonify({'message': 'Case not found'}), 404

    # Update case details
    case.title = data.get('title', case.title)
    case.description = data.get('description', case.description)
    case.status = data.get('status', case.status)
    case.client_id = data.get('client_id', case.client_id)
    case.lawyer_id = data.get('lawyer_id', case.lawyer_id)

    # Commit changes to the database
    db.session.commit()

    return jsonify({'message': 'Case updated successfully'}), 200

@app.route('/cases/<int:case_id>', methods=['DELETE'])
def delete_case(case_id):
    # Find case by case_id
    case = Case.query.get(case_id)
    if not case:
        return jsonify({'message': 'Case not found'}), 404

    # Delete the case from the database
    db.session.delete(case)
    db.session.commit()

    return jsonify({'message': 'Case deleted successfully'}), 200


@app.route('/appointments', methods=['GET'])
def get_appointments():
    appointments = Appointment.query.all()
    appointments_list = []
    
    for appointment in appointments:
        # Manually convert time to string before returning
        appointment_time = appointment.appointment_time if appointment.appointment_time else None
        
        appointments_list.append({
            'appointment_id': appointment.appointment_id,
            'client_id': appointment.client_id,
            'lawyer_id': appointment.lawyer_id,
            'appointment_date': appointment.appointment_date,
            'appointment_time': appointment.appointment_time  # Time as string
        })
    
    return jsonify(appointments_list), 200

@app.route('/appointments', methods=['POST'])
def add_appointment():
    data = request.get_json()
    print('Received data:', data)  # Log incoming data for debugging

    client_id = data.get('client_id')
    lawyer_id = data.get('lawyer_id')
    appointment_date = data.get('appointment_date')
    appointment_time = data.get('appointment_time')  # appointment_time is now expected to be a string

    if not client_id or not lawyer_id or not appointment_date or not appointment_time:
        return jsonify({'error': 'Missing required fields'}), 400

    # No need to convert the appointment_time if it's already a string

    # Create new appointment instance
    new_appointment = Appointment(
        client_id=client_id,
        lawyer_id=lawyer_id,
        appointment_date=appointment_date,
        appointment_time=appointment_time  # Store the string directly
    )

    # Add the appointment to the database
    try:
        db.session.add(new_appointment)
        db.session.commit()
        return jsonify({'message': 'Appointment added successfully'}), 201
    except Exception as e:
        db.session.rollback()  # Rollback the transaction in case of error
        print(f"Error adding appointment: {e}")
        return jsonify({'error': 'Failed to add appointment'}), 500

@app.route('/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    data = request.get_json()

    # Find the appointment by ID
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({'message': 'Appointment not found'}), 404

    # Update the appointment details, assuming appointment_time is already a string
    appointment.client_id = data.get('client_id', appointment.client_id)
    appointment.lawyer_id = data.get('lawyer_id', appointment.lawyer_id)
    appointment.appointment_date = data.get('appointment_date', appointment.appointment_date)
    appointment.appointment_time = data.get('appointment_time', appointment.appointment_time)

    # Commit the changes
    db.session.commit()

    return jsonify({'message': 'Appointment updated successfully'}), 200

@app.route('/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    # Find the appointment by ID
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({'message': 'Appointment not found'}), 404

    # Delete the appointment
    db.session.delete(appointment)
    db.session.commit()

    return jsonify({'message': 'Appointment deleted successfully'}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

