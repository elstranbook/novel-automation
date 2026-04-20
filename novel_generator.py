import os
import json
import time
from pathlib import Path
from openai import OpenAI
from db_service import NovelDatabaseService
from utils import sanitize_filename

class NovelAutomationTool:
    def __init__(self, title, model="gpt-4.1", max_scene_length=1000, min_scene_length=300, output_dir="output"):
        """
        Initialize the novel automation tool.
        
        Args:
            title (str): The title of the novel
            model (str): The OpenAI model to use (default: gpt-4.1)
            max_scene_length (int): Maximum word count for scenes
            min_scene_length (int): Minimum word count for scenes
            output_dir (str): Directory to save output files
        """
        self.title = title
        # Updated to use gpt-4.1 as the default model per user request.
        # This is the preferred model for novel generation.
        self.model = model
        self.max_scene_length = max_scene_length
        self.min_scene_length = min_scene_length
        self.output_dir = output_dir
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        # Storage for premises and endings data
        self._premises_and_endings = None
        
        # Create necessary directories
        Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    def _ai_completion(self, prompt, system_message=None, json_response=False, max_tokens=None):
        """
        Get a completion from the OpenAI API.
        
        Args:
            prompt (str): The prompt to send to the API
            system_message (str, optional): System message to guide the AI
            json_response (bool): Whether to expect a JSON response
            max_tokens (int, optional): Maximum tokens to generate
            
        Returns:
            str or dict: The response from the API
        """
        messages = []
        
        if system_message:
            messages.append({"role": "system", "content": system_message})
            
        messages.append({"role": "user", "content": prompt})
        
        kwargs = {
            "model": self.model,
            "messages": messages,
        }
        
        # Set default max tokens for novel generation to be higher (4000) if not specified
        # Reduced from 8000 to 4000 to avoid token limits in deployed environment
        if max_tokens:
            kwargs["max_tokens"] = max_tokens
        else:
            # Use a reasonable default for scene generation
            kwargs["max_tokens"] = 4000
            
        if json_response:
            kwargs["response_format"] = {"type": "json_object"}
        
        # Add retries for API calls
        max_retries = 3
        retry_delay = 5  # seconds
        
        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(**kwargs)
                content = response.choices[0].message.content
                
                if json_response:
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError as json_err:
                        print(f"JSON parsing error: {str(json_err)}")
                        # If JSON parsing fails but we expected JSON, return a simple dict
                        if attempt == max_retries - 1:  # Last attempt
                            return {"error": f"Failed to parse JSON response: {str(json_err)}"}
                        # Try again
                        time.sleep(retry_delay)
                        continue
                
                return content
                
            except Exception as e:
                print(f"API error (attempt {attempt+1}/{max_retries}): {str(e)}")
                if attempt < max_retries - 1:
                    # Wait before retrying
                    time.sleep(retry_delay)
                    # Increase delay for next attempt
                    retry_delay *= 2
                else:
                    # Last attempt failed, return error message
                    if json_response:
                        return {"error": f"API error after {max_retries} attempts: {str(e)}"}
                    return f"Error generating content: {str(e)}"
    
    def generate_story_details(self):
        """
        Generate detailed story outline for a young adult novel.
        
        Returns:
            dict: Story details including theme, genre, concept, word count, audience, etc.
        """
        prompt = f"""
        I am writing a Young Adult Novel titled "{self.title}".

        Give me the following details:
        1. story_theme: The central theme or message of the novel
        2. genre: The specific genre or genres this novel belongs to
        3. central_concept: The core idea or high-concept premise of the story
        4. estimated_word_count: The estimated word count for the complete novel
        5. target_age_range: The intended young adult audience age range (e.g., 12-15, 16-18)
        6. main_character_name: The name of the protagonist
        7. central_conflict: The primary challenge or conflict the main character faces
        8. setting: The primary world/location where the story takes place
        9. time_period: When the story takes place
        10. supporting_characters: 4-6 key supporting characters with names and brief descriptions
        11. plot_summary: A 2-3 paragraph summary of the overall plot
        12. narrative_style: First person, third person limited, omniscient, etc.
        
        Format the response as a JSON object with exactly these keys.
        """
        
        system_message = "You are a professional young adult novelist skilled at creating compelling story outlines. Your task is to create a detailed YA novel structure that appeals to teen readers."
        
        return self._ai_completion(prompt, system_message, json_response=True)
    
    def generate_premises_and_endings(self, story_details):
        """
        Generate novel premises and endings based on the story theme, genre, and concept.
        
        Args:
            story_details (dict): The story details from generate_story_details
            
        Returns:
            dict: Dictionary containing premises, the chosen premise, and potential endings
        """
        # Extract required fields from story_details
        theme = story_details.get('story_theme', 'Growth and self-discovery')
        genre = story_details.get('genre', 'Young Adult Fiction')
        concept = story_details.get('central_concept', 'A teenager discovering their hidden abilities')
        
        # Check if we have series context
        series_context = story_details.get('series_context', {})
        series_guidance = ""
        if series_context:
            series_guidance = f"""
            This novel is Book {series_context.get('book_number')} of {series_context.get('total_books')} in a series.
            
            Series Title: {series_context.get('series_title', 'Untitled Series')}
            Series Arc: {series_context.get('series_arc', 'No series arc provided')}
            
            Book's role in the series arc: """
            
            # Determine this book's role based on position in series
            book_number = series_context.get('book_number', 1)
            total_books = series_context.get('total_books', 1)
            
            if book_number == 1:
                series_guidance += "This is the FIRST book in the series. It should establish characters, world, and the main series conflict."
            elif book_number == total_books:
                series_guidance += "This is the FINAL book in the series. It should resolve the main series arc while delivering a satisfying conclusion."
            else:
                position = "early" if book_number <= total_books / 2 else "later"
                series_guidance += f"This is book #{book_number} (a {position} book in the series). It should advance the overall series arc while having its own complete story."
            
            # Add character continuity if there are previous books
            if series_context.get('prior_books'):
                series_guidance += "\n\nThis book must maintain character continuity with previous books in the series."
                
            # Add themes to maintain
            if series_context.get('themes'):
                themes_list = [f"- {theme}" for theme in series_context.get('themes', [])]
                series_guidance += "\n\nSeries Themes to incorporate:\n" + "\n".join(themes_list)
        
        prompt = f"""
        Give me 10 ideas for the premise of a novel about the following:

        Theme: {theme}
        Genre: {genre}
        Concept: {concept}
        
        {series_guidance}

        Choose the best premise that will catch the attention of YA readers. Use it as "The Premise".

        Then give me 10 ideas for how that novel could end (twists, resolutions, reveals, or character outcomes) for the chosen premise below:
        {{The Premise}}

        The endings can be thematic or emotional rather than final. Focus on where the character might end up, not just the plot twist.

        From your 10 ending ideas, select the best ending that delivers the most satisfying and emotionally resonant conclusion. This will be used as "The Ending" in future prompts.
        
        Format your response as a JSON object with these keys:
        1. "premises": An array of 10 premises (strings)
        2. "chosen_premise": The best premise you chose (string)
        3. "potential_endings": An array of 10 potential endings (strings)
        4. "chosen_ending": The best ending you selected (string)
        """
        
        system_message = """You are a professional YA novelist skilled at creating compelling story premises and satisfying endings.
        Focus on themes, emotional arcs, and character growth that resonate with young adult readers.
        Provide a variety of premise ideas and ending possibilities that could engage teen readers."""
        
        return self._ai_completion(prompt, system_message, json_response=True)
        
    def generate_chapter_outline(self, story_details):
        """
        Generate chapter structure based on story details and structured plan.
        
        Args:
            story_details (dict): The story details from generate_story_details
            
        Returns:
            list: List of chapter objects with title, POV, events, theme focus, etc.
        """
        title = self.title
        theme = story_details.get("story_theme", "")
        
        # Get the structured plan if available
        structured_plan = ""
        if hasattr(self, '_novel_plan') and self._novel_plan:
            structured_plan = self._novel_plan
        else:
            # Generate a novel plan if we don't have one
            structured_plan = self.generate_novel_plan(story_details)
            self._novel_plan = structured_plan
        
        # Prompt 6: User's exact prompt
        prompt = f"""
        Following the structured plan below, please create a detailed chapter outline for "{title}" designed to establish a powerful emotional arc that deeply explores the complexities of {theme}.

        Break the story into the necessary chapters as you see fit that serve the purpose of the story, with word count estimates for each chapter to ensure balanced pacing and focus. Each chapter should allow room for meaningful character development, emotional depth, and tension that draws readers in.

        Guidelines:
        – The outline should follow the Parts in your structured plan (e.g., Part I, Part II, etc.)
        – Ensure that each chapter reflects shifts in tone, rising stakes, or key moments of character growth
        – Design each chapter to support a powerful emotional arc, exploring the complexities of all core themes

        For each chapter, include:
        * Short summary of what happens
        * The emotional focus and development of key characters
        * Key moments of tension, conflict, or change
        * Estimated word count for balanced pacing
        * Theme focus or symbol: (e.g., betrayal, growth, power, identity, loss)

        Structured Plan:
        {structured_plan}
        
        Format your response as a JSON array of chapter objects with the following fields:
        - "number": The chapter number (integer)
        - "title": A compelling chapter title (string)
        - "pov": Which character's point of view is used (string)
        - "summary": A brief summary of key events (string)
        - "emotional_development": The emotional focus and character development (string)
        - "theme_focus": The theme or symbol emphasized in this chapter (string)
        - "estimated_word_count": Word count target for this chapter (integer)
        - "events": Key plot points or scenes in the chapter (array of strings)
        """
        
        system_message = """You are a professional novelist and story structure expert. 
        Create a compelling chapter outline that follows the provided structured plan while developing emotional arcs and themes.
        You must structure your response as a valid JSON array with all required fields.
        This is for a software application that needs this exact format to function properly."""
        
        # We want a non-json response so we can properly format it
        print(f"Generating chapter outline for '{title}'...")
        raw_response = self._ai_completion(prompt, system_message, json_response=False)
        
        # Extract the JSON array from the response
        try:
            # Attempt to find and parse JSON array from the text
            import re
            json_match = re.search(r'\[\s*{.*}\s*\]', raw_response, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
                response = json.loads(response_text)
            else:
                # If no JSON array found, try to parse the whole response
                response = json.loads(raw_response)
        except Exception as e:
            print(f"Error parsing chapter outline response: {str(e)}")
            response = {}

        # Validate and fix the response
        if isinstance(response, dict):
            # If we got a dictionary instead of a list, check if there's a chapters key
            if "chapters" in response:
                response = response["chapters"]
            else:
                # Create a list from the dictionary values if possible
                response = [response]
        
        # Ensure we have the correct number of chapters
        if not isinstance(response, list) or len(response) < 18:
            # If we don't have enough chapters, try again with a more explicit prompt
            prompt += "\n\nIMPORTANT: Your response MUST include at least 18 chapters, no exceptions."
            raw_response = self._ai_completion(prompt, system_message, json_response=False)
            
            # Extract the JSON array from the response
            try:
                # Attempt to find and parse JSON array from the text
                import re
                json_match = re.search(r'\[\s*{.*}\s*\]', raw_response, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)
                    response = json.loads(response_text)
                else:
                    # If no JSON array found, try to parse the whole response
                    response = json.loads(raw_response)
                
                # Ensure we have a list
                if isinstance(response, dict):
                    if "chapters" in response:
                        response = response["chapters"]
                    else:
                        response = [response]
            except Exception:
                # If parsing fails, keep the current response
                print(f"Error parsing second chapter outline attempt")
            
            # If still not enough chapters, create missing ones
            if not isinstance(response, list):
                response = []
            
            if len(response) < 18:
                existing_count = len(response)
                for i in range(existing_count + 1, 19):
                    response.append({
                        "number": i,
                        "title": f"Chapter {i}",
                        "pov": "Main Character",
                        "events": [
                            f"Event 1 in Chapter {i}", 
                            f"Event 2 in Chapter {i}", 
                            f"Event 3 in Chapter {i}"
                        ],
                        "word_count": self.min_scene_length * 3
                    })
        
        # Ensure each chapter has the required structure
        for i, chapter in enumerate(response):
            if not isinstance(chapter, dict):
                response[i] = {
                    "number": i+1,
                    "title": f"Chapter {i+1}",
                    "pov": "Main Character",
                    "summary": f"Summary of Chapter {i+1}",
                    "emotional_development": "Character growth and emotional changes",
                    "theme_focus": "Main theme explored in this chapter",
                    "estimated_word_count": self.min_scene_length * 3,
                    "events": [f"Event 1 in Chapter {i+1}", f"Event 2 in Chapter {i+1}"]
                }
                continue
                
            # Ensure all required keys exist
            if "number" not in chapter:
                chapter["number"] = i+1
            if "title" not in chapter:
                chapter["title"] = f"Chapter {i+1}"
            if "pov" not in chapter:
                chapter["pov"] = "Main Character"
            if "summary" not in chapter:
                chapter["summary"] = f"Summary of Chapter {i+1}"
            if "emotional_development" not in chapter:
                chapter["emotional_development"] = "Character growth and emotional changes"
            if "theme_focus" not in chapter:
                chapter["theme_focus"] = "Main theme explored in this chapter"
            if "events" not in chapter or not isinstance(chapter["events"], list):
                chapter["events"] = [f"Event 1 in Chapter {i+1}", f"Event 2 in Chapter {i+1}"]
            
            # Handle both estimated_word_count and word_count for compatibility
            if "estimated_word_count" not in chapter and "word_count" not in chapter:
                chapter["estimated_word_count"] = self.min_scene_length * 3
            elif "estimated_word_count" not in chapter and "word_count" in chapter:
                chapter["estimated_word_count"] = chapter["word_count"]
            
            # Ensure word_count exists for backward compatibility
            if "word_count" not in chapter:
                if "estimated_word_count" in chapter:
                    chapter["word_count"] = chapter["estimated_word_count"]
                else:
                    chapter["word_count"] = self.min_scene_length * 3
        
        return response
    
    def generate_chapter_scenes(self, chapter_info, story_details, chapter_beats=None):
        """
        Generate the scenes for a specific chapter based on chapter beats.
        
        Args:
            chapter_info (dict): Information about the chapter
            story_details (dict): The overall story details
            chapter_beats (list, optional): List of beat objects for the chapter
            
        Returns:
            list: List of scene content strings
        """
        # Print debug info to help with deployment troubleshooting
        chapter_num = chapter_info.get("number", "?")
        chapter_title = chapter_info.get("title", "Untitled")
        print(f"Starting scene generation for Chapter {chapter_num}: {chapter_title}")
        print(f"Using model: {self.model}")
        beat_count = len(chapter_beats) if chapter_beats else 0
        print(f"Chapter beats count: {beat_count}")
        # Ensure chapter_info is a proper dictionary
        if not isinstance(chapter_info, dict):
            if isinstance(chapter_info, str):
                try:
                    chapter_info = json.loads(chapter_info)
                except:
                    # If we can't parse it, create a default chapter
                    chapter_info = {
                        "number": 1,
                        "title": "Chapter 1",
                        "pov": "Main Character",
                        "events": ["Event 1", "Event 2", "Event 3"],
                        "word_count": self.min_scene_length * 3
                    }
            else:
                # If not a dict or string, create a default chapter
                chapter_info = {
                    "number": 1,
                    "title": "Chapter 1",
                    "pov": "Main Character",
                    "events": ["Event 1", "Event 2", "Event 3"],
                    "word_count": self.min_scene_length * 3
                }
                
        # Ensure it has all required keys
        if "number" not in chapter_info:
            chapter_info["number"] = 1
        if "title" not in chapter_info:
            chapter_info["title"] = "Untitled Chapter"
        if "pov" not in chapter_info:
            chapter_info["pov"] = "Main Character"
        if "events" not in chapter_info or not isinstance(chapter_info["events"], list):
            chapter_info["events"] = ["Key event 1", "Key event 2", "Key event 3"]
                
        # Ensure story_details is a proper dictionary
        if not isinstance(story_details, dict):
            if isinstance(story_details, str):
                try:
                    story_details = json.loads(story_details)
                except:
                    # If we can't parse it, create a default story structure
                    story_details = {
                        "genre": "Young Adult Fiction",
                        "theme": "Coming of age",
                        "concept": "A teenager discovers a hidden talent",
                        "setting": "The world of the story",
                        "time_period": "Present day",
                        "major_themes": ["Growth", "Challenge", "Relationships"],
                        "narrative_style": "First person past tense"
                    }
            else:
                # If not a dict or string, create a default story structure
                story_details = {
                    "genre": "Young Adult Fiction",
                    "theme": "Coming of age",
                    "concept": "A teenager discovers a hidden talent",
                    "setting": "The world of the story",
                    "time_period": "Present day",
                    "major_themes": ["Growth", "Challenge", "Relationships"],
                    "narrative_style": "First person past tense"
                }
        
        # Get additional context
        character_profiles_str = "No character profiles available"
        if hasattr(self, "_character_profiles") and self._character_profiles:
            character_profiles_str = self._character_profiles
                
        story_json = json.dumps(story_details, indent=2)
        chapter_json = json.dumps(chapter_info, indent=2)
        
        # Check if we have premises and endings data to incorporate
        premises_ending_info = ""
        if hasattr(self, '_premises_and_endings') and self._premises_and_endings:
            chosen_premise = self._premises_and_endings.get('chosen_premise', '')
            chosen_ending = self._premises_and_endings.get('chosen_ending', '')
            
            if chosen_premise and chosen_ending:
                premises_ending_info = f"""
                THE PREMISE:
                {chosen_premise}
                
                THE ENDING:
                {chosen_ending}
                """
                
                # If this is a late chapter, emphasize working toward the ending
                if chapter_info.get('number', 0) >= 15:
                    premises_ending_info += """
                    Since this is a later chapter, make sure to build toward the chosen ending.
                    """
        
        # If no chapter beats are provided, use the original method
        if not chapter_beats or len(chapter_beats) == 0:
            prompt = f"""
            Write the complete scenes for Chapter {chapter_info.get('number')}: "{chapter_info.get('title')}" in the novel "{self.title}".
            
            STORY DETAILS:
            {story_json}
            
            CHAPTER INFORMATION:
            {chapter_json}
            
            {premises_ending_info}
            
            Guidelines:
            1. Create 2-5 distinct scenes for this chapter based on the key events
            2. Each scene should be between {self.min_scene_length} and {self.max_scene_length} words
            3. Stay consistent with the POV specified in the chapter information 
            4. Include dialogue, description, and character development
            5. Write in first-person past tense from the POV character's perspective
            6. Connect each scene with clear transitions
            
            Format the response as a JSON array of scene strings. Return just the array of scene strings, not objects or nested structures.
            Example response format:
            [
                "Scene 1 text goes here...",
                "Scene 2 text goes here...",
                "Scene 3 text goes here..."
            ]
            """
            
            system_message = f"""You are a professional novelist writing scenes for Chapter {chapter_info.get('number')} in the novel '{self.title}'. 
            Write compelling, immersive scenes that advance the plot and develop the characters.
            Use first-person past tense from the POV character's perspective.
            Return your scenes ONLY as a JSON array of strings, not objects with properties.
            Each string in the array should be a complete scene."""
        else:
            # Format chapter beats for the prompt
            beats_formatted = []
            for beat in chapter_beats:
                beat_str = f"Beat {beat.get('beat_number', '?')}: {beat.get('action', 'No action')}\n"
                beat_str += f"Emotional Impact: {beat.get('emotional_impact', 'None')}\n"
                beat_str += f"Tension/Hook: {beat.get('tension_hook', 'None')}"
                beats_formatted.append(beat_str)
            
            beats_text = "\n\n".join(beats_formatted)
            
            # Prompt 9: Generate scenes based on chapter beats
            prompt = f"""
            Using the chapter summary and story beats, expand Chapter {chapter_info.get('number')} of "{self.title}" into a detailed, scene-by-scene breakdown.

            Guidelines:
            – The breakdown should follow the natural progression of the chapter, with each scene building on the last to maintain flow, momentum, and emotional resonance.
            – Write in first-person past tense, from {chapter_info.get('pov')}'s point of view.
            – Focus on show-don't-tell, using a deep point of view to reveal thoughts, feelings, and conflict through action and internal narration.
            – Use realistic dialogue with purpose—each exchange should move the story forward or reveal something meaningful.
            – Emphasize strong verbs and avoid overly mushy or sentimental description.

            Chapter Summary:
            {chapter_info.get('summary', 'No summary available')}

            Chapter Story Beats:
            {beats_text}

            Character Information:
            {character_profiles_str}

            {premises_ending_info}

            Additional Information:
            - Genre: {story_details.get('genre', 'Young Adult Fiction')}
            - Theme: {story_details.get('theme', 'Coming of age')}
            - Setting: {story_details.get('setting', 'Contemporary world')}

            For each beat, create a detailed scene using this prompt:

            Begin writing Chapter {chapter_info.get('number')}: {chapter_info.get('title')}, Scene [beat number] of "{self.title}" using the detailed scene summary provided.

            The writing should naturally reflect the scene's genre, tone, point of view, setting, and key characters—all of which can be inferred from the scene summary provided.

            Writing Guidelines:
            – Focus on a slow, deliberate buildup, allowing the emotional tone and character stakes to deepen gradually.
            – Use intimate, vivid moments to show the emotional toll of the scene and allow readers to connect with the characters.
            – Let dialogue reveal dynamics, tension, or internal struggles. Keep it natural, grounded, and full of subtext.
            – Emphasize "show, don't tell" storytelling. Let physical actions, choices, and setting carry emotional and thematic weight.
            – Use strong verbs, sensory-rich description, and a deep POV (if applicable) to fully immerse the reader.
            – Allow the scene to naturally lead toward its conclusion and, if appropriate, transition smoothly into the next.

            Narrative Style:
            * Point of View: First-person for the main character
            * Tense: Past

            Write up to {self.max_scene_length} words of character-driven, emotionally layered prose. 
            Let the scene summary guide your tone, structure, pacing, and character focus.
            
            Write only the prose for the scene, without any formatting, headers, or scene numbers.

            Format your response as a JSON array of scene strings, one scene per beat. Return just the array of scene strings.
            Example response format:
            [
                "Scene 1 for beat 1 text...",
                "Scene 2 for beat 2 text...",
                "Scene 3 for beat 3 text..."
            ]
            """
            
            system_message = f"""You are a professional young adult novelist writing Chapter {chapter_info.get('number')} of '{self.title}' in first-person past tense.
            Create vivid, emotionally resonant scenes from the main character's perspective.
            Include sensory details, realistic dialogue, and deep point-of-view narration.
            Focus on a slow, deliberate buildup, allowing the emotional tone and character stakes to deepen gradually.
            Use intimate, vivid moments to show the emotional toll of the scene and let readers connect with characters.
            Write only the prose for each scene, without any formatting, headers, or scene numbers.
            Return your scenes ONLY as a JSON array of strings, not objects with properties."""
        
        # Initialize default values for chapter_num and chapter_title
        chapter_num = chapter_info.get('number', '?')
        chapter_title = chapter_info.get('title', 'Untitled Chapter')
        
        try:
            # Get the scene content
            print(f"Generating scenes for Chapter {chapter_num}: {chapter_title}...")
            
            # Increase token limit for scene generation to prevent truncation
            raw_response = self._ai_completion(prompt, system_message, json_response=False, max_tokens=8000)
            
            # Extract the JSON array from the response
            try:
                # Find and parse JSON array from the text
                import re
                json_match = re.search(r'\[.*\]', raw_response, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)
                    response = json.loads(response_text)
                else:
                    # If no JSON array found, try to parse the whole response
                    response = json.loads(raw_response)
            except Exception as e:
                print(f"Error parsing scene response: {str(e)}")
                response = [f"Error: {str(e)}. Scene for Chapter {chapter_num}: {chapter_title}"]
                
            # Process the response to ensure we get a list of strings
            if isinstance(response, dict):
                # Check if there's a scenes key
                if "scenes" in response:
                    response = response["scenes"]
                # If there are numbered scene keys
                elif any(key.startswith("scene") for key in response.keys()):
                    scenes = []
                    for i in range(1, 20):  # Support up to 20 scenes for chapter beats
                        scene_key = f"scene{i}"
                        if scene_key in response:
                            scenes.append(response[scene_key])
                        else:
                            # Try other variations
                            scene_key = f"scene_{i}"
                            if scene_key in response:
                                scenes.append(response[scene_key])
                            else:
                                scene_key = f"Scene {i}"
                                if scene_key in response:
                                    scenes.append(response[scene_key])
                    if scenes:
                        response = scenes
                    else:
                        # If we can't find scenes, extract values
                        response = list(response.values())
            
            # If response is not a list at this point, wrap it in a list
            if not isinstance(response, list):
                response = [str(response)]
            
            # Ensure each item in the list is a string
            response = [str(item) if not isinstance(item, str) else item for item in response]
            
        except Exception as e:
            print(f"Error generating scenes: {str(e)}")
            response = [f"Error: {str(e)}. Scene for Chapter {chapter_num}: {chapter_title}"]
        
        # If we somehow ended up with an empty list, add a default scene
        if not response:
            response = [f"Scene for Chapter {chapter_num}: {chapter_title}"]
            
        return response
    
    def generate_all_scenes(self, story_details, chapter_outline, chapter_beats=None):
        """
        Generate all scenes for all chapters in the novel using chapter beats if available.
        
        Args:
            story_details (dict): The story details
            chapter_outline (list): List of chapter information
            chapter_beats (dict, optional): Dictionary mapping chapter numbers to lists of beat objects
            
        Returns:
            dict: Dictionary mapping chapter titles to lists of scenes
        """
        all_scenes = {}
        
        # Ensure chapter_outline is a list
        if not isinstance(chapter_outline, list):
            if isinstance(chapter_outline, dict):
                if "chapters" in chapter_outline:
                    chapter_outline = chapter_outline["chapters"]
                else:
                    chapter_outline = [chapter_outline]
            else:
                # If we can't convert to a list, create a default chapter outline
                chapter_outline = [{
                    "number": 1,
                    "title": "Beginning",
                    "pov": "Main Character",
                    "events": ["Introduction", "Initial conflict", "Setting established"],
                    "word_count": self.min_scene_length * 3
                }]
                
        # Sort chapter_outline by chapter number to ensure sequential processing
        chapter_outline = sorted(chapter_outline, key=lambda ch: int(ch.get('number', 1)))
        
        for i, chapter in enumerate(chapter_outline):
            # Ensure chapter is a dictionary with required fields
            if not isinstance(chapter, dict):
                try:
                    if isinstance(chapter, str):
                        chapter = json.loads(chapter)
                    else:
                        # If not a dict or string, create a default chapter
                        chapter = {
                            "number": i+1,
                            "title": f"Chapter {i+1}",
                            "pov": "Main Character",
                            "events": [f"Event 1 in Chapter {i+1}", f"Event 2 in Chapter {i+1}"],
                            "word_count": self.min_scene_length * 3
                        }
                except Exception:
                    # If conversion fails, create a default chapter
                    chapter = {
                        "number": i+1,
                        "title": f"Chapter {i+1}",
                        "pov": "Main Character",
                        "events": [f"Event 1 in Chapter {i+1}", f"Event 2 in Chapter {i+1}"],
                        "word_count": self.min_scene_length * 3
                    }
            
            # Ensure required keys exist
            if "number" not in chapter:
                chapter["number"] = i+1
            if "title" not in chapter:
                chapter["title"] = f"Chapter {i+1}"
                
            chapter_title = f"Chapter {chapter['number']}: {chapter['title']}"
            chapter_num = str(chapter['number'])
            
            try:
                # Get beats for this chapter if available
                chapter_beat_list = None
                if chapter_beats and isinstance(chapter_beats, dict) and chapter_num in chapter_beats:
                    chapter_beat_list = chapter_beats[chapter_num]
                    print(f"Using {len(chapter_beat_list)} beats to generate scenes for {chapter_title}...")
                
                # Generate scenes with beats if available
                scenes = self.generate_chapter_scenes(chapter, story_details, chapter_beat_list)
                
                # Ensure scenes is a list
                if not isinstance(scenes, list):
                    if isinstance(scenes, dict) and "scenes" in scenes:
                        scenes = scenes["scenes"]
                    else:
                        scenes = [str(scenes)]
            except Exception as e:
                # If scene generation fails, create generic scenes
                print(f"Error generating scenes for chapter {chapter_title}: {str(e)}")
                scenes = [
                    f"Scene 1 for {chapter_title}",
                    f"Scene 2 for {chapter_title}"
                ]
            
            all_scenes[chapter_title] = scenes
            
            # Save progress after each chapter
            self._save_progress("all_scenes", all_scenes)
            
            # Add a small delay to avoid API rate limits
            time.sleep(1)
        
        return all_scenes
    
    def generate_novel_bisac(self, story_details):
        """
        Generate BISAC subject categories for the novel based on story details.
        
        Args:
            story_details (dict): The story details including title, genre, theme, etc.
            
        Returns:
            list: List of relevant BISAC subject categories for the novel
        """
        # Get the story details for the prompt
        title = self.title
        genre = story_details.get("genre", "")
        theme = story_details.get("theme", "")
        audience = story_details.get("audience_age_range", "")
        main_character = story_details.get("main_character", "")
        central_conflict = story_details.get("central_conflict", "")
        setting = story_details.get("setting", "")
        
        # Use synopsis if available
        synopsis = ""
        if hasattr(self, "_novel_synopsis") and self._novel_synopsis:
            synopsis = self._novel_synopsis[:500]
        
        # Prepare prompt
        prompt = f"""
        I am working on a novel with the following details:
        - Title: {title}
        - Genre: {genre}
        - Theme: {theme}
        - Target Audience: {audience}
        - Main Character(s): {main_character}
        - Central Conflict: {central_conflict}
        - Setting: {setting}
        
        Additional context:
        {synopsis}
        
        Based on these details, suggest 10 BISAC subject categories that best represent this novel. These categories should align with how readers would search for or browse books similar to mine in a bookstore or online retailer. Focus on:
        - Broad genres (e.g., Fiction / Fantasy / Epic)
        - Specific themes or topics (e.g., Family Life / Coming of Age)
        - Target audience considerations (e.g., Juvenile Fiction / Social Themes)
        - Any unique elements of the story that might fit niche categories
        
        Format your response as a JSON array of strings, with each entry being a BISAC subject category.
        """
        
        system_message = """You are an expert in book publishing and categorization.
        Generate accurate BISAC subject categories that would help bookstores and online retailers properly 
        categorize this novel. Use the official BISAC format (e.g., 'Fiction / Fantasy / Epic').
        Include both broad and specific categories. Your response should be a JSON array of strings 
        containing exactly 10 BISAC category suggestions."""
        
        try:
            # Get the BISAC categories with JSON response format
            response = self._ai_completion(prompt, system_message, json_response=True)
            
            # Validate the response
            if isinstance(response, list):
                bisac_categories = response
            elif isinstance(response, dict) and "categories" in response:
                bisac_categories = response["categories"]
            else:
                # Try to extract categories from the response
                bisac_categories = []
                for key, value in response.items():
                    if isinstance(value, list):
                        bisac_categories = value
                        break
                
                # If still no categories, create a default list
                if not bisac_categories:
                    # Generate some categories from the story details
                    age_prefix = ""
                    if "young adult" in audience.lower() or "ya" in audience.lower():
                        age_prefix = "Young Adult Fiction / "
                    elif "middle grade" in audience.lower() or "children" in audience.lower():
                        age_prefix = "Juvenile Fiction / "
                    else:
                        age_prefix = "Fiction / "
                    
                    # Create default categories
                    bisac_categories = [
                        f"{age_prefix}{genre.title()}", 
                        f"{age_prefix}General",
                        f"{age_prefix}Coming of Age",
                        f"Fiction / Literary",
                        f"Fiction / {genre.title()}",
                        f"Fiction / Thematic - {theme.title()}",
                        f"Fiction / Family Life",
                        f"Fiction / Small Town & Rural",
                        f"Fiction / Psychological",
                        f"Fiction / Cultural Heritage"
                    ]
            
            # Ensure we have exactly 10 categories
            if len(bisac_categories) > 10:
                bisac_categories = bisac_categories[:10]
            elif len(bisac_categories) < 10:
                # Add generic categories if needed
                default_additions = [
                    "Fiction / General",
                    "Fiction / Literary", 
                    "Fiction / Coming of Age",
                    "Fiction / Family Life",
                    "Fiction / Contemporary",
                    "Fiction / Psychological"
                ]
                for cat in default_additions:
                    if len(bisac_categories) < 10 and cat not in bisac_categories:
                        bisac_categories.append(cat)
            
            # Save progress
            self._save_progress("novel_bisac", bisac_categories)
            
            return bisac_categories
            
        except Exception as e:
            print(f"Error generating BISAC categories: {str(e)}")
            # Return a basic list of categories based on the story details
            age_prefix = ""
            if "young adult" in str(audience).lower() or "ya" in str(audience).lower():
                age_prefix = "Young Adult Fiction / "
            elif "middle grade" in str(audience).lower() or "children" in str(audience).lower():
                age_prefix = "Juvenile Fiction / "
            else:
                age_prefix = "Fiction / "
                
            default_categories = [
                f"{age_prefix}{str(genre).title()}", 
                f"{age_prefix}General",
                f"{age_prefix}Coming of Age",
                f"Fiction / Literary",
                f"Fiction / {str(genre).title()}",
                f"Fiction / Thematic - {str(theme).title()}",
                f"Fiction / Family Life",
                f"Fiction / Small Town & Rural",
                f"Fiction / Psychological",
                f"Fiction / Cultural Heritage"
            ]
            return default_categories
            
    def generate_novel_keywords(self, story_details):
        """
        Generate relevant keywords and search terms for the novel based on story details.
        
        Args:
            story_details (dict): The story details including title, genre, theme, etc.
            
        Returns:
            list: List of relevant keywords and search phrases for the novel
        """
        # Get the story details for the prompt
        title = self.title
        genre = story_details.get("genre", "")
        theme = story_details.get("theme", "")
        audience = story_details.get("audience_age_range", "")
        main_character = story_details.get("main_character", "")
        central_conflict = story_details.get("central_conflict", "")
        setting = story_details.get("setting", "")
        
        # Use synopsis if available
        synopsis = ""
        if hasattr(self, "_novel_synopsis") and self._novel_synopsis:
            synopsis = self._novel_synopsis
        
        # Prepare prompt
        prompt = f"""
        I am working on a novel with the following details:
        - Title: {title}
        - Genre: {genre}
        - Theme: {theme}
        - Target Audience: {audience}
        - Main Character(s): {main_character}
        - Central Conflict: {central_conflict}
        - Setting: {setting}
        
        Additional context:
        {synopsis[:500]}
        
        Based on these details, generate 15 highly relevant and specific keywords or phrases that real readers might type into a search engine (e.g., Google, Amazon, etc.) to find this novel. Focus on terms that are:
        - Natural and conversational (how people actually search)
        - Related to the genre, themes, characters, and plot
        - Likely to appeal to the target audience
        - Optimized for discoverability (including both short and long-tail keywords)
        
        Format your response as a JSON array of strings, with each entry being a keyword or phrase.
        """
        
        system_message = """You are an expert in book marketing and search engine optimization.
        Generate specific, relevant keywords that would help readers discover this novel.
        Focus on actual search terms people use, not generic descriptors.
        Your response should be a JSON array of strings containing exactly 15 keywords/phrases."""
        
        try:
            # Get the keywords with JSON response format
            response = self._ai_completion(prompt, system_message, json_response=True)
            
            # Validate the response
            if isinstance(response, list):
                keywords = response
            elif isinstance(response, dict) and "keywords" in response:
                keywords = response["keywords"]
            else:
                # Try to extract keywords from the response
                keywords = []
                for key, value in response.items():
                    if isinstance(value, list):
                        keywords = value
                        break
                
                # If still no keywords, create a default list
                if not keywords:
                    # Generate some keywords from the story details
                    keywords = [
                        f"{genre} novels", 
                        f"books about {theme}",
                        f"{audience} {genre} fiction",
                        f"{genre} with {central_conflict}"
                    ]
                    
                    # Add the title and variations
                    keywords.append(f"{title} book")
                    keywords.append(f"{title} novel")
                    
                    # Fill out the list to 15 items
                    while len(keywords) < 15:
                        keywords.append(f"{genre} fiction")
            
            # Save progress
            self._save_progress("novel_keywords", keywords)
            
            return keywords
            
        except Exception as e:
            print(f"Error generating novel keywords: {str(e)}")
            # Return a basic list of keywords based on the story details
            default_keywords = [
                f"{genre} novels", 
                f"books about {theme}",
                f"{audience} {genre} fiction",
                f"{genre} with {central_conflict}",
                f"{title} book",
                f"{title} novel",
                f"{genre} fiction",
                f"books like {title}",
                f"{genre} stories",
                f"popular {genre} books",
                f"{genre} series",
                f"new {genre} releases",
                f"best {genre} novels",
                f"{theme} in fiction",
                f"{setting} {genre}"
            ]
            return default_keywords
    
    def generate_character_profiles(self, story_details):
        """
        Generate comprehensive character profiles based on the novel synopsis.
        
        Args:
            story_details (dict): The story details
            
        Returns:
            str: Detailed character profiles for all characters in the novel
        """
        # First, check if we have a synopsis
        synopsis = ""
        if hasattr(self, '_novel_synopsis') and self._novel_synopsis:
            synopsis = self._novel_synopsis
        else:
            # Generate a synopsis first if we don't have one
            synopsis = self.generate_novel_synopsis(story_details)
            self._novel_synopsis = synopsis
        
        title = self.title
        
        # Check if we have series context
        series_context = story_details.get('series_context', {})
        series_guidance = ""
        existing_characters = []
        
        if series_context:
            book_number = series_context.get('book_number', 1)
            total_books = series_context.get('total_books', 1)
            series_title = series_context.get('series_title', 'Untitled Series')
            
            series_guidance = f"""
            SERIES CONTEXT (Important for character development):
            
            This novel is Book {book_number} of {total_books} in a series titled "{series_title}".
            """
            
            # Character arcs in series
            if series_context.get('character_arcs'):
                series_guidance += "\nCharacter Arcs Throughout Series:\n"
                for char_name, char_arc in series_context.get('character_arcs', {}).items():
                    series_guidance += f"- {char_name}: {char_arc}\n"
                    existing_characters.append(char_name)
            
            # Position-specific guidance
            if book_number > 1 and series_context.get('prior_books'):
                series_guidance += "\nContinuity Requirements:\n"
                if book_number > 1:
                    series_guidance += "- Maintain consistency with established characters from previous books\n"
                    series_guidance += "- Show character growth based on previous experiences\n"
                    
                # Add info about characters from previous books
                if existing_characters:
                    series_guidance += f"\nEstablished Characters (provide more depth and development for these):\n"
                    for character in existing_characters:
                        series_guidance += f"- {character}\n"
                        
            # New character guidance
            if book_number > 1:
                series_guidance += "\nNew Character Guidelines:\n"
                series_guidance += "- Introduce new characters that enhance the existing cast\n"
                series_guidance += "- Ensure new characters have meaningful connections to the established world\n"
        
        prompt = f"""
        Write a comprehensive character profile for all of the characters of the novel "{title}" based on the synopsis provided below.

        Synopsis:
        {synopsis}
        
        {series_guidance}

        Please include the following elements in each profile:
        * Full Name
        * Role in the Story (Protagonist, Antagonist, Mentor, etc.)
        * Physical Description (Age, features, body language, fashion style)
        * Core Personality Traits (Shown through action or dialogue—not just listed)
        * Backstory (Key events that shaped them)
        * Motivations and Desires
        * Fears and Flaws
        * Character Arc (How they grow or change over the course of the story)
        * Key Relationships (Allies, enemies, love interests, etc.)
        * Important Symbols or Objects tied to them (optional)
        * Emotional Struggles or Internal Conflicts
        * Voice & Dialogue Style (e.g., blunt and sarcastic, poetic and hesitant, formal with clipped speech)
        """
        
        if series_context and book_number > 1:
            prompt += """
            For established characters from previous books in the series, also include:
            * Previous Development (How they've changed in prior books)
            * Continuity Elements (Key traits, relationships, or items that must remain consistent)
            * New Challenges (Fresh conflicts or growth opportunities in this installment)
            """
        
        prompt += """
        This profile should feel like a living portrait of the character, helping guide their actions, voice, and emotional journey throughout the novel. Focus on showing who they are through behavior, conflict, and desire, rather than just telling.
        """
        
        system_message = """You are a professional character development expert for YA fiction.
        Create detailed character profiles that bring each character to life with distinctive voices, motivations, and emotional depth.
        Ensure main characters have clear emotional arcs while supporting characters have distinctive qualities that help them stand out."""
        
        return self._ai_completion(prompt, system_message)
        
    def generate_novel_synopsis(self, story_details):
        """
        Generate a detailed novel synopsis based on the story details and chosen premise/ending.
        
        Args:
            story_details (dict): The story details
            
        Returns:
            str: The detailed novel synopsis with a three-act structure
        """
        # Extract required fields from story_details
        title = self.title
        theme = story_details.get('story_theme', 'Growth and self-discovery')
        word_count = story_details.get('estimated_word_count', '70,000-90,000')
        target_age = story_details.get('target_age_range', '13-18')
        main_character = story_details.get('main_character_name', 'the protagonist')
        conflict = story_details.get('central_conflict', 'a significant challenge')
        
        # Create a description from story details
        description = f"Theme: {theme}\n"
        description += f"Genre: {story_details.get('genre', 'Young Adult Fiction')}\n"
        description += f"Central Concept: {story_details.get('central_concept', 'A coming-of-age journey')}\n"
        description += f"Setting: {story_details.get('setting', 'A world of possibility')}\n"
        
        # Get premise and ending if available
        premise = ""
        ending = ""
        if hasattr(self, '_premises_and_endings') and self._premises_and_endings:
            premise = self._premises_and_endings.get('chosen_premise', '')
            ending = self._premises_and_endings.get('chosen_ending', '')
            
        # Check if we have series context
        series_context = story_details.get('series_context', {})
        series_guidance = ""
        if series_context:
            book_number = series_context.get('book_number', 1)
            total_books = series_context.get('total_books', 1)
            series_title = series_context.get('series_title', 'Untitled Series')
            
            series_guidance = f"""
            SERIES CONTEXT (Important - incorporate into your synopsis):
            
            This novel is Book {book_number} of {total_books} in a series titled "{series_title}".
            
            Series Arc: {series_context.get('series_arc', 'No series arc provided')}
            """
            
            # Character arcs in series
            if series_context.get('character_arcs'):
                series_guidance += "\nCharacter Arcs Across Series:\n"
                for char_name, char_arc in series_context.get('character_arcs', {}).items():
                    series_guidance += f"- {char_name}: {char_arc}\n"
            
            # Series themes
            if series_context.get('themes'):
                series_guidance += "\nSeries Themes to Incorporate:\n"
                for theme in series_context.get('themes', []):
                    series_guidance += f"- {theme}\n"
            
            # Position-specific guidance
            series_guidance += "\nRequirements for this book's position in the series:\n"
            if book_number == 1:
                series_guidance += "- As the FIRST book, establish the series world, main characters, and core conflicts\n"
                series_guidance += "- Set up plot threads that can be developed in future books\n"
                series_guidance += "- Focus on making this a complete story while introducing the larger series arc\n"
            elif book_number == total_books:
                series_guidance += "- As the FINAL book, provide satisfying resolutions to both this book's plot and the overall series arc\n"
                series_guidance += "- Address all major character arcs and provide closure\n"
                series_guidance += "- Deliver on the promises set up in previous books\n"
            else:
                series_guidance += f"- As book #{book_number} in the middle of the series, balance advancing the series arc with having its own complete story\n"
                series_guidance += "- Continue character development from previous books while setting up future development\n"
                series_guidance += "- Raise the stakes from previous books\n"
            
            # Previous books context
            if series_context.get('prior_books'):
                series_guidance += "\nPrevious books in the series (ensure continuity with these):\n"
                for book in series_context.get('prior_books', []):
                    series_guidance += f"- {book.get('title', 'Previous Book')}\n"
        
        prompt = f"""
        I am writing a Young Adult fantasy Novel titled "{title}".

        The theme centers around {theme}.

        Target word count range: {word_count}
        Intended YA audience: {target_age}

        The story follows {main_character} as they face {conflict}.

        {series_guidance}

        Given the following premise and story information, provide a highly detailed synopsis for this YA novel using a traditional three-act structure.

        The synopsis should:
        – Clearly label Act I, Act II, and Act III
        – Highlight the main characters, their emotional journey, and the obstacles they face
        – Emphasize the passion, stakes, and tension
        – Hint at the resolution without spoiling the ending completely
        – Leave readers eager to dive into the story

        Use a tone and language that captures the spirit of a YA novel while still offering depth, clarity, and structure.

        Description:
        {description}

        Premise: {premise}
        Ending: {ending}
        """
        
        system_message = """You are a professional YA novelist skilled at creating compelling synopses.
        Create a detailed three-act structure synopsis that would excite both readers and publishers.
        Focus on emotional arcs, character development, and the unique aspects that make this story stand out in the YA market."""
        
        return self._ai_completion(prompt, system_message)
    
    def generate_novel_plan(self, story_details):
        """
        Generate a structured novel plan based on the synopsis and character profiles.
        
        Args:
            story_details (dict): The story details
            
        Returns:
            str: The detailed novel plan with structure, character arcs, and pacing
        """
        # First, check if we have a synopsis
        synopsis = ""
        if hasattr(self, '_novel_synopsis') and self._novel_synopsis:
            synopsis = self._novel_synopsis
        else:
            # Generate a synopsis first if we don't have one
            synopsis = self.generate_novel_synopsis(story_details)
            self._novel_synopsis = synopsis
        
        # Check if we have character profiles
        profiles = ""
        if hasattr(self, '_character_profiles') and self._character_profiles:
            profiles = self._character_profiles
        else:
            # Generate character profiles if we don't have them
            profiles = self.generate_character_profiles(story_details)
            self._character_profiles = profiles
        
        # Set word count between 100,000 to 150,000 words
        import random
        word_count = random.randint(100000, 150000)
        
        title = self.title
        
        # Check if we have series context
        series_context = story_details.get('series_context', {})
        series_guidance = ""
        
        if series_context:
            book_number = series_context.get('book_number', 1)
            total_books = series_context.get('total_books', 1)
            series_title = series_context.get('series_title', 'Untitled Series')
            
            series_guidance = f"""
            SERIES CONTEXT (Incorporate into your plan):
            
            This novel is Book {book_number} of {total_books} in a series titled "{series_title}".
            """
            
            # Series arc
            if series_context.get('series_arc'):
                series_guidance += f"\nOverall Series Arc: {series_context.get('series_arc')}\n"
            
            # Series-specific planning elements
            series_guidance += "\nSeries Planning Elements:\n"
            
            if book_number == 1:
                series_guidance += """
                As the FIRST book in the series:
                - Establish core world elements that will persist throughout the series
                - Introduce characters who will have multi-book arcs
                - Plant seeds for future developments in later books
                - Resolve the main conflict of this book while leaving larger series questions open
                - Create a satisfying story that stands alone but hints at more to come
                """
            elif book_number == total_books:
                series_guidance += """
                As the FINAL book in the series:
                - Resolve all major series plotlines and character arcs
                - Call back to important moments from earlier books
                - Provide emotional closure for long-running character relationships
                - Tie up loose ends while maintaining the possibility of future stories
                - Deliver a climax that pays off setup from previous books
                """
            else:
                middle_position = "early" if book_number <= total_books / 2 else "later"
                series_guidance += f"""
                As a MIDDLE book ({middle_position} in the series):
                - Continue developing series-wide character arcs
                - Deepen the world established in previous books
                - Raise the stakes from previous installments
                - Resolve some conflicts while introducing new ones
                - Balance being a self-contained story and advancing the series arc
                """
                
            # Add previous book context
            if book_number > 1 and series_context.get('prior_books'):
                series_guidance += "\nContinuity Requirements:\n"
                series_guidance += "- Maintain consistency with previously established elements\n"
                series_guidance += "- Reference key events from previous books where relevant\n"
                series_guidance += "- Show character growth influenced by previous experiences\n"
        
        prompt = f"""
        Following the synopsis below, create a structured plan to guide me in building a compelling, emotionally rich narrative that keeps readers engaged throughout my {word_count}-word novel. Break the novel down into 3 parts, providing an approximate word count for each section along with key milestones and plot points to hit.

        {series_guidance}

        Include specific guidance for:

        1. Character Development:
        Outline the protagonist's growth arc and relationships, detailing how they evolve emotionally and personally. Highlight moments of transformation and key decisions that define their journey. Make use of their character profile to make them real and unique.

        2. Conflict and Tension:
        Define the central conflicts and how tension escalates at each stage, building momentum toward the climax. Include suggestions for balancing high-stakes moments with quieter, reflective scenes to maintain emotional pacing.

        3. Secondary Characters:
        Describe their roles and contributions to the plot, and how they support or complicate the main storyline. Provide insight into their mini-arcs and how they intersect with the protagonist's journey.

        4. Themes:
        Suggest ways to weave the novel's core themes naturally through dialogue, events, symbolism, and character actions to enhance emotional impact and depth.

        5. Pacing and Structure:
        Offer guidance on the emotional and narrative pacing for each section, ensuring the story unfolds organically and peaks at the right moments. Include recommendations for cliffhangers, twists, and reflective pauses where appropriate.

        6. Foreshadowing and Payoff:
        Indicate key opportunities for foreshadowing early on, ensuring satisfying payoffs that tie loose ends and reinforce the story's themes by the conclusion.

        Synopsis:
        {synopsis}

        Character Profiles:
        {profiles}
        """
        
        system_message = """You are a professional novel structure expert and writing coach.
        Create a comprehensive novel plan that gives practical, actionable guidance for developing a compelling narrative.
        Focus on emotional arcs, structural balance, and specific plot milestones that will help the author craft a satisfying story.
        Provide a balance of big-picture guidance and specific tactical suggestions."""
        
        return self._ai_completion(prompt, system_message)
    
    def generate_chapter_guide(self, chapter_outline):
        """
        Generate an extensive chapter-by-chapter guide with detailed elements for each chapter.
        
        Args:
            chapter_outline (list): List of chapter objects
            
        Returns:
            dict: Dictionary mapping chapter numbers to detailed chapter guides
        """
        # Ensure we have a valid chapter outline
        if not chapter_outline or not isinstance(chapter_outline, list):
            print("Error: Invalid chapter outline provided")
            return self._create_default_chapter_guide(chapter_outline)
        
        # Get the title and estimated word count
        title = self.title
        
        # Add debugging to help with deployment troubleshooting
        print(f"Generating chapter guide for '{title}' with {len(chapter_outline)} chapters")
        print(f"Using model: {self.model}")
        
        # Get additional context if available
        novel_synopsis = getattr(self, "_novel_synopsis", "")
        character_profiles = getattr(self, "_character_profiles", "")
        novel_plan = getattr(self, "_novel_plan", "")
        premises_and_endings = getattr(self, "_premises_and_endings", {})
        
        # Calculate total word count from chapter outline
        total_word_count = sum(
            chapter.get("estimated_word_count", chapter.get("word_count", 0)) 
            for chapter in chapter_outline
        )
        
        # Create a more concise chapter outline version for the prompt
        simplified_outline = []
        for i, chapter in enumerate(chapter_outline):
            try:
                simplified_outline.append({
                    "number": chapter.get("number", i+1),
                    "title": chapter.get("title", f"Chapter {i+1}"),
                    "summary": chapter.get("summary", "No summary available")
                })
            except Exception:
                simplified_outline.append({
                    "number": i+1,
                    "title": f"Chapter {i+1}",
                    "summary": "Error extracting chapter information"
                })
        
        # Prepare the simplified chapter outline as a JSON string
        try:
            chapter_outline_json = json.dumps(simplified_outline, indent=2)
        except Exception as e:
            print(f"Error serializing simplified chapter outline: {str(e)}")
            # Create an even more simplified version
            basic_outline = []
            for i, _ in enumerate(chapter_outline):
                basic_outline.append({
                    "number": i+1,
                    "title": f"Chapter {i+1}",
                    "summary": "Chapter summary unavailable"
                })
            chapter_outline_json = json.dumps(basic_outline, indent=2)
        
        # Improved prompt with clearer instructions and example output
        prompt = f"""
        Create a detailed chapter guide for the young adult novel "{title}" (approximately {total_word_count} words).
        
        Novel Context:
        - Synopsis: {novel_synopsis[:1000] if novel_synopsis else "Not provided"}
        - Main Characters: {character_profiles[:1000] if character_profiles else "Not provided"}
        - Novel Plan: {novel_plan[:1000] if novel_plan else "Not provided"}
        
        Chapter Outline: {chapter_outline_json}
        
        For EACH CHAPTER NUMBER in the outline, create a guide with these EXACT fields:
        1. key_dialogue: 3-4 specific lines or exchanges that reveal character or advance plot
        2. symbolism: 2-3 symbolic elements that reinforce themes
        3. emotional_pacing: A clear description of the emotional arc in the chapter
        4. sensory_details: 3-4 vivid sensory descriptions to include
        5. foreshadowing: 2-3 subtle hints about future developments
        6. scene_goal: A concise statement of what the viewpoint character wants to achieve
        
        Your response must be VALID JSON with this exact structure (example for ONE chapter):
        {{
          "1": {{
            "key_dialogue": [
              "I can't go back there. Not after what happened.",
              "Sometimes the thing we're most afraid of is exactly what we need to face.",
              "Promise me you won't tell anyone what you saw."
            ],
            "symbolism": [
              "The broken watch represents Emma's feelings of being stuck in time",
              "The locked garden gate symbolizes opportunities just out of reach"
            ],
            "emotional_pacing": "The chapter begins with anxiety, shifts to cautious hope, then ends with determination.",
            "sensory_details": [
              "The scent of lemon polish mixing with dust in the old library",
              "The feel of cool metal keys against sweaty palms",
              "The distant echo of laughter from the school cafeteria"
            ],
            "foreshadowing": [
              "The strange symbol on the library book will become significant later",
              "Mr. Peterson's unexplained absence hints at the trouble to come"
            ],
            "scene_goal": "Emma needs to find the missing journal before anyone discovers it's gone."
          }}
        }}
        
        Create entries for ALL chapters in the outline, following this exact format.
        Do not include any explanatory text outside the JSON structure.
        All fields are required for every chapter.
        """
        
        system_message = """You are an expert YA novelist creating a detailed chapter guide.
        
        IMPORTANT INSTRUCTIONS:
        1. Format your ENTIRE response as a VALID JSON object
        2. Each chapter must have ALL required fields (key_dialogue, symbolism, emotional_pacing, sensory_details, foreshadowing, scene_goal)
        3. Each array field must contain multiple concrete examples, not generic placeholders
        4. The content should be specific to the novel and avoid generic writing advice
        5. Do not include any text, explanations or comments outside the JSON structure
        6. Ensure your JSON is properly formatted with correct quotes, commas, and braces
        
        Your response will be parsed directly as JSON and any formatting errors will cause failure."""
        
        # Increase retries for more reliability
        max_retries = 5
        retry_delay = 3  # seconds
        
        for attempt in range(max_retries):
            try:
                # Get the detailed chapter guide
                print(f"Attempt {attempt+1}/{max_retries}: Generating detailed chapter guide...")
                
                chapter_guide = None
                
                # Try multiple approaches to get valid JSON
                try:
                    # First try direct JSON response format
                    chapter_guide = self._ai_completion(prompt, system_message, json_response=True, max_tokens=3000)
                    if not chapter_guide or not isinstance(chapter_guide, dict):
                        raise ValueError("Response was not a valid dictionary")
                    print("Successfully generated chapter guide with JSON response format")
                except Exception as json_err:
                    print(f"JSON format failed: {str(json_err)}, trying alternative methods...")
                    
                    # Try shortening the prompt if it might be too long
                    shorter_prompt = prompt.replace(
                        f"Novel Context:\n- Synopsis: {novel_synopsis[:1000] if novel_synopsis else 'Not provided'}\n- Main Characters: {character_profiles[:1000] if character_profiles else 'Not provided'}\n- Novel Plan: {novel_plan[:1000] if novel_plan else 'Not provided'}\n",
                        "Novel Context: Young adult novel with character development and emotional journey.\n"
                    )
                    
                    try:
                        # Try with shortened prompt
                        chapter_guide = self._ai_completion(shorter_prompt, system_message, json_response=True, max_tokens=3000)
                        if chapter_guide and isinstance(chapter_guide, dict):
                            print("Successfully generated with shortened prompt")
                        else:
                            raise ValueError("Invalid response with shortened prompt")
                    except Exception:
                        # If JSON format approach fails, try text approach with extraction
                        raw_response = self._ai_completion(shorter_prompt, system_message, json_response=False, max_tokens=3000)
                        
                        # Try multiple extraction methods
                        try:
                            # 1. First try direct JSON parsing
                            chapter_guide = json.loads(raw_response)
                        except json.JSONDecodeError as e:
                            print(f"Direct JSON parsing failed: {str(e)}")
                            
                            # 2. Try regex extraction of JSON object
                            import re
                            json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
                            if json_match:
                                response_text = json_match.group(0)
                                try:
                                    chapter_guide = json.loads(response_text)
                                    print("Extracted JSON via regex")
                                except json.JSONDecodeError as parse_err:
                                    print(f"JSON parsing error: {str(parse_err)}")
                                    # 3. Try cleaning the text before parsing
                                    try:
                                        # Fix common JSON formatting errors
                                        clean_text = response_text.replace('\n', ' ').replace('\r', '')
                                        # Fix trailing commas
                                        clean_text = re.sub(r',\s*}', '}', clean_text)
                                        clean_text = re.sub(r',\s*]', ']', clean_text)
                                        chapter_guide = json.loads(clean_text)
                                        print("Parsed JSON after cleaning")
                                    except json.JSONDecodeError as clean_err:
                                        print(f"JSON parsing error: {str(clean_err)}")
                                        raise
                
                # If we got this far without a valid chapter guide, we failed
                if not chapter_guide or not isinstance(chapter_guide, dict):
                    raise ValueError("Failed to generate a valid chapter guide dictionary")
                
                # Check if any chapter entries exist
                if len(chapter_guide.keys()) == 0:
                    raise ValueError("Generated chapter guide contains no chapters")
                
                print(f"Chapter guide generated with {len(chapter_guide.keys())} chapters")
                
                # Generate content for any missing chapters
                if len(chapter_guide.keys()) < len(chapter_outline):
                    print(f"Missing chapters detected: got {len(chapter_guide.keys())}, expected {len(chapter_outline)}")
                    chapter_guide = self._generate_missing_chapters(chapter_guide, chapter_outline)
                
                # Fill in missing fields for any chapters
                complete_guide = self._complete_chapter_guide(chapter_guide, chapter_outline)
                
                # Save progress
                self._save_progress("chapter_guide", complete_guide)
                
                return complete_guide
                
            except Exception as e:
                print(f"Error generating chapter guide (attempt {attempt+1}/{max_retries}): {str(e)}")
                if attempt < max_retries - 1:
                    print(f"Retrying in {retry_delay} seconds...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    print("All attempts failed, creating default chapter guide")
                    return self._create_default_chapter_guide(chapter_outline)
                    
    def _generate_missing_chapters(self, partial_guide, chapter_outline):
        """Generate content for missing chapters individually"""
        result = partial_guide.copy()
        
        for i, chapter in enumerate(chapter_outline):
            chapter_num = str(chapter.get("number", i+1))
            
            # Skip chapters that already have entries
            if chapter_num in result:
                continue
                
            print(f"Generating missing chapter {chapter_num} guide...")
            
            # Create a focused prompt for just this chapter
            prompt = f"""
            Create a detailed guide for Chapter {chapter_num}: {chapter.get('title', f'Chapter {chapter_num}')}
            
            Chapter Summary: {chapter.get('summary', 'No summary available')}
            
            Include these exact fields:
            1. key_dialogue: 3-4 specific lines or exchanges 
            2. symbolism: 2-3 symbolic elements
            3. emotional_pacing: A description of the emotional arc
            4. sensory_details: 3-4 vivid sensory descriptions
            5. foreshadowing: 2-3 subtle hints about future developments
            6. scene_goal: What the viewpoint character wants to achieve
            
            Format as valid JSON for a SINGLE chapter with the exact structure shown.
            """
            
            system_message = "You are creating a detailed guide for a single chapter in a novel. Format your response as valid JSON."
            
            try:
                # Try to generate content for this chapter
                chapter_content = self._ai_completion(prompt, system_message, json_response=True, max_tokens=1000)
                
                # If successful, add to the result
                if chapter_content and isinstance(chapter_content, dict):
                    # Some models might nest it under the chapter number
                    if chapter_num in chapter_content:
                        result[chapter_num] = chapter_content[chapter_num]
                    # Others might return just the chapter content
                    elif any(k in chapter_content for k in ["key_dialogue", "symbolism", "emotional_pacing"]):
                        result[chapter_num] = chapter_content
                    else:
                        # Create a default entry
                        result[chapter_num] = self._create_default_chapter_entry()
                else:
                    # Create a default entry
                    result[chapter_num] = self._create_default_chapter_entry()
                    
            except Exception as e:
                print(f"Error generating chapter {chapter_num}: {str(e)}")
                # Create a default entry
                result[chapter_num] = self._create_default_chapter_entry()
                
        return result
    
    def _complete_chapter_guide(self, chapter_guide, chapter_outline):
        """Helper method to fill in missing chapters and fields in a chapter guide"""
        result = {}
        
        # Process each chapter from the outline
        for i, chapter in enumerate(chapter_outline):
            chapter_num = str(chapter.get("number", i+1))
            
            # Check if this chapter exists in the guide
            if chapter_num in chapter_guide:
                entry = chapter_guide[chapter_num]
            else:
                print(f"Adding missing chapter {chapter_num} to guide")
                entry = {}
            
            # Ensure each chapter entry has all required fields
            complete_entry = {}
            
            # Get better default values from the default chapter entry method
            default_entry = self._create_default_chapter_entry()
            
            # Use these improved defaults
            required_fields = default_entry
            
            # Fill in from actual values or use defaults
            for field, default in required_fields.items():
                if field in entry and entry[field]:
                    # Field exists and has a value
                    value = entry[field]
                    # Ensure array fields are arrays
                    if field in ["key_dialogue", "symbolism", "sensory_details", "foreshadowing"]:
                        if not isinstance(value, list):
                            value = [str(value)]
                    complete_entry[field] = value
                else:
                    # Field is missing or empty, use default
                    complete_entry[field] = default
            
            # Add the completed entry to the result
            result[chapter_num] = complete_entry
        
        return result
    
    def _create_default_chapter_entry(self):
        """Create a default chapter entry with required fields"""
        return {
            "key_dialogue": [
                "This is where a revealing line of dialogue would appear.",
                "Here's where a character would express their emotions.",
                "This dialogue would advance the plot or reveal character."
            ],
            "symbolism": [
                "A symbolic element that represents the character's journey",
                "An object or image that reinforces the chapter's theme"
            ],
            "emotional_pacing": "The chapter would start with tension, build through conflict, and end with a moment of realization.",
            "sensory_details": [
                "A visual detail that grounds the reader in the setting",
                "A sound that creates atmosphere in a key scene",
                "A tactile sensation that makes the scene feel real"
            ],
            "foreshadowing": [
                "A subtle hint about a future plot development",
                "An unexplained detail that will become significant later"
            ],
            "scene_goal": "The protagonist needs to overcome an obstacle related to their overall character arc."
        }
        
    def _create_default_chapter_guide(self, chapter_outline):
        """Create a default chapter guide when generation fails"""
        print("Creating default chapter guide template")
        default_guide = {}
        
        # Handle case where chapter_outline might be invalid
        if not chapter_outline or not isinstance(chapter_outline, list):
            print("Cannot use chapter outline, creating basic template")
            default_guide = {
                "1": self._create_default_chapter_entry()
            }
            return default_guide
        
        # Create a basic template for each chapter
        for i, chapter in enumerate(chapter_outline):
            try:
                chapter_num = str(chapter.get("number", i+1))
                chapter_title = chapter.get("title", f"Chapter {i+1}")
                print(f"Adding default entry for Chapter {chapter_num}: {chapter_title}")
                default_guide[chapter_num] = self._create_default_chapter_entry()
            except Exception as e:
                print(f"Error creating default for chapter {i+1}: {str(e)}")
                # Even in error cases, use a better template
                default_guide[str(i+1)] = self._create_default_chapter_entry()
        
        return default_guide
    
    def generate_chapter_beats(self, chapter_outline, chapter_guide):
        """
        Generate detailed action beats for each chapter's scenes.
        
        Args:
            chapter_outline (list): List of chapter objects with detailed information
            chapter_guide (dict): Dictionary containing the chapter guide details
            
        Returns:
            dict: Dictionary mapping chapter numbers to lists of detailed action beats
        """
        # Ensure we have valid chapter outlines and guides
        if not chapter_outline or not isinstance(chapter_outline, list):
            raise ValueError("Valid chapter outline is required")
        
        if not chapter_guide or not isinstance(chapter_guide, dict):
            raise ValueError("Valid chapter guide is required")
        
        # Get the title and additional information
        title = self.title
        
        # Prepare to store all chapter beats
        all_chapter_beats = {}
        
        # Get additional context
        story_details_str = "No story details available"
        if hasattr(self, "_novel_synopsis") and self._novel_synopsis:
            story_details_str = self._novel_synopsis
            
        character_profiles_str = "No character profiles available"
        if hasattr(self, "_character_profiles") and self._character_profiles:
            character_profiles_str = self._character_profiles
            
        novel_plan_str = "No novel plan available"
        if hasattr(self, "_novel_plan") and self._novel_plan:
            novel_plan_str = self._novel_plan
        
        # Process each chapter
        for chapter in chapter_outline:
            chapter_num = str(chapter.get("number", 0))
            chapter_title = chapter.get("title", "Untitled Chapter")
            chapter_summary = chapter.get("summary", "No summary available")
            
            # Get chapter guide details if available
            chapter_guide_details = chapter_guide.get(chapter_num, {})
            
            # Prompt 8: Generate detailed action beats for each chapter
            prompt = f"""
            Take the following chapter summary and generate a list of 5 highly detailed action beats for a prose draft. Use the additional story information provided to fully flesh out the chapter's structure and momentum.

            Chapter: {chapter_num}: {chapter_title}
            Chapter Outline: {json.dumps(chapter, indent=2)}
            Chapter Summary: {chapter_summary}
            Additional Story Information: 
            - Synopsis: {story_details_str}
            - Character Profiles: {character_profiles_str}
            - Novel Plan: {novel_plan_str}
            - Chapter Guide: {json.dumps(chapter_guide_details, indent=2)}

            Guidelines:
            – Always use proper nouns (character names, locations, etc.)—avoid vague pronouns.
            – Each beat should reflect clear action, emotional shifts, or key decisions that push the story forward.
            – Beats should show what happens, who does it, and why it matters—emotionally or narratively.
            – Think in terms of cinematic or dramatic moments, whether you're outlining for a screenplay, novel, or graphic narrative.
            – These beats should serve as a scene-by-scene guide to write the full chapter with clarity and purpose.

            For each beat, also include:
            * Emotional impact or shift: (How does the character feel before/after this beat?)
            * Beat-ending tension or hook: (What question is left hanging?)
            
            Format your response as a JSON array where each item is an object with these fields:
            - "beat_number": (integer)
            - "action": (string describing what happens)
            - "emotional_impact": (string describing the emotional shift)
            - "tension_hook": (string describing the question left hanging)
            """
            
            system_message = """You are a professional novelist and writing coach creating detailed action beats for a chapter.
            Provide rich, specific guidance for each beat that aligns with the overall narrative and themes.
            Your beats should be concrete and actionable, helping to create a cohesive and engaging story.
            Format your response as a proper JSON array with all the required fields."""
            
            try:
                # Get the detailed chapter beats
                print(f"Generating detailed action beats for Chapter {chapter_num}: {chapter_title}...")
                raw_response = self._ai_completion(prompt, system_message, json_response=False, max_tokens=4000)
                
                # Extract the JSON array from the response
                try:
                    # Find and parse JSON object from the text
                    import re
                    json_match = re.search(r'\[.*\]', raw_response, re.DOTALL)
                    if json_match:
                        response_text = json_match.group(0)
                        chapter_beats = json.loads(response_text)
                    else:
                        # If no JSON array found, try to parse the whole response
                        chapter_beats = json.loads(raw_response)
                except Exception as e:
                    print(f"Error parsing chapter beats response: {str(e)}")
                    # Create more meaningful placeholder beats if parsing fails
                    chapter_beats = [
                        {
                            "beat_number": 1,
                            "action": "Character faces an initial challenge related to the chapter's main conflict",
                            "emotional_impact": "Starts with confidence but shifts to uncertainty as obstacles arise",
                            "tension_hook": "Will they make the right choice when faced with unexpected resistance?"
                        },
                        {
                            "beat_number": 2,
                            "action": "A key conversation reveals important information or character dynamics",
                            "emotional_impact": "Surprise or concern as new information changes their understanding",
                            "tension_hook": "How will they adapt their approach with this new knowledge?"
                        },
                        {
                            "beat_number": 3,
                            "action": "An unexpected complication makes the character's goal more difficult",
                            "emotional_impact": "Frustration turns to determination as they commit to overcoming the obstacle",
                            "tension_hook": "Can they find a creative solution before time runs out?"
                        },
                        {
                            "beat_number": 4,
                            "action": "Character makes progress but at a cost or sacrifice",
                            "emotional_impact": "Relief mixed with concern about the consequences of their actions",
                            "tension_hook": "Will the sacrifice they made come back to haunt them?"
                        },
                        {
                            "beat_number": 5,
                            "action": "Resolution of immediate problem creates a new question or direction",
                            "emotional_impact": "Satisfaction with current progress but anxiety about what comes next",
                            "tension_hook": "How will this apparent victory affect their overall journey?"
                        }
                    ]
                
                # Store the beats for this chapter
                all_chapter_beats[chapter_num] = chapter_beats
            
            except Exception as e:
                print(f"Error generating beats for Chapter {chapter_num}: {str(e)}")
                # Add the same meaningful fallback beats we use for parsing errors
                all_chapter_beats[chapter_num] = [
                    {
                        "beat_number": 1,
                        "action": "Character faces an initial challenge related to the chapter's main conflict",
                        "emotional_impact": "Starts with confidence but shifts to uncertainty as obstacles arise",
                        "tension_hook": "Will they make the right choice when faced with unexpected resistance?"
                    },
                    {
                        "beat_number": 2,
                        "action": "A key conversation reveals important information or character dynamics",
                        "emotional_impact": "Surprise or concern as new information changes their understanding",
                        "tension_hook": "How will they adapt their approach with this new knowledge?"
                    },
                    {
                        "beat_number": 3,
                        "action": "An unexpected complication makes the character's goal more difficult",
                        "emotional_impact": "Frustration turns to determination as they commit to overcoming the obstacle",
                        "tension_hook": "Can they find a creative solution before time runs out?"
                    },
                    {
                        "beat_number": 4,
                        "action": "Character makes progress but at a cost or sacrifice",
                        "emotional_impact": "Relief mixed with concern about the consequences of their actions",
                        "tension_hook": "Will the sacrifice they made come back to haunt them?"
                    },
                    {
                        "beat_number": 5,
                        "action": "Resolution of immediate problem creates a new question or direction",
                        "emotional_impact": "Satisfaction with current progress but anxiety about what comes next",
                        "tension_hook": "How will this apparent victory affect their overall journey?"
                    }
                ]
        
        return all_chapter_beats

    def format_novel(self, story_details, all_scenes):
        """
        Format the complete novel in multiple formats.
        
        Args:
            story_details (dict): The story details
            all_scenes (dict): Dictionary mapping chapter titles to lists of scenes
            
        Returns:
            dict: Dictionary with formatted novel content in different formats
        """
        # First, create a structured representation of the novel
        novel_content = {
            "title": self.title,
            "author": "AI Novel Generator",
            "story_details": story_details,
            "chapters": []
        }
        
        for chapter_title, scenes in all_scenes.items():
            chapter_number = chapter_title.split(":")[0].strip()
            chapter_name = chapter_title.split(":")[1].strip() if ":" in chapter_title else ""
            
            chapter_content = {
                "number": chapter_number,
                "title": chapter_name,
                "scenes": scenes
            }
            
            novel_content["chapters"].append(chapter_content)
        
        # Generate different formats
        formats = {
            "markdown": self._format_markdown(novel_content),
            "html": self._format_html(novel_content),
            "txt": self._format_txt(novel_content)
        }
        
        # Save formats to files
        for format_name, content in formats.items():
            file_path = os.path.join(self.output_dir, f"{self.title}_{format_name}.{format_name if format_name != 'markdown' else 'md'}")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
        
        return formats
    
    def _format_markdown(self, novel_content):
        """Format novel as Markdown with the new manuscript formatting requirements"""
        md_content = f"# {novel_content['title']}\n\n"
        md_content += f"*By {novel_content['author']}*\n\n"
        
        # Add story details
        md_content += "## About This Novel\n\n"
        story = novel_content['story_details']
        md_content += f"**Genre:** {story.get('genre', 'Unknown')}\n\n"
        md_content += f"**Time Period:** {story.get('time_period', 'Unknown')}\n\n"
        
        if story.get('plot_summary'):
            md_content += "### Plot Summary\n\n"
            md_content += f"{story.get('plot_summary')}\n\n"
        
        # Add Manuscript section
        md_content += "## Manuscript\n\n"
        
        # Process chapters and scenes with new formatting
        for i, chapter in enumerate(novel_content['chapters']):
            # Format chapter header according to requirements
            chapter_title = chapter.get('title', '')
            if chapter_title:
                md_content += f"CHAPTER {chapter['number']}\n{chapter_title}\n\n"
            else:
                md_content += f"CHAPTER {chapter['number']}\n\n"
            
            # Add all scenes with proper formatting
            for j, scene in enumerate(chapter['scenes']):
                # Clean up any potential chapter/scene headers the AI might have added
                import re
                clean_scene = scene.replace("Chapter ", "").replace(f"{chapter['number']}:", "")
                clean_scene = re.sub(r'Scene \d+:?\s*', '', clean_scene)
                
                # Add the clean scene text
                md_content += clean_scene
                
                # Add scene separator if not the last scene
                if j < len(chapter['scenes']) - 1:
                    md_content += "\n\n"  # Blank line between scenes
            
            # Add chapter break if not the last chapter
            if i < len(novel_content['chapters']) - 1:
                md_content += "\n\n====\n\n"  # Chapter break marker
        
        return md_content
    
    def _format_html(self, novel_content):
        """Format novel as HTML"""
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{novel_content['title']}</title>
    <style>
        body {{
            font-family: Georgia, serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }}
        h1, h2, h3 {{
            font-family: 'Times New Roman', Times, serif;
        }}
        h1 {{
            text-align: center;
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        .author {{
            text-align: center;
            font-style: italic;
            margin-bottom: 50px;
        }}
        .chapter-title {{
            margin-top: 40px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }}
        .scene {{
            margin-bottom: 30px;
        }}
        .scene-break {{
            text-align: center;
            margin: 20px 0;
        }}
        .novel-info {{
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }}
    </style>
</head>
<body>
    <h1>{novel_content['title']}</h1>
    <p class="author">By {novel_content['author']}</p>
    
    <div class="novel-info">
        <h3>About This Novel</h3>
        <p><strong>Genre:</strong> {novel_content['story_details'].get('genre', 'Unknown')}</p>
        <p><strong>Time Period:</strong> {novel_content['story_details'].get('time_period', 'Unknown')}</p>
"""
        
        if novel_content['story_details'].get('plot_summary'):
            html_content += f"""
        <h4>Plot Summary</h4>
        <p>{novel_content['story_details'].get('plot_summary')}</p>
"""
        
        html_content += """
    </div>
"""
        
        # Add manuscript section
        html_content += """
    <h2>Manuscript</h2>
"""
        
        # Add chapters and scenes with new formatting
        for i, chapter in enumerate(novel_content['chapters']):
            # Format chapter header according to requirements
            chapter_title = chapter.get('title', '')
            if chapter_title:
                html_content += f"""
    <div class="manuscript-chapter" style="text-align: center;">
        <p>CHAPTER {chapter['number']}<br>
        {chapter_title}</p>
    </div>
"""
            else:
                html_content += f"""
    <div class="manuscript-chapter" style="text-align: center;">
        <p>CHAPTER {chapter['number']}</p>
    </div>
"""
            
            # Add all scenes with proper formatting
            html_content += """
    <div class="manuscript-content">
"""
            for j, scene in enumerate(chapter['scenes']):
                # Clean up any potential chapter/scene headers the AI might have added
                import re
                clean_scene = scene.replace("Chapter ", "").replace(f"{chapter['number']}:", "")
                clean_scene = re.sub(r'Scene \d+:?\s*', '', clean_scene)
                
                # Use a regular string for the HTML template, then format scene separately
                scene_content = clean_scene.replace('\n\n', '</p><p>')
                html_content += f"""
        <div class="scene">
            <p>{scene_content}</p>
        </div>
"""
                # Add scene separator if not the last scene
                if j < len(chapter['scenes']) - 1:
                    html_content += """
        <div class="scene-break" style="height: 1em;"></div>
"""
            
            html_content += """
    </div>
"""
            
            # Add chapter break if not the last chapter
            if i < len(novel_content['chapters']) - 1:
                html_content += """
    <div class="chapter-break" style="text-align: center; margin: 2em 0;">
        <p>====</p>
    </div>
"""
        
        html_content += """
</body>
</html>
"""
        
        return html_content
    
    def _format_txt(self, novel_content):
        """Format novel as plain text with the new manuscript formatting requirements"""
        txt_content = f"{novel_content['title'].upper()}\n"
        txt_content += f"By {novel_content['author']}\n\n"
        
        # Add story details
        txt_content += "ABOUT THIS NOVEL\n"
        txt_content += "----------------\n\n"
        story = novel_content['story_details']
        txt_content += f"Genre: {story.get('genre', 'Unknown')}\n"
        txt_content += f"Time Period: {story.get('time_period', 'Unknown')}\n\n"
        
        if story.get('plot_summary'):
            txt_content += "PLOT SUMMARY\n"
            txt_content += f"{story.get('plot_summary')}\n\n"
        
        # Add manuscript section header
        txt_content += "MANUSCRIPT\n"
        txt_content += "==========\n\n"
        
        # Process chapters and scenes with new formatting
        for i, chapter in enumerate(novel_content['chapters']):
            # Format chapter header according to requirements
            chapter_title = chapter.get('title', '')
            if chapter_title:
                txt_content += f"CHAPTER {chapter['number']}\n{chapter_title}\n\n"
            else:
                txt_content += f"CHAPTER {chapter['number']}\n\n"
            
            # Add all scenes with proper formatting
            for j, scene in enumerate(chapter['scenes']):
                # Clean up any potential chapter/scene headers the AI might have added
                import re
                clean_scene = scene.replace("Chapter ", "").replace(f"{chapter['number']}:", "")
                clean_scene = re.sub(r'Scene \d+:?\s*', '', clean_scene)
                
                # Add the clean scene text
                txt_content += clean_scene
                
                # Add scene separator if not the last scene
                if j < len(chapter['scenes']) - 1:
                    txt_content += "\n\n"  # Blank line between scenes
            
            # Add chapter break if not the last chapter
            if i < len(novel_content['chapters']) - 1:
                txt_content += "\n\n====\n\n"  # Chapter break marker
        
        return txt_content
    
    def generate_editing_suggestions(self, text, content_id, content_type="scene", novel_id=None):
        """
        Generate AI-powered editing and revision suggestions for a piece of text.
        
        Args:
            text (str): The text to analyze and provide suggestions for
            content_id (str): Identifier for the content (chapter number, scene ID, etc.)
            content_type (str): The type of content being analyzed (scene, chapter, character, etc.)
            novel_id (int, optional): The novel ID to save suggestions to database
            
        Returns:
            dict: A structured set of editing suggestions
        """
        if not text or len(text.strip()) < 100:
            return {
                "overall_assessment": "The provided text is too short for a meaningful analysis.",
                "strengths": [],
                "weaknesses": [],
                "suggestions": []
            }
            
        # Create a prompt tailored to the type of content
        content_specific_guidance = ""
        if content_type == "scene":
            content_specific_guidance = """
            Focus on these elements specific to scenes:
            - Scene pacing and tension
            - Sensory details and setting
            - Character interactions and dialogue effectiveness
            - Scene purpose and advancement of plot
            - Balance of showing vs telling
            """
        elif content_type == "chapter":
            content_specific_guidance = """
            Focus on these elements specific to chapters:
            - Chapter arc and structure
            - Hook and closing effectiveness
            - Character development
            - Advancement of plot and subplots
            - Theme development
            """
        elif content_type == "character":
            content_specific_guidance = """
            Focus on these elements specific to character descriptions:
            - Character depth and complexity
            - Distinctiveness of voice and personality
            - Character motivation clarity
            - Potential for growth and development
            - Relatability for YA audience
            """
        
        prompt = f"""
        As a professional fiction editor specializing in young adult novels, analyze the following text and provide detailed editing suggestions.
        
        {content_specific_guidance}
        
        The text to analyze:
        ```
        {text}
        ```
        
        Provide your analysis in the following categories:
        
        1. Overall Assessment: A brief paragraph summarizing the strengths and weaknesses of the piece.
        
        2. Key Strengths: Identify 2-4 specific elements that work well in the piece.
        
        3. Areas for Improvement: Identify 2-4 specific elements that could be improved.
        
        4. Specific Suggestions: Provide 3-5 actionable suggestions for improving the text, with concrete examples where possible.
        
        Format your response as a JSON object with these keys:
        - "overall_assessment": Your summary assessment (string)
        - "strengths": Array of strengths (array of strings)
        - "weaknesses": Array of areas to improve (array of strings)
        - "suggestions": Array of specific, actionable suggestions (array of strings)
        """
        
        system_message = """You are an experienced editor for young adult fiction with expertise in developmental editing,
        line editing, and substantive editing. Your feedback should be constructive, specific, and actionable.
        Follow the YA market conventions while preserving the author's unique voice. Balance positive feedback
        with areas for improvement."""
        
        try:
            suggestions = self._ai_completion(prompt, system_message, json_response=True)
            
            # Save to database if novel_id is provided
            if novel_id is not None:
                NovelDatabaseService.save_editing_suggestion(
                    novel_id, 
                    content_id, 
                    content_type, 
                    text, 
                    suggestions
                )
                
            return suggestions
        except Exception as e:
            print(f"Error generating editing suggestions: {str(e)}")
            return {
                "overall_assessment": "Unable to generate editing suggestions due to an error.",
                "strengths": [],
                "weaknesses": [],
                "suggestions": []
            }
    
    def generate_cover_design_prompt(self, story_details):
        """
        Generate a cover design prompt for the novel based on the story details.
        
        Args:
            story_details (dict): The story details including title, genre, theme, etc.
            
        Returns:
            str: A detailed cover design prompt
        """
        prompt = f"""
        Create a prompt for a front cover design for the novel "{self.title}" written by Elstran Books.

        Guidelines:
        – The cover should visually represent the core theme(s) of the novel—think mood, symbolism, and emotional tone.
        – Focus on evocative imagery that captures the heart of the story and intrigues potential readers.
        – Consider the genre, setting, and key motifs when building the scene.
        – Include lighting, color palette, character presence (if needed), and symbolic elements that help tell the story at a glance.

        Examples:
        – For Fantasy: Use magical symbols, kingdoms, or weather elements
        – For Thriller: Use high-contrast lighting, one character in danger, urban or remote settings
        – For Romance: Focus on emotional expressions, warm colors, and connection between characters

        Format the request like this:

        Design a front cover for the novel "{self.title}" by Elstran Books.
        This novel is a {story_details.get('genre', 'Young Adult')} story with themes of {story_details.get('story_theme', 'transformation and growth')}.
        The tone is {story_details.get('mood', 'reflective')} and the setting features {story_details.get('setting', 'a contemporary high school')}.
        The cover should feature [Main visual concept that captures the story's essence].
        Use a [Color palette/style] to reflect the mood of the story.
        Optional: Include [Symbols, background elements, or objects that represent the deeper themes].

        Make sure the title "{self.title}" and author name "Elstran Books" are clearly visible on the cover.
        """
        
        # Generate the cover design prompt using the story details
        system_message = """
        You are a professional book cover designer. Create a detailed, specific cover design 
        prompt for this novel. Focus on concrete visual elements, specific colors, and 
        imagery that represents the theme. Avoid generic descriptions and instead provide 
        actionable specifics that an illustrator could follow.
        """
        
        return self._ai_completion(prompt, system_message=system_message)
    
    def generate_novel_quotes(self, story_details, chapter_outline=None, all_scenes=None):
        """
        Generate impactful quotes from the novel for marketing and promotional purposes.
        
        Args:
            story_details (dict): The story details including title, genre, theme, etc.
            chapter_outline (list, optional): List of chapter objects with detailed information
            all_scenes (dict, optional): Dictionary mapping chapter titles to lists of scenes
            
        Returns:
            list: List of quote strings formatted for marketing purposes
        """
        # Ensure we have the required data
        if not all_scenes or not isinstance(all_scenes, dict):
            return ["No scenes available to extract quotes from."]
            
        # Get the novel title
        novel_title = self.title
        
        # Format the scenes into a simplified structure for the AI prompt
        formatted_scenes = []
        
        for chapter_title, scenes in all_scenes.items():
            # Extract chapter number if possible
            import re
            chapter_num = "?"
            match = re.search(r'Chapter\s+(\d+)', chapter_title)
            if match:
                chapter_num = match.group(1)
                
            # Add each scene with its chapter info
            for i, scene in enumerate(scenes, 1):
                scene_summary = scene[:500] + "..." if len(scene) > 500 else scene  # Truncate long scenes
                formatted_scenes.append(f"Chapter {chapter_num}: {chapter_title}, Scene {i}\n{scene_summary}\n")
        
        # Join scenes but limit total length to avoid token limits
        all_scenes_text = "\n".join(formatted_scenes)
        if len(all_scenes_text) > 12000:  # Reasonable token limit
            # Take 1/3 from beginning, 1/3 from middle, 1/3 from end
            third = len(formatted_scenes) // 3
            sample_scenes = formatted_scenes[:third] + formatted_scenes[third:2*third] + formatted_scenes[-third:]
            all_scenes_text = "\n".join(sample_scenes)
        
        # Create the prompt
        prompt = f"""
        Analyze the following novel content chapter by chapter and extract the most powerful, emotional, or impactful quotes that would work well for marketing and advertisement. For each quote, include:

        1. The quote itself (highlighting defiance, hope, resilience, or rebellion).
        2. The character who said it (or if it's narration, label it as such).
        3. The chapter number and scene (e.g., Chapter 3, Scene 1).
        4. The novel title ("{novel_title}") at the end.

        Format each entry like this:
        "Quote." — [Character/Narration], [Chapter #, Scene #], {novel_title}

        Focus on lines that are:
        - Defiant or rebellious
        - Emotionally charged
        - Poetic or vivid
        - Themes of hope, survival, or revolution
        - Short and punchy (good for social media)
        - Longer, profound lines (good for trailers or book blurbs)

        Ignore minor dialogue or filler text. Prioritize quotes that would grab a reader's attention and make them curious about the story.

        NOVEL CONTENT:
        {all_scenes_text}
        """
        
        system_message = f"""You are a literary agent skilled at identifying powerful quotes from novels that would work well for marketing and publicity. 
        Extract 10-15 impactful quotes from the novel sections provided, following the format requested precisely.
        Return the quotes as an array of properly formatted strings, not as a numbered list.
        """
        
        try:
            # Use a larger token limit for this operation
            response = self._ai_completion(prompt, system_message, json_response=False, max_tokens=2000)
            
            # Process the response - check if it's already a list or needs parsing
            if isinstance(response, list):
                return response
            
            # Otherwise parse the quotes from the text response
            quotes = []
            lines = response.strip().split('\n')
            for line in lines:
                line = line.strip()
                if line and line.startswith('"') and ' — ' in line:
                    quotes.append(line)
                elif line and line.startswith('"') and ' - ' in line:  # Alternative dash format
                    quotes.append(line.replace(' - ', ' — '))
            
            # If parsing didn't work, return the full response as a single item
            if not quotes:
                return [response]
                
            return quotes
        except Exception as e:
            print(f"Error generating novel quotes: {str(e)}")
            return [f"Error generating quotes: {str(e)}"]
    
    def generate_book_description(self, story_details, description_type='marketing', length_type='standard'):
        """
        Generate compelling book descriptions for marketing purposes.
        
        Args:
            story_details (dict): The story details including title, genre, theme, etc.
            description_type (str): Type of description (marketing, back_cover, pitch, elevator_pitch)
            length_type (str): Length variant (short, standard, long)
            
        Returns:
            str: The generated book description
        """
        # Extract key information from story details
        title = self.title
        genre = story_details.get('genre', 'Young Adult Fiction')
        theme = story_details.get('story_theme', 'Coming of age')
        main_character = story_details.get('main_character_name', 'the protagonist')
        central_conflict = story_details.get('central_conflict', 'a life-changing challenge')
        setting = story_details.get('setting', 'modern day')
        plot_summary = story_details.get('plot_summary', 'A compelling young adult story')
        target_age = story_details.get('target_age_range', '13-18')
        
        # Configure prompt based on description type and length
        if description_type == 'marketing':
            if length_type == 'short':
                word_limit = "50-75 words"
                focus = "hook-focused, high-impact, punchy"
            elif length_type == 'long':
                word_limit = "200-250 words"
                focus = "comprehensive, detailed character development and world-building"
            else:  # standard
                word_limit = "100-150 words"
                focus = "balanced between hook and detail"
                
        elif description_type == 'back_cover':
            word_limit = "150-200 words"
            focus = "compelling back-cover copy with strong hook and call-to-action"
            
        elif description_type == 'pitch':
            word_limit = "75-100 words"
            focus = "publisher/agent pitch emphasizing market appeal and unique elements"
            
        elif description_type == 'elevator_pitch':
            word_limit = "25-40 words"
            focus = "one-sentence elevator pitch capturing the essence"
        
        # Create targeted prompts based on YA bestseller conventions
        prompt = f"""
        Create a compelling {description_type} description for the Young Adult novel "{title}".
        
        **Novel Details:**
        - Genre: {genre}
        - Theme: {theme}
        - Main Character: {main_character}
        - Central Conflict: {central_conflict}
        - Setting: {setting}
        - Target Age: {target_age}
        - Plot Summary: {plot_summary}
        
        **Description Requirements:**
        - Length: {word_limit}
        - Style: {focus}
        - Must appeal to {target_age} year old readers and parents/educators
        - Include emotional hooks that resonate with teen experiences
        - Highlight stakes and consequences
        - Use active voice and vivid language
        - Create urgency and curiosity
        
        **YA Bestseller Elements to Include:**
        - Relatable protagonist facing real challenges
        - Emotional stakes that matter to teens
        - Promise of growth/transformation
        - Contemporary relevance
        - Strong voice and authenticity
        
        **Avoid:**
        - Adult literary fiction language
        - Overly complex plots explanations
        - Spoilers beyond first act
        - Cliché YA tropes without fresh perspective
        
        Write the description now:
        """
        
        system_message = f"""You are a bestselling YA book marketing expert who understands what makes Young Adult novels successful. 
        Create descriptions that would make teenagers pick up this book immediately.
        Focus on emotional resonance, authentic voice, and compelling stakes.
        Study successful YA book descriptions to understand the tone and structure that works.
        The description should feel authentic to the {genre} genre while appealing to {target_age} year olds."""
        
        try:
            # Generate the description
            description = self._ai_completion(prompt, system_message, max_tokens=800)
            
            # Clean up the response
            if isinstance(description, dict) and 'error' in description:
                return f"Error generating description: {description['error']}"
            
            # Ensure we return a clean string
            if isinstance(description, str):
                return description.strip()
            else:
                return str(description).strip()
                
        except Exception as e:
            print(f"Error generating book description: {str(e)}")
            return f"Error generating book description: {str(e)}"
    
    def _save_progress(self, stage, data):
        """Save generation progress to a file"""
        file_path = os.path.join(self.output_dir, f"{self.title}_{stage}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)


class SeriesGenerator:
    """
    A tool for managing and generating a series of related novels.
    Allows planning and creating up to 5 books with connected story arcs.
    """
    
    def __init__(self, series_title, series_description=None, num_books=3, model="gpt-4o", output_dir="output"):
        """
        Initialize the series generator.
        
        Args:
            series_title (str): Title of the series
            series_description (str, optional): Brief description of the series
            num_books (int, optional): Number of books in the series (max 5)
            model (str, optional): AI model to use
            output_dir (str, optional): Directory for output files
        """
        self.series_title = series_title
        self.series_description = series_description or f"A series titled {series_title}"
        self.num_books = min(5, max(1, num_books))  # Limit to 1-5 books
        self.model = model
        self.output_dir = output_dir
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.series_id = None
        self.book_titles = [None] * self.num_books
        self.novel_generators = {}
        
    def _ai_completion(self, prompt, system_message=None, json_response=False, max_tokens=None):
        """
        Get a completion from the OpenAI API.
        
        Args:
            prompt (str): The prompt to send to the API
            system_message (str, optional): System message to guide the AI
            json_response (bool): Whether to expect a JSON response
            max_tokens (int, optional): Maximum tokens to generate
            
        Returns:
            str or dict: The response from the API
        """
        messages = []
        
        if system_message:
            messages.append({"role": "system", "content": system_message})
            
        messages.append({"role": "user", "content": prompt})
        
        kwargs = {
            "model": self.model,
            "messages": messages,
        }
        
        # Set default max tokens (reduced from 8000 to 4000 to avoid token limits)
        if max_tokens:
            kwargs["max_tokens"] = max_tokens
        else:
            kwargs["max_tokens"] = 4000
            
        if json_response:
            kwargs["response_format"] = {"type": "json_object"}
        
        # Add retries for API calls
        max_retries = 3
        retry_delay = 5  # seconds
        
        for attempt in range(max_retries):
            try:
                response = self.client.chat.completions.create(**kwargs)
                content = response.choices[0].message.content
                
                if json_response:
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError as json_err:
                        print(f"JSON parsing error: {str(json_err)}")
                        # If JSON parsing fails but we expected JSON, return a simple dict
                        if attempt == max_retries - 1:  # Last attempt
                            return {"error": f"Failed to parse JSON response: {str(json_err)}"}
                        # Try again
                        time.sleep(retry_delay)
                        continue
                
                return content
                
            except Exception as e:
                print(f"Series Generator API error (attempt {attempt+1}/{max_retries}): {str(e)}")
                if attempt < max_retries - 1:
                    # Wait before retrying
                    time.sleep(retry_delay)
                    # Increase delay for next attempt
                    retry_delay *= 2
                else:
                    # Last attempt failed, return error message
                    if json_response:
                        return {"error": f"API error after {max_retries} attempts: {str(e)}"}
                    return f"Error generating series content: {str(e)}"
    
    def create_series(self):
        """
        Create a new series in the database and return the series ID.
        
        Returns:
            int: The ID of the created series
        """
        if not self.series_id:
            self.series_id = NovelDatabaseService.create_series(
                title=self.series_title,
                description=self.series_description,
                num_books=self.num_books
            )
        return self.series_id
    
    def generate_series_arc(self):
        """
        Generate the overall series arc, character development across books, and themes.
        
        Returns:
            dict: Series arc information
        """
        prompt = f"""
Create a comprehensive series arc plan for a {self.num_books}-book series titled "{self.series_title}".
{self.series_description if self.series_description else ""}

Your response should be structured as JSON with the following fields:
1. "overall_arc": A detailed description of how the series story develops across all {self.num_books} books.
2. "character_arcs": A dictionary of key characters and how they develop over the entire series.
3. "themes": A list of major themes and how they evolve across the series.
4. "continuity_notes": Important notes for maintaining continuity between books.
5. "book_titles": A list of suggested titles for each book in the series (exactly {self.num_books} titles).

The json should look like:
{{
  "overall_arc": "The series follows...",
  "character_arcs": {{
    "Character 1": "This character's journey...",
    "Character 2": "Their development involves..."
  }},
  "themes": [
    "Theme 1: How it develops across books...",
    "Theme 2: Its evolution throughout the series..."
  ],
  "continuity_notes": "Important elements to maintain consistency...",
  "book_titles": ["Title for Book 1", "Title for Book 2", ...]
}}

Ensure all suggested book titles are appropriate for the series and create a cohesive progression.
"""
        
        series_arc = self._ai_completion(
            prompt,
            system_message="You are an expert series planner who specializes in creating cohesive multi-book series with compelling character arcs and evolving themes across 2-5 books. Focus on creating a balanced, engaging series structure.",
            json_response=True
        )
        
        # Save the series arc to the database if we have a series ID
        if self.series_id and series_arc:
            NovelDatabaseService.save_series_arcs(
                series_id=self.series_id,
                overall_arc=series_arc.get("overall_arc", ""),
                character_arcs=series_arc.get("character_arcs", {}),
                themes=series_arc.get("themes", []),
                continuity_notes=series_arc.get("continuity_notes", "")
            )
            
            # Store the suggested book titles
            self.book_titles = series_arc.get("book_titles", [""] * self.num_books)
            # Make sure we have exactly num_books titles
            if len(self.book_titles) < self.num_books:
                self.book_titles.extend([""] * (self.num_books - len(self.book_titles)))
            elif len(self.book_titles) > self.num_books:
                self.book_titles = self.book_titles[:self.num_books]
        
        return series_arc
    
    def create_novel_generator(self, book_number, title=None):
        """
        Create a novel generator for a specific book in the series.
        
        Args:
            book_number (int): The position of the book in the series (1-5)
            title (str, optional): Title for this book, otherwise uses the title from series arc
            
        Returns:
            NovelAutomationTool: Configured novel generator for this book
        """
        if not 1 <= book_number <= self.num_books:
            raise ValueError(f"Book number must be between 1 and {self.num_books}")
        
        idx = book_number - 1  # Convert to 0-based index
        
        # Use provided title or fall back to generated title
        book_title = title or self.book_titles[idx] or f"{self.series_title} - Book {book_number}"
        
        # Create the novel generator
        generator = NovelAutomationTool(
            title=book_title,
            model=self.model,
            output_dir=f"{self.output_dir}/{sanitize_filename(self.series_title)}/book_{book_number}"
        )
        
        self.novel_generators[idx] = generator
        return generator
    
    def get_series_context(self, book_number):
        """
        Get context information for a specific book in the series.
        
        Args:
            book_number (int): The position of the book in the series
            
        Returns:
            dict: Context information for this book
        """
        if not self.series_id:
            return {}
        
        # Get series arcs from the database
        series_arcs = NovelDatabaseService.get_series_arcs(self.series_id)
        if not series_arcs:
            return {}
        
        # Get all books in the series prior to this one
        series_novels = NovelDatabaseService.get_series_novels(self.series_id)
        prior_books = [novel for novel in series_novels if novel.get('book_number', 0) < book_number]
        
        context = {
            "series_title": self.series_title,
            "book_number": book_number,
            "total_books": self.num_books,
            "series_arc": series_arcs.get("overall_arc", ""),
            "character_arcs": series_arcs.get("character_arcs", {}),
            "themes": series_arcs.get("themes", []),
            "continuity_notes": series_arcs.get("continuity_notes", ""),
            "prior_books": []
        }
        
        # Add information about prior books if available
        for prior_book in prior_books:
            book_id = prior_book.get('id')
            if book_id:
                book_info = {
                    "title": prior_book.get('title', ''),
                    "synopsis": NovelDatabaseService.get_novel_synopsis(book_id),
                    "character_profiles": NovelDatabaseService.get_character_profiles(book_id)
                }
                context["prior_books"].append(book_info)
        
        return context
