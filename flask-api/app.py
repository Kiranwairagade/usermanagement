# main.py
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import spacy
import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, func, or_
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
import re
from intents import INTENT_PATTERNS  

# Initialize FastAPI app
app = FastAPI()

# CORS setup for frontend
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup for SQL Server
SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL', "mssql+pyodbc://sa:kiran@HP\\SQLEXPRESS/ECommerceDB?driver=ODBC+Driver+17+for+SQL+Server")
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"driver": "ODBC Driver 17 for SQL Server"})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class MessageDB(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    is_user = Column(Integer, nullable=False)  # 1 for user, 0 for bot
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class SuggestionDB(Base):
    __tablename__ = "suggestions"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(255), nullable=False, unique=True)
    usage_count = Column(Integer, default=0)

# Models from your database schema
class Brand(Base):
    __tablename__ = "Brands"
    BrandId = Column(Integer, primary_key=True)
    BrandName = Column(String(255), nullable=False)
    Description = Column(String(500))
    CreatedAt = Column(DateTime, default=datetime.datetime.utcnow)
    UpdatedAt = Column(DateTime)

class Category(Base):
    __tablename__ = "ProductCategories"
    CategoryId = Column(Integer, primary_key=True)
    CategoryName = Column(String(100), nullable=False)
    Description = Column(String(255))
    CreatedAt = Column(DateTime, default=datetime.datetime.utcnow)
    UpdatedAt = Column(DateTime)

class Product(Base):
    __tablename__ = "products"
    ProductId = Column(Integer, primary_key=True)
    Name = Column(String(100), nullable=False)
    Price = Column(String, nullable=False)
    Category = Column(String(100), nullable=False)
    Stock = Column(Integer, nullable=False)
    CreatedAt = Column(DateTime, default=datetime.datetime.utcnow)
    UpdatedAt = Column(DateTime)
    CategoryId = Column(Integer, nullable=False)

class User(Base):
    __tablename__ = "Users"
    UserId = Column(Integer, primary_key=True)
    Username = Column(String(100), nullable=False)
    Email = Column(String(100), nullable=False)
    FirstName = Column(String(100), nullable=False)
    LastName = Column(String(100), nullable=False)
    PasswordHash = Column(String(255), nullable=False)
    IsActive = Column(Integer, default=1)
    CreatedAt = Column(DateTime, default=datetime.datetime.utcnow)
    UpdatedAt = Column(DateTime)
    Permissions = Column(String(255))

class UserPermission(Base):
    __tablename__ = "UserPermissions"
    UserPermissionId = Column(Integer, primary_key=True)
    UserId = Column(Integer, nullable=False)
    ModuleName = Column(String(100), nullable=False)
    CanCreate = Column(Integer, default=0)
    CanRead = Column(Integer, default=0)
    CanUpdate = Column(Integer, default=0)
    CanDelete = Column(Integer, default=0)

class Supplier(Base):
    __tablename__ = "Suppliers"
    SupplierId = Column(Integer, primary_key=True)
    Name = Column(String(255), nullable=False)
    Email = Column(String(255))
    Phone = Column(String(50))
    Address = Column(String(500))
    CreatedAt = Column(DateTime, default=datetime.datetime.utcnow)
    UpdatedAt = Column(DateTime)

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

# Initialize suggestions
def initialize_suggestions():
    db = SessionLocal()
    default_suggestions = [
        "List all products",
        "Show product categories",
        "Show brands",
        "List all users",
        "How many products in stock?",
        "How many suppliers?",
        "Show out of stock products",
        "Show user permissions",
        "Give email id of supplier Avantika Patil",
        "What's the price of Laptop XPS 15?",
        "Get phone number of supplier Tech Solutions"
    ]

    for suggestion in default_suggestions:
        existing = db.query(SuggestionDB).filter(SuggestionDB.content == suggestion).first()
        if not existing:
            db.add(SuggestionDB(content=suggestion))

    db.commit()
    db.close()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Load spaCy NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: spaCy model not found. Using small model.")
    nlp = spacy.blank("en")

