import streamlit as st
import os
import json
import time
import html
from pathlib import Path
from novel_generator import NovelAutomationTool
from utils import create_output_directory
from db_service import NovelDatabaseService

# Set page configuration
st.set_page_config(
    page_title="YA Novel Generator",
    page_icon="📚",
    layout="wide"
)

# Create output directory if it doesn't exist
output_dir = "output"
create_output_directory(output_dir)

# Check for OpenAI API key
if "OPENAI_API_KEY" not in os.environ:
    st.warning("⚠️ OpenAI API key not found in environment variables. Please enter your API key below.")
    api_key = st.text_input("OpenAI API Key", type="password", help="Your API key starts with 'sk-'")
    if api_key:
        os.environ["OPENAI_API_KEY"] = api_key
        st.success("✅ API key set successfully! You can now generate content.")
        time.sleep(1)
        st.rerun()

def display_header():
    st.title("📚 Young Adult Novel Generator")
    st.markdown("""
    Create compelling YA novels with AI assistance. This tool will help you generate:
    - Young adult story concepts with themes, characters, and conflict
    - Chapter structures tailored for teen readers (18-25 chapters)
    - Complete scene-by-scene content with engaging dialogue
    - Formatted novel output ready to share (Markdown, HTML, TXT)
    """)

def display_settings():
    with st.expander("⚙️ Generator Settings", expanded=True):
        col1, col2 = st.columns(2)
        
        with col1:
            title = st.text_input("Novel Title", value="", help="Enter a title for your novel")
            model = st.selectbox(
                "AI Model", 
                options=["gpt-4o", "gpt-4", "gpt-3.5-turbo"],
                index=0,
                help="Select the AI model to use for generation"
            )
        
        with col2:
            max_scene_length = st.slider(
                "Maximum Scene Length", 
                min_value=500, 
                max_value=2000, 
                value=1000,
                step=100,
                help="Maximum word count for each scene"
            )
            
            min_scene_length = st.slider(
                "Minimum Scene Length", 
                min_value=100, 
                max_value=500, 
                value=300,
                step=50,
                help="Minimum word count for each scene"
            )
    
    return {
        "title": title.strip(),
        "model": model,
        "max_scene_length": max_scene_length,
        "min_scene_length": min_scene_length
    }

def display_story_details(story_details=None):
    with st.expander("📝 Young Adult Novel Concept", expanded=not bool(story_details)):
        if story_details:
            try:
                # Display in a more organized format
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("Core Concept")
                    st.markdown(f"**Theme:** {story_details.get('story_theme', 'N/A')}")
                    st.markdown(f"**Genre:** {story_details.get('genre', 'N/A')}")
                    st.markdown(f"**Central Concept:** {story_details.get('central_concept', 'N/A')}")
                    st.markdown(f"**Target Age Range:** {story_details.get('target_age_range', 'N/A')}")
                    st.markdown(f"**Word Count:** {story_details.get('estimated_word_count', 'N/A')}")
                    st.markdown(f"**Narrative Style:** {story_details.get('narrative_style', 'N/A')}")
                
                with col2:
                    st.subheader("Characters & Setting")
                    st.markdown(f"**Main Character:** {story_details.get('main_character_name', 'N/A')}")
                    st.markdown(f"**Central Conflict:** {story_details.get('central_conflict', 'N/A')}")
                    st.markdown(f"**Setting:** {story_details.get('setting', 'N/A')}")
                    st.markdown(f"**Time Period:** {story_details.get('time_period', 'N/A')}")
                
                st.subheader("Supporting Characters")
                supporting_chars = story_details.get('supporting_characters', [])
                if isinstance(supporting_chars, list):
                    for char in supporting_chars:
                        if isinstance(char, dict):
                            st.markdown(f"- **{char.get('name', 'Character')}**: {char.get('description', '')}")
                        else:
                            st.markdown(f"- {char}")
                else:
                    st.markdown(supporting_chars)
                
                st.subheader("Plot Summary")
                st.markdown(story_details.get('plot_summary', 'No plot summary available.'))
                
                # Advanced: View raw JSON with a checkbox instead of expander
                if st.checkbox("View Raw JSON Data", False):
                    st.json(story_details)
                    
                if st.button("♻️ Regenerate Story Details", key="regenerate_story"):
                    return True
            except Exception as e:
                st.error(f"Error displaying story details: {str(e)}")
                st.json(story_details)
                if st.button("♻️ Regenerate Story Details", key="regenerate_story_error"):
                    return True
        else:
            st.info("Generate story details to create your YA novel's foundation.")
        return False

