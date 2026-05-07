from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Folder, Page
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity

folders_bp = Blueprint("folders_bp", __name__)

@folders_bp.route('/', methods=['GET', 'POST'])
@jwt_required()
def folders():
    current_user_id = get_jwt_identity()

    if request.method == 'GET':
        folders = Folder.query.filter_by(user_id=int(current_user_id)).all()
        return jsonify([folder.serialize() for folder in folders]), 200

    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        title = data.get("title")
        if not title:
            return jsonify({"error": "title is required"}), 400
        new_folder = Folder(title=title, user_id=int(current_user_id))
        db.session.add(new_folder)
        db.session.commit()
        return jsonify(new_folder.serialize()), 201

@folders_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_folder(id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.get(id)
    if not folder:
        return jsonify({"error": "Folder no encontrado"}), 404
    if folder.user_id != int(current_user_id):
        return jsonify({"error": "No autorizado"}), 403
    return jsonify(folder.serialize()), 200

@folders_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_folder(id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.get(id)
    if not folder:
        return jsonify({"error": "Folder no encontrado"}), 404
    if folder.user_id != int(current_user_id):
        return jsonify({"error": "No autorizado"}), 403
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    if "title" in data:
        folder.title = data["title"]
    db.session.commit()
    return jsonify({
        "message": "Folder updated successfully",
        "folder": folder.serialize()
    }), 200

@folders_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_folder(id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.get(id)
    if not folder:
        return jsonify({"error": "Folder no encontrado"}), 404
    if folder.user_id != int(current_user_id):
        return jsonify({"error": "No autorizado"}), 403
    db.session.delete(folder)
    db.session.commit()
    return jsonify({"message": f"Folder {id} eliminado"}), 200

@folders_bp.route('/<int:folder_id>/pages', methods=['GET', 'POST'])
@jwt_required()
def folder_pages(folder_id):
    current_user_id = get_jwt_identity()
    folder = Folder.query.get(folder_id)
    if not folder:
        return jsonify({"error": "Folder no encontrado"}), 404
    if folder.user_id != int(current_user_id):
        return jsonify({"error": "No autorizado"}), 403

    if request.method == 'GET':
        pages = Page.query.filter_by(folder_id=folder_id).all()
        return jsonify([page.serialize() for page in pages]), 200

    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        title = data.get("title")
        if not title:
            return jsonify({"error": "title is required"}), 400
        content = data.get("content", "")
        new_page = Page(title=title, content=content, folder_id=folder_id)
        db.session.add(new_page)
        db.session.commit()
        return jsonify(new_page.serialize()), 201