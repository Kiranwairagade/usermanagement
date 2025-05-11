from flask import Blueprint, request, jsonify
import spacy
from backend import db
from backend.models import User
from sqlalchemy.exc import SQLAlchemyError

# Create a blueprint for routes
chatbot_bp = Blueprint('chatbot_bp', __name__)

# Load spaCy model
nlp = spacy.load("en_core_web_trf")

@chatbot_bp.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        # Get the JSON data from the request
        data = request.get_json()

        # Extract the message from the JSON body
        user_message = data.get('message')

        if user_message:
            # Process the message using spaCy to extract entities
            doc = nlp(user_message)

            entities = []
            for ent in doc.ents:
                entities.append({
                    "label": ent.label_,
                    "text": ent.text
                })

            # Sample query to fetch data from the database (e.g., fetching users)
            users = User.query.all()
            user_list = [{"id": user.id, "name": user.name, "email": user.email} for user in users]

            # Return the result including entities and data from the DB
            return jsonify({
                "entities": entities,
                "message": "I am processing your query.",
                "users_from_db": user_list
            })
        else:
            return jsonify({"error": "No message provided"}), 400

    except SQLAlchemyError as e:
        # Handle database errors
        return jsonify({"error": f"Database error: {str(e)}"}), 500