def display_premises_and_endings(premises_data=None):
    with st.expander("💡 Premises & Endings", expanded=not bool(premises_data)):
        if premises_data:
            try:
                col1, col2 = st.columns([2, 3])
                
                with col1:
                    st.subheader("Potential Premises")
                    premises = premises_data.get('premises', [])
                    for i, premise in enumerate(premises, 1):
                        st.markdown(f"**{i}.** {premise}")
                
                with col2:
                    st.subheader("Chosen Premise")
                    st.markdown(f"**{premises_data.get('chosen_premise', 'No premise chosen')}**")
                    
                    # Display the best ending if it exists
                    chosen_ending = premises_data.get('chosen_ending', '')
                    if chosen_ending:
                        st.subheader("The Ending (For Future Prompts)")
                        st.markdown(f"**{chosen_ending}**")
                        st.markdown("---")
                        
                    st.subheader("Potential Endings")
                    endings = premises_data.get('potential_endings', [])
                    for i, ending in enumerate(endings, 1):
                        st.markdown(f"**{i}.** {ending}")
                        
                if st.button("♻️ Regenerate Premises & Endings", key="regen_premises_btn"):
                    return True
            except Exception as e:
                st.error(f"Error displaying premises and endings: {str(e)}")
                if st.button("♻️ Regenerate Premises & Endings", key="regen_premises_error_btn"):
                    return True
        else:
            st.info("Generate premises and endings to explore possible story directions.")
        return False

def display_novel_synopsis(synopsis=None):
    with st.expander("📑 Novel Synopsis", expanded=not bool(synopsis)):
        if synopsis:
            try:
                st.markdown(synopsis)
                if st.button("♻️ Regenerate Synopsis", key="regen_synopsis_btn"):
                    return True
            except Exception as e:
                st.error(f"Error displaying synopsis: {str(e)}")
                if st.button("♻️ Regenerate Synopsis", key="regen_synopsis_error_btn"):
                    return True
        else:
            st.info("Generate a detailed three-act structure synopsis for your novel.")
        return False

def display_character_profiles(profiles=None):
    with st.expander("👤 Character Profiles", expanded=not bool(profiles)):
        if profiles:
            try:
                st.markdown(profiles)
                if st.button("♻️ Regenerate Character Profiles", key="regen_profiles_btn"):
                    return True
            except Exception as e:
                st.error(f"Error displaying character profiles: {str(e)}")
                if st.button("♻️ Regenerate Character Profiles", key="regen_profiles_error_btn"):
                    return True
        else:
            st.info("Generate comprehensive character profiles for your novel.")
        return False

def display_novel_plan(plan=None):
    with st.expander("📋 Novel Plan", expanded=not bool(plan)):
        if plan:
            try:
                st.markdown(plan)
                if st.button("♻️ Regenerate Novel Plan", key="regen_plan_btn"):
                    return True
            except Exception as e:
                st.error(f"Error displaying novel plan: {str(e)}")
                if st.button("♻️ Regenerate Novel Plan", key="regen_plan_error_btn"):
                    return True
        else:
            st.info("Generate a detailed novel plan including structure, character arcs, and pacing.")
        return False

