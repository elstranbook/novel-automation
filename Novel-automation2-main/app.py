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
    - Book cover design prompts for professional designers
    """)
    
    # Use a radio button for mode selection - cleaner than tabs or selectbox
    if "state" not in st.session_state:
        st.session_state.state = {}
        st.session_state.state["series_mode"] = False
    
    # Create mode selector
    mode_options = ["Single Novel", "Series (up to 5 books)"]
    current_mode_index = 1 if st.session_state.state.get("series_mode", False) else 0
    
    mode_choice = st.radio(
        "📚 Novel Generation Mode",
        options=mode_options,
        index=current_mode_index,
        horizontal=True
    )
    
    # Process mode selection
    if mode_choice == "Single Novel":
        # Single Novel Mode
        st.session_state.state["series_mode"] = False
        st.session_state.state["series_id"] = None
        st.session_state.state["series_book_number"] = None
        st.info("Create a standalone novel with detailed character development, chapter outlines, and scenes.")
    else:
        # Series Mode
        st.session_state.state["series_mode"] = True
        st.info("Create a series of connected novels with consistent character arcs and evolving themes.")
        
        # Series creation form
        with st.expander("Series Settings", expanded=not bool(st.session_state.get("series_state", {}).get("series_id"))):
            series_title = st.text_input("Series Title", key="series_title", 
                                        value=st.session_state.get("series_state", {}).get("series_title", ""))
            series_description = st.text_area("Series Description", key="series_description", 
                                            value=st.session_state.get("series_state", {}).get("series_description", ""),
                                            placeholder="Describe your series concept and overall arc")
            num_books = st.slider("Number of Books in Series", min_value=1, max_value=5, 
                                value=st.session_state.get("series_state", {}).get("num_books", 3), key="num_books")
            
            if st.button("Create Series", disabled=not series_title):
                with st.spinner("Creating series structure..."):
                    try:
                        # Create a series generator
                        from novel_generator import SeriesGenerator
                        series_gen = SeriesGenerator(
                            series_title=series_title,
                            series_description=series_description,
                            num_books=num_books,
                            model=st.session_state.state.get("model", "gpt-4.1")
                        )
                        
                        # Create the series in the database
                        series_id = series_gen.create_series()
                        
                        # Generate the series arc
                        series_arc = series_gen.generate_series_arc()
                        
                        # Store in session state
                        if "series_state" not in st.session_state:
                            st.session_state.series_state = {}
                        
                        st.session_state.series_state.update({
                            "series_id": series_id,
                            "series_title": series_title,
                            "series_description": series_description,
                            "num_books": num_books,
                            "series_arc": series_arc,
                            "book_titles": series_arc.get("book_titles", [f"Book {i+1}" for i in range(num_books)]),
                            "current_book": 1
                        })
                        
                        # Update the state for series mode
                        st.session_state.state["series_mode"] = True
                        st.session_state.state["series_id"] = series_id
                        st.session_state.state["series_book_number"] = 1  # Start with Book 1
                        
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error creating series: {str(e)}")
        
        # Display series information if available
        if st.session_state.get("series_state", {}).get("series_id"):
            series_state = st.session_state.series_state
            st.subheader(f"Series: {series_state.get('series_title')}")
            
            # Display series arc overview
            with st.expander("Series Arc Overview"):
                series_arc = series_state.get("series_arc", {})
                st.markdown(f"**Overall Arc**: {series_arc.get('overall_arc', 'Not available')}")
                
                st.markdown("**Character Arcs**")
                for char_name, char_arc in series_arc.get("character_arcs", {}).items():
                    st.markdown(f"- **{char_name}**: {char_arc}")
                
                st.markdown("**Series Themes**")
                for theme in series_arc.get("themes", []):
                    st.markdown(f"- {theme}")
                
                if series_arc.get("continuity_notes"):
                    st.markdown(f"**Continuity Notes**: {series_arc.get('continuity_notes')}")
            
            # Book selection
            book_options = [f"Book {i+1}: {title}" for i, title in 
                          enumerate(series_state.get("book_titles", [])[:series_state.get("num_books", 0)])]
            
            selected_book = st.selectbox(
                "Select Book to Work On",
                options=book_options,
                index=series_state.get("current_book", 1) - 1
            )
            
            # Update current book based on selection
            if selected_book:
                book_num = int(selected_book.split(":")[0].replace("Book ", ""))
                series_state["current_book"] = book_num
                
                # Extract the book title
                book_title = selected_book.split(":", 1)[1].strip() if ":" in selected_book else f"Book {book_num}"
                
                # Update the title in the state
                st.session_state.state["title"] = book_title
                st.session_state.state["series_mode"] = True
                st.session_state.state["series_book_number"] = book_num
        
    # Series/Single mode is now controlled by the selectbox directly

def display_settings():
    with st.expander("⚙️ Generator Settings", expanded=True):
        col1, col2 = st.columns(2)
        
        with col1:
            # Use the book title from series state if in series mode
            default_title = ""
            if st.session_state.state.get("series_mode") and st.session_state.state.get("title"):
                default_title = st.session_state.state.get("title")
            
            title = st.text_input("Novel Title", value=default_title, help="Enter a title for your novel")
            model = st.selectbox(
                "AI Model", 
                options=["gpt-4.1-mini", "gpt-4.1", "gpt-4o", "gpt-4", "gpt-3.5-turbo"],
                index=0,
                help="Select the AI model to use for generation - gpt-4.1-mini is faster and more economical"
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
                
                # Download button for story details
                # Prepare formatted text for download
                story_details_text = f"""# Story Details for '{story_details.get('title', 'Novel')}'

## Core Concept
Theme: {story_details.get('story_theme', 'N/A')}
Genre: {story_details.get('genre', 'N/A')}
Central Concept: {story_details.get('central_concept', 'N/A')}
Target Age Range: {story_details.get('target_age_range', 'N/A')}
Word Count: {story_details.get('estimated_word_count', 'N/A')}
Narrative Style: {story_details.get('narrative_style', 'N/A')}

## Characters & Setting
Main Character: {story_details.get('main_character_name', 'N/A')}
Central Conflict: {story_details.get('central_conflict', 'N/A')}
Setting: {story_details.get('setting', 'N/A')}
Time Period: {story_details.get('time_period', 'N/A')}