# Models
class MessageRequest(BaseModel):
    message: str

class Entity(BaseModel):
    label: str
    text: str

class ChatbotResponse(BaseModel):
    message: str
    entities: List[Entity] = []
    message_id: int

class SuggestionsResponse(BaseModel):
    suggestions: List[str]

class Message(BaseModel):
    id: int
    content: str
    is_user: bool
    timestamp: datetime.datetime

class MessageHistoryResponse(BaseModel):
    messages: List[Message]

# Improved entity extraction function
def extract_entities(message: str) -> Dict[str, Any]:
    doc = nlp(message)
    entities = {}

    # Extract product names, categories, numbers, etc.
    # Look for product names after terms like "find" or "search"
    product_search_patterns = [r"find\s+([\w\s]+)", r"search\s+for\s+([\w\s]+)", r"looking\s+for\s+([\w\s]+)"]
    for pattern in product_search_patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            entities["product_name"] = match.group(1).strip()
            break

    # Extract supplier name pattern
    supplier_patterns = [
        r"(?:supplier|vendor)\s+([A-Za-z\s]+?)(?:\s+(?:email|phone|contact|address)|$)",
        r"(?:email|phone|contact|address)\s+(?:of|for)\s+(?:supplier|vendor)\s+([A-Za-z\s]+)(?:\?|$)",
        r"(?:email|phone|contact|address)\s+(?:of|for)\s+([A-Za-z\s]+)(?:\?|$)"
    ]

    for pattern in supplier_patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            entities["supplier_name"] = match.group(1).strip()
            break

    # Extract product price pattern
    price_patterns = [
        r"price\s+of\s+([\w\s\d]+?)(?:\?|$)",
        r"how\s+much\s+(?:is|does|costs?)\s+([\w\s\d]+?)(?:\?|$)",
        r"what(?:'s|\s+is)\s+the\s+price\s+of\s+([\w\s\d]+?)(?:\?|$)"
    ]

    for pattern in price_patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            entities["product_name"] = match.group(1).strip()
            break

    # Extract what attribute/field they're looking for
    field_patterns = {
        "email": [r"email\s+(?:id|address)", r"e-?mail"],
        "phone": [r"phone\s+(?:number|no\.?)", r"contact\s+number"],
        "address": [r"address", r"location"],
        "price": [r"price", r"cost", r"how much"],
        "stock": [r"stock", r"inventory", r"available"]
    }

    for field, patterns in field_patterns.items():
        for pattern in patterns:
            if re.search(pattern, message, re.IGNORECASE):
                entities["requested_field"] = field
                break
        if "requested_field" in entities:
            break

    # Extract numbers for potential quantities or IDs
    quantity_pattern = r"(\d+)\s+(?:products?|items?|users?)"
    match = re.search(quantity_pattern, message, re.IGNORECASE)
    if match:
        entities["quantity"] = int(match.group(1))

    # If no specific product name was found, try to find noun chunks
    if "product_name" not in entities and "supplier_name" not in entities:
        for chunk in doc.noun_chunks:
            # Skip chunks that are likely not product or supplier names
            skip_terms = ["product", "category", "user", "database", "list", "all", "email", "phone"]
            if not any(term in chunk.text.lower() for term in skip_terms):
                # Check if this could be a proper name (potential supplier)
                is_proper = any(token.pos_ == "PROPN" for token in chunk)
                if is_proper:
                    entities["supplier_name"] = chunk.text
                else:
                    entities["product_name"] = chunk.text
                break

    return entities

# Determine user intent from message
def classify_intent(message: str) -> str:
    message_lower = message.lower()

    for intent, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, message_lower, re.IGNORECASE):
                return intent

    # Check if query is about specific supplier info
    if re.search(r"(email|phone|contact|address)\s+(?:of|for|details)", message_lower):
        return "supplier_contact"

    # Check if query is about product price
    if re.search(r"(price|cost|how much)", message_lower):
        return "product_price"

    return "unknown"