def display_chapter_outline(chapter_outline=None):
    with st.expander("📑 Chapter Outline", expanded=not bool(chapter_outline)):
        if chapter_outline:
            for chapter in chapter_outline:
                try:
                    # Check if chapter is a dictionary, otherwise convert it
                    if isinstance(chapter, str):
                        try:
                            chapter = json.loads(chapter)
                        except json.JSONDecodeError:
                            st.error(f"Invalid chapter data format: {chapter[:50]}...")
                            continue
                    
                    with st.container():
                        st.subheader(f"Chapter {chapter.get('number', '?')}: {chapter.get('title', 'Untitled')}")
                        
                        # Display POV
                        if chapter.get('pov'):
                            st.markdown(f"**POV:** {chapter['pov']}")
                        
                        # Display new fields from updated prompt
                        if chapter.get('summary'):
                            st.markdown(f"**Summary:** {chapter['summary']}")
                            
                        if chapter.get('emotional_development'):
                            st.markdown(f"**Emotional Development:** {chapter['emotional_development']}")
                            
                        if chapter.get('theme_focus'):
                            st.markdown(f"**Theme Focus:** {chapter['theme_focus']}")
                        
                        # Display events
                        if chapter.get('events'):
                            st.markdown("**Key Events:**")
                            for event in chapter['events']:
                                st.markdown(f"- {event}")
                        
                        # Handle both word_count and estimated_word_count
                        word_count = None
                        if chapter.get('estimated_word_count'):
                            word_count = chapter['estimated_word_count']
                        elif chapter.get('word_count'):
                            word_count = chapter['word_count']
                            
                        if word_count:
                            st.caption(f"Estimated word count: {word_count}")
                            
                        st.divider()
                except Exception as e:
                    st.error(f"Error displaying chapter: {str(e)}")
            
            if st.button("♻️ Regenerate Chapter Outline", key="regenerate_outline"):
                return True
        else:
            st.info("Generate a chapter outline based on your novel plan.")
        return False

def display_chapter_guide(chapter_guide=None, chapter_outline=None):
    with st.expander("📝 Chapter Writing Guide", expanded=not bool(chapter_guide)):
        if chapter_guide and chapter_outline:
            # Create tabs for each chapter
            chapter_numbers = sorted(list(chapter_guide.keys()), key=lambda x: int(x))
            if not chapter_numbers:
                st.info("No chapter guide available. Generate a chapter outline first, then create a chapter guide.")
                return False
                
            chapter_tabs = st.tabs([f"Chapter {num}" for num in chapter_numbers])
            
            # Display each chapter's guide
            for i, chapter_num in enumerate(chapter_numbers):
                with chapter_tabs[i]:
                    # Find the corresponding chapter from outline
                    chapter_info = None
                    for ch in chapter_outline:
                        if str(ch.get('number')) == chapter_num:
                            chapter_info = ch
                            break
                    
                    # If chapter found in outline, display title
                    if chapter_info:
                        st.subheader(f"Chapter {chapter_num}: {chapter_info.get('title', 'Untitled')}")
                    else:
                        st.subheader(f"Chapter {chapter_num}")
                    
                    # Display chapter guide elements
                    chapter_data = chapter_guide[chapter_num]
                    
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        st.markdown("### 🎯 Scene Goal")
                        st.markdown(chapter_data.get('scene_goal', 'No scene goal specified'))
                        
                        st.markdown("### 💬 Key Dialogue")
                        dialogue = chapter_data.get('key_dialogue', [])
                        if dialogue:
                            for line in dialogue:
                                st.markdown(f"- {line}")
                        else:
                            st.markdown("No key dialogue specified")
                            
                        st.markdown("### 🔄 Emotional Pacing")
                        st.markdown(chapter_data.get('emotional_pacing', 'No emotional pacing specified'))
                    
                    with col2:
                        st.markdown("### 🔍 Sensory Details")
                        sensory = chapter_data.get('sensory_details', [])
                        if sensory:
                            for detail in sensory:
                                st.markdown(f"- {detail}")
                        else:
                            st.markdown("No sensory details specified")
                        
                        st.markdown("### 🔮 Foreshadowing")
                        foreshadowing = chapter_data.get('foreshadowing', [])
                        if foreshadowing:
                            for hint in foreshadowing:
                                st.markdown(f"- {hint}")
                        else:
                            st.markdown("No foreshadowing specified")
                        
                        st.markdown("### 🏺 Symbolism")
                        symbolism = chapter_data.get('symbolism', [])
                        if symbolism:
                            for symbol in symbolism:
                                st.markdown(f"- {symbol}")
                        else:
                            st.markdown("No symbolism specified")
            
            if st.button("♻️ Regenerate Chapter Guide", key="regenerate_guide"):
                return True
        else:
            st.info("Generate a chapter guide after creating a chapter outline.")
        return False