## Supporting Characters
"""
                # Add supporting characters
                if isinstance(supporting_chars, list):
                    for char in supporting_chars:
                        if isinstance(char, dict):
                            story_details_text += f"- {char.get('name', 'Character')}: {char.get('description', '')}\n"
                        else:
                            story_details_text += f"- {char}\n"
                else:
                    story_details_text += supporting_chars + "\n"
                
                story_details_text += f"\n## Plot Summary\n{story_details.get('plot_summary', 'No plot summary available.')}"
                
                st.download_button(
                    label="Download Story Details",
                    data=story_details_text,
                    file_name=f"{story_details.get('title', 'novel')}_story_details.txt",
                    mime="text/plain",
                )

                # Display series context if available
                if story_details.get('series_context'):
                    series_context = story_details.get('series_context', {})
                    # Use a container instead of nested expander
                    st.subheader("📚 Series Context")
                    st.markdown(f"**Book {series_context.get('book_number', '?')} of {series_context.get('total_books', '?')}**")
                    
                    st.markdown("**Series Arc**")
                    st.markdown(series_context.get('series_arc', 'No series arc available.'))
                    
                    if series_context.get('character_arcs'):
                        st.markdown("**Character Arcs Across Series**")
                        for char_name, char_arc in series_context.get('character_arcs', {}).items():
                            st.markdown(f"- **{char_name}**: {char_arc}")
                    
                    if series_context.get('themes'):
                        st.markdown("**Series Themes**")
                        for theme in series_context.get('themes', []):
                            st.markdown(f"- {theme}")
                    
                    if series_context.get('continuity_notes'):
                        st.markdown("**Continuity Notes**")
                        st.markdown(series_context.get('continuity_notes', ''))
                    
                    if series_context.get('prior_books'):
                        st.markdown("**Prior Books in Series**")
                        for i, book in enumerate(series_context.get('prior_books', [])):
                            st.markdown(f"**📕 {book.get('title', f'Prior Book {i+1}')}**")
                            st.markdown(f"*Synopsis:* {book.get('synopsis', 'No synopsis available.')}")
                
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
                # Get initial values for custom premise and ending
                current_premise = premises_data.get('chosen_premise', 'No premise chosen')
                current_ending = premises_data.get('chosen_ending', '')
                
                # Create tabs for viewing and customizing
                view_tab, customize_tab = st.tabs(["View Generated Options", "Customize Premise & Ending"])
                
                with view_tab:
                    col1, col2 = st.columns([2, 3])
                    
                    with col1:
                        st.subheader("Potential Premises")
                        premises = premises_data.get('premises', [])
                        for i, premise in enumerate(premises, 1):
                            st.markdown(f"**{i}.** {premise}")
                    
                    with col2:
                        st.subheader("Chosen Premise")
                        st.markdown(f"**{current_premise}**")
                        
                        # Display the chosen ending if it exists
                        if current_ending:
                            st.subheader("The Ending (For Future Prompts)")
                            st.markdown(f"**{current_ending}**")
                            st.markdown("---")
                            
                        st.subheader("Potential Endings")
                        endings = premises_data.get('potential_endings', [])
                        for i, ending in enumerate(endings, 1):
                            st.markdown(f"**{i}.** {ending}")
                
                with customize_tab:
                    st.subheader("Custom Premise")
                    custom_premise = st.text_area(
                        "Enter your own premise", 
                        value=current_premise if current_premise != "No premise chosen" else "",
                        height=150,
                        placeholder="Paste or write your own premise here..."
                    )
                    
                    st.subheader("Custom Ending")
                    custom_ending = st.text_area(
                        "Enter your own ending", 
                        value=current_ending,
                        height=150,
                        placeholder="Paste or write your own ending here..."
                    )
                    
                    # Save button for custom inputs
                    if st.button("Save Custom Premise & Ending"):
                        if custom_premise.strip():
                            premises_data['chosen_premise'] = custom_premise.strip()
                        if custom_ending.strip():
                            premises_data['chosen_ending'] = custom_ending.strip()
                        
                        # Save to database if we have a novel ID
                        if st.session_state.state.get("novel_id"):
                            NovelDatabaseService.save_premises_and_endings(
                                st.session_state.state.get("novel_id"),
                                premises_data
                            )
                        
                        # Update session state
                        st.session_state.state["premises_and_endings"] = premises_data
                        st.success("Your custom premise and ending have been saved!")
                        time.sleep(1)
                        st.rerun()
                
                # Button to regenerate all premises and endings
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
                
                # Add download button for the synopsis
                col1, col2 = st.columns([1, 2])
                with col1:
                    st.download_button(
                        label="Download Synopsis",
                        data=synopsis,
                        file_name="novel_synopsis.txt",
                        mime="text/plain",
                    )
                with col2:
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
                
                # Add download button for character profiles
                col1, col2 = st.columns([1, 2])
                with col1:
                    st.download_button(
                        label="Download Character Profiles",
                        data=profiles,
                        file_name="character_profiles.txt",
                        mime="text/plain",
                    )
                with col2:
                    if st.button("♻️ Regenerate Character Profiles", key="regen_profiles_btn"):
                        return True
                        
            except Exception as e:
                st.error(f"Error displaying character profiles: {str(e)}")
                if st.button("♻️ Regenerate Character Profiles", key="regen_profiles_error_btn"):
                    return True
        else:
            st.info("Generate comprehensive character profiles for your novel.")
        return False

def display_promotional_articles(articles=None):
    with st.expander("📰 Promotional Articles", expanded=not bool(articles)):
        if articles:
            try:
                # Article type display names
                article_type_names = {
                    'theme_analysis': 'Theme Analysis',
                    'character_spotlight': 'Character Spotlight',
                    'author_journey': 'Author Journey',
                    'world_building': 'World Building',
                    'quote_spotlight': 'Quote Spotlight',
                    'lessons_learned': 'Lessons for Teens',
                    'comparison_article': 'Comparison Article',
                    'symbolism_article': 'Hidden Symbolism',
                    'emotional_hook': 'Emotional Hook',
                    'author_letter': 'Author Letter',
                    'problem_solution': 'Problem-Solution',
                    'seo_review': 'SEO Review'
                }
                
                if isinstance(articles, list):
                    for i, article in enumerate(articles):
                        article_type = article.get('article_type', 'unknown')
                        type_name = article_type_names.get(article_type, article_type.replace('_', ' ').title())
                        title = article.get('title', 'Untitled Article')
                        
                        st.subheader(f"{type_name}: {title}")
                        st.caption(f"Length: {article.get('length_type', 'medium').title()} | Tone: {article.get('tone', 'formal').title()} | CTA: {article.get('cta_type', 'medium').title()}")
                        
                        # Show content in an expandable section
                        with st.container():
                            st.markdown(article.get('content', 'No content available'))
                        
                        # Download button for this article
                        st.download_button(
                            label=f"Download {type_name}",
                            data=f"# {title}\n\n{article.get('content', '')}",
                            file_name=f"{article_type}_{article.get('length_type', 'medium')}.txt",
                            mime="text/plain",
                            key=f"download_article_{i}"
                        )
                        st.markdown("---")
                else:
                    # Single article dict
                    title = articles.get('title', 'Promotional Article')
                    st.subheader(title)
                    st.markdown(articles.get('content', 'No content available'))
                    
                    st.download_button(
                        label="Download Article",
                        data=f"# {title}\n\n{articles.get('content', '')}",
                        file_name="promotional_article.txt",
                        mime="text/plain",
                    )
                
                col1, col2 = st.columns(2)
                with col1:
                    if st.button("♻️ Clear All Articles", key="clear_articles_btn"):
                        return "clear"
                with col2:
                    if st.button("➕ Generate Another Article", key="gen_another_article"):
                        return "generate_more"
                        
            except Exception as e:
                st.error(f"Error displaying promotional articles: {str(e)}")
                if st.button("♻️ Clear Articles", key="clear_articles_error_btn"):
                    return "clear"
        else:
            st.info("Generate promotional articles to advertise your novel across different platforms.")
        return False

def display_social_snippets(snippets=None):
    with st.expander("📱 Social Media Snippets", expanded=not bool(snippets)):
        if snippets:
            try:
                content = snippets.get('content', '') if isinstance(snippets, dict) else snippets
                st.markdown(content)
                
                st.download_button(
                    label="Download Social Snippets",
                    data=content,
                    file_name="social_snippets.txt",
                    mime="text/plain",
                )
                
                if st.button("♻️ Regenerate Social Snippets", key="regen_social_btn"):
                    return True
                        
            except Exception as e:
                st.error(f"Error displaying social snippets: {str(e)}")
        else:
            st.info("Generate social media snippets for Twitter, Instagram, TikTok, and more.")
        return False

def display_book_descriptions(descriptions=None):
    with st.expander("📝 Book Descriptions", expanded=not bool(descriptions)):
        if descriptions:
            try:
                # If descriptions is a dict with multiple types/lengths
                if isinstance(descriptions, dict):
                    for desc_key, desc_content in descriptions.items():
                        if desc_content:
                            # Parse the key to get type and length info
                            parts = desc_key.split('_')
                            desc_type = parts[0] if parts else 'marketing'
                            length_type = parts[1] if len(parts) > 1 else 'standard'
                            
                            st.subheader(f"{desc_type.title()} Description ({length_type.title()})")
                            st.markdown(desc_content)
                            st.markdown("---")
                else:
                    # If it's a simple string, display as marketing description
                    st.subheader("Marketing Description")
                    st.markdown(descriptions)
                
                # Download button for descriptions
                col1, col2, col3 = st.columns([1, 1, 1])
                with col1:
                    # Prepare download content
                    if isinstance(descriptions, dict):
                        download_content = ""
                        for desc_key, desc_content in descriptions.items():
                            if desc_content:
                                parts = desc_key.split('_')
                                desc_type = parts[0] if parts else 'marketing'
                                length_type = parts[1] if len(parts) > 1 else 'standard'
                                download_content += f"## {desc_type.title()} Description ({length_type.title()})\n\n{desc_content}\n\n---\n\n"
                    else:
                        download_content = descriptions
                    
                    st.download_button(
                        label="Download Descriptions",
                        data=download_content,
                        file_name="book_descriptions.txt",
                        mime="text/plain",
                    )
                with col2:
                    if st.button("♻️ Regenerate Descriptions", key="regen_descriptions_btn"):
                        return True
                with col3:
                    # Option to generate additional description types
                    if st.button("➕ Generate More Types", key="gen_more_desc_types"):
                        return "generate_more"
                        
            except Exception as e:
                st.error(f"Error displaying book descriptions: {str(e)}")
                if st.button("♻️ Regenerate Descriptions", key="regen_descriptions_error_btn"):
                    return True
        else:
            st.info("Generate compelling book descriptions for marketing, back covers, and pitches.")
        return False

def display_novel_keywords(keywords=None):
    with st.expander("🔍 Novel Keywords", expanded=not bool(keywords)):
        if keywords:
            try:
                st.markdown("## Search Keywords")
                st.markdown("These keywords represent search terms potential readers might use to discover your novel:")
                
                # Display keywords in a clean format with bullets
                for keyword in keywords:
                    st.markdown(f"- {keyword}")
                
                # Download button for keywords
                keywords_text = "\n".join(keywords)
                st.download_button(
                    label="Download Keywords",
                    data=keywords_text,
                    file_name="novel_keywords.txt",
                    mime="text/plain",
                )
                
                if st.button("♻️ Regenerate Keywords", key="regenerate_keywords"):
                    return True
            except Exception as e:
                st.error(f"Error displaying novel keywords: {str(e)}")
                if st.button("♻️ Regenerate Keywords", key="regenerate_keywords_error"):
                    return True
        else:
            st.info("Generate keywords to help readers discover your novel through search engines and online bookstores.")
        return False

def display_novel_bisac(bisac_categories=None):
    with st.expander("📚 BISAC Categories", expanded=not bool(bisac_categories)):
        if bisac_categories:
            try:
                st.markdown("## BISAC Subject Categories")
                st.markdown("These industry-standard book categories help retailers properly place your novel:")
                
                # Display BISAC categories in a clean format with bullets
                for category in bisac_categories:
                    st.markdown(f"- {category}")
                
                # Add explanation
                st.caption("BISAC (Book Industry Standards and Communications) categories are used by publishers, retailers, and libraries to classify books by subject matter.")
                
                # Download button for BISAC categories
                bisac_text = "\n".join(bisac_categories)
                st.download_button(
                    label="Download BISAC Categories",
                    data=bisac_text,
                    file_name="novel_bisac_categories.txt",
                    mime="text/plain",
                )
                
                if st.button("♻️ Regenerate BISAC Categories", key="regenerate_bisac"):
                    return True
            except Exception as e:
                st.error(f"Error displaying BISAC categories: {str(e)}")
                if st.button("♻️ Regenerate BISAC Categories", key="regenerate_bisac_error"):
                    return True
        else:
            st.info("Generate BISAC subject categories to help bookstores and retailers properly categorize your novel.")
        return False

def display_novel_plan(plan=None):
    with st.expander("📋 Novel Plan", expanded=not bool(plan)):
        if plan:
            try:
                st.markdown(plan)
                
                # Add download button for novel plan
                col1, col2 = st.columns([1, 2])
                with col1:
                    st.download_button(
                        label="Download Novel Plan",
                        data=plan,
                        file_name="novel_plan.txt",
                        mime="text/plain",
                    )
                with col2:
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
                        st.subheader("Scene Summaries")
                        scenes = all_scenes[title]
                        if isinstance(scenes, list):
                            for j, scene in enumerate(scenes, 1):
                                with st.container(border=True):
                                    st.caption(f"Scene {j}")
                                    st.markdown(scene)
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

def display_prose(prose_scenes=None):
    with st.expander("📝 Generated Prose", expanded=not bool(prose_scenes)):
        if prose_scenes:
            try:
                # Make sure prose_scenes is a dictionary
                if not isinstance(prose_scenes, dict):
                    if isinstance(prose_scenes, str):
                        try:
                            prose_scenes = json.loads(prose_scenes)
                            if not isinstance(prose_scenes, dict):
                                prose_scenes = {"Chapter 1": [prose_scenes]}
                        except Exception:
                            prose_scenes = {"Chapter 1": [prose_scenes]}
                    else:
                        prose_scenes = {"Chapter 1": ["Invalid prose data format"]}
                
                # Sort chapters by chapter number
                import re
                
                def extract_chapter_number(title):
                    # Try to extract chapter number for sorting
                    match = re.search(r'Chapter\s+(\d+)', title)
                    if match:
                        return int(match.group(1))
                    # If no "Chapter X" pattern, look for any number
                    numbers = re.findall(r'\d+', title)
                    if numbers:
                        return int(numbers[0])
                    # If no numbers, return a high value to sort to the end
                    return 9999
                
                # Sort chapter titles by their numerical value
                chapter_titles = list(prose_scenes.keys())
                chapter_titles.sort(key=extract_chapter_number)
                
                # Create tabs for sorted chapters
                chapter_tabs = st.tabs([title for title in chapter_titles])
                
                # Display each chapter's prose
                for i, title in enumerate(chapter_titles):
                    with chapter_tabs[i]:
                        chapter_prose = prose_scenes[title]
                        if isinstance(chapter_prose, list):
                            # Add a download button for the entire chapter
                            chapter_text = "\n\n".join([f"Scene {j}\n{prose}" for j, prose in enumerate(chapter_prose, 1)])
                            sanitized_title = title.replace(" ", "_").lower()
                            st.download_button(
                                label=f"Download {title}",
                                data=chapter_text,
                                file_name=f"{sanitized_title}.txt",
                                mime="text/plain",
                                help=f"Download the full text of {title} as a text file"
                            )
                            
                            # Display scenes
                            for j, prose in enumerate(chapter_prose, 1):
                                with st.container(border=True):
                                    st.caption(f"Scene {j}")
                                    st.markdown(prose)
                        else:
                            st.warning(f"Invalid prose data format for {title}: {type(chapter_prose)}")
                
                # Add a button to download the entire novel
                if len(chapter_titles) > 0:
                    st.markdown("---")
                    st.subheader("Download Full Novel")
                    # Combine all chapters into a single document
                    full_novel_text = ""
                    for title in chapter_titles:
                        chapter_prose = prose_scenes[title]
                        if isinstance(chapter_prose, list):
                            full_novel_text += f"\n\n{title}\n{'=' * len(title)}\n\n"
                            for j, prose in enumerate(chapter_prose, 1):
                                full_novel_text += f"Scene {j}\n{prose}\n\n"
                    
                    # Add a download button for the entire novel
                    novel_title = st.session_state.state.get("title", "novel")
                    sanitized_novel_title = novel_title.replace(" ", "_").lower() if novel_title else "novel"
                    st.download_button(
                        label="Download Complete Novel",
                        data=full_novel_text,
                        file_name=f"{sanitized_novel_title}_complete.txt",
                        mime="text/plain",
                        help="Download the complete novel as a single text file"
                    )
                
                if st.button("♻️ Regenerate Prose", key="regenerate_prose"):
                    st.session_state.state.update({"prose_scenes": None})
                    st.rerun()
            except Exception as e:
                st.error(f"Error displaying prose: {str(e)}")
                if st.button("♻️ Regenerate Prose", key="regenerate_prose_error"):
                    st.session_state.state.update({"prose_scenes": None})
                    st.rerun()
        else:
            st.info("Generate prose for all scenes using the 'Generate Prose' button above.")
        return False



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
            "novel_keywords": None,
            "novel_bisac": None,
            "novel_plan": None,
            "chapter_outline": None,
            "chapter_guide": None,
            "chapter_beats": None,
            "all_scenes": None,
            "prose_scenes": None,
            "novel_formats": None,
            "novel_quotes": None,
            "cover_design_prompt": None,
            "series_mode": False,
            "series_id": None,
            "series_book_number": 1,
            "model": "gpt-4o"
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
                            "novel_keywords": NovelDatabaseService.get_novel_keywords(novel_id),
                            "novel_bisac": NovelDatabaseService.get_novel_bisac(novel_id),
                            "novel_plan": NovelDatabaseService.get_novel_plan(novel_id),
                            "chapter_outline": NovelDatabaseService.get_chapter_outline(novel_id),
                            "chapter_guide": NovelDatabaseService.get_chapter_guide(novel_id),
                            "chapter_beats": NovelDatabaseService.get_chapter_beats(novel_id),
                            "all_scenes": NovelDatabaseService.get_all_scenes(novel_id),
                            "prose_scenes": None,  # Will be regenerated if needed
                            "novel_formats": NovelDatabaseService.get_novel_formats(novel_id),
                            "novel_quotes": NovelDatabaseService.get_novel_quotes(novel_id),
                            "cover_design_prompt": NovelDatabaseService.get_cover_design_prompt(novel_id)
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
                    # Check if we're in series mode
                    if st.session_state.state.get("series_mode") and st.session_state.state.get("series_id"):
                        # Create a novel in the series
                        series_id = st.session_state.state.get("series_id")
                        book_number = st.session_state.state.get("series_book_number", 1)
                        
                        novel_id = NovelDatabaseService.create_novel(
                            title=settings["title"],
                            model=settings["model"],
                            max_scene_length=settings["max_scene_length"],
                            min_scene_length=settings["min_scene_length"],
                            series_id=series_id,
                            book_number=book_number
                        )
                    else:
                        # Create a standalone novel
                        novel_id = NovelDatabaseService.create_novel(
                            title=settings["title"],
                            model=settings["model"],
                            max_scene_length=settings["max_scene_length"],
                            min_scene_length=settings["min_scene_length"]
                        )
                    
                    st.session_state.state["novel_id"] = novel_id
                
                # Check if we're in series mode and need series context
                if st.session_state.state.get("series_mode") and st.session_state.state.get("series_id"):
                    try:
                        # Create a SeriesGenerator to get series context
                        from novel_generator import SeriesGenerator
                        series_state = st.session_state.get("series_state", {})
                        series_gen = SeriesGenerator(
                            series_title=series_state.get("series_title", "Untitled Series"),
                            series_description=series_state.get("series_description", ""),
                            num_books=series_state.get("num_books", 3),
                            model=settings["model"]
                        )
                        series_gen.series_id = st.session_state.state.get("series_id")
                        
                        # Get the context for this specific book in the series
                        book_number = st.session_state.state.get("series_book_number", 1)
                        series_context = series_gen.get_series_context(book_number)
                        
                        # Add context to story details generation
                        story_details = tool.generate_story_details()
                        
                        # Add series context to the story details
                        story_details["series_context"] = series_context
                        
                    except Exception as e:
                        st.warning(f"Issue with series context: {str(e)}. Continuing with standalone story generation.")
                        story_details = tool.generate_story_details()
                else:
                    # Regular standalone novel generation
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
            "novel_keywords": None,
            "novel_bisac": None,
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
            "novel_keywords": None,
            "novel_bisac": None,
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
            "novel_keywords": None,
            "novel_bisac": None,
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
            "novel_keywords": None,
            "novel_bisac": None,
            "novel_plan": None,
            "chapter_outline": None,
            "chapter_guide": None,
            "chapter_beats": None,
            "all_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # 4a. Book Descriptions - Button followed by display
    if st.button("Generate Book Descriptions", 
                disabled=not st.session_state.state.get("story_details"),
                key="gen_book_descriptions"):
        with st.spinner("Creating compelling book descriptions for marketing..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass additional context if available
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                
                # Generate multiple description types
                descriptions = {}
                description_types = [
                    ('marketing', 'standard'),
                    ('marketing', 'short'),
                    ('back_cover', 'standard'),
                    ('pitch', 'standard')
                ]
                
                for desc_type, length_type in description_types:
                    try:
                        desc = tool.generate_book_description(
                            st.session_state.state["story_details"], 
                            description_type=desc_type,
                            length_type=length_type
                        )
                        descriptions[f"{desc_type}_{length_type}"] = desc
                        
                        # Save to database
                        NovelDatabaseService.save_book_description(
                            st.session_state.state["novel_id"], 
                            desc,
                            description_type=desc_type,
                            length_type=length_type
                        )
                    except Exception as desc_e:
                        st.warning(f"Failed to generate {desc_type} ({length_type}) description: {str(desc_e)}")
                
                if descriptions:
                    st.session_state.state["book_descriptions"] = descriptions
                    st.success(f"Generated {len(descriptions)} book descriptions!")
                else:
                    st.error("Failed to generate any book descriptions")
                    
                st.rerun()
            except Exception as e:
                st.error(f"Error generating book descriptions: {str(e)}")
    
    # Check regeneration requests for Book Descriptions
    desc_result = display_book_descriptions(st.session_state.state.get("book_descriptions"))
    if desc_result is True:
        # Clear descriptions for regeneration
        st.session_state.state["book_descriptions"] = None
        st.rerun()
    elif desc_result == "generate_more":
        # Generate additional description types
        with st.spinner("Generating additional description types..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass context
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                # Get current descriptions or initialize
                current_descriptions = st.session_state.state.get("book_descriptions", {})
                
                # Generate additional types that don't exist yet
                additional_types = [
                    ('marketing', 'long'),
                    ('elevator_pitch', 'standard')
                ]
                
                for desc_type, length_type in additional_types:
                    key = f"{desc_type}_{length_type}"
                    if key not in current_descriptions:
                        try:
                            desc = tool.generate_book_description(
                                st.session_state.state["story_details"], 
                                description_type=desc_type,
                                length_type=length_type
                            )
                            current_descriptions[key] = desc
                            
                            # Save to database
                            NovelDatabaseService.save_book_description(
                                st.session_state.state["novel_id"], 
                                desc,
                                description_type=desc_type,
                                length_type=length_type
                            )
                        except Exception as desc_e:
                            st.warning(f"Failed to generate {desc_type} ({length_type}): {str(desc_e)}")
                
                st.session_state.state["book_descriptions"] = current_descriptions
                st.rerun()
            except Exception as e:
                st.error(f"Error generating additional descriptions: {str(e)}")
    
    # 4b. Novel Keywords - Button followed by display
    if st.button("Generate Novel Keywords", 
                disabled=not st.session_state.state.get("story_details"),
                key="gen_keywords"):
        with st.spinner("Creating searchable keywords for your novel..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass novel synopsis to the tool if available
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                
                novel_keywords = tool.generate_novel_keywords(st.session_state.state["story_details"])
                st.session_state.state["novel_keywords"] = novel_keywords
                NovelDatabaseService.save_novel_keywords(st.session_state.state["novel_id"], novel_keywords)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating novel keywords: {str(e)}")
    
    # Check regeneration requests for Novel Keywords      
    if display_novel_keywords(st.session_state.state.get("novel_keywords")):
        st.session_state.state.update({
            "novel_keywords": None,
            "novel_bisac": None  # Also clear BISAC categories when keywords are regenerated
        })
        st.rerun()
        
    # 4c. Novel BISAC Categories - Button followed by display
    if st.button("Generate BISAC Categories", 
                disabled=not st.session_state.state.get("story_details"),
                key="gen_bisac"):
        with st.spinner("Creating BISAC subject categories for your novel..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass the story details and synopsis to the tool
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                
                bisac_categories = tool.generate_novel_bisac(st.session_state.state["story_details"])
                st.session_state.state["novel_bisac"] = bisac_categories
                NovelDatabaseService.save_novel_bisac(st.session_state.state["novel_id"], bisac_categories)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating BISAC categories: {str(e)}")
    
    # Check regeneration requests for BISAC Categories
    if display_novel_bisac(st.session_state.state.get("novel_bisac")):
        st.session_state.state.update({"novel_bisac": None})
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
                # Add debug info
                st.info("Initializing chapter guide generation...")
                
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
                
                # Add progress messages
                st.info("Starting chapter guide generation...")
                
                # Generate chapter guide with error handling
                chapter_outline = st.session_state.state["chapter_outline"]
                if not chapter_outline:
                    st.error("Missing chapter outline. Please generate a chapter outline first.")
                    return
                
                try:
                    chapter_guide = tool.generate_chapter_guide(chapter_outline)
                    
                    # Verify the chapter guide has content
                    if not chapter_guide or not isinstance(chapter_guide, dict) or len(chapter_guide) == 0:
                        st.error("Generated chapter guide is empty or invalid. Using default template.")
                        # Create a simple default guide
                        chapter_guide = {}
                        for i, chapter in enumerate(chapter_outline):
                            chapter_num = str(chapter.get("number", i+1))
                            chapter_guide[chapter_num] = {
                                "key_dialogue": ["Key dialogue not generated"],
                                "symbolism": ["Symbolism not generated"],
                                "emotional_pacing": "Emotional pacing not generated",
                                "sensory_details": ["Sensory details not generated"], 
                                "foreshadowing": ["Foreshadowing not generated"],
                                "scene_goal": "Scene goal not generated"
                            }
                except Exception as guide_err:
                    st.error(f"Error in guide generation: {str(guide_err)}")
                    # Create default guide on error
                    chapter_guide = {}
                    for i, chapter in enumerate(chapter_outline):
                        chapter_num = str(chapter.get("number", i+1))
                        chapter_guide[chapter_num] = {
                            "key_dialogue": ["Key dialogue not generated"],
                            "symbolism": ["Symbolism not generated"],
                            "emotional_pacing": "Emotional pacing not generated",
                            "sensory_details": ["Sensory details not generated"],
                            "foreshadowing": ["Foreshadowing not generated"],
                            "scene_goal": "Scene goal not generated"
                        }
                
                # Save to state
                st.session_state.state["chapter_guide"] = chapter_guide
                
                # Save to database
                try:
                    st.info("Saving chapter guide to database...")
                    NovelDatabaseService.save_chapter_guide(st.session_state.state["novel_id"], chapter_guide)
                except Exception as db_err:
                    st.error(f"Error saving to database: {str(db_err)}")
                    st.warning("Unable to save chapter guide to database, but it will be available in the current session.")
                
                st.success("Chapter guide generation complete!")
                st.rerun()
            except Exception as e:
                st.error(f"Error in chapter guide generation: {type(e).__name__}: {str(e)}")
    
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
            "prose_scenes": None,
            "novel_formats": None
        })
        st.rerun()
    
    # Add new button for Generating Prose (Prompt 10)
    if st.button("Generate Prose", 
                disabled=not st.session_state.state.get("all_scenes"),
                key="gen_prose"):
        with st.spinner("Generating prose for all scenes using Prompt 10 (this may take a while)..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass context data to tool
                if st.session_state.state.get("premises_and_endings"):
                    tool._premises_and_endings = st.session_state.state["premises_and_endings"]
                
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                
                if st.session_state.state.get("character_profiles"):
                    tool._character_profiles = st.session_state.state["character_profiles"]
                    
                if st.session_state.state.get("novel_plan"):
                    tool._novel_plan = st.session_state.state["novel_plan"]
                
                # Store the current scene summaries
                scene_summaries = st.session_state.state["all_scenes"]
                
                # Sort chapters numerically for ordered processing
                chapter_titles = list(scene_summaries.keys())
                
                # Create a list of (chapter_title, chapter_num) tuples
                chapter_info_list = []
                for chapter_title in chapter_titles:
                    # Extract chapter number using various formats
                    chapter_num = None
                    
                    # Try standard format "Chapter X: Title"
                    if ":" in chapter_title and "Chapter" in chapter_title.split(":")[0]:
                        chapter_prefix = chapter_title.split(":")[0].strip()
                        try:
                            chapter_num = int(chapter_prefix.replace("Chapter", "").strip())
                        except ValueError:
                            chapter_num = None
                    
                    # If that didn't work, try to find "Chapter X" pattern
                    if chapter_num is None:
                        import re
                        chapter_match = re.search(r'Chapter\s+(\d+)', chapter_title)
                        if chapter_match:
                            try:
                                chapter_num = int(chapter_match.group(1))
                            except ValueError:
                                chapter_num = None
                    
                    # If still no number, extract first number found
                    if chapter_num is None:
                        numbers = re.findall(r'\d+', chapter_title)
                        if numbers:
                            try:
                                chapter_num = int(numbers[0])
                            except ValueError:
                                chapter_num = None
                    
                    # Default to position in list if no number found
                    if chapter_num is None:
                        chapter_num = len(chapter_info_list) + 1
                    
                    chapter_info_list.append((chapter_title, chapter_num))
                
                # Sort chapters by their extracted numbers
                chapter_info_list.sort(key=lambda x: x[1])
                
                # Initialize prose scenes dictionary
                prose_scenes = {}
                
                # Retrieve any existing prose scenes from database
                if st.session_state.state.get("prose_scenes"):
                    prose_scenes = st.session_state.state.get("prose_scenes", {})
                    st.info(f"Found {len(prose_scenes)} chapters with existing prose. Will continue from where we left off.")
                
                # Process each chapter to generate prose for every scene
                for chapter_title, chapter_num in chapter_info_list:
                    # Skip if we already have prose for this chapter
                    if chapter_title in prose_scenes:
                        st.info(f"Skipping {chapter_title} - prose already generated.")
                        continue
                        
                    st.info(f"Generating prose for {chapter_title} (Chapter {chapter_num})...")
                    
                    # Find chapter info in outline
                    chapter_info = None
                    if st.session_state.state.get("chapter_outline"):
                        for ch in st.session_state.state["chapter_outline"]:
                            if ch.get("number") == chapter_num:
                                chapter_info = ch
                                break
                    
                    # Access scenes for this chapter
                    scenes = scene_summaries.get(chapter_title, [])
                    if not scenes:
                        st.warning(f"No scenes found for {chapter_title}. Skipping.")
                        prose_scenes[chapter_title] = ["No scene content available."]
                        continue
                    
                    # Generate prose for each scene in this chapter
                    chapter_prose = []
                    for i, scene_summary in enumerate(scenes, 1):
                        scene_prompt = f"""