# Enhanced database query functions
def get_products(db: Session, limit: int = 10):
    return db.query(Product).limit(limit).all()

def get_categories(db: Session):
    return db.query(Category).all()

def get_brands(db: Session):
    return db.query(Brand).all()

def get_users(db: Session, limit: int = 10):
    return db.query(User).limit(limit).all()

def get_suppliers(db: Session):
    return db.query(Supplier).all()

def get_products_count(db: Session):
    return db.query(func.count(Product.ProductId)).scalar()

def get_products_in_stock_count(db: Session):
    return db.query(func.count(Product.ProductId)).filter(Product.Stock > 0).scalar()

def get_out_of_stock_products(db: Session):
    return db.query(Product).filter(Product.Stock == 0).all()

def get_product_by_category(db: Session, category_id: int):
    return db.query(Product).filter(Product.CategoryId == category_id).all()

def get_user_permissions(db: Session, user_id: int = None):
    if user_id:
        return db.query(UserPermission).filter(UserPermission.UserId == user_id).all()
    return db.query(UserPermission).all()

def get_product_by_name(db: Session, name: str):
    # Improved search with OR condition and fuzzy matching
    search_term = f"%{name}%"
    return db.query(Product).filter(
        or_(
            Product.Name.like(search_term),
            Product.Category.like(search_term)
        )
    ).all()

def get_supplier_by_name(db: Session, name: str):
    # Fuzzy search for supplier by name
    search_term = f"%{name}%"
    return db.query(Supplier).filter(Supplier.Name.like(search_term)).all()

def find_specific_product_attribute(db: Session, product_name: str, attribute: str):
    """Find a specific attribute of a product by name"""
    products = get_product_by_name(db, product_name)
    if not products:
        return None

    # Return the requested attribute for the first matching product
    product = products[0]
    if attribute == "price":
        return product.Price
    elif attribute == "stock":
        return product.Stock
    elif attribute == "category":
        return product.Category
    else:
        return None

def find_specific_supplier_attribute(db: Session, supplier_name: str, attribute: str):
    """Find a specific attribute of a supplier by name"""
    suppliers = get_supplier_by_name(db, supplier_name)
    if not suppliers:
        return None

    # Return the requested attribute for the first matching supplier
    supplier = suppliers[0]
    if attribute == "email":
        return supplier.Email
    elif attribute == "phone":
        return supplier.Phone
    elif attribute == "address":
        return supplier.Address
    else:
        return None

