from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Goals
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity

goals_bp = Blueprint("goals_bp", __name__)



@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():

    current_user_id = get_jwt_identity()

    goals = Goals.query.filter_by(user_id=current_user_id).all()
    response = [goal.serialize() for goal in goals]
    return jsonify(response), 200


@goals_bp.route('/<int:goal_id>', methods=['GET'])
@jwt_required()
def get_single_goal(goal_id):

    current_user_id = get_jwt_identity()

    goal = Goals.query.filter_by(id=goal_id, user_id=current_user_id).first()
    if not goal:
        return jsonify({"error": "goal no exist"}), 404
    return jsonify(goal.serialize()), 200

@goals_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():

    data = request.get_json()
    if not data: 
        return jsonify({"error": "Request body is required"}), 400
    title = data.get("title")
    content = data.get("content")
    if not title or not content:
        return jsonify({"error": "title and content are required"}), 400
    
    current_user_id = get_jwt_identity()
    
    new_goal = Goals(
        title=title,
        content=content,
        user_id=current_user_id
    )
    db.session.add(new_goal)
    db.session.commit()
    return jsonify({"msg": "Goal created successfully", "goal": new_goal.serialize()}), 201

@goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    current_user_id = get_jwt_identity()
    
    goal = Goals.query.filter_by(id=goal_id, user_id=current_user_id).first()

    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    if "title" in data:
        goal.title = data["title"]

    if "content" in data:
        goal.content = data["content"]

    if "status" in data:
        goal.status = data["status"]

    db.session.commit()

    return jsonify({
        "message": "Goal updated successfully",
        "goal": goal.serialize()
    }), 200

@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):

    current_user_id = get_jwt_identity()
    goal = Goals.query.filter_by(id=goal_id, user_id=current_user_id).first()
    if not goal:
        return jsonify({"error": "Goal not found"}), 404
    
    db.session.delete(goal)
    db.session.commit()

    return jsonify({
        "message": "Goal deleted successfully"}), 200

@goals_bp.route('/', methods=['DELETE'])
@jwt_required()
def delete_all_goals():
    current_user_id = get_jwt_identity()
    goals = Goals.query.filter_by(user_id=current_user_id).all()

    if not goals:
        return jsonify({"message": "No goals found for this user"}), 404

    for goal in goals:
        db.session.delete(goal)

    db.session.commit()

    return jsonify({
        "message": f"{len(goals)} goals deleted successfully"
    }), 200