# YA Novel Generator

## Overview
A comprehensive Streamlit-based application for generating Young Adult novels using AI assistance. This tool helps authors create compelling YA fiction with detailed character development, structured plots, and complete scene-by-scene content.

## Recent Changes
- **September 26, 2025**: Successfully imported and configured for Replit environment
  - Installed all Python dependencies (streamlit, openai, anthropic, pathlib)
  - Configured Streamlit workflow for port 5000 with proper host settings
  - Set up deployment configuration for autoscale deployment
  - Verified database setup and application functionality

## Project Architecture

### Core Components
- **app.py**: Main Streamlit application interface with comprehensive UI for novel generation
- **novel_generator.py**: Core AI-powered novel generation logic using OpenAI APIs
- **db_service.py**: SQLite database service for managing novels, chapters, scenes, and series
- **utils.py**: Utility functions for file operations and text processing

### Key Features
- **Single Novel Mode**: Create standalone novels with detailed character development
- **Series Mode**: Generate connected multi-book series with consistent character arcs
- **AI Models**: Support for multiple OpenAI models (gpt-4.1, gpt-4o, gpt-3.5-turbo, etc.)
- **Chapter Structure**: Automated chapter outlines with 18-25 chapters for YA format
- **Scene Generation**: Detailed scene-by-scene content with dialogue and narrative
- **Export Options**: Multiple format outputs (TXT, HTML, Markdown)
- **Character Profiles**: Comprehensive character development and profiling
- **Database Storage**: Persistent storage of all generated content

### Database Schema
- **novels**: Core novel metadata and settings
- **series**: Series information for multi-book projects  
- **chapter_outlines**: Structured chapter plans
- **scenes**: Individual scene content
- **novel_formats**: Export formats (TXT, HTML, Markdown)
- **character_profiles**: Character development data
- **premises_and_endings**: Story premises and conclusion options

### Dependencies
- **streamlit**: Web application framework
- **openai**: AI text generation via OpenAI API
- **anthropic**: Alternative AI provider support
- **sqlite3**: Database operations (built-in)
- **pathlib**: File path operations

## User Preferences
- No specific user preferences documented yet
- Application designed for YA novel authors and content creators
- Focus on comprehensive, detailed novel generation workflows

## Configuration
- **Development**: Streamlit runs on port 5000 with host 0.0.0.0
- **Deployment**: Configured for autoscale deployment target
- **Database**: SQLite database (novels.db) for data persistence
- **API Keys**: Requires OpenAI API key for content generation

## Getting Started
1. Ensure OpenAI API key is available in environment variables
2. Run the application using the configured workflow
3. Choose between Single Novel or Series mode
4. Follow the guided interface to generate novel content
5. Export completed novels in preferred formats

## File Structure
```
├── app.py                 # Main Streamlit application
├── novel_generator.py     # AI novel generation engine
├── db_service.py         # Database operations
├── utils.py              # Utility functions
├── novels.db             # SQLite database
├── output/               # Generated novel outputs
├── pyproject.toml        # Python project configuration
└── uv.lock              # Dependency lock file
```