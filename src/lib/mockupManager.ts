export class MockupManager {
  private static BASE_URL = process.env.MOCKUPS_API_URL || "http://localhost:3000";

  static async getTemplates() {
    try {
      const response = await fetch(`${this.BASE_URL}/api/templates`);
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.error("Error fetching mockup templates:", error);
      return [];
    }
  }

  static async submitRender(
    novelId: string,
    coverId: string,
    coverUrl: string,
    templateId: string,
    options: Record<string, unknown> = {}
  ) {
    try {
      const renderData = {
        templateId,
        userImage: coverUrl,
        useQueue: true,
        ...options,
      };

      const response = await fetch(`${this.BASE_URL}/api/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(renderData),
      });

      if (!response.ok) throw new Error("Failed to submit render");
      const data = await response.json();
      return data.id; // job ID
    } catch (error) {
      console.error("Error submitting mockup render:", error);
      return null;
    }
  }
}
