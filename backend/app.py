from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from models import db, Lawyer,Client,Case,Appointment,Admin
from config import Config
import json
from werkzeug.security import generate_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required,get_jwt_identity, decode_token
from sqlalchemy.exc import SQLAlchemyError
from flask_cors import CORS
from datetime import datetime, time, timedelta

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
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/legal_case_management'
app.config['JWT_SECRET_KEY'] = 'your_secret_key_here'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Token expires in 1 hour
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

# Set the custom JSON encoder
app.json_encoder = CustomJSONEncoder

# Initialize extensions
db.init_app(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

CORS(app)

def is_token_expired(token):
    try:
        decoded_token = decode_token(token)
        exp_timestamp = decoded_token['exp']
        now = datetime.utcnow().timestamp()
        return exp_timestamp < now
    except Exception:
        return True

@app.route('/cors', methods=['GET'])
def cors_route():
    return "CORS is enabled on /cors!", 200

@app.route('/test', methods=['GET'])
def test_route():
    return "Test route working!", 200

@app.route('/test-db')
def test_db():
    try:
        # Try to query the database
        lawyers = Lawyer.query.all()
        return jsonify({'message': 'Database connection successful', 'lawyer_count': len(lawyers)})
    except Exception as e:
        return jsonify({'message': 'Database error', 'error': str(e)}), 500

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
    try:
        data = request.get_json()

        # Check if the data is valid
        if not data or not data.get('email') or not data.get('password') or not data.get('name'):
            return jsonify({'message': 'Missing required fields'}), 400

        # Check if the email already exists
        existing_admin = Admin.query.filter_by(email=data['email']).first()
        if existing_admin:
            return jsonify({'message': 'Email already exists'}), 400

        # Hash the password before storing
        hashed_password = generate_password_hash(data['password'])
        
        # Create new admin with hashed password
        new_admin = Admin(
            name=data['name'],
            email=data['email'],
            password=hashed_password
        )

        db.session.add(new_admin)
        db.session.commit()

        return jsonify({'message': 'Admin registered successfully'}), 201
    except Exception as e:
        print('Registration error:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error registering admin', 'error': str(e)}), 500

