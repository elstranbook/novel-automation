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
    page_title="AI Novel Generator",
    page_icon="📚",
    layout="wide"
)

# Create output directory if it doesn't exist
output_dir = "output"
create_output_directory(output_dir)

def display_header():
    st.title("📚 Novel Automation Tool")
    st.markdown("""
    Generate complete novels with AI assistance. This tool will help you create:
    - Story outlines with character and setting details
    - Chapter structures (18-25 chapters)
    - Complete scene-by-scene content
    - Formatted novel output (Markdown, HTML, TXT)
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
    with st.expander("📝 Story Details", expanded=not bool(story_details)):
        if story_details:
            st.json(story_details)
            if st.button("♻️ Regenerate Story Details", key="regenerate_story"):
                return True
        else:
            st.info("Generate story details to create your novel's foundation.")
        return False

def display_chapter_outline(chapter_outline=None):
    with st.expander("📑 Chapter Outline (18-25 Chapters)", expanded=not bool(chapter_outline)):
        if chapter_outline:
            if len(chapter_outline) < 18:
                st.warning(f"Only {len(chapter_outline)} chapters generated (should be 18-25)")
            
            for chapter in chapter_outline:
                with st.container():
                    st.subheader(f"Chapter {chapter.get('number', '?')}: {chapter.get('title', 'Untitled')}")
                    if chapter.get('pov'):
                        st.caption(f"POV: {chapter['pov']}")
                    if chapter.get('events'):
                        st.markdown("**Key Events:**")
                        for event in chapter['events']:
                            st.markdown(f"- {event}")
                    if chapter.get('word_count'):
                        st.caption(f"Word count: {chapter['word_count']}")
                    st.divider()
            
            if st.button("♻️ Regenerate Chapter Outline", key="regenerate_outline"):
                return True
        else:
            st.info("Generate a chapter outline after creating story details.")
        return False

def display_scenes(all_scenes=None):
    with st.expander("📖 Generated Scenes", expanded=not bool(all_scenes)):
        if all_scenes:
            chapter_tabs = st.tabs([f"Chapter {i+1}" for i in range(len(all_scenes))])
            
            for i, (chapter, scenes) in enumerate(all_scenes.items()):
                with chapter_tabs[i]:
                    st.subheader(chapter)
                    for j, scene in enumerate(scenes, 1):
                        with st.container():
                            st.markdown(f"**Scene {j}**")
                            st.markdown(scene)
                            if j < len(scenes):
                                st.divider()
            
            if st.button("♻️ Regenerate All Scenes", key="regenerate_scenes"):
                return True
        else:
            st.info("Generate scenes after creating a chapter outline.")
        return False

def display_novel_output(novel_formats=None):
    with st.expander("📘 Complete Novel", expanded=not bool(novel_formats)):
        if novel_formats:
            format_tabs = st.tabs(list(novel_formats.keys()))
            
            for i, (format_name, content) in enumerate(novel_formats.items()):
                with format_tabs[i]:
                    if format_name == "markdown":
                        st.code(content, language="markdown")
                    elif format_name == "html":
                        st.components.v1.html(content, height=600, scrolling=True)
                    elif format_name == "txt":
                        st.text_area("Plain Text", content, height=300)
                    
                    st.download_button(
                        f"Download {format_name.upper()}",
                        content,
                        file_name=f"{st.session_state.state.get('title', 'novel')}_FULL_NOVEL.{'html' if format_name == 'html' else 'md' if format_name == 'markdown' else 'txt'}",
                        mime="text/html" if format_name == "html" else "text/plain"
                    )
        else:
            st.info("Generate the complete novel after creating all scenes.")

def display_generation_progress():
    st.markdown("## 🚀 Generation Progress")
    cols = st.columns(4)
    
    with cols[0]:
        st.metric("1. Story Details", 
                 "Complete" if st.session_state.state.get("story_details") else "Pending",
                 help="Foundation of your novel")
    
    with cols[1]:
        st.metric("2. Chapter Outline", 
                 f"{len(st.session_state.state.get('chapter_outline', []))}/25" if st.session_state.state.get("chapter_outline") else "Pending",
                 help="18-25 chapter structure")
    
    with cols[2]:
        scene_count = sum(len(chapter) for chapter in st.session_state.state.get("all_scenes", {}).values()) if st.session_state.state.get("all_scenes") else 0
        st.metric("3. Scenes", 
                 f"{scene_count} scenes" if scene_count else "Pending",
                 help="All chapter scenes")
    
    with cols[3]:
        st.metric("4. Complete Novel", 
                 "Ready" if st.session_state.state.get("novel_formats") else "Pending",
                 help="Final formatted novel")

def main():
    display_header()
    
    # Initialize session state
    if "state" not in st.session_state:
        st.session_state.state = {
            "novel_id": None,
            "title": "",
            "story_details": None,
            "chapter_outline": None,
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
                            "chapter_outline": NovelDatabaseService.get_chapter_outline(novel_id),
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
    
    # Check regeneration requests
    if display_story_details(st.session_state.state.get("story_details")):
        st.session_state.state.update({
            "story_details": None,
            "chapter_outline": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    if display_chapter_outline(st.session_state.state.get("chapter_outline")):
        st.session_state.state.update({
            "chapter_outline": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    if display_scenes(st.session_state.state.get("all_scenes")):
        st.session_state.state.update({
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    display_novel_output(st.session_state.state.get("novel_formats"))
    
    # Generation actions
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
    
    if st.button("Generate Chapter Outline", 
                disabled=not st.session_state.state.get("story_details"),
                key="gen_outline"):
        with st.spinner("Creating 18-25 chapter outline..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                chapter_outline = tool.generate_chapter_outline(st.session_state.state["story_details"])
                st.session_state.state["chapter_outline"] = chapter_outline
                NovelDatabaseService.save_chapter_outline(st.session_state.state["novel_id"], chapter_outline)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating outline: {str(e)}")
    
    if st.button("Generate All Scenes", 
                disabled=not st.session_state.state.get("chapter_outline"),
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
                
                all_scenes = tool.generate_all_scenes(st.session_state.state["chapter_outline"])
                st.session_state.state["all_scenes"] = all_scenes
                NovelDatabaseService.save_scenes(
                    st.session_state.state["novel_id"],
                    all_scenes,
                    st.session_state.state["chapter_outline"]
                )
                st.rerun()
            except Exception as e:
                st.error(f"Error generating scenes: {str(e)}")
    
    if st.button("Generate Complete Novel", 
                disabled=not st.session_state.state.get("all_scenes"),
                key="gen_novel"):
        with st.spinner("Compiling final novel..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                novel_formats = tool.generate_combined_novel(
                    st.session_state.state["all_scenes"],
                    st.session_state.state["chapter_outline"]
                )
                st.session_state.state["novel_formats"] = novel_formats
                NovelDatabaseService.save_novel_formats(
                    st.session_state.state["novel_id"],
                    novel_formats
                )
                st.rerun()
            except Exception as e:
                st.error(f"Error compiling novel: {str(e)}")

if __name__ == "__main__":
    main()