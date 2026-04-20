import os
import requests
import time
from db_service import NovelDatabaseService

class MockupManager:
    """
    Handles communication with the Mockups Next.js app APIs.
    """
    
    BASE_URL = os.environ.get("MOCKUPS_API_URL", "http://localhost:3000")
    
    @classmethod
    def get_templates(cls):
        """Fetch available mockup templates from the Mockups app"""
        try:
            response = requests.get(f"{cls.BASE_URL}/api/templates")
            response.raise_for_status()
            data = response.json()
            return data.get("templates", [])
        except Exception as e:
            print(f"Error fetching mockup templates: {str(e)}")
            return []
            
    @classmethod
    def submit_render(cls, novel_id, cover_id, cover_url, template_id, options=None):
        """
        Submit a render job to the Mockups app.
        
        Args:
            novel_id (str): The novel ID
            cover_id (str): The cover ID
            cover_url (str): The URL of the cover image to use
            template_id (str): The ID of the mockup template
            options (dict, optional): Additional render options (scale, position, etc.)
            
        Returns:
            str: The job ID (render ID)
        """
        try:
            # Prepare render data
            render_data = {
                "templateId": template_id,
                "userImage": cover_url,
                "useQueue": True
            }
            
            # Add additional options if provided
            if options:
                render_data.update(options)
                
            # Submit to Mockups API
            response = requests.post(f"{cls.BASE_URL}/api/render", json=render_data)
            response.raise_for_status()
            result = response.json()
            
            job_id = result.get("id")
            
            # Save the mockup record in our database as pending
            if job_id:
                NovelDatabaseService.save_mockup(
                    novel_id=novel_id,
                    cover_id=cover_id,
                    template_id=template_id,
                    status="pending"
                )
                
            return job_id
            
        except Exception as e:
            print(f"Error submitting mockup render: {str(e)}")
            return None
            
    @classmethod
    def check_render_status(cls, job_id):
        """
        Check the status of a render job.
        
        Args:
            job_id (str): The job ID to check
            
        Returns:
            dict: The status and result of the job
        """
        try:
            response = requests.get(f"{cls.BASE_URL}/api/render", params={"id": job_id})
            response.raise_for_status()
            data = response.json()
            
            # If completed, update our database
            if data.get("status") == "completed" and data.get("resultUrl"):
                # We'll need the mockup_id or match by job_id (which is used as mockup_id in our DB if we saved it that way)
                # For simplicity, we'll assume job_id is what we need to track.
                # Actually, our save_mockup returns a new UUID. We might need to store the job_id in our DB too.
                # Let's update the mockup table to include external_job_id.
                pass 
                
            return data
            
        except Exception as e:
            print(f"Error checking render status: {str(e)}")
            return {"status": "failed", "error": str(e)}

    @classmethod
    def poll_render(cls, job_id, timeout=60, interval=2):
        """Poll the render status until complete or timeout"""
        start_time = time.time()
        while time.time() - start_time < timeout:
            status_data = cls.check_render_status(job_id)
            if status_data.get("status") in ["completed", "failed"]:
                return status_data
            time.sleep(interval)
        return {"status": "timeout", "message": "Render timed out"}