def display_chapter_beats(chapter_beats=None, chapter_outline=None):
    with st.expander("🔄 Chapter Action Beats", expanded=not bool(chapter_beats)):
        if chapter_beats and chapter_outline:
            try:
                # Create tabs for each chapter
                chapter_numbers = sorted(list(chapter_beats.keys()), key=lambda x: int(x) if x.isdigit() else float('inf'))
                if not chapter_numbers:
                    st.info("No chapter beats available. Generate a chapter guide first, then create action beats.")
                    return False
                    
                chapter_tabs = st.tabs([f"Chapter {num}" for num in chapter_numbers])
                
                # Display each chapter's beats
                for i, chapter_num in enumerate(chapter_numbers):
                    with chapter_tabs[i]:
                        # Find the corresponding chapter from outline
                        chapter_info = None
                        for ch in chapter_outline:
                            if str(ch.get('number')) == chapter_num:
                                chapter_info = ch
                                break
                        
                        # If chapter found in outline, display title
                        if chapter_info:
                            st.subheader(f"Chapter {chapter_num}: {chapter_info.get('title', 'Untitled')}")
                        else:
                            st.subheader(f"Chapter {chapter_num}")
                        
                        # Display beats
                        beats = chapter_beats[chapter_num]
                        if beats:
                            for beat in beats:
                                with st.container(border=True):
                                    col1, col2 = st.columns([1, 3])
                                    with col1:
                                        st.markdown(f"### Beat {beat.get('beat_number', 'N/A')}")
                                    with col2:
                                        st.markdown(f"**Action:** {beat.get('action', 'No action specified')}")
                                    
                                    st.markdown(f"**Emotional Impact:** {beat.get('emotional_impact', 'No impact specified')}")
                                    st.markdown(f"**Tension/Hook:** {beat.get('tension_hook', 'No hook specified')}")
                        else:
                            st.warning(f"No action beats available for Chapter {chapter_num}")
                
                if st.button("♻️ Regenerate Chapter Beats", key="regen_beats_btn"):
                    return True
            except Exception as e:
                st.error(f"Error displaying chapter beats: {str(e)}")
                if st.button("♻️ Regenerate Chapter Beats", key="regen_beats_error_btn"):
                    return True
        else:
            st.info("Generate detailed action beats for each chapter with emotional impacts and tension hooks.")
        return False

def display_scenes(all_scenes=None):
    with st.expander("📖 Generated Scenes", expanded=not bool(all_scenes)):
        if all_scenes:
            try:
                # Make sure all_scenes is a dictionary
                if not isinstance(all_scenes, dict):
                    if isinstance(all_scenes, str):
                        try:
                            all_scenes = json.loads(all_scenes)
                            if not isinstance(all_scenes, dict):
                                all_scenes = {"Chapter 1": [all_scenes]}
                        except Exception:
                            all_scenes = {"Chapter 1": [all_scenes]}
                    else:
                        all_scenes = {"Chapter 1": ["Invalid scene data format"]}
                
                # Create tabs for each chapter
                chapter_titles = list(all_scenes.keys())
                chapter_tabs = st.tabs([title for title in chapter_titles])
                
                # Display each chapter's scenes
                for i, title in enumerate(chapter_titles):
                    with chapter_tabs[i]:
                        scenes = all_scenes[title]
                        if isinstance(scenes, list):
                            for j, scene in enumerate(scenes, 1):
                                st.subheader(f"Scene {j}")
                                st.markdown(scene)
                                if j < len(scenes):
                                    st.divider()
                        else:
                            st.warning(f"Invalid scene data format for {title}: {type(scenes)}")
                
                if st.button("♻️ Regenerate All Scenes", key="regenerate_scenes"):
                    return True
            except Exception as e:
                st.error(f"Error displaying scenes: {str(e)}")
                if st.button("♻️ Regenerate All Scenes", key="regenerate_scenes_error"):
                    return True
        else:
            st.info("Generate all scenes based on chapter beats for complete novel content.")
        return False