# Login Route
@app.route('/admin/login', methods=['POST'])
def login_admin():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        admin = Admin.query.filter_by(email=email).first()
        if admin and admin.check_password(password):
            access_token = create_access_token(identity=admin.admin_id)
            return jsonify({
                'message': 'Login successful',
                'token': access_token,
                'admin_id': admin.admin_id,
                'name': admin.name,
                'email': admin.email
            }), 200
        else:
            return jsonify({'message': 'Invalid email or password'}), 401

    except Exception as e:
        print('Login error:', str(e))
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500


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
        print('Received data:', data)  # Debug log
        
        if not data:
            return jsonify({'message': 'No input data provided'}), 400

        # Convert date string to date object
        try:
            date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

        # Create new lawyer instance
        new_lawyer = Lawyer(
            name=data['name'],
            email=data['email'],
            experience_years=int(data['experience_years']),
            cases_won=int(data['cases_won']),
            cases_lost=int(data['cases_lost']),
            phone=data['phone'],
            address=data['address'],
            date_of_birth=date_of_birth,
            specialization=data['specialization']
        )

        print('Creating lawyer:', new_lawyer)  # Debug log

        # Add to database
        db.session.add(new_lawyer)
        db.session.commit()

        # Return the created lawyer data
        return jsonify({
            'message': 'Lawyer added successfully',
            'data': {
                'lawyer_id': new_lawyer.lawyer_id,
                'name': new_lawyer.name,
                'email': new_lawyer.email,
                'experience_years': new_lawyer.experience_years,
                'cases_won': new_lawyer.cases_won,
                'cases_lost': new_lawyer.cases_lost,
                'phone': new_lawyer.phone,
                'address': new_lawyer.address,
                'date_of_birth': new_lawyer.date_of_birth.isoformat(),
                'specialization': new_lawyer.specialization
            }
        }), 201

    except KeyError as e:
        return jsonify({'message': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        print('Error adding lawyer:', str(e))  # Debug log
        db.session.rollback()
        return jsonify({'message': 'Error adding lawyer', 'error': str(e)}), 500


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
    try:
        clients = Client.query.all()
        client_list = []
        
        for client in clients:
            client_list.append({
                'client_id': client.client_id,
                'name': client.name,
                'email': client.email,
                'phone': client.phone,
                'address': client.address,
                'lawyer_id': client.lawyer_id
            })
        
        return jsonify(client_list), 200
    except Exception as e:
        print('Error fetching clients:', str(e))
        return jsonify({'message': 'Error fetching clients', 'error': str(e)}), 500

@app.route('/clients', methods=['POST'])
def add_client():
    try:
        data = request.get_json()
        print('Received client data:', data)

        if not data:
            return jsonify({'message': 'No input data provided'}), 400

        # Create new client instance
        new_client = Client(
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            address=data['address'],
            lawyer_id=data['lawyer_id']
        )

        print('Creating client:', new_client)

        # Add to database
        db.session.add(new_client)
        db.session.commit()

        # Return the created client data
        return jsonify({
            'message': 'Client added successfully',
            'data': {
                'client_id': new_client.client_id,
                'name': new_client.name,
                'email': new_client.email,
                'phone': new_client.phone,
                'address': new_client.address,
                'lawyer_id': new_client.lawyer_id
            }
        }), 201

    except KeyError as e:
        return jsonify({'message': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        print('Error adding client:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error adding client', 'error': str(e)}), 500

@app.route('/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'message': 'Client not found'}), 404

        data = request.get_json()
        
        # Update client details
        client.name = data.get('name', client.name)
        client.email = data.get('email', client.email)
        client.phone = data.get('phone', client.phone)
        client.address = data.get('address', client.address)
        client.lawyer_id = data.get('lawyer_id', client.lawyer_id)

        db.session.commit()

        return jsonify({
            'message': 'Client updated successfully',
            'data': {
                'client_id': client.client_id,
                'name': client.name,
                'email': client.email,
                'phone': client.phone,
                'address': client.address,
                'lawyer_id': client.lawyer_id
            }
        }), 200

    except Exception as e:
        print('Error updating client:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error updating client', 'error': str(e)}), 500

@app.route('/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'message': 'Client not found'}), 404

        db.session.delete(client)
        db.session.commit()

        return jsonify({'message': 'Client deleted successfully'}), 200

    except Exception as e:
        print('Error deleting client:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error deleting client', 'error': str(e)}), 500


@app.route('/cases', methods=['GET'])
def get_cases():
    try:
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
        
        print('Returning cases:', cases_list)  # Debug log
        return jsonify(cases_list), 200
    except Exception as e:
        print('Error fetching cases:', str(e))
        return jsonify({'message': 'Error fetching cases', 'error': str(e)}), 500

@app.route('/cases', methods=['POST'])
def add_case():
    try:
        data = request.get_json()
        print('Received case data:', data)

        if not data:
            return jsonify({'message': 'No input data provided'}), 400

        # Create new case instance
        new_case = Case(
            title=data['title'],
            description=data['description'],
            status=data['status'],
            client_id=int(data['client_id']),
            lawyer_id=int(data['lawyer_id'])
        )

        print('Creating case:', new_case)

        # Add to database
        db.session.add(new_case)
        db.session.commit()

        # Return the created case data
        return jsonify({
            'message': 'Case added successfully',
            'data': {
                'case_id': new_case.case_id,
                'title': new_case.title,
                'description': new_case.description,
                'status': new_case.status,
                'client_id': new_case.client_id,
                'lawyer_id': new_case.lawyer_id
            }
        }), 201

    except KeyError as e:
        return jsonify({'message': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        print('Error adding case:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error adding case', 'error': str(e)}), 500

@app.route('/cases/<int:case_id>', methods=['PUT'])
def update_case(case_id):
    try:
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

        # Return updated case data
        return jsonify({
            'message': 'Case updated successfully',
            'data': {
                'case_id': case.case_id,
                'title': case.title,
                'description': case.description,
                'status': case.status,
                'client_id': case.client_id,
                'lawyer_id': case.lawyer_id
            }
        }), 200

    except Exception as e:
        print('Error updating case:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error updating case', 'error': str(e)}), 500

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
    try:
        appointments = Appointment.query.all()
        appointments_list = []
        
        for appointment in appointments:
            case_title = None
            if appointment.case:
                case_title = appointment.case.title

            appointments_list.append({
                'appointment_id': appointment.appointment_id,
                'client_id': appointment.client_id,
                'lawyer_id': appointment.lawyer_id,
                'case_id': appointment.case_id,
                'case_title': case_title,
                'appointment_date': appointment.appointment_date.isoformat(),
                'appointment_time': appointment.appointment_time.strftime('%H:%M:%S'),
                'appointment_status': appointment.appointment_status,
                'client_name': appointment.client.name if appointment.client else None,
                'lawyer_name': appointment.lawyer.name if appointment.lawyer else None
            })
        
        return jsonify(appointments_list), 200
    except Exception as e:
        print('Error fetching appointments:', str(e))
        return jsonify({'message': 'Error fetching appointments', 'error': str(e)}), 500

@app.route('/appointments', methods=['POST'])
def add_appointment():
    try:
        data = request.get_json()
        print('Received appointment data:', data)

        if not data:
            return jsonify({'message': 'No input data provided'}), 400

        try:
            # Convert date and time strings to Python objects
            appointment_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            appointment_time = datetime.strptime(data['time'], '%H:%M:%S').time()
            
            print(f"Parsed date: {appointment_date}, time: {appointment_time}")

            # Validate required fields
            required_fields = ['client_id', 'lawyer_id', 'case_id', 'date', 'time', 'appointment_status']
            for field in required_fields:
                if field not in data:
                    return jsonify({'message': f'Missing required field: {field}'}), 400

            # Create new appointment instance
            new_appointment = Appointment(
                client_id=int(data['client_id']),
                lawyer_id=int(data['lawyer_id']),
                case_id=int(data['case_id']),
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                appointment_status=data['appointment_status']
            )

            print('Creating appointment:', new_appointment)

            # Add to database
            db.session.add(new_appointment)
            db.session.commit()

            # Return the created appointment data with additional info
            response_data = {
                'message': 'Appointment added successfully',
                'data': {
                    'appointment_id': new_appointment.appointment_id,
                    'client_id': new_appointment.client_id,
                    'lawyer_id': new_appointment.lawyer_id,
                    'case_id': new_appointment.case_id,
                    'appointment_date': new_appointment.appointment_date.isoformat(),
                    'appointment_time': new_appointment.appointment_time.strftime('%H:%M:%S'),
                    'appointment_status': new_appointment.appointment_status,
                    'client_name': new_appointment.client.name if new_appointment.client else None,
                    'lawyer_name': new_appointment.lawyer.name if new_appointment.lawyer else None,
                    'case_title': new_appointment.case.title if new_appointment.case else None
                }
            }
            print('Response data:', response_data)
            return jsonify(response_data), 201

        except ValueError as e:
            print('Date/time parsing error:', str(e))
            return jsonify({'message': f'Invalid date or time format: {str(e)}'}), 400

    except Exception as e:
        print('Error adding appointment:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error adding appointment', 'error': str(e)}), 500

@app.route('/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'message': 'Appointment not found'}), 404

        data = request.get_json()
        
        # Update appointment details
        if 'date' in data:
            appointment.appointment_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'time' in data:
            appointment.appointment_time = datetime.strptime(data['time'], '%H:%M:%S').time()
        if 'appointment_status' in data:
            appointment.appointment_status = data['appointment_status']
        if 'client_id' in data:
            appointment.client_id = int(data['client_id'])
        if 'lawyer_id' in data:
            appointment.lawyer_id = int(data['lawyer_id'])
        if 'case_id' in data:
            appointment.case_id = int(data['case_id']) if data['case_id'] else None

        db.session.commit()

        return jsonify({
            'message': 'Appointment updated successfully',
            'data': {
                'appointment_id': appointment.appointment_id,
                'client_id': appointment.client_id,
                'lawyer_id': appointment.lawyer_id,
                'case_id': appointment.case_id,
                'appointment_date': appointment.appointment_date.isoformat(),
                'appointment_time': appointment.appointment_time.strftime('%H:%M:%S'),
                'appointment_status': appointment.appointment_status,
                'client_name': appointment.client.name if appointment.client else None,
                'lawyer_name': appointment.lawyer.name if appointment.lawyer else None
            }
        }), 200

    except ValueError as e:
        return jsonify({'message': 'Invalid date or time format'}), 400
    except Exception as e:
        print('Error updating appointment:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error updating appointment', 'error': str(e)}), 500

@app.route('/appointments/<int:appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    try:
        appointment = Appointment.query.get(appointment_id)
        if not appointment:
            return jsonify({'message': 'Appointment not found'}), 404

        db.session.delete(appointment)
        db.session.commit()

        return jsonify({'message': 'Appointment deleted successfully'}), 200

    except Exception as e:
        print('Error deleting appointment:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error deleting appointment', 'error': str(e)}), 500

@app.route('/debug/cases', methods=['GET'])
def debug_cases():
    try:
        cases = Case.query.all()
        cases_list = []
        
        for case in cases:
            cases_list.append({
                'case_id': case.case_id,
                'title': case.title,
                'description': case.description,
                'status': case.status,
                'client_id': case.client_id,
                'lawyer_id': case.lawyer_id,
                'client_name': case.client.name if case.client else None,
                'lawyer_name': case.lawyer.name if case.lawyer else None
            })
        
        return jsonify({
            'total_cases': len(cases_list),
            'cases': cases_list
        }), 200
    except Exception as e:
        print('Error in debug cases:', str(e))
        return jsonify({'message': 'Error fetching cases', 'error': str(e)}), 500

@app.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    try:
        # Get counts from database
        total_lawyers = Lawyer.query.count()
        total_clients = Client.query.count()
        total_cases = Case.query.count()
        total_appointments = Appointment.query.count()

        dashboard_data = {
            'total_lawyers': total_lawyers,
            'total_clients': total_clients,
            'total_cases': total_cases,
            'total_appointments': total_appointments
        }

        return jsonify(dashboard_data), 200
    except Exception as e:
        print('Error fetching dashboard data:', str(e))
        return jsonify({'message': 'Error fetching dashboard data', 'error': str(e)}), 500

@app.route('/profile/<int:admin_id>', methods=['GET'])
@jwt_required()
def get_admin_profile(admin_id):
    try:
        # Get the JWT identity
        current_user_id = get_jwt_identity()
        print(f"Current user ID: {current_user_id}, Requested admin ID: {admin_id}")

        # Convert both to integers for comparison
        if int(current_user_id) != int(admin_id):
            return jsonify({'message': 'Unauthorized access'}), 403

        admin = Admin.query.get(admin_id)
        if not admin:
            return jsonify({'message': 'Admin not found'}), 404

        return jsonify({
            'admin_id': admin.admin_id,
            'name': admin.name,
            'email': admin.email
        }), 200
    except Exception as e:
        print('Error fetching admin profile:', str(e))
        return jsonify({'message': 'Error fetching profile', 'error': str(e)}), 500

@app.route('/profile/<int:admin_id>', methods=['PUT'])
@jwt_required()
def update_admin_profile(admin_id):
    try:
        # Verify that the logged-in user is updating their own profile
        current_user_id = get_jwt_identity()
        if current_user_id != admin_id:
            return jsonify({'message': 'Unauthorized access'}), 403

        admin = Admin.query.get(admin_id)
        if not admin:
            return jsonify({'message': 'Admin not found'}), 404

        data = request.get_json()
        
        if 'name' in data:
            admin.name = data['name']
        if 'email' in data:
            admin.email = data['email']
        if 'password' in data:
            admin.password = generate_password_hash(data['password'])

        db.session.commit()

        return jsonify({
            'message': 'Profile updated successfully',
            'data': {
                'admin_id': admin.admin_id,
                'name': admin.name,
                'email': admin.email
            }
        }), 200
    except Exception as e:
        print('Error updating admin profile:', str(e))
        db.session.rollback()
        return jsonify({'message': 'Error updating profile', 'error': str(e)}), 500

@app.route('/view/<table>', methods=['GET'])
@jwt_required()
def get_view_details(table):
    try:
        # Get the JWT identity
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Invalid or expired token'}), 401

        # Print debug information
        print(f"User ID: {current_user_id}, Accessing table: {table}")

        if table == 'cases':
            query = """
                SELECT 
                    c.case_id,
                    c.title,
                    c.description,
                    c.status,
                    cl.name as client_name,
                    l.name as lawyer_name,
                    c.filing_date,
                    c.closing_date
                FROM cases c
                LEFT JOIN clients cl ON c.client_id = cl.client_id
                LEFT JOIN lawyers l ON c.lawyer_id = l.lawyer_id
                ORDER BY c.case_id DESC
            """
        elif table == 'appointments':
            query = """
                SELECT 
                    a.appointment_id,
                    cl.name as client_name,
                    l.name as lawyer_name,
                    c.title as case_title,
                    DATE_FORMAT(a.appointment_date, '%%Y-%%m-%%d') as appointment_date,
                    TIME_FORMAT(a.appointment_time, '%%H:%%i:%%s') as appointment_time,
                    a.appointment_status
                FROM appointments a
                LEFT JOIN clients cl ON a.client_id = cl.client_id
                LEFT JOIN lawyers l ON a.lawyer_id = l.lawyer_id
                LEFT JOIN cases c ON a.case_id = c.case_id
                ORDER BY a.appointment_date DESC, a.appointment_time DESC
            """
        elif table == 'clients':
            query = """
                SELECT 
                    c.client_id,
                    c.name,
                    c.email,
                    c.phone,
                    c.address,
                    l.name as assigned_lawyer,
                    COUNT(DISTINCT cs.case_id) as total_cases
                FROM clients c
                LEFT JOIN lawyers l ON c.lawyer_id = l.lawyer_id
                LEFT JOIN cases cs ON c.client_id = cs.client_id
                GROUP BY c.client_id, c.name, c.email, c.phone, c.address, l.name
                ORDER BY c.client_id DESC
            """
        elif table == 'lawyers':
            query = """
                SELECT 
                    l.lawyer_id,
                    l.name,
                    l.email,
                    l.phone,
                    l.specialization,
                    l.experience_years,
                    COUNT(DISTINCT c.case_id) as active_cases,
                    COUNT(DISTINCT cl.client_id) as total_clients
                FROM lawyers l
                LEFT JOIN cases c ON l.lawyer_id = c.lawyer_id AND c.status = 'Active'
                LEFT JOIN clients cl ON l.lawyer_id = cl.lawyer_id
                GROUP BY l.lawyer_id, l.name, l.email, l.phone, l.specialization, l.experience_years
                ORDER BY l.lawyer_id DESC
            """
        else:
            return jsonify({'message': 'Invalid table name'}), 400

        result = db.session.execute(query)
        data = [dict(row) for row in result]
        
        # Convert datetime objects to strings
        for row in data:
            for key, value in row.items():
                if isinstance(value, (datetime, time)):
                    row[key] = value.isoformat()

        return jsonify(data), 200

    except Exception as e:
        print('Error in get_view_details:', str(e))
        return jsonify({
            'message': 'Error fetching view details',
            'error': str(e),
            'details': 'Token validation failed'
        }), 500

@app.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    try:
        # Get the JWT identity
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return jsonify({'message': 'Invalid token'}), 401
            
        return jsonify({'message': 'Token is valid', 'user_id': current_user_id}), 200
    except Exception as e:
        print('Token verification error:', str(e))
        return jsonify({'message': 'Token verification failed', 'error': str(e)}), 401

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)

