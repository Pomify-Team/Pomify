from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Folder, Page
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity

pages_bp = Blueprint("pages_bp", __name__)

@pages_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_page(id):
    current_user_id = get_jwt_identity()
    page = Page.query.get(id)
    if not page:
        return jsonify({"error": "Page no encontrada"}), 404
    folder = Folder.query.get(page.folder_id)
    if not folder:
        return jsonify({"error": "Folder no encontrado"}), 404
    if folder.user_id != int(current_user_id):
        return jsonify({"error": "No autorizado"}), 403
    return jsonify(page.serialize()), 200

@pages_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_page(id):
    current_user_id = get_jwt_identity()
    page = Page.query.get(id)
    if not page:
        return jsonify({"error": "Page no encontrada"}), 404
    folder = Folder.query.get(page.folder_id)
    if not folder:
        return jsonify({"error": "Folder no encontrado"}), 404
    if folder.user_id != int(current_user_id):
        return jsonify({"error": "No autorizado"}), 403
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    title = data.get("title")
    content = data.get("content")
    new_folder_id = data.get("folder_id")
    if new_folder_id:
        new_folder = Folder.query.get(new_folder_id)
        if not new_folder or new_folder.user_id != int(current_user_id):
            return jsonify({"error": "Folder no válido"}), 403
        page.folder_id = new_folder_id
    if title:
        page.title = title
    if content:
        page.content = content
    db.session.commit()
    return jsonify(page.serialize()), 200

@pages_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_page(id):
    current_user_id = get_jwt_identity()
    page = Page.query.get(id)
    if not page:
        return jsonify({"error": "Page no encontrada"}), 404
    folder = Folder.query.get(page.folder_id)
    if not folder:
        return jsonify({"error": "Folder no encontrado"}), 404
    if folder.user_id != int(current_user_id):
        return jsonify({"error": "No autorizado"}), 403
    db.session.delete(page)
    db.session.commit()
    return jsonify({"message": f"Page {id} eliminada"}), 200