# Enhanced response generation function
def generate_response(message: str, db: Session) -> str:
    # Extract entities and determine intent
    entities = extract_entities(message)
    intent = classify_intent(message)

    # Handle specific supplier contact information requests
    if intent == "supplier_contact" and "supplier_name" in entities:
        supplier_name = entities["supplier_name"]
        field = entities.get("requested_field", "email")  # Default to email if not specified
        
        attribute = find_specific_supplier_attribute(db, supplier_name, field)
        if attribute:
            field_name = "email address" if field == "email" else field + " number" if field == "phone" else field
            return f"The {field_name} of supplier {supplier_name} is: {attribute}"
        else:
            return f"Sorry, I couldn't find the {field} for supplier '{supplier_name}'. Please check the name and try again."

    # Handle specific product price requests
    if intent == "product_price" and "product_name" in entities:
        product_name = entities["product_name"]
        field = entities.get("requested_field", "price")  # Default to price if not specified
        
        attribute = find_specific_product_attribute(db, product_name, field)
        if attribute:
            return f"The {field} of {product_name} is: {attribute}"
        else:
            return f"Sorry, I couldn't find the {field} for product '{product_name}'. Please check the name and try again."

    # Handle different intents
    if intent == "list_products":
        products = get_products(db)
        if products:
            product_list = "\n".join([f"- {product.Name}: ${product.Price}, Stock: {product.Stock}" for product in products])
            return f"Here are the products in our database:\n{product_list}"
        return "No products found in the database."

    elif intent == "product_categories":
        categories = get_categories(db)
        if categories:
            category_list = "\n".join([f"- {category.CategoryName}: {category.Description}" for category in categories])
            return f"Here are the product categories:\n{category_list}"
        return "No product categories found in the database."

    elif intent == "out_of_stock":
        out_of_stock = get_out_of_stock_products(db)
        if out_of_stock:
            product_list = "\n".join([f"- {product.Name}" for product in out_of_stock])
            return f"Out of stock products:\n{product_list}"
        return "All products are currently in stock."

    elif intent == "product_count":
        count = get_products_count(db)
        in_stock = get_products_in_stock_count(db)
        return f"There are {count} products in total, with {in_stock} currently in stock."

    elif intent == "brands":
        brands = get_brands(db)
        if brands:
            brand_list = "\n".join([f"- {brand.BrandName}: {brand.Description}" for brand in brands])
            return f"Here are the brands in our database:\n{brand_list}"
        return "No brands found in the database."

    elif intent == "list_users":
        users = get_users(db)
        if users:
            user_list = "\n".join([f"- {user.Username} ({user.FirstName} {user.LastName}, {user.Email})" for user in users])
            return f"Here are the users in our system:\n{user_list}"
        return "No users found in the database."

    elif intent == "user_permissions":
        permissions = get_user_permissions(db)
        if permissions:
            perm_list = "\n".join([
                f"- User {perm.UserId}, Module: {perm.ModuleName}, "
                f"Rights: {'C' if perm.CanCreate else '-'}"
                f"{'R' if perm.CanRead else '-'}"
                f"{'U' if perm.CanUpdate else '-'}"
                f"{'D' if perm.CanDelete else '-'}"
                for perm in permissions
            ])
            return f"User permissions:\n{perm_list}"
        return "No user permissions found in the database."

    elif intent == "suppliers":
        suppliers = get_suppliers(db)
        if suppliers:
            supplier_list = "\n".join([f"- {supplier.Name} (Email: {supplier.Email}, Phone: {supplier.Phone})" for supplier in suppliers])
            return f"Here are our suppliers:\n{supplier_list}"
        return "No suppliers found in the database."

    elif intent == "product_search" and "product_name" in entities:
        product_name = entities["product_name"]
        products = get_product_by_name(db, product_name)
        if products:
            product_list = "\n".join([f"- {product.Name}: ${product.Price}, Stock: {product.Stock}" for product in products])
            return f"Found these products matching '{product_name}':\n{product_list}"
        return f"No products found matching '{product_name}'."

    elif intent == "database_info":
        product_count = get_products_count(db)
        category_count = db.query(func.count(Category.CategoryId)).scalar()
        brand_count = db.query(func.count(Brand.BrandId)).scalar()
        user_count = db.query(func.count(User.UserId)).scalar()
        supplier_count = db.query(func.count(Supplier.SupplierId)).scalar()
        
        return (
            f"Database overview:\n"
            f"- {product_count} products\n"
            f"- {category_count} product categories\n"
            f"- {brand_count} brands\n"
            f"- {user_count} users\n"
            f"- {supplier_count} suppliers"
        )

    elif intent == "help":
        return (
            "I can help you with information from our e-commerce database. Try asking:\n"
            "- List all products\n"
            "- Show product categories\n"
            "- Show brands\n"
            "- List all users\n"
            "- Show out of stock products\n"
            "- How many products do we have?\n"
            "- Show user permissions\n"
            "- Show suppliers\n"
            "- Search for a specific product\n"
            "- Give me the email id of supplier [Name]\n"
            "- What's the price of [Product Name]?\n"
            "- Get phone number of supplier [Name]"
        )

    # If we detected a product name but no other intent, assume product search
    elif "product_name" in entities:
        product_name = entities["product_name"]
        products = get_product_by_name(db, product_name)
        if products:
            product_list = "\n".join([f"- {product.Name}: ${product.Price}, Stock: {product.Stock}" for product in products])
            return f"Found these products matching '{product_name}':\n{product_list}"
        return f"No products found matching '{product_name}'."

    # If we detected a supplier name but no other intent, assume supplier search
    elif "supplier_name" in entities:
        supplier_name = entities["supplier_name"]
        suppliers = get_supplier_by_name(db, supplier_name)
        if suppliers:
            supplier_list = "\n".join([
                f"- Name: {supplier.Name}\n  Email: {supplier.Email}\n  Phone: {supplier.Phone}\n  Address: {supplier.Address}"
                for supplier in suppliers
            ])
            return f"Found supplier information for '{supplier_name}':\n{supplier_list}"
        return f"No suppliers found matching '{supplier_name}'."

    # Default response
    return (
        f"I received your message: '{message}'. I can provide information about products, "
        f"categories, brands, users, and suppliers in our database. Type 'help' to see what I can do."
    )

