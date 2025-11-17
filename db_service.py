import sqlite3
import json
import os
import time
from pathlib import Path

class NovelDatabaseService:
    """
    Service for managing novel data in a SQLite database.
    Handles CRUD operations for novels, chapter outlines, scenes, formats, and series.
    """
    DB_PATH = "novels.db"
    
    @classmethod
    def _get_connection(cls):
        """Get a database connection and create tables if they don't exist"""
        try:
            # Ensure the database path exists by creating parent directories if needed
            db_dir = os.path.dirname(cls.DB_PATH)
            if db_dir and not os.path.exists(db_dir):
                os.makedirs(db_dir, exist_ok=True)
                
            # Use a retry loop for connecting to the database
            max_retries = 3
            last_error = None
            
            for attempt in range(max_retries):
                try:
                    conn = sqlite3.connect(cls.DB_PATH)
                    conn.row_factory = sqlite3.Row
                    return conn
                except sqlite3.Error as e:
                    last_error = e
                    print(f"Database connection attempt {attempt+1}/{max_retries} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        time.sleep(1)  # Wait before retrying
            
            # If we get here, all retries failed
            raise last_error or sqlite3.Error("Failed to connect to database after multiple attempts")
            
        except Exception as e:
            print(f"Critical database error: {str(e)}")
            # Create an in-memory database as fallback
            print("Creating in-memory database as fallback")
            conn = sqlite3.connect(":memory:")
            conn.row_factory = sqlite3.Row
            
        # Create tables if they don't exist
        cursor = conn.cursor()
        
        # Create series table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS series (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            num_books INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create series_arcs table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS series_arcs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            series_id INTEGER NOT NULL,
            overall_arc TEXT NOT NULL,
            character_arcs TEXT NOT NULL,
            themes TEXT NOT NULL,
            continuity_notes TEXT,
            FOREIGN KEY (series_id) REFERENCES series (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS novels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            model TEXT NOT NULL,
            max_scene_length INTEGER NOT NULL,
            min_scene_length INTEGER NOT NULL,
            story_details TEXT,
            series_id INTEGER,
            book_number INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (series_id) REFERENCES series (id) ON DELETE SET NULL
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS chapter_outlines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            outline TEXT NOT NULL,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS scenes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            chapter_title TEXT NOT NULL,
            scene_content TEXT NOT NULL,
            scene_order INTEGER NOT NULL,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS novel_formats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            format_name TEXT NOT NULL,
            content TEXT NOT NULL,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS premises_and_endings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            premises TEXT NOT NULL,
            chosen_premise TEXT NOT NULL,
            potential_endings TEXT NOT NULL,
            chosen_ending TEXT,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS novel_synopsis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            synopsis TEXT NOT NULL,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS character_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            profiles TEXT NOT NULL,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS novel_plan (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            plan TEXT NOT NULL,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS chapter_guide (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            guide TEXT NOT NULL,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS cover_design_prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            prompt TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        # Create table for editing suggestions
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS editing_suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            content_id TEXT NOT NULL,
            content_type TEXT NOT NULL,
            original_text TEXT NOT NULL,
            overall_assessment TEXT NOT NULL,
            strengths TEXT NOT NULL,
            weaknesses TEXT NOT NULL,
            suggestions TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        # Create table for novel keywords
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS novel_keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            keywords TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        # Create table for novel BISAC categories
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS novel_bisac (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            categories TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        # Create table for book descriptions
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS book_descriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            novel_id INTEGER NOT NULL,
            description_type TEXT NOT NULL DEFAULT 'marketing',
            content TEXT NOT NULL,
            length_type TEXT NOT NULL DEFAULT 'standard',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
        )
        ''')
        
        conn.commit()
        return conn
    
    @classmethod
    def list_novels(cls):
        """List all saved novels"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, title, created_at FROM novels ORDER BY created_at DESC")
        novels = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return novels
    
    @classmethod
    def create_novel(cls, title, model, max_scene_length, min_scene_length, series_id=None, book_number=None):
        """
        Create a new novel entry
        
        Args:
            title (str): The novel title
            model (str): The AI model used
            max_scene_length (int): Maximum scene length
            min_scene_length (int): Minimum scene length
            series_id (int, optional): ID of the series this novel belongs to
            book_number (int, optional): Position of this book in the series
            
        Returns:
            int: The ID of the created novel
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        if series_id and book_number:
            cursor.execute(
                "INSERT INTO novels (title, model, max_scene_length, min_scene_length, series_id, book_number) VALUES (?, ?, ?, ?, ?, ?)",
                (title, model, max_scene_length, min_scene_length, series_id, book_number)
            )
        else:
            cursor.execute(
                "INSERT INTO novels (title, model, max_scene_length, min_scene_length) VALUES (?, ?, ?, ?)",
                (title, model, max_scene_length, min_scene_length)
            )
        
        novel_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return novel_id
        
    @classmethod
    def create_series(cls, title, description=None, num_books=1):
        """
        Create a new series
        
        Args:
            title (str): The series title
            description (str, optional): Series description
            num_books (int, optional): Number of books planned for the series
            
        Returns:
            int: The ID of the created series
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO series (title, description, num_books) VALUES (?, ?, ?)",
            (title, description, num_books)
        )
        
        series_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return series_id
        
    @classmethod
    def get_series(cls, series_id):
        """
        Get a series by ID
        
        Args:
            series_id (int): The series ID
            
        Returns:
            dict: Series information
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM series WHERE id = ?", (series_id,))
        series = cursor.fetchone()
        
        conn.close()
        
        if series:
            return dict(series)
        
        return None
        
    @classmethod
    def list_series(cls):
        """
        List all series
        
        Returns:
            list: List of series dictionaries
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, title, num_books, created_at FROM series ORDER BY created_at DESC")
        series_list = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return series_list
        
    @classmethod
    def delete_series(cls, series_id):
        """
        Delete a series and optionally all its novels
        
        Args:
            series_id (int): The series ID
            
        Returns:
            bool: True on success
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        try:
            # First delete the series
            cursor.execute("DELETE FROM series WHERE id = ?", (series_id,))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            conn.close()
            return False
            
    @classmethod
    def get_series_novels(cls, series_id):
        """
        Get all novels in a series ordered by book number
        
        Args:
            series_id (int): The series ID
            
        Returns:
            list: List of novel dictionaries
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, title, book_number, created_at FROM novels WHERE series_id = ? ORDER BY book_number",
            (series_id,)
        )
        
        novels = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return novels
    
    @classmethod
    def get_novel(cls, novel_id):
        """Get a novel by ID"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM novels WHERE id = ?", (novel_id,))
        novel = cursor.fetchone()
        
        conn.close()
        
        if novel:
            novel_dict = dict(novel)
            if novel_dict.get('story_details'):
                novel_dict['story_details'] = json.loads(novel_dict['story_details'])
            return novel_dict
        
        return None
    
    @classmethod
    def delete_novel(cls, novel_id):
        """Delete a novel and all related data"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("DELETE FROM novels WHERE id = ?", (novel_id,))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            conn.close()
            return False
    
    @classmethod
    def save_story_details(cls, novel_id, story_details):
        """Save or update story details for a novel"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE novels SET story_details = ? WHERE id = ?",
            (json.dumps(story_details), novel_id)
        )
        
        conn.commit()
        conn.close()
        
        return True
    
    @classmethod
    def save_chapter_outline(cls, novel_id, chapter_outline):
        """Save chapter outline for a novel"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        # First delete any existing chapter outlines for this novel
        cursor.execute("DELETE FROM chapter_outlines WHERE novel_id = ?", (novel_id,))
        
        # Then insert the new outline
        cursor.execute(
            "INSERT INTO chapter_outlines (novel_id, outline) VALUES (?, ?)",
            (novel_id, json.dumps(chapter_outline))
        )
        
        conn.commit()
        conn.close()
        
        return True
    
    @classmethod
    def get_chapter_outline(cls, novel_id):
        """Get chapter outline for a novel"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT outline FROM chapter_outlines WHERE novel_id = ?", (novel_id,))
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            return json.loads(result['outline'])
        
        return None
    
    @classmethod
    def save_scenes(cls, novel_id, all_scenes):
        """Save all scenes for a novel"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        # First delete any existing scenes for this novel
        cursor.execute("DELETE FROM scenes WHERE novel_id = ?", (novel_id,))
        
        # Then insert all new scenes
        for chapter_title, scenes in all_scenes.items():
            for scene_order, scene_content in enumerate(scenes):
                cursor.execute(
                    "INSERT INTO scenes (novel_id, chapter_title, scene_content, scene_order) VALUES (?, ?, ?, ?)",
                    (novel_id, chapter_title, scene_content, scene_order)
                )
        
        conn.commit()
        conn.close()
        
        return True
    
    @classmethod
    def get_all_scenes(cls, novel_id):
        """Get all scenes for a novel"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT chapter_title, scene_content, scene_order FROM scenes WHERE novel_id = ? ORDER BY chapter_title, scene_order",
            (novel_id,)
        )
        
        scenes_rows = cursor.fetchall()
        conn.close()
        
        if not scenes_rows:
            return None
        
        # Group scenes by chapter
        all_scenes = {}
        for row in scenes_rows:
            chapter_title = row['chapter_title']
            if chapter_title not in all_scenes:
                all_scenes[chapter_title] = []
            all_scenes[chapter_title].append(row['scene_content'])
        
        return all_scenes
    
    @classmethod
    def save_novel_formats(cls, novel_id, novel_formats):
        """Save formatted novel content"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        # First delete any existing formats for this novel
        cursor.execute("DELETE FROM novel_formats WHERE novel_id = ?", (novel_id,))
        
        # Then insert all formats
        for format_name, content in novel_formats.items():
            cursor.execute(
                "INSERT INTO novel_formats (novel_id, format_name, content) VALUES (?, ?, ?)",
                (novel_id, format_name, content)
            )
        
        conn.commit()
        conn.close()
        
        return True
    
    @classmethod
    def get_novel_formats(cls, novel_id):
        """Get formatted novel content"""
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT format_name, content FROM novel_formats WHERE novel_id = ?",
            (novel_id,)
        )
        
        format_rows = cursor.fetchall()
        conn.close()
        
        if not format_rows:
            return None
        
        # Convert to dictionary
        formats = {}
        for row in format_rows:
            formats[row['format_name']] = row['content']
        
        return formats
        
    @classmethod
    def save_premises_and_endings(cls, novel_id, data):
        """
        Save premises and endings data
        
        Args:
            novel_id (int): The novel ID
            data (dict): Dictionary containing 'premises', 'chosen_premise', 'potential_endings', and 'chosen_ending'
            
        Returns:
            bool: True on success
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        # First delete any existing data for this novel
        cursor.execute("DELETE FROM premises_and_endings WHERE novel_id = ?", (novel_id,))
        
        # Then insert the new data
        cursor.execute(
            "INSERT INTO premises_and_endings (novel_id, premises, chosen_premise, potential_endings, chosen_ending) VALUES (?, ?, ?, ?, ?)",
            (
                novel_id,
                json.dumps(data.get('premises', [])),
                data.get('chosen_premise', ''),
                json.dumps(data.get('potential_endings', [])),
                data.get('chosen_ending', '')
            )
        )
        
        conn.commit()
        conn.close()
        
        return True
        
    @classmethod
    def get_premises_and_endings(cls, novel_id):
        """
        Get premises and endings data for a novel
        
        Args:
            novel_id (int): The novel ID
            
        Returns:
            dict: Dictionary containing premises and endings data
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT premises, chosen_premise, potential_endings, chosen_ending FROM premises_and_endings WHERE novel_id = ?", (novel_id,))
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            data = {
                'premises': json.loads(result['premises']),
                'chosen_premise': result['chosen_premise'],
                'potential_endings': json.loads(result['potential_endings'])
            }
            
            # Add chosen_ending if it exists
            if 'chosen_ending' in result and result['chosen_ending']:
                data['chosen_ending'] = result['chosen_ending']
                
            return data
        
        return None
        
    @classmethod
    def save_novel_synopsis(cls, novel_id, synopsis):
        """
        Save a novel synopsis
        
        Args:
            novel_id (int): The novel ID
            synopsis (str): The three-act structure synopsis
            
        Returns:
            bool: True on success
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        # First delete any existing synopsis for this novel
        cursor.execute("DELETE FROM novel_synopsis WHERE novel_id = ?", (novel_id,))
        
        # Then insert the new synopsis
        cursor.execute(
            "INSERT INTO novel_synopsis (novel_id, synopsis) VALUES (?, ?)",
            (novel_id, synopsis)
        )
        
        conn.commit()
        conn.close()
        
        return True
        
    @classmethod
    def get_novel_synopsis(cls, novel_id):
        """
        Get a novel synopsis
        
        Args:
            novel_id (int): The novel ID
            
        Returns:
            str: The novel synopsis
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT synopsis FROM novel_synopsis WHERE novel_id = ?", (novel_id,))
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            return result['synopsis']
        
        return None
        
    @classmethod
    def save_character_profiles(cls, novel_id, profiles):
        """
        Save character profiles
        
        Args:
            novel_id (int): The novel ID
            profiles (str): Character profiles in text format
            
        Returns:
            bool: True on success
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        # First delete any existing profiles for this novel
        cursor.execute("DELETE FROM character_profiles WHERE novel_id = ?", (novel_id,))
        
        # Then insert the new profiles
        cursor.execute(
            "INSERT INTO character_profiles (novel_id, profiles) VALUES (?, ?)",
            (novel_id, profiles)
        )
        
        conn.commit()
        conn.close()
        
        return True
        
    @classmethod
    def get_character_profiles(cls, novel_id):
        """
        Get character profiles
        
        Args:
            novel_id (int): The novel ID
            
        Returns:
            str: The character profiles
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT profiles FROM character_profiles WHERE novel_id = ?", (novel_id,))
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            return result['profiles']
        
        return None
    
    @classmethod
    def save_novel_plan(cls, novel_id, plan):
        """
        Save novel plan
        
        Args:
            novel_id (int): The novel ID
            plan (str): Detailed novel plan text
            
        Returns:
            bool: True on success
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        # First delete any existing plan for this novel
        cursor.execute("DELETE FROM novel_plan WHERE novel_id = ?", (novel_id,))
        
        # Then insert the new plan
        cursor.execute(
            "INSERT INTO novel_plan (novel_id, plan) VALUES (?, ?)",
            (novel_id, plan)
        )
        
        conn.commit()
        conn.close()
        
        return True
    
    @classmethod
    def get_novel_plan(cls, novel_id):
        """
        Get novel plan
        
        Args:
            novel_id (int): The novel ID
            
        Returns:
            str: The novel plan
        """
        conn = cls._get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT plan FROM novel_plan WHERE novel_id = ?", (novel_id,))
        result = cursor.fetchone()
        
        conn.close()
        
        if result:
            return result['plan']
        
        return None
        
    @classmethod
    def save_chapter_guide(cls, novel_id, guide):
        """
        Save detailed chapter guide
        
        Args:
            novel_id (int): The novel ID
            guide (dict): Detailed chapter-by-chapter guide with writing elements
            
        Returns:
            bool: True on success
        """
        try:
            # Parameter validation
            if not novel_id:
                print("Error: save_chapter_guide - novel_id is required")
                return False
                
            if not guide or not isinstance(guide, dict):
                print(f"Error: save_chapter_guide - guide must be a dictionary, got {type(guide)}")
                return False
                
            # Get database connection with retry logic built into _get_connection
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # Convert guide to JSON with error handling
            try:
                guide_json = json.dumps(guide)
            except (TypeError, ValueError) as json_err:
                print(f"Error serializing chapter guide to JSON: {str(json_err)}")
                # Create a simplified version that can be serialized
                fallback_guide = {}
                for ch_num, ch_data in guide.items():
                    try:
                        # Try to serialize each chapter separately
                        json.dumps(ch_data)  # Just to test if it works
                        fallback_guide[ch_num] = ch_data
                    except:
                        # If a chapter can't be serialized, use a basic structure
                        fallback_guide[ch_num] = {
                            "key_dialogue": ["Unable to serialize original dialogue"],
                            "symbolism": ["Unable to serialize original symbolism"],
                            "emotional_pacing": "Unable to serialize original pacing",
                            "sensory_details": ["Unable to serialize original details"],
                            "foreshadowing": ["Unable to serialize original foreshadowing"],
                            "scene_goal": "Unable to serialize original scene goal"
                        }
                guide_json = json.dumps(fallback_guide)
            
            # Database operations with error handling
            try:
                # First delete any existing guide for this novel
                cursor.execute("DELETE FROM chapter_guide WHERE novel_id = ?", (novel_id,))
                
                # Then insert the new guide
                cursor.execute(
                    "INSERT INTO chapter_guide (novel_id, guide) VALUES (?, ?)",
                    (novel_id, guide_json)
                )
                
                conn.commit()
                conn.close()
                return True
                
            except sqlite3.Error as db_err:
                print(f"Database error in save_chapter_guide: {str(db_err)}")
                conn.close()
                return False
                
        except Exception as e:
            print(f"Unexpected error in save_chapter_guide: {str(e)}")
            return False
    
    @classmethod
    def get_chapter_guide(cls, novel_id):
        """
        Get detailed chapter guide
        
        Args:
            novel_id (int): The novel ID
            
        Returns:
            dict: Dictionary with chapter guide details
        """
        try:
            # Parameter validation
            if not novel_id:
                print("Error: get_chapter_guide - novel_id is required")
                return {}
                
            # Get database connection with retry logic built into _get_connection
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # Query database with error handling
            try:
                cursor.execute("SELECT guide FROM chapter_guide WHERE novel_id = ?", (novel_id,))
                result = cursor.fetchone()
                conn.close()
                
                if result:
                    try:
                        # First try accessing as a Row object (default with row_factory)
                        return json.loads(result['guide'])
                    except (KeyError, TypeError):
                        try:
                            # Then try as a tuple (if row_factory is not set)
                            if isinstance(result, tuple) and result[0]:
                                return json.loads(result[0])
                        except (IndexError, TypeError, json.JSONDecodeError) as json_err:
                            print(f"Error parsing chapter guide JSON: {str(json_err)}")
                        
                    except json.JSONDecodeError as json_err:
                        print(f"JSONDecodeError parsing chapter guide: {str(json_err)}")
                
                # If we get here, either no result or couldn't parse result
                return {}
                
            except sqlite3.Error as db_err:
                print(f"Database error in get_chapter_guide: {str(db_err)}")
                conn.close()
                return {}
                
        except Exception as e:
            print(f"Unexpected error in get_chapter_guide: {str(e)}")
            return {}
        
    @classmethod
    def save_chapter_beats(cls, novel_id, beats):
        """
        Save chapter action beats
        
        Args:
            novel_id (int): The novel ID
            beats (dict): Dictionary mapping chapter numbers to lists of beat objects
            
        Returns:
            bool: True on success
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # Create table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS chapter_beats (
                    novel_id INTEGER PRIMARY KEY,
                    beats TEXT,
                    FOREIGN KEY (novel_id) REFERENCES novels(id) ON DELETE CASCADE
                )
            """)
            
            # Convert dictionary to JSON
            beats_json = json.dumps(beats)
            
            # Check if entry exists
            cursor.execute(
                "SELECT novel_id FROM chapter_beats WHERE novel_id = ?",
                (novel_id,)
            )
            
            if cursor.fetchone():
                # Update existing entry
                cursor.execute(
                    "UPDATE chapter_beats SET beats = ? WHERE novel_id = ?",
                    (beats_json, novel_id)
                )
            else:
                # Insert new entry
                cursor.execute(
                    "INSERT INTO chapter_beats (novel_id, beats) VALUES (?, ?)",
                    (novel_id, beats_json)
                )
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Database error saving chapter beats: {str(e)}")
            return False
            
    @classmethod
    def get_chapter_beats(cls, novel_id):
        """
        Get chapter action beats
        
        Args:
            novel_id (int): The novel ID
            
        Returns:
            dict: Dictionary mapping chapter numbers to lists of beat objects
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT beats FROM chapter_beats WHERE novel_id = ?",
                (novel_id,)
            )
            
            result = cursor.fetchone()
            conn.close()
            
            if result and result[0]:
                return json.loads(result[0])
            
            return {}
        except Exception as e:
            print(f"Database error getting chapter beats: {str(e)}")
            return {}
            
    @classmethod
    def save_cover_design_prompt(cls, novel_id, prompt):
        """
        Save a cover design prompt for a novel
        
        Args:
            novel_id (int): The novel ID
            prompt (str): The cover design prompt text
            
        Returns:
            bool: True on success
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # First delete any existing prompt for this novel
            cursor.execute("DELETE FROM cover_design_prompts WHERE novel_id = ?", (novel_id,))
            
            # Then insert the new prompt
            cursor.execute(
                "INSERT INTO cover_design_prompts (novel_id, prompt) VALUES (?, ?)",
                (novel_id, prompt)
            )
            
            conn.commit()
            conn.close()
            
            return True
        except Exception as e:
            print(f"Database error saving cover design prompt: {str(e)}")
            return False
        
    @classmethod
    def get_cover_design_prompt(cls, novel_id):
        """
        Get the cover design prompt for a novel
        
        Args:
            novel_id (int): The novel ID
            
        Returns:
            str: The cover design prompt text, or None if not found
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT prompt FROM cover_design_prompts WHERE novel_id = ? ORDER BY created_at DESC LIMIT 1", (novel_id,))
            result = cursor.fetchone()
            
            conn.close()
            
            if result:
                return result['prompt']
            
            return None
        except Exception as e:
            print(f"Database error getting cover design prompt: {str(e)}")
            return None
            
    @classmethod
    def save_series_arcs(cls, series_id, overall_arc, character_arcs, themes, continuity_notes=None):
        """
        Save series arcs and continuity information
        
        Args:
            series_id (int): The series ID
            overall_arc (str): The overall series arc description
            character_arcs (dict): Character arcs across the series
            themes (list): Series themes and how they develop
            continuity_notes (str, optional): Notes for maintaining continuity
            
        Returns:
            bool: True on success
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # First check if there's an existing record
            cursor.execute("SELECT id FROM series_arcs WHERE series_id = ?", (series_id,))
            existing = cursor.fetchone()
            
            if existing:
                # Update existing record
                cursor.execute(
                    "UPDATE series_arcs SET overall_arc = ?, character_arcs = ?, themes = ?, continuity_notes = ? WHERE series_id = ?",
                    (overall_arc, json.dumps(character_arcs), json.dumps(themes), continuity_notes, series_id)
                )
            else:
                # Insert new record
                cursor.execute(
                    "INSERT INTO series_arcs (series_id, overall_arc, character_arcs, themes, continuity_notes) VALUES (?, ?, ?, ?, ?)",
                    (series_id, overall_arc, json.dumps(character_arcs), json.dumps(themes), continuity_notes)
                )
            
            conn.commit()
            conn.close()
            
            return True
        except Exception as e:
            print(f"Database error saving series arcs: {str(e)}")
            return False
            
    @classmethod
    def get_series_arcs(cls, series_id):
        """
        Get series arcs and continuity information
        
        Args:
            series_id (int): The series ID
            
        Returns:
            dict: Series arcs information, or None if not found
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM series_arcs WHERE series_id = ?", (series_id,))
            result = cursor.fetchone()
            
            conn.close()
            
            if result:
                arc_data = dict(result)
                arc_data['character_arcs'] = json.loads(arc_data['character_arcs'])
                arc_data['themes'] = json.loads(arc_data['themes'])
                return arc_data
            
            return None
        except Exception as e:
            print(f"Database error getting series arcs: {str(e)}")
            return None
            
    @classmethod
    def save_editing_suggestion(cls, novel_id, content_id, content_type, original_text, editing_suggestions):
        """
        Save AI-generated editing suggestions for content
        
        Args:
            novel_id (int): The novel ID
            content_id (str): Identifier for the specific content (chapter ID, scene ID, etc.)
            content_type (str): Type of content being analyzed (scene, chapter, character, etc.)
            original_text (str): The original text that was analyzed
            editing_suggestions (dict): Dictionary with overall_assessment, strengths, weaknesses, and suggestions
            
        Returns:
            int: ID of the saved editing suggestion or None on error
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                """INSERT INTO editing_suggestions 
                   (novel_id, content_id, content_type, original_text, 
                    overall_assessment, strengths, weaknesses, suggestions)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    novel_id,
                    content_id,
                    content_type,
                    original_text,
                    editing_suggestions.get('overall_assessment', ''),
                    json.dumps(editing_suggestions.get('strengths', [])),
                    json.dumps(editing_suggestions.get('weaknesses', [])),
                    json.dumps(editing_suggestions.get('suggestions', []))
                )
            )
            
            suggestion_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return suggestion_id
        except Exception as e:
            print(f"Database error saving editing suggestion: {str(e)}")
            return None
    
    @classmethod
    def get_editing_suggestions(cls, novel_id, content_id=None, content_type=None):
        """
        Get editing suggestions for a novel, optionally filtered by content ID or type
        
        Args:
            novel_id (int): The novel ID
            content_id (str, optional): Filter by specific content ID
            content_type (str, optional): Filter by content type
            
        Returns:
            list: List of editing suggestion dictionaries
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            query = "SELECT * FROM editing_suggestions WHERE novel_id = ?"
            params = [novel_id]
            
            if content_id:
                query += " AND content_id = ?"
                params.append(content_id)
                
            if content_type:
                query += " AND content_type = ?"
                params.append(content_type)
                
            query += " ORDER BY created_at DESC"
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            conn.close()
            
            suggestions = []
            for row in results:
                suggestion = dict(row)
                # Parse JSON strings into Python objects
                suggestion['strengths'] = json.loads(suggestion['strengths'])
                suggestion['weaknesses'] = json.loads(suggestion['weaknesses'])
                suggestion['suggestions'] = json.loads(suggestion['suggestions'])
                suggestions.append(suggestion)
                
            return suggestions
        except Exception as e:
            print(f"Database error getting editing suggestions: {str(e)}")
            return []
            
    @classmethod
    def save_novel_keywords(cls, novel_id, keywords):
        """Save searchable keywords for a novel to the database
        
        Args:
            novel_id: The ID of the novel
            keywords: List of keyword strings
            
        Returns:
            bool: True if saved successfully, False otherwise
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # Convert keywords list to JSON
            keywords_json = json.dumps(keywords)
            
            # Delete any existing keywords for this novel
            cursor.execute("DELETE FROM novel_keywords WHERE novel_id = ?", (novel_id,))
            
            # Insert new keywords
            cursor.execute(
                "INSERT INTO novel_keywords (novel_id, keywords) VALUES (?, ?)",
                (novel_id, keywords_json)
            )
            
            conn.commit()
            conn.close()
            
            return True
        except Exception as e:
            print(f"Database error saving novel keywords: {str(e)}")
            return False
            
    @classmethod
    def get_novel_keywords(cls, novel_id):
        """Get searchable keywords for a novel from the database
        
        Args:
            novel_id: The ID of the novel
            
        Returns:
            list: List of keyword strings, or empty list if none found
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT keywords FROM novel_keywords WHERE novel_id = ? ORDER BY created_at DESC LIMIT 1",
                (novel_id,)
            )
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return json.loads(result[0])
            else:
                return []
        except Exception as e:
            print(f"Database error getting novel keywords: {str(e)}")
            return []
            
    @classmethod
    def save_novel_bisac(cls, novel_id, categories):
        """Save BISAC subject categories for a novel to the database
        
        Args:
            novel_id: The ID of the novel
            categories: List of BISAC category strings
            
        Returns:
            bool: True if saved successfully, False otherwise
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # Convert categories list to JSON
            categories_json = json.dumps(categories)
            
            # Delete any existing BISAC categories for this novel
            cursor.execute("DELETE FROM novel_bisac WHERE novel_id = ?", (novel_id,))
            
            # Insert new categories
            cursor.execute(
                "INSERT INTO novel_bisac (novel_id, categories) VALUES (?, ?)",
                (novel_id, categories_json)
            )
            
            conn.commit()
            conn.close()
            
            return True
        except Exception as e:
            print(f"Database error saving novel BISAC categories: {str(e)}")
            return False
            
    @classmethod
    def get_novel_bisac(cls, novel_id):
        """Get BISAC subject categories for a novel from the database
        
        Args:
            novel_id: The ID of the novel
            
        Returns:
            list: List of BISAC category strings, or empty list if none found
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT categories FROM novel_bisac WHERE novel_id = ? ORDER BY created_at DESC LIMIT 1",
                (novel_id,)
            )
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return json.loads(result[0])
            else:
                return []
        except Exception as e:
            print(f"Database error getting novel BISAC categories: {str(e)}")
            return []
            
    @classmethod
    def save_novel_quotes(cls, novel_id, quotes):
        """
        Save novel quotes for marketing and promotion
        
        Args:
            novel_id (int): The novel ID
            quotes (list): List of quote strings
            
        Returns:
            bool: True on success
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # Create the table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS novel_quotes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    novel_id INTEGER NOT NULL,
                    quotes TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
                )
            """)
            
            # Convert quotes list to JSON
            quotes_json = json.dumps(quotes)
            
            # Delete any existing quotes for this novel
            cursor.execute("DELETE FROM novel_quotes WHERE novel_id = ?", (novel_id,))
            
            # Insert new quotes
            cursor.execute(
                "INSERT INTO novel_quotes (novel_id, quotes) VALUES (?, ?)",
                (novel_id, quotes_json)
            )
            
            conn.commit()
            conn.close()
            
            return True
        except Exception as e:
            print(f"Database error saving novel quotes: {str(e)}")
            return False
            
    @classmethod
    def get_novel_quotes(cls, novel_id):
        """
        Get novel quotes for marketing and promotion
        
        Args:
            novel_id (int): The novel ID
            
        Returns:
            list: List of quote strings, or empty list if none found
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # Create the table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS novel_quotes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    novel_id INTEGER NOT NULL,
                    quotes TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (novel_id) REFERENCES novels (id) ON DELETE CASCADE
                )
            """)
            
            cursor.execute(
                "SELECT quotes FROM novel_quotes WHERE novel_id = ? ORDER BY created_at DESC LIMIT 1",
                (novel_id,)
            )
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return json.loads(result[0])
            else:
                return []
        except Exception as e:
            print(f"Database error getting novel quotes: {str(e)}")
            return []
            
    @classmethod
    def save_book_description(cls, novel_id, content, description_type='marketing', length_type='standard'):
        """
        Save a book description for marketing purposes
        
        Args:
            novel_id (int): The novel ID
            content (str): The description content
            description_type (str): Type of description (marketing, back_cover, pitch, etc.)
            length_type (str): Length variant (short, standard, long)
            
        Returns:
            bool: True on success
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            # Delete any existing description of this type and length for this novel
            cursor.execute(
                "DELETE FROM book_descriptions WHERE novel_id = ? AND description_type = ? AND length_type = ?", 
                (novel_id, description_type, length_type)
            )
            
            # Insert new description
            cursor.execute(
                "INSERT INTO book_descriptions (novel_id, description_type, content, length_type) VALUES (?, ?, ?, ?)",
                (novel_id, description_type, content, length_type)
            )
            
            conn.commit()
            conn.close()
            
            return True
        except Exception as e:
            print(f"Database error saving book description: {str(e)}")
            return False
            
    @classmethod
    def get_book_description(cls, novel_id, description_type='marketing', length_type='standard'):
        """
        Get a book description
        
        Args:
            novel_id (int): The novel ID
            description_type (str): Type of description to retrieve
            length_type (str): Length variant to retrieve
            
        Returns:
            str: The book description content, or None if not found
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT content FROM book_descriptions WHERE novel_id = ? AND description_type = ? AND length_type = ? ORDER BY created_at DESC LIMIT 1",
                (novel_id, description_type, length_type)
            )
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return result[0]
            else:
                return None
        except Exception as e:
            print(f"Database error getting book description: {str(e)}")
            return None
            
    @classmethod
    def get_all_book_descriptions(cls, novel_id):
        """
        Get all book descriptions for a novel
        
        Args:
            novel_id (int): The novel ID
            
        Returns:
            list: List of description dictionaries
        """
        try:
            conn = cls._get_connection()
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT description_type, length_type, content, created_at FROM book_descriptions WHERE novel_id = ? ORDER BY created_at DESC",
                (novel_id,)
            )
            
            results = cursor.fetchall()
            conn.close()
            
            descriptions = []
            for row in results:
                descriptions.append({
                    'description_type': row[0],
                    'length_type': row[1], 
                    'content': row[2],
                    'created_at': row[3]
                })
            
            return descriptions
        except Exception as e:
            print(f"Database error getting all book descriptions: {str(e)}")
            return []