def display_novel_output(novel_formats=None):
    with st.expander("📘 Complete Novel", expanded=not bool(novel_formats)):
        if novel_formats:
            try:
                # Create tabs for each format
                format_tabs = st.tabs(["Markdown", "HTML", "Plain Text", "Download"])
                
                with format_tabs[0]:
                    markdown_text = novel_formats.get('markdown', "No Markdown format available.")
                    st.markdown(markdown_text[:3000] + "... (truncated for display)")
                    if st.button("Copy Markdown to Clipboard", key="copy_md"):
                        st.code(markdown_text)
                        st.success("Copied to clipboard! Use Ctrl+C to copy the content.")
                
                with format_tabs[1]:
                    html_text = novel_formats.get('html', "<p>No HTML format available.</p>")
                    st.code(html_text[:3000] + "... (truncated for display)", language="html")
                    if st.button("Copy HTML to Clipboard", key="copy_html"):
                        st.code(html_text)
                        st.success("Copied to clipboard! Use Ctrl+C to copy the content.")
                
                with format_tabs[2]:
                    txt_text = novel_formats.get('txt', "No text format available.")
                    st.text(txt_text[:3000] + "... (truncated for display)")
                    if st.button("Copy Text to Clipboard", key="copy_txt"):
                        st.code(txt_text)
                        st.success("Copied to clipboard! Use Ctrl+C to copy the content.")
                
                with format_tabs[3]:
                    if st.button("Download Markdown Format", key="dl_md"):
                        md_content = novel_formats.get('markdown', "No content available")
                        md_title = html.escape(st.session_state.state.get('title', 'novel'))
                        st.download_button(
                            label="Click to Download Markdown",
                            data=md_content,
                            file_name=f"{md_title}.md",
                            mime="text/markdown",
                            key="dl_md_btn"
                        )
                    
                    if st.button("Download HTML Format", key="dl_html"):
                        html_content = novel_formats.get('html', "<p>No content available</p>")
                        html_title = html.escape(st.session_state.state.get('title', 'novel'))
                        st.download_button(
                            label="Click to Download HTML",
                            data=html_content,
                            file_name=f"{html_title}.html",
                            mime="text/html",
                            key="dl_html_btn"
                        )
                    
                    if st.button("Download Plain Text Format", key="dl_txt"):
                        txt_content = novel_formats.get('txt', "No content available")
                        txt_title = html.escape(st.session_state.state.get('title', 'novel'))
                        st.download_button(
                            label="Click to Download Plain Text",
                            data=txt_content,
                            file_name=f"{txt_title}.txt",
                            mime="text/plain",
                            key="dl_txt_btn"
                        )
                
                if st.button("♻️ Regenerate Novel Formats", key="regenerate_formats"):
                    st.session_state.state.update({"novel_formats": None})
                    st.rerun()
                        
            except Exception as e:
                st.error(f"Error displaying novel formats: {str(e)}")
        else:
            st.info("Format the complete novel for download after generating all scenes.")

def display_generation_progress():
    # Count completed steps
    state = st.session_state.state
    total_steps = 9
    completed_steps = 0
    
    if state.get("story_details"):
        completed_steps += 1
    if state.get("premises_and_endings"):
        completed_steps += 1
    if state.get("novel_synopsis"):
        completed_steps += 1
    if state.get("character_profiles"):
        completed_steps += 1
    if state.get("novel_plan"):
        completed_steps += 1
    if state.get("chapter_outline"):
        completed_steps += 1
    if state.get("chapter_guide"):
        completed_steps += 1
    if state.get("chapter_beats"):
        completed_steps += 1
    if state.get("all_scenes"):
        completed_steps += 1
    
    # Add one more if novel formats is available
    total_steps += 1 if state.get("novel_formats") else 0
    
    # Calculate percentage
    progress_pct = int((completed_steps / total_steps) * 100)
    
    # Display progress bar
    st.progress(progress_pct, text=f"Generated {completed_steps} of {total_steps} elements ({progress_pct}%)")

