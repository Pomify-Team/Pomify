from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from typing import List
from flask_bcrypt import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "user_table"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(500), unique=True, nullable=True)
    reset_token: Mapped[str] = mapped_column(String(500), nullable=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # cascade-delete permite que, al borrar user, se borren todos los folders, lo mismo con goals.leer más en la documetacion,
    folders: Mapped[List["Folder"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")

    goals: Mapped[List["Goals"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "avatar_url": self.avatar_url
        }


class Folder(db.Model):
    __tablename__ = "folder_table"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user_table.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="folders")

    pages: Mapped[List["Page"]] = relationship(
        back_populates="folder", cascade="all, delete-orphan")

    title: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "pages": [page.serialize() for page in self.pages],
            "created_at": self.created_at
        }


class Page(db.Model):
    __tablename__ = "page_table"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(
        String(120), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    update_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),default=lambda: datetime.now(timezone.utc),onupdate=lambda: datetime.now(timezone.utc)
)

    folder_id: Mapped[int] = mapped_column(
        ForeignKey("folder_table.id"), nullable=False)
    folder: Mapped["Folder"] = relationship(back_populates="pages")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "folder": {
                "id": self.folder.id,
                "title": self.folder.title
            },
            "created_at": self.created_at.isoformat(),
            "update_at": self.update_at.isoformat()
        }


class Goals(db.Model):
    __tablename__ = "goal_table"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="not_started")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user_id: Mapped[int] = mapped_column(
        ForeignKey("user_table.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="goals")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "status": self.status,
            "created_at": self.created_at
        }
