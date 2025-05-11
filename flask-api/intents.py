# intents.py
INTENT_PATTERNS = {
    # Product listing and information
    "list_products": [
        r"list\s+(?:all\s+)?products",
        r"show\s+(?:all\s+)?products",
        r"what\s+products",
        r"available\s+products",
        r"products\s+(?:in\s+)?(?:stock|inventory)",
        r"catalog",
        r"merchandise",
        r"items?\s+(?:for\s+)?(?:sale|available)"
    ],

    "product_categories": [
        r"product\s+categor(?:y|ies)",
        r"categories\s+of\s+products",
        r"types?\s+of\s+products",
        r"product\s+groups",
        r"product\s+classification",
        r"how\s+(?:are|do\s+you)\s+(?:products\s+)?categori(?:ze|sed)"
    ],

    "out_of_stock": [
        r"out\s+of\s+stock",
        r"no\s+stock",
        r"zero\s+stock",
        r"not\s+available",
        r"back\s*order",
        r"sold\s+out",
        r"unavailable",
        r"(?:products|items)\s+(?:that\s+)?(?:are\s+)?(?:not|no\s+longer)\s+available"
    ],

    "product_count": [
        r"how\s+many\s+products",
        r"number\s+of\s+products",
        r"product\s+count",
        r"total\s+products",
        r"quantity\s+of\s+(?:items|products)",
        r"inventory\s+(?:count|size)",
        r"stock\s+(?:level|count)"
    ],

    "brands": [
        r"\bbrands?\b",
        r"manufacturers?",
        r"makers?",
        r"companies\s+(?:that\s+)?(?:make|produce)",
        r"product\s+brands"
    ],

    "product_search": [
        r"find\s+(?:a\s+)?product",
        r"search\s+(?:for\s+)?(?:a\s+)?product", 
        r"looking\s+for",
        r"do\s+(?:you|we)\s+have",
        r"is\s+there\s+(?:a|any)",
        r"where\s+(?:can\s+I|to)\s+find",
        r"locate\s+(?:a\s+)?product"
    ],

    "product_price": [
        r"price\s+of", 
        r"how\s+much\s+(?:is|does|costs?)",
        r"what(?:'s|\s+is)\s+the\s+price",
        r"cost\s+of",
        r"pricing",
        r"(?:cheapest|most\s+expensive)",
        r"(?:discount|sale)\s+(?:price|cost)",
        r"(?:regular|retail)\s+price"
    ],

    "product_details": [
        r"details?\s+(?:about|of|for)",
        r"specifications?",
        r"specs",
        r"features?",
        r"dimensions?",
        r"(?:more|additional)\s+information",
        r"tell\s+me\s+(?:about|more)",
        r"description\s+of"
    ],

    # Inventory and stock management
    "inventory_management": [
        r"inventory\s+(?:management|control)",
        r"stock\s+levels?",
        r"replenish(?:ment)?",
        r"restock(?:ing)?",
        r"low\s+stock",
        r"(?:update|check)\s+inventory"
    ],

    "stock_alerts": [
        r"stock\s+alerts?",
        r"notify\s+(?:me|when)",
        r"back\s+in\s+stock\s+(?:notification|alert)",
        r"let\s+me\s+know\s+when",
        r"availability\s+notification"
    ],

    # User management
    "list_users": [
        r"list\s+(?:all\s+)?users", 
        r"show\s+(?:all\s+)?users",
        r"all\s+(?:the\s+)?users",
        r"registered\s+users",
        r"user\s+accounts?",
        r"who\s+has\s+access"
    ],

    "user_permissions": [
        r"user\s+permissions", 
        r"access\s+rights",
        r"user\s+roles?",
        r"privileges?",
        r"authorization",
        r"who\s+can\s+(?:access|view|edit)",
        r"permission\s+levels"
    ],

    "user_management": [
        r"(?:add|create|new)\s+user",
        r"(?:delete|remove)\s+user",
        r"(?:update|modify|change)\s+user",
        r"reset\s+password",
        r"user\s+(?:profile|settings)"
    ],

    # Supplier information
    "suppliers": [
        r"suppliers?\b", 
        r"vendors?\b",
        r"distributors?",
        r"(?:product|goods)\s+providers?",
        r"who\s+(?:supplies|provides)",
        r"where\s+(?:do\s+)?(?:we|you)\s+get\s+(?:products|supplies)"
    ],

    "supplier_contact": [
        r"email\s+(?:id|address)\s+of\s+supplier", 
        r"contact\s+(?:details|info)\s+of\s+supplier",
        r"phone\s+(?:number|no\.?)\s+of\s+supplier",
        r"how\s+to\s+(?:contact|reach)\s+(?:a\s+)?supplier",
        r"supplier\s+(?:contact|representative)"
    ],

    "supplier_orders": [
        r"order\s+from\s+supplier",
        r"purchase\s+order",
        r"supplier\s+order",
        r"procure(?:ment)?",
        r"(?:place|make)\s+(?:an\s+)?order",
        r"ordering\s+(?:process|system)"
    ],

    # System and help
    "database_info": [
        r"database", 
        r"schema",
        r"data\s+structure",
        r"tables?",
        r"fields?",
        r"(?:database|system)\s+architecture"
    ],

    "help": [
        r"\bhelp\b",
        r"assist(?:ance)?",
        r"support",
        r"how\s+(?:do\s+I|to)",
        r"guide\s+me",
        r"instructions?",
        r"documentation",
        r"tutorial"
    ],
}