# Endpoints
@app.post("/chatbot", response_model=ChatbotResponse)
async def chatbot(data: MessageRequest, db: Session = Depends(get_db)):
    try:
        user_message = data.message.strip()

        if not user_message:
            raise HTTPException(status_code=400, detail="No message provided")
        
        # Save user message to database
        user_msg_db = MessageDB(content=user_message, is_user=1)
        db.add(user_msg_db)
        db.commit()
        db.refresh(user_msg_db)
        
        # Process the message with spaCy
        doc = nlp(user_message)
        entities = [{"label": ent.label_, "text": ent.text} for ent in doc.ents]
        
        # Generate bot response
        bot_response = generate_response(user_message, db)
        
        # Save bot response to database
        bot_msg_db = MessageDB(content=bot_response, is_user=0)
        db.add(bot_msg_db)
        db.commit()
        db.refresh(bot_msg_db)
        
        # Update suggestion usage if the message matches any suggestion
        suggestion = db.query(SuggestionDB).filter(SuggestionDB.content == user_message).first()
        if suggestion:
            suggestion.usage_count += 1
            db.commit()
        
        return ChatbotResponse(
            message=bot_response,
            entities=entities,
            message_id=bot_msg_db.id
        )
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Error: {str(ex)}")

@app.get("/suggestions", response_model=SuggestionsResponse)
async def suggestions(db: Session = Depends(get_db)):
    # Get top suggestions by usage count
    db_suggestions = db.query(SuggestionDB).order_by(SuggestionDB.usage_count.desc()).limit(6).all()

    if not db_suggestions:
        initialize_suggestions()
        db_suggestions = db.query(SuggestionDB).limit(6).all()

    return SuggestionsResponse(
        suggestions=[suggestion.content for suggestion in db_suggestions]
    )

@app.get("/history", response_model=MessageHistoryResponse)
async def message_history(limit: int = 50, db: Session = Depends(get_db)):
    messages = db.query(MessageDB).order_by(MessageDB.timestamp.desc()).limit(limit).all()

    return MessageHistoryResponse(
        messages=[Message(
            id=msg.id,
            content=msg.content,
            is_user=bool(msg.is_user),
            timestamp=msg.timestamp
        ) for msg in messages]
    )

@app.post("/add-suggestion")
async def add_suggestion(data: MessageRequest, db: Session = Depends(get_db)):
    new_suggestion = data.message.strip()
    existing = db.query(SuggestionDB).filter(SuggestionDB.content == new_suggestion).first()
    if existing:
        return {"status": "exists", "message": "Suggestion already exists"}

    db.add(SuggestionDB(content=new_suggestion))
    db.commit()

    return {"status": "success", "message": "Suggestion added successfully"}

# Initialize app with default data
@app.on_event("startup")
async def startup_event():
    initialize_suggestions()

# Start the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)