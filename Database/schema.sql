-- Create Admin table
CREATE TABLE admin (
    Admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL
);

-- Insert sample data into Admin
INSERT INTO admin (name, email, Password) 
VALUES ('Admin User', 'admin@example.com', 'adminpass123');

-- Create Lawyers table
CREATE TABLE lawyers (
    lawyer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    experience_years INT NOT NULL CHECK (experience_years >= 0),
    cases_won INT NOT NULL CHECK (cases_won >= 0),
    cases_lost INT NOT NULL CHECK (cases_lost >= 0),
    phone VARCHAR(15),
    address TEXT,
    date_of_birth DATE,
    specialization VARCHAR(255)
);

-- Insert sample data into Lawyers
INSERT INTO lawyers (name, email, experience_years, cases_won, cases_lost, phone, address, date_of_birth, specialization) 
VALUES 
('John Doe', 'johndoe@example.com', 10, 20, 5, '1234567890', '123 Main St', '1980-01-01', 'Criminal Law'),
('Jane Smith', 'janesmith@example.com', 5, 10, 2, '9876543210', '456 Elm St', '1985-05-15', 'Family Law');

-- Create Clients table
CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(15),
    address TEXT,
    lawyer_id INT,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(lawyer_id) ON DELETE CASCADE
);

-- Insert sample data into Clients
INSERT INTO clients (name, email, phone, address, lawyer_id) 
VALUES 
('Alice Johnson', 'alicej@example.com', '1112223333', '789 Pine St', 1),
('Bob Williams', 'bobw@example.com', '4445556666', '321 Oak St', 2);

-- Create Cases table
CREATE TABLE cases (
    case_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Open', 'In Progress', 'Closed', 'Under Review', 'Awaiting Judgment') NOT NULL,
    client_id INT,
    lawyer_id INT,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(lawyer_id) ON DELETE CASCADE
);

-- Insert sample data into Cases
INSERT INTO cases (title, description, status, client_id, lawyer_id) 
VALUES 
('Case A', 'Description of Case A', 'Open', 1, 1),
('Case B', 'Description of Case B', 'In Progress', 2, 2);

-- Create Appointments table
CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    lawyer_id INT,
    case_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyers(lawyer_id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
);

-- Insert sample data into Appointments
INSERT INTO appointments (client_id, lawyer_id, case_id, appointment_date, appointment_time, appointment_status) 
VALUES 
(1, 1, 1, '2024-01-15', '10:00:00', 'Scheduled'),
(2, 2, 2, '2024-01-16', '14:00:00', 'Scheduled'),
(1, 1, NULL, '2024-01-20', '11:30:00', 'Scheduled');

-- Create View for appointment details
CREATE VIEW appointment_details AS
SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    l.lawyer_id,
    l.name AS lawyer_name,
    l.email AS lawyer_email,
    l.phone AS lawyer_phone,
    c.client_id,
    c.name AS client_name,
    c.email AS client_email,
    ca.case_id,
    ca.title AS case_title,
    ca.status AS case_status,
    (SELECT COUNT(*) FROM cases WHERE lawyer_id = l.lawyer_id) AS number_of_cases
FROM 
    appointments a
JOIN 
    lawyers l ON a.lawyer_id = l.lawyer_id
JOIN 
    clients c ON a.client_id = c.client_id
LEFT JOIN 
    cases ca ON a.case_id = ca.case_id;

-- Triggers Section
DELIMITER $$

-- Prevent appointments with invalid times
CREATE TRIGGER before_insert_appointments
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
    IF NEW.appointment_time NOT BETWEEN '09:00:00' AND '18:00:00' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Appointment time must be between 9:00 AM and 6:00 PM.';
    END IF;
END$$

-- Prevent booking appointments for cases with status Closed
CREATE TRIGGER before_insert_appointments_check_case_status
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
    DECLARE case_status VARCHAR(20);

    SELECT status INTO case_status
    FROM cases
    WHERE case_id = NEW.case_id;

    IF case_status = 'Closed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot book an appointment for a closed case.';
    END IF;
END$$

-- Prevent overlapping appointments for the same lawyer
CREATE TRIGGER prevent_overlapping_appointments
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
    DECLARE existing_appointments INT;

    SELECT COUNT(*) INTO existing_appointments
    FROM appointments
    WHERE lawyer_id = NEW.lawyer_id
      AND appointment_date = NEW.appointment_date
      AND appointment_time = NEW.appointment_time;

    IF existing_appointments > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lawyer already has an appointment at this date and time.';
    END IF;
END$$

-- Validate appointment date
CREATE TRIGGER validate_appointment_date
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
    IF NEW.appointment_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Appointment date cannot be in the past.';
    END IF;
END$$

-- Ensure lawyers are at least 25 years old
CREATE TRIGGER before_insert_lawyers_age
BEFORE INSERT ON lawyers
FOR EACH ROW
BEGIN
    IF TIMESTAMPDIFF(YEAR, NEW.date_of_birth, CURDATE()) < 25 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lawyer must be at least 25 years old.';
    END IF;
END$$

DELIMITER ;
