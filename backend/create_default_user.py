#!/usr/bin/env python3
"""
Script untuk membuat user default untuk testing ResearchMate
Sistem ini menggunakan role sederhana: hanya 1 user role tanpa kompleksitas role bertingkat
"""

import sys
import os
from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.models import Base, User

def create_tables():
    """Create database tables if not exist"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created")

def create_default_user():
    """Create default user for testing"""
    db: Session = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("❌ User 'admin' already exists")
            return False
        
        # Create default user
        default_user = User(
            email="admin@researchmate.com",
            username="admin",
            full_name="Administrator",
            hashed_password=get_password_hash("password123"),
            is_active=True
            # No is_superuser - using single role system
        )
        
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
        
        print("✓ Default user created successfully!")
        print(f"  Email: {default_user.email}")
        print(f"  Username: {default_user.username}")
        print(f"  Password: password123")
        print(f"  Role: Standard User (single role system)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating default user: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def show_existing_users():
    """Show all existing users"""
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"\n📋 Total users in database: {len(users)}")
        
        if users:
            print("Existing users:")
            for user in users:
                status = "Active" if user.is_active else "Inactive"
                print(f"  - {user.username} ({user.email}) - {status}")
        else:
            print("No users found in database")
            
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
    finally:
        db.close()

def main():
    print("🔧 ResearchMate - Default User Creator")
    print("=====================================")
    print("Setting up single-role user system...")
    
    # Create tables
    create_tables()
    
    # Show existing users
    show_existing_users()
    
    # Create default user
    print("\n🆕 Creating default user...")
    success = create_default_user()
    
    if success:
        print("\n✅ Setup completed successfully!")
        print("\n📝 Login credentials:")
        print("  Username: admin")
        print("  Password: password123")
        print("\n🏗️ System Architecture:")
        print("  - Single role system (no complex role hierarchy)")
        print("  - All users have standard access")
        print("  - No superuser/admin privileges needed")
    else:
        print("\n❌ Setup failed!")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())