Begin writing Chapter {chapter_num}, Scene {i} of "{settings['title']}" using the detailed scene summary provided.

The writing should naturally reflect the scene's genre, tone, point of view, setting, and key characters—all of which can be inferred from the scene summary provided.

Writing Guidelines:
– Focus on a slow, deliberate buildup, allowing the emotional tone and character stakes to deepen gradually.
– Use intimate, vivid moments to show the emotional toll of the scene and allow readers to connect with the characters.
– Let dialogue reveal dynamics, tension, or internal struggles. Keep it natural, grounded, and full of subtext.
– Emphasize "show, don't tell" storytelling. Let physical actions, choices, and setting carry emotional and thematic weight.
– Use strong verbs, sensory-rich description, and a deep POV (if applicable) to fully immerse the reader.
– Allow the scene to naturally lead toward its conclusion and, if appropriate, transition smoothly into the next.

Narrative Style:
* Point of View: First-person for the main character.
* Tense: Past

Write up to {settings["max_scene_length"]} words of character-driven, emotionally layered prose. 

Let the scene summary guide your tone, structure, pacing, and character focus.

Scene Summary:
{scene_summary}
"""
                        # Generate the prose for this scene
                        try:
                            scene_prose = tool._ai_completion(scene_prompt, 
                                system_message="You are an expert fiction writer specializing in deep, emotionally resonant first-person prose. Write immersive, character-driven scenes that follow 'show, don't tell' principles. DO NOT include scene numbers, headers or any formatting in your response - just the pure prose text.", 
                                max_tokens=8000)
                            chapter_prose.append(scene_prose)
                        except Exception as e:
                            error_msg = f"Error generating prose for scene {i} in {chapter_title}: {str(e)}"
                            st.warning(error_msg)
                            chapter_prose.append(f"Error generating prose: {str(e)}")
                    
                    # Store prose for this chapter and save progress immediately
                    prose_scenes[chapter_title] = chapter_prose
                    
                    # Update session state after each chapter to save progress
                    st.session_state.state["prose_scenes"] = prose_scenes
                    
                    # Save to database after each chapter to preserve progress
                    NovelDatabaseService.save_scenes(st.session_state.state["novel_id"], scene_summaries)
                    
                    # Show progress message
                    progress_count = len(prose_scenes)
                    total_count = len(chapter_info_list)
                    st.success(f"Progress: {progress_count}/{total_count} chapters completed ({int(progress_count/total_count*100)}%)")
                
                # Final database update
                NovelDatabaseService.save_scenes(st.session_state.state["novel_id"], scene_summaries)
                
                st.success("Successfully generated prose for all scenes!")
                st.rerun()
            except Exception as e:
                st.error(f"Error generating prose: {str(e)}")
    
    # Display generated prose if available
    display_prose(st.session_state.state.get("prose_scenes"))
    
    # Function to display editing suggestions UI
    def display_editing_suggestions(novel_id=None, all_scenes=None, chapter_outline=None):
        """
        Display AI-powered editing suggestions UI for content analysis and improvement.
        
        Args:
            novel_id: The ID of the current novel
            all_scenes: Dictionary of scenes by chapter
            chapter_outline: List of chapter outlines
            
        Returns:
            dict or None: Generated suggestions if any, None otherwise
        """
        with st.expander("✏️ Editing & Revision Suggestions", expanded=False):
            st.markdown("### AI Editing Assistant")
            st.markdown("""
            Get professional editing feedback on your novel's content. 
            The AI editor will analyze your text and provide constructive suggestions 
            for improvement based on YA fiction best practices.
            """)
            
            # If no novel is loaded yet
            if not novel_id or not all_scenes:
                st.info("Please generate your novel content first before requesting editing suggestions.")
                return None
                
            # Create tabs for different analysis types
            analysis_tabs = st.tabs(["Scene Analysis", "Chapter Analysis", "Recent Suggestions"])
            
            # Scene Analysis Tab
            with analysis_tabs[0]:
                st.subheader("Analyze a Scene")
                
                # Select chapter and scene
                chapters = list(all_scenes.keys()) if all_scenes else []
                
                if not chapters:
                    st.info("No scenes available for analysis. Please generate scenes first.")
                    return None
                    
                selected_chapter = st.selectbox(
                    "Select a chapter to analyze:",
                    options=chapters,
                    key="edit_scene_chapter"
                )
                
                if selected_chapter and selected_chapter in all_scenes:
                    scenes = all_scenes[selected_chapter]
                    
                    if not scenes:
                        st.info(f"No scenes found in chapter {selected_chapter}.")
                        return None
                        
                    scene_options = [f"Scene {i+1}" for i in range(len(scenes))]
                    selected_scene_idx = st.selectbox(
                        "Select a scene to analyze:",
                        options=range(len(scene_options)),
                        format_func=lambda x: scene_options[x],
                        key="edit_scene_idx"
                    )
                    
                    # Preview the selected scene
                    st.markdown("#### Scene Preview")
                    scene_text = scenes[selected_scene_idx]
                    st.text_area(
                        "Scene content (first 500 characters):",
                        scene_text[:500] + ("..." if len(scene_text) > 500 else ""),
                        height=150,
                        disabled=True
                    )
                    
                    # Button to analyze the scene
                    if st.button("Analyze This Scene", key="analyze_scene_btn"):
                        with st.spinner("Analyzing scene..."):
                            # Create a temporary NovelAutomationTool instance for analysis
                            generator = NovelAutomationTool(
                                title=settings["title"],
                                model=settings["model"]
                            )
                            
                            # Generate unique content ID
                            content_id = f"{selected_chapter}_scene_{selected_scene_idx}"
                            
                            # Call the editing suggestion method
                            suggestions = generator.generate_editing_suggestions(
                                scene_text,
                                content_id=content_id,
                                content_type="scene",
                                novel_id=novel_id
                            )
                            
                            if suggestions:
                                # Display the generated suggestions
                                _display_suggestion_details(suggestions)
                                return suggestions
                                
            # Chapter Analysis Tab
            with analysis_tabs[1]:
                st.subheader("Analyze a Full Chapter")
                
                if not chapter_outline:
                    st.info("No chapter outline available. Please generate a chapter outline first.")
                else:
                    # Get chapter numbers from outline
                    chapter_nums = [ch.get('number', i+1) for i, ch in enumerate(chapter_outline)]
                    chapter_titles = [f"Chapter {ch.get('number', i+1)}: {ch.get('title', 'Untitled')}" 
                                     for i, ch in enumerate(chapter_outline)]
                    
                    selected_ch_idx = st.selectbox(
                        "Select a chapter to analyze:",
                        options=range(len(chapter_nums)),
                        format_func=lambda x: chapter_titles[x],
                        key="edit_chapter_idx"
                    )
                    
                    selected_chapter_num = chapter_nums[selected_ch_idx]
                    selected_chapter_title = chapter_outline[selected_ch_idx].get('title', 'Untitled')
                    
                    # Find all scenes for this chapter
                    chapter_key = f"Chapter {selected_chapter_num}: {selected_chapter_title}"
                    alt_chapter_key = f"Chapter {selected_chapter_num}"
                    
                    # Try both possible chapter key formats
                    if chapter_key in all_scenes:
                        chapter_scenes = all_scenes[chapter_key]
                    elif alt_chapter_key in all_scenes:
                        chapter_scenes = all_scenes[alt_chapter_key]
                    else:
                        st.warning(f"No scenes found for {chapter_key}.")
                        return None
                    
                    # Combine all scenes into chapter text
                    full_chapter_text = "\n\n".join(chapter_scenes)
                    
                    # Show preview
                    st.markdown("#### Chapter Preview")
                    st.text_area(
                        "Chapter content (first 500 characters):",
                        full_chapter_text[:500] + ("..." if len(full_chapter_text) > 500 else ""),
                        height=150,
                        disabled=True
                    )
                    
                    # Button to analyze the chapter
                    if st.button("Analyze This Chapter", key="analyze_chapter_btn"):
                        with st.spinner("Analyzing chapter..."):
                            # Create a temporary NovelAutomationTool instance for analysis
                            generator = NovelAutomationTool(
                                title=settings["title"],
                                model=settings["model"]
                            )
                            
                            # Generate unique content ID
                            content_id = f"chapter_{selected_chapter_num}"
                            
                            # Call the editing suggestion method
                            suggestions = generator.generate_editing_suggestions(
                                full_chapter_text,
                                content_id=content_id,
                                content_type="chapter",
                                novel_id=novel_id
                            )
                            
                            if suggestions:
                                # Display the generated suggestions
                                _display_suggestion_details(suggestions)
                                return suggestions
            
            # Recent Suggestions Tab
            with analysis_tabs[2]:
                st.subheader("Recent Editing Suggestions")
                
                # Get previous suggestions from the database
                if novel_id:
                    try:
                        suggestions_list = NovelDatabaseService.get_editing_suggestions(novel_id)
                        
                        if not suggestions_list:
                            st.info("No previous editing suggestions found. Analyze scenes or chapters to generate suggestions.")
                        else:
                            # Group suggestions by content type and ID
                            grouped_suggestions = {}
                            for suggestion in suggestions_list:
                                key = f"{suggestion['content_type']}_{suggestion['content_id']}"
                                if key not in grouped_suggestions:
                                    grouped_suggestions[key] = []
                                grouped_suggestions[key].append(suggestion)
                            
                            # Create a selectbox to choose which suggestion to view
                            suggestion_options = list(grouped_suggestions.keys())
                            selected_suggestion_key = st.selectbox(
                                "Select content to view suggestions:",
                                options=suggestion_options,
                                format_func=lambda x: x.replace("_", " ").title(),
                                key="previous_suggestion_select"
                            )
                            
                            if selected_suggestion_key:
                                # Get the most recent suggestion for this content
                                recent_suggestion = grouped_suggestions[selected_suggestion_key][0]
                                
                                # Display the suggestion
                                _display_suggestion_details(recent_suggestion)
                    except Exception as e:
                        st.error(f"Error loading previous suggestions: {str(e)}")
        
        return None

    def _display_suggestion_details(suggestion, show_text=True):
        """Helper function to display a single editing suggestion"""
        if not suggestion:
            return
            
        st.markdown("#### Overall Assessment")
        st.markdown(suggestion['overall_assessment'])
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("#### Key Strengths")
            for strength in suggestion['strengths']:
                st.markdown(f"✓ {strength}")
        
        with col2:
            st.markdown("#### Areas for Improvement")
            for weakness in suggestion['weaknesses']:
                st.markdown(f"→ {weakness}")
        
        st.markdown("#### Specific Suggestions")
        for i, sugg in enumerate(suggestion['suggestions'], 1):
            st.markdown(f"**{i}.** {sugg}")
        
        st.markdown("---")
        
        # Show the original text if requested
        # We don't include this inside an expander to avoid nesting expanders
        if show_text:
            st.markdown("##### Analyzed Text")
            st.text_area(
                "Original content:",
                suggestion['original_text'][:1000] + ("..." if len(suggestion['original_text']) > 1000 else ""),
                height=200,
                disabled=True
            )
    
    # Display editing suggestions UI if prose is available
    if st.session_state.state.get("prose_scenes"):
        display_editing_suggestions(
            novel_id=st.session_state.state.get("novel_id"),
            all_scenes=st.session_state.state.get("prose_scenes"),
            chapter_outline=st.session_state.state.get("chapter_outline")
        )
    
    # Display function for novel quotes
    def display_novel_quotes(quotes=None):
        with st.expander("🗣 Novel Quotes", expanded=not bool(quotes)):
            if quotes:
                try:
                    st.markdown("## Marketing & Promotional Quotes")
                    st.markdown("These powerful quotes capture the essence of your novel and can be used for marketing, social media, and promotional materials:")
                    
                    # Display quotes in a clean format with dividers
                    for quote in quotes:
                        st.markdown(f"*{quote}*")
                        st.markdown("---")
                    
                    # Download button for quotes
                    quotes_text = "\n\n".join(quotes)
                    st.download_button(
                        label="Download Quotes",
                        data=quotes_text,
                        file_name="novel_quotes.txt",
                        mime="text/plain",
                    )
                    
                    if st.button("♻️ Regenerate Novel Quotes", key="regenerate_quotes"):
                        return True
                except Exception as e:
                    st.error(f"Error displaying novel quotes: {str(e)}")
                    if st.button("♻️ Regenerate Novel Quotes", key="regenerate_quotes_error"):
                        return True
            else:
                st.info("Generate impactful quotes from your novel for marketing and promotional purposes.")
            return False
    
    # Display function for cover design prompt
    def display_cover_design_prompt(cover_prompt=None):
        with st.expander("🎨 Cover Design Prompt", expanded=not bool(cover_prompt)):
            if cover_prompt:
                st.markdown("## Cover Design Request")
                st.markdown(cover_prompt)
                
                # Download button for the prompt
                st.download_button(
                    label="Download Cover Design Prompt",
                    data=cover_prompt,
                    file_name=f"{settings['title']}_cover_design.txt",
                    mime="text/plain",
                )
            else:
                st.info("Generate a professional cover design prompt that could be sent to a designer.")
    
    # 10. Generate Novel Quotes
    if st.button("Generate Novel Quotes",
               disabled=not st.session_state.state.get("all_scenes"),
               key="gen_quotes"):
        with st.spinner("Extracting powerful quotes from your novel..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                quotes = tool.generate_novel_quotes(
                    story_details=st.session_state.state["story_details"],
                    chapter_outline=st.session_state.state["chapter_outline"],
                    all_scenes=st.session_state.state["all_scenes"]
                )
                st.session_state.state["novel_quotes"] = quotes
                NovelDatabaseService.save_novel_quotes(st.session_state.state["novel_id"], quotes)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating novel quotes: {str(e)}")
    
    # Display novel quotes if available
    regenerate_quotes = display_novel_quotes(st.session_state.state.get("novel_quotes"))
    if regenerate_quotes:
        st.session_state.state["novel_quotes"] = None
        st.rerun()
    
    # 11. Generate Cover Design Prompt
    if st.button("Generate Cover Design Prompt", 
                disabled=not st.session_state.state.get("story_details"),
                key="gen_cover_prompt"):
        with st.spinner("Creating a professional cover design prompt..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                cover_prompt = tool.generate_cover_design_prompt(st.session_state.state["story_details"])
                st.session_state.state["cover_design_prompt"] = cover_prompt
                NovelDatabaseService.save_cover_design_prompt(st.session_state.state["novel_id"], cover_prompt)
                st.rerun()
            except Exception as e:
                st.error(f"Error generating cover design prompt: {str(e)}")
    
    # Display cover design prompt if available
    display_cover_design_prompt(st.session_state.state.get("cover_design_prompt"))
    
    # 12. Promotional Articles - Advanced marketing article generation
    st.markdown("### 📰 Promotional Articles for Advertising")
    
    # Article type selection
    article_type_options = {
        'theme_analysis': 'Deep-Dive Theme Article - Explore themes and emotional connections',
        'character_spotlight': 'Meet the Characters - Backstories, motivations, conflicts',
        'author_journey': 'Behind the Scenes / Author Journey - Writing process and inspiration',
        'world_building': 'World-Building Feature - Setting, environment, cultural details',
        'quote_spotlight': 'Quote Spotlight - 10-20 emotional quotes with commentary',
        'lessons_learned': 'Lessons Teens Can Learn - Moral lessons and educational value',
        'comparison_article': 'Fans of X Will Love Y - Comparison to popular YA books',
        'symbolism_article': 'Hidden Symbolism - Symbols, motifs, deeper meanings',
        'emotional_hook': 'Emotional Hook Article - Short, shareable, pure emotion',
        'author_letter': 'Author Letter to Readers - Heartfelt personal message',
        'problem_solution': 'Problem-Solution Article - Teen struggles and book insights',
        'seo_review': 'SEO-Optimized Review - Long-form, keyword-rich article'
    }
    
    col1, col2 = st.columns(2)
    with col1:
        selected_article_type = st.selectbox(
            "Select Article Type",
            options=list(article_type_options.keys()),
            format_func=lambda x: article_type_options[x],
            key="article_type_select"
        )
    
    with col2:
        article_length = st.selectbox(
            "Article Length",
            options=['short', 'medium', 'long'],
            format_func=lambda x: {'short': 'Short (300-600 words) - Social & Email', 'medium': 'Medium (800-1200 words) - Website', 'long': 'Long (1500-2000 words) - SEO Blog'}[x],
            index=1,
            key="article_length_select"
        )
    
    col3, col4 = st.columns(2)
    with col3:
        article_tone = st.selectbox(
            "Tone Preference",
            options=['formal', 'warm', 'casual', 'emotional'],
            format_func=lambda x: x.title(),
            key="article_tone_select"
        )
    
    with col4:
        cta_type = st.selectbox(
            "Call-to-Action Style",
            options=['soft', 'medium', 'strong'],
            format_func=lambda x: {'soft': 'Soft Sell - Gentle invitation', 'medium': 'Medium Sell - Balanced approach', 'strong': 'Strong Sell - Direct call to buy'}[x],
            index=1,
            key="cta_type_select"
        )
    
    include_links = st.checkbox("Include placeholder links [BOOK_LINK]", key="include_links_check")
    
    if st.button("Generate Promotional Article", 
                disabled=not st.session_state.state.get("story_details"),
                key="gen_promo_article"):
        with st.spinner(f"Creating your {article_type_options[selected_article_type].split(' - ')[0]}..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass novel synopsis to the tool if available
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                
                article_result = tool.generate_promotional_article(
                    st.session_state.state["story_details"],
                    article_type=selected_article_type,
                    length_type=article_length,
                    tone=article_tone,
                    cta_type=cta_type,
                    include_links=include_links
                )
                
                # Initialize promotional_articles list if needed
                if not st.session_state.state.get("promotional_articles"):
                    st.session_state.state["promotional_articles"] = []
                
                # Add the new article to the list
                st.session_state.state["promotional_articles"].append(article_result)
                
                # Save to database
                NovelDatabaseService.save_promotional_article(
                    st.session_state.state["novel_id"],
                    article_type=selected_article_type,
                    content=article_result.get('content', ''),
                    length_type=article_length,
                    tone=article_tone,
                    cta_type=cta_type,
                    title=article_result.get('title', '')
                )
                
                st.success(f"Successfully generated {article_type_options[selected_article_type].split(' - ')[0]}!")
                st.rerun()
            except Exception as e:
                st.error(f"Error generating promotional article: {str(e)}")
    
    # Display promotional articles
    article_action = display_promotional_articles(st.session_state.state.get("promotional_articles"))
    if article_action == "clear":
        st.session_state.state["promotional_articles"] = []
        st.rerun()
    
    # 13. Social Media Snippets
    st.markdown("### 📱 Social Media Repurposing")
    
    if st.button("Generate Social Media Snippets", 
                disabled=not st.session_state.state.get("story_details"),
                key="gen_social_snippets"):
        with st.spinner("Creating social media content for multiple platforms..."):
            try:
                tool = NovelAutomationTool(
                    title=settings["title"],
                    model=settings["model"],
                    max_scene_length=settings["max_scene_length"],
                    min_scene_length=settings["min_scene_length"],
                    output_dir=output_dir
                )
                
                # Pass novel synopsis to the tool if available
                if st.session_state.state.get("novel_synopsis"):
                    tool._novel_synopsis = st.session_state.state["novel_synopsis"]
                
                # Get the latest article content if available
                latest_article = None
                if st.session_state.state.get("promotional_articles"):
                    latest_article = st.session_state.state["promotional_articles"][-1].get('content', '')
                
                snippets = tool.generate_social_snippets(
                    st.session_state.state["story_details"],
                    article_content=latest_article
                )
                
                st.session_state.state["social_snippets"] = snippets
                st.success("Social media snippets generated successfully!")
                st.rerun()
            except Exception as e:
                st.error(f"Error generating social snippets: {str(e)}")
    
    # Display social snippets
    if display_social_snippets(st.session_state.state.get("social_snippets")):
        st.session_state.state["social_snippets"] = None
        st.rerun()

if __name__ == "__main__":
    main()