def main():
    display_header()
    
    # Initialize session state
    if "state" not in st.session_state:
        st.session_state.state = {
            "novel_id": None,
            "title": "",
            "story_details": None,
            "premises_and_endings": None,
            "novel_synopsis": None,
            "character_profiles": None,
            "novel_plan": None,
            "chapter_outline": None,
            "chapter_guide": None,
            "chapter_beats": None,
            "all_scenes": None,
            "novel_formats": None
        }
    
    # Sidebar for novel management
    with st.sidebar:
        st.header("📂 Novel Management")
        novels = NovelDatabaseService.list_novels()
        
        if novels:
            novel_options = [f"{novel['title']} (ID: {novel['id']})" for novel in novels]
            selected_novel = st.selectbox("Load Existing Novel", ["Create New Novel"] + novel_options)
            
            if selected_novel != "Create New Novel":
                novel_id = int(selected_novel.split("ID: ")[1].replace(")", ""))
                
                if st.button("Load Novel"):
                    novel = NovelDatabaseService.get_novel(novel_id)
                    if novel:
                        st.session_state.state.update({
                            "novel_id": novel_id,
                            "title": novel['title'],
                            "story_details": novel.get("story_details"),
                            "premises_and_endings": NovelDatabaseService.get_premises_and_endings(novel_id),
                            "novel_synopsis": NovelDatabaseService.get_novel_synopsis(novel_id),
                            "character_profiles": NovelDatabaseService.get_character_profiles(novel_id),
                            "novel_plan": NovelDatabaseService.get_novel_plan(novel_id),
                            "chapter_outline": NovelDatabaseService.get_chapter_outline(novel_id),
                            "chapter_guide": NovelDatabaseService.get_chapter_guide(novel_id),
                            "chapter_beats": NovelDatabaseService.get_chapter_beats(novel_id),
                            "all_scenes": NovelDatabaseService.get_all_scenes(novel_id),
                            "novel_formats": NovelDatabaseService.get_novel_formats(novel_id)
                        })
                        st.rerun()
                
                if st.button("Delete Novel", type="secondary"):
                    if NovelDatabaseService.delete_novel(novel_id):
                        st.rerun()

    # Get settings
    settings = display_settings()
    st.session_state.state["title"] = settings["title"]
    
    # Display generation progress
    display_generation_progress()
    
    # 1. Story Details - Button followed by display
    if st.button("Generate Story Details", disabled=not settings["title"], key="gen_story"):
        with st.spinner("Creating story foundation..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                if not st.session_state.state.get("novel_id"):
                    novel_id = NovelDatabaseService.create_novel(
                        title=settings["title"],
                        model=settings["model"],
                        max_scene_length=settings["max_scene_length"],
                        min_scene_length=settings["min_scene_length"]
                    )
                    st.session_state.state["novel_id"] = novel_id
                
                story_details = tool.generate_story_details()
                st.session_state.state["story_details"] = story_details
                NovelDatabaseService.save_story_details(st.session_state.state["novel_id"], story_details)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating story: {str(e)}")
    
    # Check regeneration requests for Story Details
    if display_story_details(st.session_state.state.get("story_details")):
        st.session_state.state.update({
            "story_details": None,
            "premises_and_endings": None,
            "novel_synopsis": None,
            "character_profiles": None,
            "novel_plan": None,
            "chapter_outline": None,
            "chapter_guide": None,
            "chapter_beats": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 2. Premises & Endings - Button followed by display
    if st.button("Generate Premises & Endings", 
                disabled=not st.session_state.state.get("story_details"),
                key="gen_premises"):
        with st.spinner("Creating novel premises and possible endings..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                premises_data = tool.generate_premises_and_endings(st.session_state.state["story_details"])
                st.session_state.state["premises_and_endings"] = premises_data
                NovelDatabaseService.save_premises_and_endings(st.session_state.state["novel_id"], premises_data)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating premises and endings: {str(e)}")
    
    # Check regeneration requests for Premises & Endings        
    if display_premises_and_endings(st.session_state.state.get("premises_and_endings")):
        st.session_state.state.update({
            "premises_and_endings": None,
            "novel_synopsis": None,
            "character_profiles": None,
            "novel_plan": None,
            "chapter_outline": None,
            "chapter_guide": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 3. Novel Synopsis - Button followed by display
    if st.button("Generate Novel Synopsis", 
                disabled=not st.session_state.state.get("premises_and_endings"),
                key="gen_synopsis"):
        with st.spinner("Creating detailed three-act novel synopsis..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass the premises and endings data to the tool
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                novel_synopsis = tool.generate_novel_synopsis(st.session_state.state["story_details"])
                st.session_state.state["novel_synopsis"] = novel_synopsis
                NovelDatabaseService.save_novel_synopsis(st.session_state.state["novel_id"], novel_synopsis)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating novel synopsis: {str(e)}")
    
    # Check regeneration requests for Novel Synopsis
    if display_novel_synopsis(st.session_state.state.get("novel_synopsis")):
        st.session_state.state.update({
            "novel_synopsis": None,
            "character_profiles": None,
            "novel_plan": None,
            "chapter_outline": None,
            "chapter_guide": None,
            "chapter_beats": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 4. Character Profiles - Button followed by display
    if st.button("Generate Character Profiles", 
                disabled=not st.session_state.state.get("novel_synopsis"),
                key="gen_profiles"):
        with st.spinner("Creating comprehensive character profiles..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass the premises and endings data to the tool
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                # Pass the novel synopsis to the tool
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                
                character_profiles = tool.generate_character_profiles(st.session_state.state["story_details"])
                st.session_state.state["character_profiles"] = character_profiles
                NovelDatabaseService.save_character_profiles(st.session_state.state["novel_id"], character_profiles)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating character profiles: {str(e)}")
    
    # Check regeneration requests for Character Profiles
    if display_character_profiles(st.session_state.state.get("character_profiles")):
        st.session_state.state.update({
            "character_profiles": None,
            "novel_plan": None,
            "chapter_outline": None,
            "chapter_guide": None,
            "chapter_beats": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 5. Novel Plan - Button followed by display
    if st.button("Generate Novel Plan", 
                disabled=not st.session_state.state.get("character_profiles"),
                key="gen_plan"):
        with st.spinner("Creating structured novel plan..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass the premises and endings data to the tool
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                # Pass the novel synopsis and character profiles to the tool
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                if st.session_state.state.get("character_profiles"):
                    tool._character_profiles = st.session_state.state["character_profiles"]
                
                novel_plan = tool.generate_novel_plan(st.session_state.state["story_details"])
                st.session_state.state["novel_plan"] = novel_plan
                NovelDatabaseService.save_novel_plan(st.session_state.state["novel_id"], novel_plan)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating novel plan: {str(e)}")
    
    # Check regeneration requests for Novel Plan        
    if display_novel_plan(st.session_state.state.get("novel_plan")):
        st.session_state.state.update({
            "novel_plan": None,
            "chapter_outline": None,
            "chapter_guide": None,
            "chapter_beats": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 6. Chapter Outline - Button followed by display
    if st.button("Generate Chapter Outline", 
                disabled=not st.session_state.state.get("novel_plan"),
                key="gen_chapters"):
        with st.spinner("Creating detailed chapter outline..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass the premises and endings data to the tool
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                # Pass the novel synopsis and character profiles to the tool
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                if st.session_state.state.get("character_profiles"):
                    tool._character_profiles = st.session_state.state["character_profiles"]
                if st.session_state.state.get("novel_plan"):
                    tool._novel_plan = st.session_state.state["novel_plan"]
                    
                chapter_outline = tool.generate_chapter_outline(st.session_state.state["story_details"])
                st.session_state.state["chapter_outline"] = chapter_outline
                NovelDatabaseService.save_chapter_outline(st.session_state.state["novel_id"], chapter_outline)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating chapter outline: {str(e)}")
    
    # Check regeneration requests for Chapter Outline    
    if display_chapter_outline(st.session_state.state.get("chapter_outline")):
        st.session_state.state.update({
            "chapter_outline": None,
            "chapter_guide": None,
            "chapter_beats": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 7. Chapter Guide - Button followed by display
    if st.button("Generate Chapter Guide", 
               disabled=not st.session_state.state.get("chapter_outline"),
               key="gen_chapter_guide"):
        with st.spinner("Creating detailed chapter-by-chapter guide..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass the premises and endings data to the tool
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                # Pass the novel synopsis and character profiles to the tool
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                if st.session_state.state.get("character_profiles"):
                    tool._character_profiles = st.session_state.state["character_profiles"]
                if st.session_state.state.get("novel_plan"):
                    tool._novel_plan = st.session_state.state["novel_plan"]
                
                chapter_guide = tool.generate_chapter_guide(st.session_state.state["chapter_outline"])
                st.session_state.state["chapter_guide"] = chapter_guide
                NovelDatabaseService.save_chapter_guide(st.session_state.state["novel_id"], chapter_guide)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating chapter guide: {str(e)}")
    
    # Check regeneration requests for Chapter Guide
    if display_chapter_guide(st.session_state.state.get("chapter_guide"), st.session_state.state.get("chapter_outline")):
        st.session_state.state.update({
            "chapter_guide": None,
            "chapter_beats": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 8. Chapter Beats - Button followed by display
    if st.button("Generate Chapter Beats", 
               disabled=not st.session_state.state.get("chapter_guide"),
               key="gen_chapter_beats"):
        with st.spinner("Creating detailed action beats for each chapter..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass the premises and endings data to the tool
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                # Pass the novel synopsis and character profiles to the tool
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                if st.session_state.state.get("character_profiles"):
                    tool._character_profiles = st.session_state.state["character_profiles"]
                if st.session_state.state.get("novel_plan"):
                    tool._novel_plan = st.session_state.state["novel_plan"]
                
                chapter_beats = tool.generate_chapter_beats(
                    st.session_state.state["chapter_outline"],
                    st.session_state.state["chapter_guide"]
                )
                st.session_state.state["chapter_beats"] = chapter_beats
                NovelDatabaseService.save_chapter_beats(st.session_state.state["novel_id"], chapter_beats)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating chapter beats: {str(e)}")
    
    # Check regeneration requests for Chapter Beats
    if display_chapter_beats(st.session_state.state.get("chapter_beats"), st.session_state.state.get("chapter_outline")):
        st.session_state.state.update({
            "chapter_beats": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 9. All Scenes - Button followed by display
    if st.button("Generate All Scenes", 
                disabled=not st.session_state.state.get("chapter_beats"),
                key="gen_scenes"):
        with st.spinner("Generating all scenes (this may take a while)..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass the premises and endings data to the tool
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                # Pass context data to tool
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                
                if st.session_state.state.get("character_profiles"):
                    tool._character_profiles = st.session_state.state["character_profiles"]
                    
                if st.session_state.state.get("novel_plan"):
                    tool._novel_plan = st.session_state.state["novel_plan"]
                
                # Generate all scenes using chapter beats
                all_scenes = tool.generate_all_scenes(
                    st.session_state.state["story_details"],
                    st.session_state.state["chapter_outline"],
                    st.session_state.state["chapter_beats"]
                )
                st.session_state.state["all_scenes"] = all_scenes
                NovelDatabaseService.save_scenes(st.session_state.state["novel_id"], all_scenes)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating scenes: {str(e)}")
    
    # Check regeneration requests for All Scenes
    if display_scenes(st.session_state.state.get("all_scenes")):
        st.session_state.state.update({
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 10. Complete Novel - Button followed by display
    if st.button("Format Complete Novel", 
                disabled=not st.session_state.state.get("all_scenes"),
                key="gen_novel"):
        with st.spinner("Formatting complete novel..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass the premises and endings data to the tool
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                novel_formats = tool.format_novel(
                    st.session_state.state["story_details"],
                    st.session_state.state["all_scenes"]
                )
                st.session_state.state["novel_formats"] = novel_formats
                NovelDatabaseService.save_novel_formats(st.session_state.state["novel_id"], novel_formats)
                st.rerun()
            except Exception as e:
                st.error(f"Error formatting novel: {str(e)}")
    
    # Check novel output
    display_novel_output(st.session_state.state.get("novel_formats"))

if __name__ == "__main__":
    main()