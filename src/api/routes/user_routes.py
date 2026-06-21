from flask import Flask, request, jsonify, Blueprint, redirect
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.models import db, User, Shortcut
from authlib.integrations.flask_client import OAuth
import secrets
import resend
import os

user_routes_bp = Blueprint('user_routes_bp', __name__)

oauth = OAuth()

def init_oauth(app):
    oauth.init_app(app)
    oauth.register(
        name='google',
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email profile'}
    )

#LOGIN:
@user_routes_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = db.session.execute(db.select(User).where(
        User.email == email)).scalar_one_or_none()

    if user is None:
        return jsonify({"message": "Invalid email or password"}), 400

    if user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"message": "Login successful", "token": access_token}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 400

#REGISTER:
@user_routes_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print("DATA:", data)
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not email or not password or not name:
        return jsonify({"message": "Email, password and name are required"}), 400

    existing_user = db.session.execute(db.select(User).where(
        User.email == email)).scalar_one_or_none()

    if existing_user:
        return jsonify({"message": "user already registered"}), 400

    new_user = User(name=name, email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# GOOGLE OAUTH
@user_routes_bp.route('/auth/google')
def google_login():
    redirect_uri = os.getenv("BACKEND_PUBLIC_URL", os.getenv("VITE_BACKEND_URL")) + "/api/user/auth/google/callback"
    return oauth.google.authorize_redirect(redirect_uri)

@user_routes_bp.route('/auth/google/callback')
def google_callback():
    token = oauth.google.authorize_access_token()
    user_info = token['userinfo']
    email = user_info['email']
    name = user_info.get('name', '')

    user = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()

    is_new = False
    if not user:
        is_new = True
        user = User(name=name, email=email)
        user.set_password(secrets.token_hex(16))
        db.session.add(user)
        db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return redirect(f"{frontend_url}/google-callback?token={access_token}&is_new={is_new}")

#OBTENER TODOS LOS USUARIOS
@user_routes_bp.route('/', methods=['GET'])
def get_users():
    users = User.query.all()
    users_list = [{"id": user.id, "email": user.email, "name": user.name,
                   "avatar_url": user.avatar_url} for user in users]
    return jsonify(users_list), 200

#OBTENER UN USUARIO(CON SU TOKEN)
@user_routes_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.serialize()), 200

#PUT solo el usuario logeado puede actualizar su perfil.
@user_routes_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_user():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, int(current_user_id))

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()

    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        user.email = data["email"]
    if "avatar_url" in data:
        user.avatar_url = data["avatar_url"]
    if "password" in data:
        user.set_password(data["password"])

    db.session.commit()

    return jsonify({
        "message": "User updated successfully",
        "user": user.serialize()
    }), 200

#DELETE solo el usuario logeado puede eliminar su perfil.
@user_routes_bp.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_user():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, int(current_user_id))

    if not user:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200

#RECUPERACION DE CONTRASEÑA
@user_routes_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').lower()
    if not email:
        return jsonify({"message": "Email is required"}), 400

    user = db.session.execute(
        db.select(User).where(User.email == email)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"message": "User not found"}), 404

    token = create_access_token(identity=str(user.id))
    user.reset_token = token
    db.session.commit()

    resend.api_key = os.getenv("RESEND_API_KEY")

    resend.Emails.send({
        "from": "noreply@pomify.es",
        "to": [email],
        "subject": "Reset your password - Pomify",
        "html": f"""
            <h2>Reset your password</h2>
            <p>Click the link below to reset your password. It expires in 1 hour.</p>
            <a href="{os.getenv('FRONTEND_URL')}/reset-password?token={token}">
                Reset password
            </a>
        """
    })

    return jsonify({"message": "Password reset email sent"}), 200

# SHORTCUTS
@user_routes_bp.route('/shortcuts', methods=['GET'])
@jwt_required()
def get_shortcuts():
    user_id = get_jwt_identity()
    shortcuts = db.session.execute(
        db.select(Shortcut).where(Shortcut.user_id == int(user_id))
    ).scalars().all()
    return jsonify([s.serialize() for s in shortcuts]), 200

@user_routes_bp.route('/shortcuts', methods=['POST'])
@jwt_required()
def create_shortcut():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name', '').strip()
    url = data.get('url', '').strip()
    service = data.get('service', 'generic')
    if not name or not url:
        return jsonify({"message": "Name and URL are required"}), 400
    shortcut = Shortcut(user_id=int(user_id), name=name, url=url, service=service)
    db.session.add(shortcut)
    db.session.commit()
    return jsonify({"shortcut": shortcut.serialize()}), 201

@user_routes_bp.route('/shortcuts/<int:shortcut_id>', methods=['PUT'])
@jwt_required()
def update_shortcut(shortcut_id):
    user_id = get_jwt_identity()
    shortcut = db.session.get(Shortcut, shortcut_id)
    if not shortcut or shortcut.user_id != int(user_id):
        return jsonify({"message": "Not found"}), 404
    data = request.get_json()
    if "name" in data: shortcut.name = data["name"].strip()
    if "url" in data: shortcut.url = data["url"].strip()
    if "service" in data: shortcut.service = data["service"]
    db.session.commit()
    return jsonify({"shortcut": shortcut.serialize()}), 200

@user_routes_bp.route('/shortcuts/<int:shortcut_id>', methods=['DELETE'])
@jwt_required()
def delete_shortcut(shortcut_id):
    user_id = get_jwt_identity()
    shortcut = db.session.get(Shortcut, shortcut_id)
    if not shortcut or shortcut.user_id != int(user_id):
        return jsonify({"message": "Not found"}), 404
    db.session.delete(shortcut)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200


@user_routes_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({"message": "Token and password are required"}), 400

    user = db.session.execute(
        db.select(User).where(User.reset_token == token)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"message": "Invalid or expired token"}), 404

    user.set_password(new_password)
    user.reset_token = None
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200