import os
from db_service import NovelDatabaseService

class PublishingService:
    """
    Handles promoting finalized book data from the 'studio' schema to the 'public' schema.
    """
    
    @classmethod
    def publish_novel(cls, novel_id):
        """
        Promote a novel and all its related content from 'studio' to 'public' schema.
        
        Args:
            novel_id (str): The ID of the novel in the 'studio' schema.
            
        Returns:
            dict: Result containing the new ID in the 'public' schema or error.
        """
        try:
            client = NovelDatabaseService.get_client()
            
            # Step 1: Get novel data from studio
            studio_novel = client.schema("studio").table("novels").select("*").eq("id", novel_id).single().execute()
            if not studio_novel.data:
                return {"error": "Novel not found in studio schema"}
            
            novel_data = studio_novel.data
            
            # Step 2: Use the 'public' schema for insertion
            # We'll switch schema by creating a temporary client or using the schema override if supported
            from supabase.lib.client_options import ClientOptions
            public_client = create_public_client()
            
            # Prepare novel data for public schema
            public_novel_data = {
                "title": novel_data["title"],
                "model": novel_data["model"],
                "max_scene_length": novel_data["max_scene_length"],
                "min_scene_length": novel_data["min_scene_length"],
                "story_details": novel_data["story_details"],
                # You might want to map user_id or handle series_id promotion too
                "user_id": novel_data.get("user_id")
            }
            
            # Step 3: Insert into public schema
            public_novel = public_client.schema("public").table("novels").insert(public_novel_data).select("id").single().execute()
            public_novel_id = public_novel.data["id"]
            
            # Step 4: Promote related content (Chapter Outlines, Scenes, Formats, Synopses, Character Profiles, Covers, Mockups)
            cls._promote_related_content(client, public_client, novel_id, public_novel_id)
            
            # Step 5: Update studio novel status
            client.schema("studio").table("novels").update({
                "is_published": True,
                "published_at": "now()",
                "public_id": public_novel_id
            }).eq("id", novel_id).execute()
            
            return {"success": True, "public_id": public_novel_id}
            
        except Exception as e:
            print(f"Publishing error: {str(e)}")
            return {"error": str(e)}

    @classmethod
    def _promote_related_content(cls, studio_client, public_client, studio_id, public_id):
        """Helper to promote all related tables for a novel"""
        
        # Chapter Outlines
        outlines = studio_client.schema("studio").table("chapter_outlines").select("*").eq("novel_id", studio_id).execute()
        for row in outlines.data:
            public_client.schema("public").table("chapter_outlines").insert({
                "novel_id": public_id,
                "outline": row["outline"]
            }).execute()
            
        # Scenes
        scenes = studio_client.schema("studio").table("scenes").select("*").eq("novel_id", studio_id).execute()
        scene_rows = [{
            "novel_id": public_id,
            "chapter_title": row["chapter_title"],
            "scene_content": row["scene_content"],
            "scene_order": row["scene_order"]
        } for row in scenes.data]
        if scene_rows:
            public_client.schema("public").table("scenes").insert(scene_rows).execute()
            
        # Formats
        formats = studio_client.schema("studio").table("novel_formats").select("*").eq("novel_id", studio_id).execute()
        format_rows = [{
            "novel_id": public_id,
            "format_name": row["format_name"],
            "content": row["content"]
        } for row in formats.data]
        if format_rows:
            public_client.schema("public").table("novel_formats").insert(format_rows).execute()
            
        # Synopsis
        synopsis = studio_client.schema("studio").table("novel_synopsis").select("*").eq("novel_id", studio_id).execute()
        for row in synopsis.data:
            public_client.schema("public").table("novel_synopsis").insert({
                "novel_id": public_id,
                "synopsis": row["synopsis"]
            }).execute()
            
        # Character Profiles
        profiles = studio_client.schema("studio").table("character_profiles").select("*").eq("novel_id", studio_id).execute()
        for row in profiles.data:
            public_client.schema("public").table("character_profiles").insert({
                "novel_id": public_id,
                "profiles": row["profiles"]
            }).execute()
            
        # Note: You can also promote covers and mockups similarly

def create_public_client():
    """Create a client specifically for the 'public' schema"""
    from supabase import create_client
    from supabase.lib.client_options import ClientOptions
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    options = ClientOptions(schema="public")
    return create_client(url, key, options=options)
